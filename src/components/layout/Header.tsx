"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/brand/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/blog", label: "Blog" },
  { href: "/admissions", label: "Admissions" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/[0.06] bg-[#0F172A]/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-main">
        <div className="grid min-h-[4.75rem] grid-cols-[auto_1fr_auto] items-center gap-4 py-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex items-center justify-start min-w-0">
            <BrandLogo variant="full" size="md" priority />
          </div>

          <nav
            className="hidden lg:flex items-center justify-center gap-0.5"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="site-nav-link"
                data-active={pathname === link.href ? "true" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2.5">
              <Link href="/login" className="btn btn-login btn-sm min-h-[44px] px-5">
                Login
              </Link>
              <Link
                href="/donate"
                className="btn btn-primary btn-sm min-h-[44px] px-5"
                aria-label="Donate to RiseUp Preps Academy"
              >
                <Heart className="w-4 h-4" aria-hidden />
                Donate
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl",
                "text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
              )}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            id="mobile-nav"
            className="lg:hidden border-t border-white/[0.06] pb-5 pt-4 animate-fade-in"
          >
            <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="site-nav-link px-4 py-3"
                  data-active={pathname === link.href ? "true" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                href="/login"
                className="btn btn-login w-full min-h-[44px]"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/donate"
                className="btn btn-primary w-full min-h-[44px]"
                aria-label="Donate to RiseUp Preps Academy"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="w-4 h-4" aria-hidden />
                Donate
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
