"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Shield,
  GraduationCap,
  HeartHandshake,
  LogIn,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { getDashboardPath } from "@/lib/roles";

const DEV_PASSWORD = "password123";

const DEV_ACCOUNTS = [
  { label: "Admin", email: "admin@riseuppreps.com" },
  { label: "Teacher", email: "fatima@riseuppreps.com" },
  { label: "Student", email: "student@riseuppreps.com" },
  { label: "Donor", email: "donor@riseuppreps.com" },
  { label: "Accountant", email: "accountant@riseuppreps.com" },
] as const;

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: "Students & families",
    text: "Assignments, fees, results, and attendance in one place.",
  },
  {
    icon: Shield,
    title: "Staff & leadership",
    text: "Manage classes, admissions, finance, and school operations.",
  },
  {
    icon: HeartHandshake,
    title: "Donors & partners",
    text: "Track impact, receipts, and transparent giving.",
  },
] as const;

async function resolveDashboardPath(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { user?: { role?: string } };
      const role = data.user?.role;
      if (role) return getDashboardPath(role);
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  return "/portal";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [inactiveMessage, setInactiveMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get("error");
    if (urlError === "AccountInactive") {
      setInactiveMessage("Your account is inactive. Contact the academy office.");
    } else if (urlError === "ProfileInactive") {
      setInactiveMessage("Your student or teacher profile is inactive.");
    } else if (urlError) {
      setInactiveMessage("Sign-in failed. Please try again.");
    }
  }, []);

  const signInWithCredentials = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");
    setInactiveMessage("");

    try {
      const result = await signIn("credentials", {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      window.location.assign(await resolveDashboardPath());
    } catch {
      setError("Could not reach the server. Check that the database is running, then try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void signInWithCredentials(email, password);
  };

  const handleQuickLogin = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword(DEV_PASSWORD);
    void signInWithCredentials(accountEmail, DEV_PASSWORD);
  };

  const bannerMessage = error || inactiveMessage;

  return (
    <main className="auth-page">
      <div className="auth-page__glow auth-page__glow--orange" aria-hidden />
      <div className="auth-page__glow auth-page__glow--teal" aria-hidden />

      <div className="auth-shell">
        <aside className="auth-panel" aria-label="About the RiseUp portal">
          <Link href="/" className="auth-panel__back">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to website
          </Link>

          <h1 className="auth-panel__title font-display">Welcome back</h1>
          <p className="auth-panel__lead">
            Sign in to your RiseUp portal — built for students, staff, donors, and families across
            Sukkur and Rohri.
          </p>

          <ul className="auth-highlights">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="auth-highlight">
                <span className="auth-highlight__icon" aria-hidden>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="auth-highlight__title">{title}</p>
                  <p className="auth-highlight__text">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="auth-form-section" aria-labelledby="auth-sign-in-heading">
          <div className="auth-form-section__inner">
            <div className="auth-form-section__brand">
              <BrandLogo variant="full" size="md" href="/" priority />
            </div>
            <div className="auth-form-card landing-card">
              <div className="auth-form-card__header">
                <span className="landing-card__icon auth-form-card__icon" aria-hidden>
                  <LogIn className="w-[1.375rem] h-[1.375rem]" strokeWidth={2} />
                </span>
                <div>
                  <h2 id="auth-sign-in-heading" className="auth-form-card__title font-display">
                    Sign in
                  </h2>
                  <p className="auth-form-card__subtitle">
                    Use the email and password provided by the academy.
                  </p>
                </div>
              </div>

              {bannerMessage && (
                <div className="alert-error auth-form-card__alert" role="alert">
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden />
                  <span>{bannerMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="form-label" htmlFor="login-email">
                    Email address
                  </label>
                  <div className="auth-input-wrap">
                    <Mail className="auth-input-wrap__icon" aria-hidden />
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input auth-input-wrap__input"
                      placeholder="you@riseuppreps.com"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <div className="auth-input-wrap">
                    <Lock className="auth-input-wrap__icon" aria-hidden />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input auth-input-wrap__input auth-input-wrap__input--password"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-input-wrap__toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary auth-form__submit"
                >
                  {loading ? (
                    <span className="auth-form__spinner" aria-hidden />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5" aria-hidden />
                    </>
                  )}
                </button>
              </form>

              <p className="auth-form-card__footer">
                Need access?{" "}
                <Link href="/register" className="auth-form-card__link">
                  Request a portal account
                </Link>
              </p>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="auth-dev">
                <summary className="auth-dev__summary">Development quick sign-in</summary>
                <p className="auth-dev__hint">Password for all test accounts: {DEV_PASSWORD}</p>
                <div className="auth-dev__chips">
                  {DEV_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickLogin(account.email)}
                      className="auth-dev__chip"
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
