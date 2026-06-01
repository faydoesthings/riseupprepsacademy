"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

const inputClass =
  "w-full pl-11 pr-4 py-3 min-h-[44px] bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#F78C1F]/30 focus:border-[#F78C1F]/50 transition-all";
const inputClassPassword = `${inputClass} pr-11`;
const labelClass = "block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        const role = session?.user?.role;

        const paths: Record<string, string> = {
          SUPER_ADMIN: "/portal/admin",
          ACCOUNTANT: "/portal/accountant",
          TEACHER: "/portal/teacher",
          STUDENT: "/portal/student",
          DONOR: "/portal/donor",
        };

        router.push(paths[role] || "/portal");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#0A0E1A]">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#F78C1F]/10 blur-3xl animate-float" />
          <div
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#05335C]/30 blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="mb-12">
            <BrandLogo variant="full" href="/" className="!h-14" priority />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4 font-display">Welcome back</h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Access your personalized dashboard to manage classes, track progress, and stay connected
            with the RiseUp community.
          </p>
          <div className="space-y-4">
            {["Admin", "Teacher", "Student", "Donor", "Accountant"].map((role) => (
              <div key={role} className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#F78C1F]/20 flex items-center justify-center">
                  <span className="text-[#F78C1F] text-sm font-bold">{role[0]}</span>
                </div>
                <span className="text-white/80 text-sm">{role} portal</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#0A0E1A]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <BrandLogo variant="full" href="/" priority />
          </div>

          <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Sign in</h2>
            <p className="text-white/50 text-sm mb-8">Enter your credentials to access your portal</p>

            {error && (
              <div className="alert-error flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@riseuppreps.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClassPassword}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#F78C1F] hover:bg-[#E07B0E] text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(247,140,31,0.3)] hover:shadow-[0_0_30px_rgba(247,140,31,0.5)] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/register"
                className="text-sm text-[#F78C1F] font-medium hover:text-[#E07B0E] transition-colors"
              >
                Don&apos;t have an account? Request access
              </Link>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 rounded-xl border border-[#05335C]/30 bg-[#05335C]/20">
                <p className="text-xs font-semibold text-white/70 mb-2">
                  Development logins (password: password123)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-white/50">
                  <span>Admin: admin@riseuppreps.com</span>
                  <span>Teacher: fatima@riseuppreps.com</span>
                  <span>Student: student1@riseuppreps.com</span>
                  <span>Donor: hamza@donor.com</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
