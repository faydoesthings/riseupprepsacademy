import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(type: string): string | null {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

export async function saveAvatarFile(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!file.size) {
    return { error: "Choose an image to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be smaller than 2 MB." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Use a JPG, PNG, WebP, or GIF image." };
  }

  const ext = extensionForMime(file.type);
  if (!ext) {
    return { error: "Unsupported image type." };
  }

  const filename = `${userId}-${Date.now()}.${ext}`;
  await mkdir(AVATAR_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(AVATAR_DIR, filename), buffer);

  return { url: `/uploads/avatars/${filename}` };
}

export async function deleteAvatarFile(imageUrl: string | null | undefined) {
  if (!imageUrl?.startsWith("/uploads/avatars/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", imageUrl));
  } catch {
    // File may already be gone.
  }
}
