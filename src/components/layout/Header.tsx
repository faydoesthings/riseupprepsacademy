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
  { href: "/admissions", label: "Admissions" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="container-main">
        <div className="flex items-center justify-between h-[72px] gap-4">
          <BrandLogo variant="full" priority />

          <nav className="hidden lg:flex flex-1 justify-center items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "text-white bg-white/[0.06]" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex shrink-0 items-center gap-3">
            <Link href="/login" className="btn btn-outline btn-sm min-h-[44px]">
              Login
            </Link>
            <Link href="/donate" className="btn btn-primary btn-sm min-h-[44px]">
              <Heart className="w-4 h-4" />
              Donate
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white/60 hover:text-white p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-4 border-t border-white/[0.06] pt-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === link.href ? "text-white bg-white/[0.06]" : "text-white/60 hover:bg-white/[0.04]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/login" className="btn btn-outline w-full min-h-[44px]" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link href="/donate" className="btn btn-primary w-full min-h-[44px]" onClick={() => setIsOpen(false)}>
                <Heart className="w-4 h-4" />
                Donate
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
