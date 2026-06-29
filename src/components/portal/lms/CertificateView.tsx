"use client";

import { Award, ExternalLink } from "lucide-react";

type CertificateProps = {
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date | string;
  appUrl: string;
};

export default function CertificateView({
  studentName,
  courseTitle,
  certificateNumber,
  verificationCode,
  issuedAt,
  appUrl,
}: CertificateProps) {
  const issued = new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const verifyUrl = `${appUrl}/verify/${verificationCode}`;

  return (
    <div className="lms-certificate">
      <div className="lms-certificate__frame">
        <div className="lms-certificate__inner">
          <div className="lms-certificate__badge" aria-hidden>
            <Award className="w-8 h-8" />
          </div>
          <p className="lms-certificate__eyebrow">RiseUp Preps Academy</p>
          <h1 className="lms-certificate__title">Certificate of Completion</h1>
          <p className="lms-certificate__subtitle">This certifies that</p>
          <p className="lms-certificate__name">{studentName}</p>
          <p className="lms-certificate__subtitle">has successfully completed</p>
          <p className="lms-certificate__course">{courseTitle}</p>
          <div className="lms-certificate__meta">
            <div>
              <span className="lms-certificate__meta-label">Certificate no.</span>
              <span className="lms-certificate__meta-value">{certificateNumber}</span>
            </div>
            <div>
              <span className="lms-certificate__meta-label">Issued</span>
              <span className="lms-certificate__meta-value">{issued}</span>
            </div>
            <div>
              <span className="lms-certificate__meta-label">Verify</span>
              <a href={verifyUrl} className="lms-certificate__meta-link" target="_blank" rel="noopener noreferrer">
                {verificationCode}
                <ExternalLink className="w-3 h-3 inline ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="lms-certificate__actions no-print">
        <button type="button" onClick={() => window.print()} className="portal-btn portal-btn--primary">
          Download / Print
        </button>
      </div>
    </div>
  );
}
