"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { submitRegistrationRequest } from "@/app/actions/registration-actions";

const inputClass =
  "w-full pl-11 pr-4 py-3 min-h-[44px] bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#F78C1F]/30 focus:border-[#F78C1F]/50 transition-all";
const labelClass = "block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await submitRegistrationRequest(formData);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to submit request");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#0A0E1A]">
        <div className="admissions-success landing-card landing-card--center w-full max-w-md mx-auto">
          <div className="admissions-success__icon" aria-hidden>
            <CheckCircle2 className="w-10 h-10 text-[#0ABFBC]" strokeWidth={2} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-display tracking-tight">
            Request submitted
          </h1>
          <p className="mt-4 text-sm text-white/55 leading-relaxed">
            An administrator will review your request and contact you by email once your portal
            access is approved.
          </p>
          <div className="admissions-success__actions landing-cta-actions">
            <Link href="/login" className="btn btn-primary min-h-[48px] w-full sm:w-auto px-8">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-[#0A0E1A]">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#0ABFBC]/10 blur-3xl animate-float" />
          <div
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#05335C]/30 blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="mb-12">
            <BrandLogo variant="full" href="/" className="!h-14" priority />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4 font-display">Join the portal</h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Request access to the RiseUp portal. Staff accounts are created by administrators after
            review.
          </p>
          <ul className="space-y-4">
            {[
              "Students track assignments, fees, and results",
              "Teachers manage classes and attendance",
              "Donors view impact and receipts",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 glass-card rounded-xl px-4 py-3">
                <UserPlus className="w-5 h-5 text-[#F78C1F] shrink-0 mt-0.5" aria-hidden />
                <span className="text-white/75 text-sm leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#0A0E1A]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <BrandLogo variant="full" href="/" priority />
          </div>

          <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Request portal access</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Submit your details for admin approval. You&apos;ll receive an email once access is
              granted.
            </p>

            {error && (
              <div className="alert-error flex items-center gap-3 mb-6" role="alert">
                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass} htmlFor="name">
                  Full name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="phone">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    className={inputClass}
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="roleRequested">
                  Role requested *
                </label>
                <select id="roleRequested" name="roleRequested" required className="form-select min-h-[44px]">
                  <option value="">Select role</option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="DONOR">Donor</option>
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="reason">
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  className="form-input resize-none min-h-[88px]"
                  placeholder="Briefly explain why you need access"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-[#F78C1F] hover:bg-[#E07B0E] text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(247,140,31,0.3)] hover:shadow-[0_0_30px_rgba(247,140,31,0.5)] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit request
                    <ArrowRight className="w-5 h-5" aria-hidden />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#F78C1F] font-medium hover:text-[#E07B0E] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
