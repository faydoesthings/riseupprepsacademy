"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRoleAction } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

export async function submitDonationPledge(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.trim();
    const amount = parseFloat(formData.get("amount") as string);
    const type = (formData.get("type") as string) || "ONE_TIME";
    const method = (formData.get("method") as string) || "CASH";
    const anonymous = formData.get("anonymous") === "on";

    if (!name || !email || Number.isNaN(amount) || amount < 100) {
      return { success: false, error: "Please provide your name, email, and a valid amount (min PKR 100)" };
    }

    await prisma.registrationRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        roleRequested: "DONATION",
        reason: `Pledge: PKR ${amount} | Type: ${type} | Method: ${method} | Anonymous: ${anonymous ? "yes" : "no"}`,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit donation pledge",
    };
  }
}

const DonationSchema = z.object({
  donorId: z.string().cuid(),
  amount: z.number().min(1, "Donation must be greater than 0"),
  type: z.enum(["ONE_TIME", "MONTHLY", "ANNUAL"]),
  method: z.enum(["CASH", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA"]),
  note: z.string().optional(),
});

export async function createDonation(formData: FormData) {
  try {
    const auth = await requireRoleAction("SUPER_ADMIN"); 
    if (!auth.ok) throw new Error(auth.error);

    const data = {
      donorId: formData.get("donorId") as string,
      amount: parseFloat(formData.get("amount") as string),
      type: (formData.get("type") as string) || "ONE_TIME",
      method: (formData.get("method") as string) || "CASH",
      note: (formData.get("note") as string) || undefined,
    };

    const validated = DonationSchema.parse(data);

    const donation = await prisma.donation.create({
      data: {
        donorId: validated.donorId,
        amount: validated.amount,
        type: validated.type,
        method: validated.method,
        note: validated.note,
        status: "CONFIRMED"
      }
    });

    const uid = auth.session.user?.id;
    if (uid) {
      await logAudit({
        userId: uid,
        action: "CREATE",
        module: "DONATION",
        recordId: donation.id,
        details: `PKR ${validated.amount}`,
      });
    }

    revalidatePath("/portal/admin/donors");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record donation",
    };
  }
}

export async function createSponsorship(formData: FormData) {
  try {
    const auth = await requireRoleAction("SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    const donorId = formData.get("donorId") as string;
    const studentId = formData.get("studentId") as string;
    const amount = parseFloat(formData.get("amount") as string); // We could log this as a recurring donation if needed

    if (!donorId || !studentId) throw new Error("Missing IDs");

    await prisma.student.update({
      where: { id: studentId },
      data: {
        sponsorId: donorId,
        isSponsored: true
      }
    });

    const uid = auth.session.user?.id;
    if (uid) {
      await logAudit({
        userId: uid,
        action: "SPONSOR",
        module: "STUDENT",
        recordId: studentId,
        details: `Donor ${donorId}`,
      });
    }

    revalidatePath("/portal/admin/donors");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sponsorship",
    };
  }
}
