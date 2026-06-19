"use server";

import prisma from "@/lib/prisma";
import { contactSubjectValues } from "@/data/contact";

export async function submitContactMessage(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.trim();
    const subject = (formData.get("subject") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!name || !email || !subject || !message) {
      return { success: false, error: "Please fill in all required fields" };
    }

    if (!(contactSubjectValues as readonly string[]).includes(subject)) {
      return { success: false, error: "Please select a valid topic" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    await prisma.registrationRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        roleRequested: "CONTACT",
        reason: `Subject: ${subject}\n\n${message}`,
        status: "PENDING",
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("submitContactMessage:", error);
    return {
      success: false,
      error: "Failed to send your message. Please try again later.",
    };
  }
}
