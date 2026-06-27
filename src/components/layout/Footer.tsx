import Link from "next/link";
import { Heart, Mail, Phone, MapPin, GraduationCap, LogIn } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  ACADEMY_EMAIL,
  ACADEMY_PHONE,
  ACADEMY_PHONE_DISPLAY,
  academySocialLinks,
} from "@/data/contact";

const exploreLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Impact", href: "/impact" },
  { label: "Admissions", href: "/admissions" },
  { label: "Blog", href: "/blog" },
  { label: "Donate", href: "/donate" },
];

const footerStats = ["All grades welcome", "Not-for-profit", "Sukkur, Sindh"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container-main">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <BrandLogo variant="full" size="lg" href="/" />
            <p>
              A not-for-profit academy in Sukkur building futures through rigorous academics,
              mentorship, and community support.
            </p>
            <div className="site-footer__stats" aria-label="Academy highlights">
              {footerStats.map((stat) => (
                <span key={stat} className="site-footer__stat">
                  {stat}
                </span>
              ))}
            </div>
            <div className="site-footer__social" aria-label="Social media">
              {academySocialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__social-link"
                    aria-label={`RiseUp Preps Academy on ${link.label}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="site-footer__heading">Explore</h4>
            <nav aria-label="Footer navigation">
              <ul className="site-footer__links">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="site-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="site-footer__heading">Contact</h4>
            <ul className="site-footer__contact">
              <li className="site-footer__contact-item">
                <MapPin aria-hidden />
                <span>Sukkur / Rohri, Sindh, Pakistan</span>
              </li>
              <li className="site-footer__contact-item">
                <Mail aria-hidden />
                <a href={`mailto:${ACADEMY_EMAIL}`} className="site-footer__link">
                  {ACADEMY_EMAIL}
                </a>
              </li>
              <li className="site-footer__contact-item">
                <Phone aria-hidden />
                <a href={`tel:${ACADEMY_PHONE}`} className="site-footer__link">
                  {ACADEMY_PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__support">
            <p className="site-footer__support-title">
              PKR 2,500 sponsors one month of school for a child.
            </p>
            <p className="site-footer__support-desc">
              Tuition, supplies, and daily support — every gift goes directly to students.
            </p>
            <Link href="/donate" className="btn btn-primary min-h-[48px]">
              <Heart className="w-4 h-4" aria-hidden />
              Donate now
            </Link>
            <div className="site-footer__actions">
              <Link href="/admissions" className="site-footer__link inline-flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-[#F78C1F]" aria-hidden />
                Apply for admission
              </Link>
              <Link href="/login" className="site-footer__link inline-flex items-center gap-2">
                <LogIn className="w-3.5 h-3.5 text-[#0ABFBC]" aria-hidden />
                Portal login
              </Link>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} RiseUp Preps Academy. All rights reserved.</p>
          <p>Built with purpose in Sindh, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
