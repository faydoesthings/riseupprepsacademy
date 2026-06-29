"use client";

import { useState, useTransition } from "react";
import { uploadLmsFile } from "@/lib/lms/upload";

export default function FileUploadField({
  onUploaded,
  accept = "video/*,application/pdf,image/*",
}: {
  onUploaded: (url: string) => void;
  accept?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadLmsFile(fd);
      if (!res.success) {
        setError(res.error);
        return;
      }
      onUploaded(res.url);
    });
  }

  return (
    <div className="space-y-2">
      <label className="form-label-caps">Upload file</label>
      <input
        type="file"
        accept={accept}
        disabled={pending}
        onChange={handleChange}
        className="form-input text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#F78C1F]/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#F78C1F]"
      />
      {pending && <p className="text-xs text-white/45">Uploading…</p>}
      {error && <p className="text-xs text-red-400/90">{error}</p>}
    </div>
  );
}
