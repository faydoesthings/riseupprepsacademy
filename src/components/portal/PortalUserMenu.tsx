"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import PortalAvatar from "@/components/portal/PortalAvatar";
import { ChevronDown, LogOut, Settings } from "lucide-react";

type PortalUserMenuProps = {
  variant: "sidebar" | "topbar";
  name: string;
  image?: string | null;
  roleLabel: string;
  roleBadgeClass: string;
  settingsHref: string | null;
  onNavigate?: () => void;
};

export default function PortalUserMenu({
  variant,
  name,
  image,
  roleLabel,
  roleBadgeClass,
  settingsHref,
  onNavigate,
}: PortalUserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    onNavigate?.();
  }

  const menu = (
    <div
      id={menuId}
      role="menu"
      className={`portal-user-menu__dropdown ${
        variant === "sidebar" ? "portal-user-menu__dropdown--up" : ""
      }`}
    >
      {settingsHref && (
        <Link
          href={settingsHref}
          role="menuitem"
          className="portal-user-menu__item"
          onClick={closeMenu}
        >
          <Settings className="w-4 h-4" aria-hidden />
          Settings
        </Link>
      )}
      <button
        type="button"
        role="menuitem"
        className="portal-user-menu__item portal-user-menu__item--danger"
        onClick={() => {
          setOpen(false);
          signOut({ callbackUrl: "/" });
        }}
      >
        <LogOut className="w-4 h-4" aria-hidden />
        Sign out
      </button>
    </div>
  );

  if (variant === "sidebar") {
    return (
      <div ref={rootRef} className="portal-user-menu portal-user-menu--sidebar">
        <button
          type="button"
          className="portal-user-menu__trigger portal-user-menu__trigger--sidebar"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
        >
          <PortalAvatar
            name={name}
            image={image}
            size={variant === "sidebar" ? "md" : "sm"}
          />
          <span className="portal-user-menu__meta">
            <span className="portal-user-menu__name">{name}</span>
            <span className={`portal-user-menu__role ${roleBadgeClass}`}>{roleLabel}</span>
          </span>
          <ChevronDown
            className={`portal-user-menu__chevron ${open ? "is-open" : ""}`}
            aria-hidden
          />
        </button>
        {open && menu}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="portal-user-menu portal-user-menu--topbar">
      <button
        type="button"
        className="portal-user-menu__trigger portal-user-menu__trigger--topbar"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="portal-user-menu__name portal-user-menu__name--topbar">{name}</span>
        <PortalAvatar name={name} image={image} size="sm" />
        <ChevronDown
          className={`portal-user-menu__chevron portal-user-menu__chevron--topbar ${open ? "is-open" : ""}`}
          aria-hidden
        />
      </button>
      {open && menu}
    </div>
  );
}
