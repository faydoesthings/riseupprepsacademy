"use client";

import { Award, Heart } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import PageHero from "@/components/layout/PageHero";

const impactStats = [
  { label: "Students enrolled", value: 30, suffix: "+", color: "#F78C1F" },
  { label: "Subjects taught", value: 18, suffix: "", color: "#0ABFBC" },
  { label: "Attendance rate", value: 94, suffix: "%", color: "#0ABFBC" },
  { label: "Exam pass rate", value: 92, suffix: "%", color: "#F78C1F" },
  { label: "Donations (PKR)", value: 900, suffix: "K+", color: "#F78C1F" },
  { label: "Active donors", value: 15, suffix: "+", color: "#0ABFBC" },
];

const monthlyDonations = [
  { month: "Jan", amount: 85000 },
  { month: "Feb", amount: 120000 },
  { month: "Mar", amount: 95000 },
  { month: "Apr", amount: 180000 },
  { month: "May", amount: 150000 },
];

const topDonors = [
  { name: "Aisha Foundation", amount: 500000, anonymous: false },
  { name: "Kareem Overseas Trust", amount: 250000, anonymous: true },
  { name: "Hamza Merchant", amount: 150000, anonymous: false },
];

export default function ImpactPage() {
  const maxDonation = Math.max(...monthlyDonations.map((d) => d.amount));

  return (
    <main className="bg-[#0A0E1A]">
      <PageHero
        eyebrow="Transparency"
        title="Our impact"
        description="Every number reflects real progress — students in class, exams passed, and community support received."
      />

      <section className="border-b border-white/[0.06] bg-[#070B14]">
        <div className="container-main py-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-4 lg:divide-x lg:divide-white/[0.06]">
            {impactStats.map((stat, i) => (
              <div key={i} className="text-center lg:px-4">
                <p className="text-2xl md:text-3xl font-bold font-mono" style={{ color: stat.color }}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000 + i * 150} />
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-main max-w-3xl">
          <h2 className="text-xl font-bold text-white text-center mb-2">Monthly donations</h2>
          <p className="text-sm text-white/40 text-center mb-10">Community giving over recent months (PKR)</p>

          <div className="glass-card p-6 md:p-8">
            <div className="flex items-end gap-3 md:gap-4 h-52">
              {monthlyDonations.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className="text-[10px] md:text-xs font-mono text-white/50">
                    {(d.amount / 1000).toFixed(0)}K
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#05335C] to-[#F78C1F]/80 min-h-[8px] transition-all"
                    style={{ height: `${(d.amount / maxDonation) * 100}%` }}
                  />
                  <span className="text-xs text-white/35">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-white/[0.06]">
        <div className="container-main">
          <h2 className="text-xl font-bold text-white text-center mb-2">Donor recognition</h2>
          <p className="text-sm text-white/40 text-center mb-10 max-w-lg mx-auto">
            Thank you to the supporters who make our mission possible.
          </p>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {topDonors.map((donor, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F78C1F]/10 border border-[#F78C1F]/20 flex items-center justify-center mx-auto mb-4">
                  {i === 0 ? (
                    <Award className="w-7 h-7 text-[#F78C1F]" />
                  ) : (
                    <Heart className="w-7 h-7 text-[#F78C1F]" />
                  )}
                </div>
                <h3 className="font-semibold text-white">{donor.anonymous ? "Anonymous donor" : donor.name}</h3>
                <p className="text-[#F78C1F] font-bold font-mono text-lg mt-2">
                  PKR {donor.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
