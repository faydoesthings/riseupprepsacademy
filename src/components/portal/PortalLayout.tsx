"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  FileText, DollarSign, ClipboardCheck, Bell, Settings, LogOut,
  Menu, X, Heart, BarChart3, Receipt, Wallet,
  UserCheck, Building2, Clock, Shield,
} from "lucide-react";

const roleMenus: Record<string, Array<{ icon: any; label: string; href: string }>> = {
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
    { icon: Bell, label: "Notifications", href: "/portal/admin/notifications" },
    { icon: Shield, label: "Audit Log", href: "/portal/admin/audit" },
    { icon: Settings, label: "Settings", href: "/portal/admin/settings" },
  ],
  TEACHER: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/teacher" },
    { icon: ClipboardCheck, label: "Attendance", href: "/portal/teacher/attendance" },
    { icon: BookOpen, label: "Materials", href: "/portal/teacher/materials" },
    { icon: FileText, label: "Assignments", href: "/portal/teacher/assignments" },
    { icon: BarChart3, label: "Exam Results", href: "/portal/teacher/results" },
    { icon: Calendar, label: "Timetable", href: "/portal/teacher/timetable" },
    { icon: Wallet, label: "Payslips", href: "/portal/teacher/payslips" },
    { icon: Bell, label: "Announcements", href: "/portal/teacher/announcements" },
  ],
  STUDENT: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal/student" },
    { icon: BookOpen, label: "Study Material", href: "/portal/student/materials" },
    { icon: FileText, label: "Assignments", href: "/portal/student/assignments" },
    { icon: ClipboardCheck, label: "Attendance", href: "/portal/student/attendance" },
    { icon: BarChart3, label: "Exam Results", href: "/portal/student/results" },
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
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "STUDENT";
  const menuItems = roleMenus[role] || roleMenus.STUDENT;

  // Get page title from current path
  const currentItem = menuItems.find(
    (item) => pathname === item.href || (item.href !== menuItems[0]?.href && pathname.startsWith(`${item.href}/`))
  );
  const pageTitle = currentItem?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Sidebar */}
      <aside className={`sidebar z-50 ${sidebarOpen ? "open" : ""}`}>
        <div className="px-4 pb-4 mb-2 border-b border-white/[0.06]">
          <BrandLogo variant="full" href="/" className="!h-9" />
        </div>

        {/* Nav Links */}
        <nav className="px-3 flex-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20">Main Menu</p>
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

        {/* User Info + Logout */}
        <div className="px-3 pb-4 mt-auto">
          <div className="glass-card px-3 py-3 mb-2 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F78C1F] to-[#C0392B] flex items-center justify-center text-white text-xs font-bold">
                {session?.user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${roleBadgeColors[role] || ""}`}>
                  {role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-link w-full text-[#C0392B] hover:text-[#e74c3c] hover:bg-[#C0392B]/5"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="portal-main">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#070B14]/80 backdrop-blur-[20px] border-b border-white/[0.06] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-transparent hover:bg-white/[0.06] text-white/40 hover:text-white rounded-xl p-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast("Notifications coming soon", { icon: "🔔" })}
              aria-label="Notifications (coming soon)"
              className="bg-transparent hover:bg-white/[0.06] text-white/40 hover:text-white rounded-xl p-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Bell className="w-5 h-5" />
            </button>
            <span className="hidden sm:block text-white/70 text-sm font-medium truncate max-w-[140px]">
              {session?.user?.name || "User"}
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#05335C] to-[#0D1B2A] flex items-center justify-center text-white text-xs font-bold border border-white/10">
              {session?.user?.name?.[0] || "U"}
            </div>
          </div>
        </header>

        {/* Ajrak texture behind content */}
        <div className="relative">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('/patterns/ajrak-tile.svg')", backgroundSize: "40px 40px" }} />
          <main className="relative z-10 p-6">{children}</main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
