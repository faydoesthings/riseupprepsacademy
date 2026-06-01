"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Users, CreditCard, CheckCircle2, Shield, ChevronRight } from "lucide-react";

const amountPresets = [1000, 2500, 5000, 10000];

export default function DonatePage() {
  const [donationType, setDonationType] = useState<"general" | "sponsor">("general");
  const [amount, setAmount] = useState<number | null>(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [submitted, setSubmitted] = useState(false);

  const finalAmount = amount || parseInt(customAmount) || 0;

  if (submitted) {
    return (
      <main>
        <section className="relative pt-32 pb-20 min-h-screen">
          <div className="absolute inset-0 gradient-hero" />
          <div className="container-main relative z-10 flex items-center justify-center py-20">
            <div className="glass-card max-w-lg mx-auto p-8 sm:p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Thank You for Your Generosity!</h2>
              <p className="text-gray-600 mb-4">
                Your donation of <strong className="text-[#F78C1F]">PKR {finalAmount.toLocaleString()}</strong> has been recorded. You will receive a confirmation receipt via email.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Every rupee you donate goes directly towards educating underprivileged children in Sindh.
              </p>
              <Link href="/" className="btn btn-primary">Back to Home</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative pt-48 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#F78C1F]/10 blur-3xl" />
        </div>
        <div className="container-main relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
            <Heart className="w-4 h-4 text-[#F78C1F]" />
            <span className="text-sm text-white/80 font-medium">Make a Difference</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Support Our Students
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Your generosity directly funds tuition, supplies, and programs that change lives in Sindh.
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 md:py-20 bg-[#0A0E1A]">
        <div className="container-main">
          <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-8">
            {/* Form */}
            <div className="md:col-span-3">
              <div className="card-elevated p-8">
                {/* Donation Type */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">I want to</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDonationType("general")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        donationType === "general"
                          ? "border-[#F78C1F] bg-[#F78C1F]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="mb-3 block">
                        <Heart className={`w-6 h-6 ${donationType === "general" ? "text-[#F78C1F]" : "text-gray-400"}`} />
                      </div>
                      <h4 className="font-semibold text-white">General Donation</h4>
                      <p className="text-xs text-gray-400 mt-1">Support the academy fund</p>
                    </button>
                    <button
                      onClick={() => setDonationType("sponsor")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        donationType === "sponsor"
                          ? "border-[#F78C1F] bg-[#F78C1F]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="mb-3 block">
                        <Users className={`w-6 h-6 ${donationType === "sponsor" ? "text-[#F78C1F]" : "text-gray-400"}`} />
                      </div>
                      <h4 className="font-semibold text-white">Sponsor a Student</h4>
                      <p className="text-xs text-gray-400 mt-1">PKR 2,500/month</p>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Select Amount (PKR)</h3>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {amountPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => { setAmount(preset); setCustomAmount(""); }}
                        className={`py-3 rounded-xl font-bold text-sm transition-all ${
                          amount === preset
                            ? "bg-[#F78C1F] text-white shadow-lg shadow-[#F78C1F]/30"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium z-10 pointer-events-none">PKR</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                      className="form-input"
                      style={{ paddingLeft: "60px" }}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    {[
                      { id: "jazzcash", label: "JazzCash", desc: "Pay via JazzCash mobile wallet" },
                      { id: "easypaisa", label: "EasyPaisa", desc: "Pay via EasyPaisa mobile wallet" },
                      { id: "bank", label: "Bank Transfer", desc: "Direct bank transfer" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-[#05335C] bg-[#05335C]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-[#05335C]"
                        />
                        <div>
                          <h4 className="font-semibold text-white">{method.label}</h4>
                          <p className="text-xs text-gray-400">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Donor Info */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-input" placeholder="+92 300 1234567" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#05335C] rounded" />
                        <span className="text-sm text-gray-600">Remain anonymous</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSubmitted(true)}
                  disabled={!finalAmount}
                  className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" />
                  Donate PKR {finalAmount.toLocaleString()}
                </button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="md:col-span-2">
              <div className="card-elevated p-6 sticky top-24">
                <h3 className="font-bold text-white text-lg mb-6">Donation Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-white">{donationType === "general" ? "General Fund" : "Student Sponsorship"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-[#F78C1F] text-lg">PKR {finalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-medium text-white capitalize">{paymentMethod}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-semibold text-white text-sm mb-3">Your Impact</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Auto-generated tax receipt
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Transparent fund usage reports
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Student progress updates
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
                  <Shield className="w-4 h-4" />
                  Secure & encrypted payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
