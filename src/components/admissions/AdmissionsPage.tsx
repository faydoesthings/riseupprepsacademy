"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ArrowRight,
  User,
  Users,
} from "lucide-react";
import { submitAdmissionApplication } from "@/app/actions/admission-actions";
import PageHero from "@/components/layout/PageHero";
import { admissionSteps, admissionsHighlights, gradeOptionGroups } from "@/data/admissions";
import { getFadeUp, MOTION_EASE } from "@/lib/motion";

const initialForm = {
  studentName: "",
  dateOfBirth: "",
  gradeApplying: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
  previousSchool: "",
};

export default function AdmissionsPage() {
  const reduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);

  const fadeUp = getFadeUp(reduceMotion);

  const viewport = { once: true, margin: "-64px" as const };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));

    const result = await submitAdmissionApplication(fd);
    if (result.success) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } else {
      setError(result.error || "Failed to submit application");
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <main className="bg-[#0A0E1A] overflow-x-hidden">
        <PageHero
          eyebrow="Application received"
          title="Thank you for applying"
          description="Our admissions team will review your details and reach out within 3–5 business days."
        />
        <section className="section-padding pb-20 md:pb-28">
          <div className="container-main flex justify-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: MOTION_EASE }}
              className="admissions-success landing-card landing-card--center w-full max-w-lg"
            >
              <div className="admissions-success__icon" aria-hidden>
                <CheckCircle2 className="w-10 h-10 text-[#0ABFBC]" strokeWidth={2} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display tracking-tight">
                You&apos;re on the list
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed max-w-md mx-auto">
                Please keep your phone available — we may call from our admissions office to discuss
                placement and a campus visit.
              </p>
              <div className="admissions-success__actions landing-cta-actions">
                <Link href="/programs" className="btn btn-secondary min-h-[48px] px-6">
                  Explore programs
                </Link>
                <Link href="/" className="landing-link justify-center">
                  Back to home
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#0A0E1A] overflow-x-hidden">
      <PageHero
        eyebrow="Admissions open"
        title="Apply to RiseUp"
        description="We welcome students across grades. Share a few details and our team will guide you through placement and next steps."
      />

      {/* Process */}
      <section className="section-padding border-b border-white/[0.06] bg-[#070B14]/50">
        <div className="container-main section-centered">
          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="admissions-steps w-full max-w-4xl mx-auto"
          >
            {admissionSteps.map((item) => (
              <li key={item.step} className="admissions-step">
                <span className="admissions-step__num" aria-hidden>
                  {item.step}
                </span>
                <div>
                  <h2 className="admissions-step__title">{item.title}</h2>
                  <p className="admissions-step__text">{item.description}</p>
                </div>
              </li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="section-padding pb-20 md:pb-28" aria-labelledby="admissions-form-title">
        <div className="container-main">
          <div className="admissions-layout">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={fadeUp}
              className="admissions-form-card landing-card"
            >
              <header className="admissions-form-card__header">
                <div className="landing-card__icon" aria-hidden>
                  <FileText className="w-[1.375rem] h-[1.375rem] text-[#F78C1F]" strokeWidth={2} />
                </div>
                <div>
                  <h2 id="admissions-form-title" className="admissions-form-card__title">
                    Application form
                  </h2>
                  <p className="admissions-form-card__subtitle">Fields marked * are required</p>
                </div>
              </header>

              {error && (
                <div className="admissions-alert admissions-alert--error" role="alert">
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="admissions-form" noValidate>
                <fieldset className="admissions-form__section">
                  <legend className="admissions-form__legend">
                    <User className="w-4 h-4" aria-hidden />
                    Student information
                  </legend>
                  <div className="admissions-form__grid">
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="studentName">
                        Student full name *
                      </label>
                      <input
                        id="studentName"
                        type="text"
                        name="studentName"
                        required
                        autoComplete="name"
                        className="form-input"
                        placeholder="Student's full name"
                        value={formData.studentName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="dateOfBirth">
                        Date of birth *
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        name="dateOfBirth"
                        required
                        className="form-input"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="gradeApplying">
                        Current school grade *
                      </label>
                      <select
                        id="gradeApplying"
                        name="gradeApplying"
                        required
                        className="form-select"
                        value={formData.gradeApplying}
                        onChange={handleChange}
                      >
                        <option value="">Select grade</option>
                        {gradeOptionGroups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="admissions-field-hint">
                        Choose the grade your child is in now. We&apos;ll confirm placement after review.
                      </p>
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="previousSchool">
                        Previous school
                      </label>
                      <input
                        id="previousSchool"
                        type="text"
                        name="previousSchool"
                        className="form-input"
                        placeholder="Optional"
                        value={formData.previousSchool}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="admissions-form__section">
                  <legend className="admissions-form__legend">
                    <Users className="w-4 h-4" aria-hidden />
                    Parent / guardian
                  </legend>
                  <div className="admissions-form__grid">
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="parentName">
                        Full name *
                      </label>
                      <input
                        id="parentName"
                        type="text"
                        name="parentName"
                        required
                        autoComplete="name"
                        className="form-input"
                        placeholder="Parent or guardian name"
                        value={formData.parentName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="parentPhone">
                        Phone number *
                      </label>
                      <input
                        id="parentPhone"
                        type="tel"
                        name="parentPhone"
                        required
                        autoComplete="tel"
                        className="form-input"
                        placeholder="+92 300 1234567"
                        value={formData.parentPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="parentEmail">
                        Email
                      </label>
                      <input
                        id="parentEmail"
                        type="email"
                        name="parentEmail"
                        autoComplete="email"
                        className="form-input"
                        placeholder="Optional"
                        value={formData.parentEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="admissions-field admissions-field--full">
                      <label className="form-label" htmlFor="address">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        autoComplete="street-address"
                        className="form-input"
                        placeholder="City, area, Sindh"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="admissions-alert admissions-alert--info">
                  <AlertCircle className="w-5 h-5 shrink-0 text-[#4A9EE8]" aria-hidden />
                  <p>
                    After you submit, our team reviews your application and calls within 3–5 business
                    days. Bring student documents (B-form / school records) to your campus visit.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary min-h-[52px] w-full disabled:opacity-60 disabled:pointer-events-none group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5" aria-hidden />
                      Submit application
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <motion.aside
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={fadeUp}
              className="admissions-aside"
              aria-label="Admissions information"
            >
              {admissionsHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="admissions-aside-card">
                    <div className="admissions-aside-card__icon" aria-hidden>
                      <Icon className="w-5 h-5 text-[#F78C1F]" strokeWidth={2} />
                    </div>
                    <h3 className="admissions-aside-card__title">{item.title}</h3>
                    <p className="admissions-aside-card__text">{item.description}</p>
                  </article>
                );
              })}
              <div className="admissions-aside-cta landing-card">
                <p className="text-sm text-white/55 leading-relaxed">
                  Want to learn about our curriculum before you apply?
                </p>
                <Link href="/programs" className="landing-link mt-4">
                  View programs
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link href="/contact" className="landing-link mt-3">
                  Contact admissions
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </main>
  );
}
