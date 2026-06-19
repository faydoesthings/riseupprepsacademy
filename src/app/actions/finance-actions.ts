"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRoleAction } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const FeeStructureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
  frequency: z.enum(["MONTHLY", "ONE_TIME", "ANNUAL", "QUARTERLY"]),
  classId: z.union([z.literal(""), z.string().cuid()]).optional(),
  studentId: z.union([z.literal(""), z.string().cuid()]).optional(),
});

export async function createFeeStructure(formData: FormData) {
  try {
    const auth = await requireRoleAction("ACCOUNTANT", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    const data = {
      name: formData.get("name") as string,
      amount: parseFloat(formData.get("amount") as string),
      frequency: formData.get("frequency") as string,
      classId: formData.get("classId") as string || undefined,
      studentId: formData.get("studentId") as string || undefined,
    };

    const validated = FeeStructureSchema.parse(data);

    const created = await prisma.feeStructure.create({
      data: {
        name: validated.name,
        amount: validated.amount,
        frequency: validated.frequency,
        classId: validated.classId || null,
        studentId: validated.studentId || null,
      }
    });

    const uid = auth.session.user?.id;
    if (uid) {
      await logAudit({
        userId: uid,
        action: "CREATE",
        module: "FEE_STRUCTURE",
        recordId: created.id,
        details: validated.name,
      });
    }

    revalidatePath("/portal/accountant/fees");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create fee structure",
    };
  }
}

const CollectFeeSchema = z.object({
  studentId: z.string().cuid("Invalid Student ID"),
  feeStructureId: z.string().cuid("Invalid Fee Structure ID"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["CASH", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA"]),
  month: z.string().min(1),
});

export async function collectFee(formData: FormData) {
  try {
    const auth = await requireRoleAction("ACCOUNTANT", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    const data = {
      studentId: formData.get("studentId") as string,
      feeStructureId: formData.get("feeStructureId") as string,
      amount: parseFloat(formData.get("amount") as string),
      method: formData.get("method") as string,
      month: formData.get("month") as string,
    };

    const validated = CollectFeeSchema.parse(data);

    const duplicate = await prisma.feePayment.findFirst({
      where: {
        studentId: validated.studentId,
        feeStructureId: validated.feeStructureId,
        month: validated.month,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });
    if (duplicate) {
      return {
        success: false,
        error: "A fee record for this student, plan, and month already exists",
      };
    }

    const payment = await prisma.feePayment.create({
      data: {
        studentId: validated.studentId,
        feeStructureId: validated.feeStructureId,
        amount: validated.amount,
        method: validated.method,
        month: validated.month,
        status: "CONFIRMED",
        paidAt: new Date(),
      }
    });

    const uid = auth.session.user?.id;
    if (uid) {
      await logAudit({
        userId: uid,
        action: "COLLECT",
        module: "FEE_PAYMENT",
        recordId: payment.id,
        details: `${validated.month} — PKR ${validated.amount}`,
      });
    }

    revalidatePath("/portal/accountant/fees");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to collect fee",
    };
  }
}

const ExpenseSchema = z.object({
  category: z.string().min(1),
  amount: z.number().min(1, "Amount must be positive"),
  description: z.string().optional(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid Date"),
});

export async function createExpense(formData: FormData, userId: string) {
  try {
    const auth = await requireRoleAction("ACCOUNTANT", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    // Prevent IDOR by forcing the createdBy to be the current logged in user.
    // The `userId` passed from the client form is ignored for security.
    const actualUserId = auth.session.user?.id;
    if (!actualUserId) throw new Error("Missing user ID in session");

    const data = {
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string || undefined,
      date: formData.get("date") as string,
    };

    const validated = ExpenseSchema.parse(data);

    const expense = await prisma.expense.create({
      data: {
        category: validated.category,
        amount: validated.amount,
        description: validated.description || null,
        date: new Date(validated.date),
        createdBy: actualUserId,
      }
    });

    await logAudit({
      userId: actualUserId,
      action: "CREATE",
      module: "EXPENSE",
      recordId: expense.id,
      details: `${validated.category} — PKR ${validated.amount}`,
    });

    revalidatePath("/portal/accountant/expenses");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

const PayrollSchema = z.object({
  teacherId: z.string().cuid(),
  month: z.string().min(3),
  year: z.number().min(2020),
  amount: z.number().min(1),
});

export async function processPayroll(formData: FormData) {
  try {
    const auth = await requireRoleAction("ACCOUNTANT", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    const data = {
      teacherId: formData.get("teacherId") as string,
      month: formData.get("month") as string,
      year: parseInt(formData.get("year") as string, 10),
      amount: parseFloat(formData.get("amount") as string),
    };

    const validated = PayrollSchema.parse(data);

    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        teacherId: validated.teacherId,
        month: validated.month,
        year: validated.year,
      },
    });
    if (existingPayroll) {
      return {
        success: false,
        error: "Payroll for this teacher and month has already been processed",
      };
    }

    const payroll = await prisma.payroll.create({
      data: {
        teacherId: validated.teacherId,
        month: validated.month,
        year: validated.year,
        amount: validated.amount,
        status: "PAID",
        processedAt: new Date(),
      }
    });

    const uid = auth.session.user?.id;
    if (uid) {
      await logAudit({
        userId: uid,
        action: "PROCESS",
        module: "PAYROLL",
        recordId: payroll.id,
        details: `${validated.month} ${validated.year} — PKR ${validated.amount}`,
      });
    }

    revalidatePath("/portal/accountant/payroll");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process payroll",
    };
  }
}
