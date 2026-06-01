import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-[#070B14] border-t border-white/[0.06]">
      <div className="container-main py-14 md:py-16">
        <div className="grid md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-1">
            <BrandLogo variant="full" href="/" />
            <p className="text-sm text-white/40 leading-relaxed mt-5">
              Transforming lives through quality education in Sukkur, Sindh, Pakistan.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Quick links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About", href: "/about" },
                { label: "Programs", href: "/programs" },
                { label: "Admissions", href: "/admissions" },
                { label: "Impact", href: "/impact" },
                { label: "Donate", href: "/donate" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F78C1F] mt-0.5 shrink-0" />
                Sukkur / Rohri, Sindh, Pakistan
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F78C1F] shrink-0" />
                info@riseuppreps.org
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F78C1F] shrink-0" />
                +92 300 0000000
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Support a student</h4>
            <p className="text-sm text-white/40 mb-4 leading-relaxed">
              PKR 2,500/month covers tuition, supplies, and mentorship for one child.
            </p>
            <Link href="/donate" className="btn btn-primary btn-sm w-full min-h-[44px]">
              <Heart className="w-4 h-4" />
              Donate now
            </Link>
          </div>
        </div>

        <div className="border-t border-white/[0.04] mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>© {new Date().getFullYear()} RiseUp Preps Academy. All rights reserved.</p>
          <p>Built with purpose in Sindh, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
