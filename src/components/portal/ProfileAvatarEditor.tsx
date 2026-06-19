"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import PortalAvatar from "@/components/portal/PortalAvatar";
import { removeProfileImage, updateProfileImage } from "@/app/actions/user-actions";

type ProfileAvatarEditorProps = {
  name: string;
  image: string | null;
  roleLabel: string;
  roleBadgeClass: string;
};

export default function ProfileAvatarEditor({
  name,
  image,
  roleLabel,
  roleBadgeClass,
}: ProfileAvatarEditorProps) {
  const router = useRouter();
  const { update } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(image);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const result = await updateProfileImage(formData);
    if (result.success) {
      setPreview(result.imageUrl ?? null);
      await update({ image: result.imageUrl ?? null });
      toast.success("Profile photo updated");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to upload photo");
    }
    setUploading(false);
  }

  async function handleRemove() {
    setRemoving(true);
    const result = await removeProfileImage();
    if (result.success) {
      setPreview(null);
      await update({ image: null });
      toast.success("Profile photo removed");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove photo");
    }
    setRemoving(false);
  }

  const busy = uploading || removing;

  return (
    <section className="portal-settings-hero">
      <div className="portal-settings-hero__avatar-wrap">
        <PortalAvatar name={name} image={preview} size="xl" />
        <button
          type="button"
          className="portal-settings-hero__camera"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Change profile photo"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          ) : (
            <Camera className="w-4 h-4" aria-hidden />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="portal-settings-hero__body">
        <p className="portal-settings-hero__eyebrow">Account</p>
        <h2 className="portal-settings-hero__name">{name}</h2>
        <span className={`portal-settings-hero__role ${roleBadgeClass}`}>{roleLabel}</span>
        <p className="portal-settings-hero__hint">
          Upload a clear photo so staff and students can recognise you in the portal.
        </p>
        <div className="portal-settings-hero__actions">
          <button
            type="button"
            className="portal-btn portal-btn--primary"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Uploading…
              </>
            ) : (
              "Upload photo"
            )}
          </button>
          {preview && (
            <button
              type="button"
              className="portal-btn portal-btn--ghost"
              onClick={() => void handleRemove()}
              disabled={busy}
            >
              {removing ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="w-4 h-4" aria-hidden />
              )}
              Remove
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
