"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Users,
  CreditCard,
  Shield,
  Loader2,
  ArrowRight,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { submitDonationPledge } from "@/app/actions/donor-actions";
import PageHero from "@/components/layout/PageHero";
import DonorImpactShowcase from "@/components/media/DonorImpactShowcase";
import { ACADEMY_PHONE_DISPLAY } from "@/data/contact";

const amountPresets = [1000, 2500, 5000, 10000];

const impactHighlights = [
  {
    icon: Receipt,
    title: "Tax receipt",
    description: "Auto-generated receipt sent to your email within minutes.",
  },
  {
    icon: TrendingUp,
    title: "Transparent reporting",
    description: "Quarterly fund usage reports published on our Impact page.",
  },
  {
    icon: Users,
    title: "Student updates",
    description: "Sponsors receive progress notes from the students they support.",
  },
];

export default function DonatePage() {
  const [donationType, setDonationType] = useState<"general" | "sponsor">("general");
  const [amount, setAmount] = useState<number | null>(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  const finalAmount = amount || parseInt(customAmount, 10) || 0;

  if (submitted) {
    return (
      <main className="bg-[#0A0E1A] overflow-x-hidden">
        <PageHero
          eyebrow="Thank you"
          title="Your generosity matters"
          description="We've recorded your pledge. A confirmation receipt will arrive by email shortly."
        />
        <section className="section-padding pb-20 md:pb-28">
          <div className="container-main flex justify-center">
            <div className="admissions-success landing-card landing-card--center w-full max-w-lg">
              <div className="admissions-success__icon" aria-hidden>
                <Heart className="w-10 h-10 text-[#0ABFBC]" strokeWidth={2} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display tracking-tight">
                PKR {finalAmount.toLocaleString()} pledged
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed max-w-md mx-auto">
                Every rupee goes directly toward tuition, supplies, and programs for students in
                Sindh. Our team will follow up with payment instructions if needed.
              </p>
              <div className="admissions-success__actions landing-cta-actions">
                <Link href="/impact" className="btn btn-secondary min-h-[48px] px-6">
                  See your impact
                </Link>
                <Link href="/" className="landing-link justify-center">
                  Back to home
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#0A0E1A] overflow-x-hidden">
      <PageHero
        eyebrow="Make a difference"
        title="Support our students"
        description="Your gift funds tuition, supplies, and programs that change lives across Sindh."
      />

      <section className="section-padding border-b border-white/[0.06] bg-[#070B14]/50">
        <div className="container-main section-centered">
          <ol className="admissions-steps" aria-label="How giving works">
            {[
              { n: "01", title: "Choose amount", text: "Pick a preset or enter a custom PKR amount." },
              { n: "02", title: "Share details", text: "Tell us how you'd like to pay and where to send your receipt." },
              { n: "03", title: "See impact", text: "Track fund usage and student progress on our Impact page." },
            ].map((step) => (
              <li key={step.n} className="admissions-step">
                <span className="admissions-step__num">{step.n}</span>
                <div>
                  <h3 className="admissions-step__title">{step.title}</h3>
                  <p className="admissions-step__text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-padding border-b border-white/[0.06]">
        <div className="container-main max-w-4xl mx-auto">
          <DonorImpactShowcase
            photoId="students-writing"
            eyebrow="Where it goes"
            title="PKR 2,500 keeps one child in class for a month"
            description="Tuition, notebooks, and daily support — your gift shows up in scenes exactly like this, every school day."
            stats={[
              { label: "Suggested monthly gift", value: "PKR 2,500" },
              { label: "Covers", value: "1 student" },
            ]}
          />
        </div>
      </section>

      <section className="section-padding">
        <div className="container-main">
          <div className="admissions-layout">
            <div className="landing-card donate-form-card">
              <header className="admissions-form-card__header">
                <div className="landing-card__icon landing-card__icon--lg" aria-hidden>
                  <Heart className="w-7 h-7" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="admissions-form-card__title">Complete your pledge</h2>
                  <p className="admissions-form-card__subtitle">
                    Secure, transparent giving — 100% directed to student programs.
                  </p>
                </div>
              </header>

              {error && (
                <div className="admissions-alert admissions-alert--error mb-6" role="alert">
                  {error}
                </div>
              )}

              <form
                className="admissions-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!finalAmount) {
                    setError("Please select or enter a donation amount.");
                    return;
                  }
                  if (!donorName.trim() || !donorEmail.trim()) {
                    setError("Please enter your name and email to continue.");
                    return;
                  }
                  setLoading(true);
                  setError("");
                  const fd = new FormData();
                  fd.set("name", donorName);
                  fd.set("email", donorEmail);
                  fd.set("phone", donorPhone);
                  fd.set("amount", String(finalAmount));
                  fd.set("type", donationType === "sponsor" ? "MONTHLY" : "ONE_TIME");
                  fd.set("method", paymentMethod.toUpperCase());
                  const result = await submitDonationPledge(fd);
                  if (result.success) {
                    setSubmitted(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    setError(result.error || "Failed to submit pledge");
                  }
                  setLoading(false);
                }}
              >
                <fieldset className="admissions-form__section">
                  <legend className="admissions-form__legend">I want to</legend>
                  <div className="donate-type-grid">
                    <button
                      type="button"
                      onClick={() => setDonationType("general")}
                      aria-pressed={donationType === "general"}
                      className={`donate-type-option${donationType === "general" ? " donate-type-option--active" : ""}`}
                    >
                      <Heart className="w-5 h-5 shrink-0" aria-hidden />
                      <span>
                        <strong>General donation</strong>
                        <small>Support the academy fund</small>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationType("sponsor")}
                      aria-pressed={donationType === "sponsor"}
                      className={`donate-type-option${donationType === "sponsor" ? " donate-type-option--active" : ""}`}
                    >
                      <Users className="w-5 h-5 shrink-0" aria-hidden />
                      <span>
                        <strong>Sponsor a student</strong>
                        <small>From PKR 2,500/month</small>
                      </span>
                    </button>
                  </div>
                </fieldset>

                <fieldset className="admissions-form__section">
                  <legend className="admissions-form__legend">Amount (PKR)</legend>
                  <div className="donate-amount-grid">
                    {amountPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        aria-pressed={amount === preset}
                        onClick={() => {
                          setAmount(preset);
                          setCustomAmount("");
                        }}
                        className={`donate-amount-btn${amount === preset ? " donate-amount-btn--active" : ""}`}
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="donate-custom-amount mt-3">
                    <label className="form-label" htmlFor="customAmount">
                      Custom amount
                    </label>
                    <div className="relative">
                      <span className="donate-currency-prefix" aria-hidden>
                        PKR
                      </span>
                      <input
                        id="customAmount"
                        type="number"
                        min={100}
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount(null);
                        }}
                        className="form-input donate-custom-input"
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="admissions-form__section">
                  <legend className="admissions-form__legend">Payment method</legend>
                  <div className="donate-payment-list">
                    {[
                      { id: "jazzcash", label: "JazzCash", desc: "Mobile wallet" },
                      { id: "easypaisa", label: "EasyPaisa", desc: "Mobile wallet" },
                      { id: "bank", label: "Bank transfer", desc: "Direct deposit" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`donate-payment-option${paymentMethod === method.id ? " donate-payment-option--active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <span>
                          <strong>{method.label}</strong>
                          <small>{method.desc}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="admissions-form__section">
                  <legend className="admissions-form__legend">Your information</legend>
                  <div className="admissions-form__grid">
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="donorName">
                        Full name *
                      </label>
                      <input
                        id="donorName"
                        type="text"
                        required
                        autoComplete="name"
                        className="form-input"
                        placeholder="Your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                      />
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="donorEmail">
                        Email *
                      </label>
                      <input
                        id="donorEmail"
                        type="email"
                        required
                        autoComplete="email"
                        className="form-input"
                        placeholder="email@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                      />
                    </div>
                    <div className="admissions-field">
                      <label className="form-label" htmlFor="donorPhone">
                        Phone
                      </label>
                      <input
                        id="donorPhone"
                        type="tel"
                        autoComplete="tel"
                        className="form-input"
                        placeholder={ACADEMY_PHONE_DISPLAY}
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                      />
                    </div>
                    <div className="admissions-field flex items-end">
                      <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px]">
                        <input type="checkbox" className="w-4 h-4 accent-[#F78C1F] rounded" />
                        <span className="text-sm text-white/60">Remain anonymous</span>
                      </label>
                    </div>
                  </div>
                </fieldset>

                <div className="admissions-alert admissions-alert--info">
                  <Shield className="w-5 h-5 shrink-0 text-[#0ABFBC]" aria-hidden />
                  <p>
                    Your payment details are handled securely. You&apos;ll receive a tax receipt by
                    email and can track fund usage on our{" "}
                    <Link href="/impact" className="text-[#F78C1F] hover:underline">
                      Impact page
                    </Link>
                    .
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
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" aria-hidden />
                      Donate PKR {finalAmount.toLocaleString()}
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </>
                  )}
                </button>
              </form>
            </div>

            <aside className="admissions-aside" aria-label="Donation summary">
              <article className="donate-summary landing-card">
                <h3 className="admissions-aside-card__title mb-4">Donation summary</h3>
                <dl className="donate-summary__list">
                  <div>
                    <dt>Type</dt>
                    <dd>{donationType === "general" ? "General fund" : "Student sponsorship"}</dd>
                  </div>
                  <div>
                    <dt>Amount</dt>
                    <dd className="donate-summary__amount">PKR {finalAmount.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd className="capitalize">{paymentMethod}</dd>
                  </div>
                </dl>
              </article>

              {impactHighlights.map((item) => {
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
                  Questions about giving or corporate partnerships?
                </p>
                <Link href="/contact" className="landing-link mt-4">
                  Contact our team
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
