"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  GraduationCap,
  Shield,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { ACADEMY_EMAIL, ACADEMY_PHONE_DISPLAY } from "@/data/contact";
import { submitRegistrationRequest } from "@/app/actions/registration-actions";

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: "Students & families",
    text: "Assignments, fees, results, and attendance.",
  },
  {
    icon: Shield,
    title: "Teachers & staff",
    text: "Classes, attendance, and student progress.",
  },
] as const;

const STEPS = [
  "Submit your details below",
  "An admin reviews your request",
  "You receive login credentials by email",
] as const;

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
      <main className="auth-page auth-page--register">
        <div className="auth-page__glow auth-page__glow--orange" aria-hidden />
        <div className="auth-page__glow auth-page__glow--teal" aria-hidden />

        <div className="auth-shell auth-shell--centered">
          <section className="auth-form-section auth-form-section--solo">
            <div className="auth-form-section__inner">
              <div className="auth-form-section__brand">
                <BrandLogo variant="full" size="md" href="/" priority />
              </div>

              <div className="auth-form-card landing-card auth-success-card">
                <div className="auth-success-card__icon" aria-hidden>
                  <CheckCircle2 className="w-7 h-7 text-[#0ABFBC]" strokeWidth={2} />
                </div>
                <h1 className="auth-success-card__title font-display">Request submitted</h1>
                <p className="auth-success-card__text">
                  An administrator will review your application and contact you at the email you
                  provided once portal access is approved.
                </p>
                <ol className="auth-success-card__steps">
                  {STEPS.map((step, i) => (
                    <li key={step}>
                      <span className="auth-success-card__step-num">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="auth-success-card__actions">
                  <Link href="/login" className="btn btn-primary">
                    Back to sign in
                  </Link>
                  <Link href="/" className="auth-form-card__link">
                    Return to website
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page auth-page--register">
      <div className="auth-page__glow auth-page__glow--orange" aria-hidden />
      <div className="auth-page__glow auth-page__glow--teal" aria-hidden />

      <div className="auth-shell">
        <aside className="auth-panel" aria-label="About portal access">
          <Link href="/" className="auth-panel__back">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to website
          </Link>

          <h1 className="auth-panel__title font-display">Request portal access</h1>
          <p className="auth-panel__lead">
            Accounts are created by administrators after review. Tell us who you are and which role
            you need.
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

        <section className="auth-form-section" aria-labelledby="register-form-heading">
          <div className="auth-form-section__inner">
            <div className="auth-form-section__brand">
              <BrandLogo variant="full" size="md" href="/" priority />
            </div>

            <div className="auth-form-card landing-card">
              <div className="auth-form-card__header">
                <span className="landing-card__icon auth-form-card__icon" aria-hidden>
                  <UserPlus className="w-[1.375rem] h-[1.375rem]" strokeWidth={2} />
                </span>
                <div>
                  <h2 id="register-form-heading" className="auth-form-card__title font-display">
                    Apply for an account
                  </h2>
                  <p className="auth-form-card__subtitle">
                    Fill in your details. We typically respond within one business day.
                  </p>
                </div>
              </div>

              {error && (
                <div className="alert-error auth-form-card__alert" role="alert">
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form__row">
                  <div className="auth-field">
                    <label className="form-label" htmlFor="register-name">
                      Full name
                    </label>
                    <div className="auth-input-wrap">
                      <User className="auth-input-wrap__icon" aria-hidden />
                      <input
                        id="register-name"
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        className="form-input auth-input-wrap__input"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="form-label" htmlFor="register-email">
                      Email
                    </label>
                    <div className="auth-input-wrap">
                      <Mail className="auth-input-wrap__icon" aria-hidden />
                      <input
                        id="register-email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        className="form-input auth-input-wrap__input"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-form__row">
                  <div className="auth-field">
                    <label className="form-label" htmlFor="register-phone">
                      Phone <span className="auth-field__optional">(opt.)</span>
                    </label>
                    <div className="auth-input-wrap">
                      <Phone className="auth-input-wrap__icon" aria-hidden />
                      <input
                        id="register-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        className="form-input auth-input-wrap__input"
                        placeholder={ACADEMY_PHONE_DISPLAY}
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="form-label" htmlFor="register-role">
                      Role
                    </label>
                    <select
                      id="register-role"
                      name="roleRequested"
                      required
                      className="form-select auth-form__select"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="DONOR">Donor</option>
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="form-label" htmlFor="register-reason">
                    Why you need access <span className="auth-field__optional">(optional)</span>
                  </label>
                  <input
                    id="register-reason"
                    type="text"
                    name="reason"
                    className="form-input"
                    placeholder="Brief connection to RiseUp Preps"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary auth-form__submit">
                  {loading ? (
                    <span className="auth-form__spinner" aria-hidden />
                  ) : (
                    <>
                      Submit request
                      <ArrowRight className="w-5 h-5" aria-hidden />
                    </>
                  )}
                </button>
              </form>

              <p className="auth-form-card__footer">
                Already have an account?{" "}
                <Link href="/login" className="auth-form-card__link">
                  Sign in
                </Link>
                {" · "}
                <a href={`mailto:${ACADEMY_EMAIL}`} className="auth-form-card__link">
                  Questions?
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
