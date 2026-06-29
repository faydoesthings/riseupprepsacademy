"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeCertificate } from "@/app/actions/lms/certificate-actions";
import Link from "next/link";

type CertRow = {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date;
  revokedAt: Date | null;
  user: { name: string | null; email: string };
  course: { title: string; slug: string };
};

export default function CertificatesPanel({ certificates }: { certificates: CertRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRevoke(id: string, studentName: string | null) {
    if (!confirm(`Revoke certificate for ${studentName ?? "this student"}?`)) return;
    startTransition(async () => {
      await revokeCertificate(id);
      router.refresh();
    });
  }

  if (certificates.length === 0) {
    return (
      <div className="portal-panel">
        <p className="portal-panel-empty">No certificates issued yet.</p>
      </div>
    );
  }

  return (
    <div className="portal-panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr>
            <th className="portal-table-th text-left">Student</th>
            <th className="portal-table-th text-left">Course</th>
            <th className="portal-table-th text-left">Certificate #</th>
            <th className="portal-table-th text-left">Issued</th>
            <th className="portal-table-th text-left">Status</th>
            <th className="portal-table-th" />
          </tr>
        </thead>
        <tbody className="portal-table-body divide-y divide-white/[0.05]">
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td>
                <p className="font-medium text-white">{cert.user.name ?? "Student"}</p>
                <p className="text-xs text-white/42">{cert.user.email}</p>
              </td>
              <td>{cert.course.title}</td>
              <td className="font-mono text-xs">{cert.certificateNumber}</td>
              <td className="text-sm text-white/60">
                {new Date(cert.issuedAt).toLocaleDateString()}
              </td>
              <td>
                {cert.revokedAt ? (
                  <span className="badge badge-warning">Revoked</span>
                ) : (
                  <span className="badge badge-success">Valid</span>
                )}
              </td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/verify/${cert.verificationCode}`}
                    className="portal-btn portal-btn--ghost portal-btn--sm"
                    target="_blank"
                  >
                    Verify
                  </Link>
                  {!cert.revokedAt && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleRevoke(cert.id, cert.user.name)}
                      className="portal-btn portal-btn--ghost portal-btn--sm text-red-400/80"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
