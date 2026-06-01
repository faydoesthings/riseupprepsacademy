"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRoleAction } from "@/lib/auth-utils";
import { z } from "zod";

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
      type: formData.get("type") as any || "ONE_TIME",
      method: formData.get("method") as any || "CASH",
      note: formData.get("note") as string || undefined,
    };

    const validated = DonationSchema.parse(data);

    await prisma.donation.create({
      data: {
        donorId: validated.donorId,
        amount: validated.amount,
        type: validated.type,
        method: validated.method,
        note: validated.note,
        status: "CONFIRMED"
      }
    });

    revalidatePath("/portal/admin/donors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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

    revalidatePath("/portal/admin/donors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
