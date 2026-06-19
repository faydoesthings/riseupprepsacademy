"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { submitContactMessage } from "@/app/actions/contact-actions";
import PageHero from "@/components/layout/PageHero";
import {
  ACADEMY_MAP_EMBED,
  contactChannels,
  contactSubjects,
} from "@/data/contact";
import { getFadeUp, MOTION_EASE } from "@/lib/motion";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);

  const fadeUp = getFadeUp(reduceMotion);

  const viewport = { once: true, margin: "-64px" as const };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));

    const result = await submitContactMessage(fd);
    if (result.success) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } else {
      setError(result.error || "Failed to send message");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <main className="bg-[#0A0E1A] overflow-x-hidden">
        <PageHero
          eyebrow="Message received"
          title="Thanks for reaching out"
          description="Our team typically responds within one business day."
        />
        <section className="section-padding pb-20 md:pb-28">
          <div className="container-main flex justify-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: MOTION_EASE }}
              className="contact-success landing-card landing-card--center w-full max-w-lg"
            >
              <div className="contact-success__icon" aria-hidden>
                <CheckCircle2 className="w-10 h-10 text-[#0ABFBC]" strokeWidth={2} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display tracking-tight">
                We&apos;ll be in touch soon
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed max-w-md mx-auto">
                For urgent admissions questions, you can also message us on WhatsApp during office
                hours.
              </p>
              <div className="contact-success__actions landing-cta-actions">
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary min-h-[48px] px-6"
                >
                  Open WhatsApp
                </a>
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
        eyebrow="Contact"
        title="We're here to help"
        description="Questions about admissions, visits, donations, or partnerships — reach out and our team will respond personally."
      />

      <section className="section-padding border-b border-white/[0.06]" aria-labelledby="contact-form-title">
        <div className="container-main">
          <div className="contact-layout">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={fadeUp}
              className="contact-form-card landing-card"
            >
              <header className="contact-form-card__header">
                <div className="landing-card__icon" aria-hidden>
                  <MessageSquare className="w-[1.375rem] h-[1.375rem] text-[#F78C1F]" strokeWidth={2} />
                </div>
                <div>
                  <h2 id="contact-form-title" className="contact-form-card__title">
                    Send a message
                  </h2>
                  <p className="contact-form-card__subtitle">We usually reply within 24 hours</p>
                </div>
              </header>

              {error && (
                <div className="contact-alert contact-alert--error" role="alert">
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="contact-form__grid">
                  <div className="contact-field">
                    <label className="form-label" htmlFor="contact-name">
                      Your name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      className="form-input"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field">
                    <label className="form-label" htmlFor="contact-email">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field">
                    <label className="form-label" htmlFor="contact-phone">
                      Phone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      className="form-input"
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field">
                    <label className="form-label" htmlFor="contact-subject">
                      Topic *
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      className="form-select"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      {contactSubjects.map((opt) => (
                        <option key={opt.value || "empty"} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="contact-field contact-field--full">
                    <label className="form-label" htmlFor="contact-message">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      className="form-textarea"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary min-h-[52px] w-full disabled:opacity-60 disabled:pointer-events-none group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden />
                      Send message
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
              className="contact-aside"
              aria-label="Contact details"
            >
              <div className="contact-info landing-card">
                <h3 className="contact-info__title">Reach us directly</h3>
                <ul className="contact-info__list">
                  {contactChannels.map((channel) => {
                    const Icon = channel.icon;
                    const content = (
                      <>
                        <span
                          className="contact-info__icon"
                          style={{
                            borderColor: `${channel.accent}40`,
                            background: `${channel.accent}14`,
                          }}
                          aria-hidden
                        >
                          <Icon className="w-4 h-4" style={{ color: channel.accent }} strokeWidth={2} />
                        </span>
                        <span className="contact-info__body">
                          <span className="contact-info__label">{channel.title}</span>
                          <span
                            className={
                              channel.href ? "contact-info__value contact-info__value--link" : "contact-info__value"
                            }
                          >
                            {channel.value}
                          </span>
                        </span>
                      </>
                    );

                    return (
                      <li key={channel.id}>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className="contact-info__row"
                            {...(channel.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                          >
                            {content}
                          </a>
                        ) : (
                          <div className="contact-info__row">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="contact-quick-links landing-card">
                <p className="text-sm text-white/55 leading-relaxed">
                  Applying for a place or supporting a student?
                </p>
                <Link href="/admissions" className="landing-link mt-4">
                  Start admission application
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link href="/donate" className="landing-link mt-3">
                  Sponsor a student
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="section-padding pb-20 md:pb-28" aria-labelledby="contact-map-title">
        <div className="container-main max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="landing-card overflow-hidden p-0"
          >
            <div className="contact-map-grid">
              <div className="contact-map-copy">
                <div className="landing-card__icon mb-6">
                  <MapPin className="w-[1.375rem] h-[1.375rem] text-[#F78C1F]" strokeWidth={2} aria-hidden />
                </div>
                <h2 id="contact-map-title" className="text-xl font-bold text-white mb-3 tracking-tight font-display">
                  Visit our campus
                </h2>
                <p className="text-sm text-white/55 leading-relaxed mb-4">
                  RiseUp Preps Academy serves families in Sukkur and Rohri. Schedule a visit through
                  the form above or call during office hours.
                </p>
                <p className="text-sm text-white/45">Monday – Saturday · 8:00 AM – 2:00 PM</p>
              </div>
              <div className="contact-map-frame">
                <iframe
                  src={ACADEMY_MAP_EMBED}
                  width="100%"
                  height="100%"
                  className="contact-map-iframe"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RiseUp Preps Academy location on map"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
