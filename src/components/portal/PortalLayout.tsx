"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BrandLogo from "@/components/brand/BrandLogo";
import NotificationsBell from "@/components/portal/NotificationsBell";
import PortalUserMenu from "@/components/portal/PortalUserMenu";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  FileText, DollarSign, ClipboardCheck, Bell,
  Menu, X, Heart, BarChart3, Receipt, Wallet,
  UserCheck, Building2, Clock, Shield, GraduationCap,
  UserPlus,
  Video,
  Award,
  ClipboardList,
} from "lucide-react";

const settingsHrefByRole: Record<string, string> = {
  SUPER_ADMIN: "/portal/admin/settings",
  TEACHER: "/portal/teacher/settings",
  STUDENT: "/portal/student/settings",
  DONOR: "/portal/donor/settings",
  ACCOUNTANT: "/portal/accountant/settings",
};

const roleMenus: Record<string, Array<{ icon: LucideIcon; label: string; href: string }>> = {
  SUPER_ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/admin" },
    { icon: Users, label: "Students", href: "/portal/admin/students" },
    { icon: UserCheck, label: "Teachers", href: "/portal/admin/teachers" },
    { icon: Building2, label: "Classes", href: "/portal/admin/classes" },
    { icon: BookOpen, label: "Subjects", href: "/portal/admin/subjects" },
    { icon: Clock, label: "Timetable", href: "/portal/admin/timetable" },
    { icon: ClipboardCheck, label: "Attendance", href: "/portal/admin/attendance" },
    { icon: FileText, label: "Assignments", href: "/portal/admin/assignments" },
    { icon: BarChart3, label: "Exam Results", href: "/portal/admin/results" },
    { icon: DollarSign, label: "Finance", href: "/portal/admin/finance" },
    { icon: Heart, label: "Donors", href: "/portal/admin/donors" },
    { icon: Receipt, label: "Admissions", href: "/portal/admin/admissions" },
    { icon: UserPlus, label: "Registrations", href: "/portal/admin/registrations" },
    { icon: BookOpen, label: "Courses", href: "/portal/admin/courses" },
    { icon: Video, label: "Viva", href: "/portal/admin/viva" },
    { icon: ClipboardList, label: "Quiz grading", href: "/portal/admin/lms/grading" },
    { icon: Award, label: "Certificates", href: "/portal/admin/certificates" },
    { icon: Bell, label: "Notifications", href: "/portal/admin/notifications" },
    { icon: Shield, label: "Audit Log", href: "/portal/admin/audit" },
  ],
  TEACHER: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/teacher" },
    { icon: ClipboardCheck, label: "Attendance", href: "/portal/teacher/attendance" },
    { icon: BookOpen, label: "Materials", href: "/portal/teacher/materials" },
    { icon: FileText, label: "Assignments", href: "/portal/teacher/assignments" },
    { icon: BarChart3, label: "Exam Results", href: "/portal/teacher/exams" },
    { icon: Calendar, label: "Timetable", href: "/portal/teacher/timetable" },
    { icon: BookOpen, label: "Courses", href: "/portal/teacher/courses" },
    { icon: ClipboardList, label: "Quiz grading", href: "/portal/teacher/lms/grading" },
    { icon: Video, label: "Viva", href: "/portal/teacher/viva" },
    { icon: Wallet, label: "Payslips", href: "/portal/teacher/payslips" },
    { icon: Bell, label: "Announcements", href: "/portal/teacher/notifications" },
  ],
  STUDENT: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/student" },
    { icon: GraduationCap, label: "My Courses", href: "/portal/student/courses" },
    { icon: BookOpen, label: "Browse courses", href: "/portal/student/courses/browse" },
    { icon: Video, label: "Viva", href: "/portal/student/viva" },
    { icon: BookOpen, label: "Study Material", href: "/portal/student/materials" },
    { icon: FileText, label: "Assignments", href: "/portal/student/assignments" },
    { icon: ClipboardCheck, label: "Attendance", href: "/portal/student/attendance" },
    { icon: BarChart3, label: "Exam Results", href: "/portal/student/exams" },
    { icon: DollarSign, label: "Fee Status", href: "/portal/student/fees" },
    { icon: Calendar, label: "Timetable", href: "/portal/student/timetable" },
    { icon: Bell, label: "Notifications", href: "/portal/student/notifications" },
  ],
  DONOR: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/donor" },
    { icon: Heart, label: "My Donations", href: "/portal/donor/donations" },
    { icon: Users, label: "Sponsored Student", href: "/portal/donor/sponsored" },
    { icon: Receipt, label: "Receipts", href: "/portal/donor/receipts" },
    { icon: BarChart3, label: "Impact Report", href: "/portal/donor/impact" },
  ],
  ACCOUNTANT: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/accountant" },
    { icon: DollarSign, label: "Fee Collection", href: "/portal/accountant/fees" },
    { icon: Wallet, label: "Expenses", href: "/portal/accountant/expenses" },
    { icon: Receipt, label: "Payroll", href: "/portal/accountant/payroll" },
    { icon: Heart, label: "Donations", href: "/portal/accountant/donations" },
    { icon: BarChart3, label: "Reports", href: "/portal/accountant/reports" },
  ],
};

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: "bg-[#F78C1F]/20 text-[#F78C1F]",
  TEACHER: "bg-[#4A9CC7]/20 text-[#4A9CC7]",
  STUDENT: "bg-[#7AC943]/20 text-[#7AC943]",
  DONOR: "bg-[#C9A84C]/20 text-[#C9A84C]",
  ACCOUNTANT: "bg-[#0ABFBC]/20 text-[#0ABFBC]",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading portal…</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/50 text-sm">Redirecting to sign in…</div>
      </div>
    );
  }

  const role = (session.user as { role?: string }).role;
  const resolvedRole = role ?? "UNKNOWN";
  const menuItems = roleMenus[resolvedRole] ?? [];
  const roleLabel = resolvedRole.replace(/_/g, " ");
  const roleBadgeClass = roleBadgeColors[resolvedRole] ?? "bg-white/10 text-white/60";
  const settingsHref = settingsHrefByRole[resolvedRole] ?? null;

  // Get page title from current path
  const currentItem = menuItems.find(
    (item) => pathname === item.href || (item.href !== menuItems[0]?.href && pathname.startsWith(`${item.href}/`))
  );
  const pageTitle = currentItem?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Sidebar */}
      <aside className={`sidebar z-50 ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar__brand">
          <BrandLogo variant="full" size="sm" href="/" />
        </div>

        <nav className="sidebar__nav flex-1 overflow-y-auto" aria-label="Portal navigation">
          <p className="sidebar__label">Main Menu</p>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== menuItems[0]?.href && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__footer mt-auto">
          <PortalUserMenu
            variant="sidebar"
            name={session.user.name || "User"}
            image={session.user.image}
            roleLabel={roleLabel}
            roleBadgeClass={roleBadgeClass}
            settingsHref={settingsHref}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="portal-main">
        {/* Top Bar */}
        <header className="portal-topbar">
          <div className="portal-topbar__start">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="portal-topbar__menu-btn md:hidden"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <nav className="portal-topbar__breadcrumb hidden md:flex" aria-label="Breadcrumb">
              <span className="portal-topbar__crumb portal-topbar__crumb--muted">Portal</span>
              <span className="portal-topbar__sep" aria-hidden>/</span>
              <span className="portal-topbar__crumb portal-topbar__crumb--current">{pageTitle}</span>
            </nav>
            <h1 className="portal-topbar__title md:hidden">{pageTitle}</h1>
          </div>

          <div className="portal-topbar__end">
            <NotificationsBell />
            <PortalUserMenu
              variant="topbar"
              name={session.user.name || "User"}
              image={session.user.image}
              roleLabel={roleLabel}
              roleBadgeClass={roleBadgeClass}
              settingsHref={settingsHref}
            />
          </div>
        </header>

        {/* Ajrak texture behind content */}
        <div className="relative">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('/patterns/ajrak-tile.svg')", backgroundSize: "40px 40px" }} />
          <main className="portal-content relative z-10">{children}</main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
