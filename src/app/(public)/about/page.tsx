import type { Metadata } from "next";
import { Target, Eye, Heart, Users, Award, MapPin, Star, CheckCircle2 } from "lucide-react";
import PageHero from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "About Us — RiseUp Preps Academy",
  description:
    "Learn about RiseUp Preps Academy's mission to educate Sindh, our team, vision, and the story behind our academy in Sukkur/Rohri.",
};

const team = [
  {
    name: "Mairaj Rashdi",
    role: "Founder & Director",
    initials: "MR",
    bio: "Visionary leader committed to transforming education in Sindh through technology and community support.",
  },
  {
    name: "Fatima Shaikh",
    role: "Head of Academics",
    initials: "FS",
    bio: "M.Ed graduate with 8+ years of teaching experience, specializing in Mathematics and curriculum development.",
  },
  {
    name: "Muhammad Ali",
    role: "Senior Teacher",
    initials: "MA",
    bio: "MA English Literature, passionate about fostering critical thinking and communication skills in students.",
  },
  {
    name: "Saima Parveen",
    role: "IT & Science Faculty",
    initials: "SP",
    bio: "BSc Computer Science, bringing technology literacy and scientific inquiry to the classroom.",
  },
  {
    name: "Ahmed Khan",
    role: "Finance & Operations",
    initials: "AK",
    bio: "Managing the academy's financial operations with transparency and accountability.",
  },
];

const timeline = [
  { year: "2024", title: "The Vision", description: "RiseUp Preps Academy was conceived with a mission to provide quality education to underprivileged children in Sindh." },
  { year: "2025", title: "Foundation", description: "Academy formally established in Sukkur/Rohri. First batch of students enrolled with a team of dedicated teachers." },
  { year: "2026", title: "Digital Transformation", description: "Launch of the integrated digital platform, expanding reach and enabling donor engagement from around the world." },
  { year: "2027", title: "The Future", description: "Scaling to 200+ students, multi-campus expansion, and mobile app launch for seamless access to education." },
];

const values = [
  { icon: Heart, title: "Compassion", description: "Every decision is guided by genuine care for our students' well-being and future." },
  { icon: Star, title: "Excellence", description: "We maintain the highest standards in teaching, administration, and student outcomes." },
  { icon: Users, title: "Community", description: "Education is a collective effort — we thrive through partnerships with families and donors." },
  { icon: Award, title: "Integrity", description: "Transparent operations, honest reporting, and accountable use of every donation received." },
];

export default function AboutPage() {
  return (
    <main className="bg-[#0A0E1A]">
      <PageHero
        eyebrow="Our story"
        title="About RiseUp Preps Academy"
        description="A mission-driven school in Sukkur empowering the next generation through accessible, quality education."
      />

      <section className="py-16 md:py-20 border-b border-white/[0.06]">
        <div className="container-main grid md:grid-cols-2 gap-6">
          <div className="glass-card p-8 border-l-2 border-l-[#05335C]">
            <div className="w-12 h-12 rounded-xl bg-[#05335C]/30 flex items-center justify-center mb-5">
              <Eye className="w-6 h-6 text-[#4A9EE8]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Our vision</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              To be a catalyst for educational transformation in rural Sindh — empowering compassionate leaders who uplift their communities.
            </p>
          </div>
          <div className="glass-card p-8 border-l-2 border-l-[#F78C1F]">
            <div className="w-12 h-12 rounded-xl bg-[#F78C1F]/10 flex items-center justify-center mb-5">
              <Target className="w-6 h-6 text-[#F78C1F]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Our mission</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              To provide accessible, high-quality education in Sukkur and Rohri through dedicated teaching, community partnerships, and transparent donor engagement.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-white/[0.06]">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-white text-center mb-3">Our journey</h2>
          <p className="text-sm text-white/40 text-center mb-12 max-w-lg mx-auto">
            From a vision to a thriving academy — every step driven by purpose.
          </p>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
            {timeline.map((item, i) => (
              <div key={i} className="glass-card p-6 flex gap-5">
                <div className="w-11 h-11 rounded-full bg-[#05335C] flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {item.year}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-white/[0.06]">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Core values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="w-11 h-11 rounded-xl bg-[#F78C1F]/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-5 h-5 text-[#F78C1F]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-white/[0.06]">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-white text-center mb-3">Meet our team</h2>
          <p className="text-sm text-white/40 text-center mb-12 max-w-lg mx-auto">
            Educators and leaders committed to every child in our care.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#05335C] to-[#0A4A82] flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-white">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-[#F78C1F] mt-1 mb-3">{member.role}</p>
                <p className="text-xs text-white/45 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-main">
          <div className="glass-card overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="w-11 h-11 rounded-xl bg-[#F78C1F]/10 flex items-center justify-center mb-5">
                  <MapPin className="w-5 h-5 text-[#F78C1F]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-3">Visit our campus</h2>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">
                  Located in Sukkur/Rohri, our campus is a safe and inspiring place to learn.
                </p>
                <ul className="space-y-2.5 text-sm text-white/45">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ABFBC] shrink-0" />
                    Sukkur / Rohri, Sindh, Pakistan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ABFBC] shrink-0" />
                    Monday – Saturday, 8:00 AM – 2:00 PM
                  </li>
                </ul>
              </div>
              <div className="bg-[#0D1B2A] min-h-[280px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56640.42047147098!2d68.82!3d27.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3935f5ff7c6e7b41%3A0xb45e8f2d4a93c7a!2sSukkur%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "300px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RiseUp Academy Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
