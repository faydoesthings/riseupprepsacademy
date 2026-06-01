"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { submitRegistrationRequest } from "@/app/actions/registration-actions";

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
      <main className="min-h-screen flex items-center justify-center p-8 bg-[#0A0E1A]">
        <div className="glass-card max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0ABFBC]/10 flex items-center justify-center mx-auto mb-4 border border-[#0ABFBC]/20">
            <CheckCircle2 className="w-8 h-8 text-[#0ABFBC]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Request submitted</h1>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            An administrator will review your request and contact you by email once your
            portal access is approved.
          </p>
          <Link href="/login" className="btn btn-navy w-full">
            Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[#0A0E1A]">
      <div className="w-full max-w-md mx-4">
        <div className="flex justify-center mb-8">
          <BrandLogo variant="full" href="/" />
        </div>

        <div className="glass-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Request portal access</h1>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Submit your details for admin approval. Staff accounts are created by
            administrators only.
          </p>

          {error && (
            <div className="alert-error flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input pl-11"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  className="form-input pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  className="form-input pl-11"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Role Requested *</label>
              <select name="roleRequested" required className="form-select">
                <option value="">Select role</option>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="DONOR">Donor</option>
              </select>
            </div>

            <div>
              <label className="form-label">Reason (optional)</label>
              <textarea
                name="reason"
                rows={3}
                className="form-input resize-none"
                placeholder="Briefly explain why you need access"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full min-h-[44px] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#F78C1F] font-medium hover:text-[#E07B0E] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
