"use server";

import { put } from "@vercel/blob";
import { requireRoleAction } from "@/lib/auth-utils";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function uploadLmsFile(formData: FormData) {
  const auth = await requireRoleAction("SUPER_ADMIN", "TEACHER");
  if (!auth.ok) return { success: false as const, error: auth.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, error: "No file provided" };
  }
  if (file.size > MAX_BYTES) {
    return { success: false as const, error: "File exceeds 50 MB limit" };
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return {
      success: false as const,
      error: "File upload is not configured. Paste a URL instead, or set BLOB_READ_WRITE_TOKEN.",
    };
  }

  try {
    const blob = await put(`lms/${Date.now()}-${file.name}`, file, {
      access: "public",
      token,
    });
    return { success: true as const, url: blob.url };
  } catch (error) {
    console.error("uploadLmsFile:", error);
    return { success: false as const, error: "Upload failed" };
  }
}
