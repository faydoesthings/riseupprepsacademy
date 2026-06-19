import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import ProfileAvatarEditor from "@/components/portal/ProfileAvatarEditor";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";
import { Mail, Phone, Shield, UserRound } from "lucide-react";

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: "bg-[#F78C1F]/20 text-[#F78C1F]",
  TEACHER: "bg-[#4A9CC7]/20 text-[#4A9CC7]",
  STUDENT: "bg-[#7AC943]/20 text-[#7AC943]",
  DONOR: "bg-[#C9A84C]/20 text-[#C9A84C]",
  ACCOUNTANT: "bg-[#0ABFBC]/20 text-[#0ABFBC]",
};

export default async function PortalSettingsPage({
  backLabel,
  eyebrow = "Admin portal",
}: {
  backLabel: string;
  eyebrow?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  const roleLabel = user.role.replace(/_/g, " ");
  const roleBadgeClass = roleBadgeColors[user.role] ?? "bg-white/10 text-white/60";
  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const accountFields = [
    { label: "Full name", value: user.name, icon: UserRound },
    { label: "Email address", value: user.email, icon: Mail },
    { label: "Phone", value: user.phone || "Not provided", icon: Phone },
    { label: "Member since", value: memberSince, icon: Shield },
  ];

  return (
    <PortalListPage>
      <PageHeader
        eyebrow={eyebrow}
        title="Account settings"
        description="Manage your profile photo, account details, and password."
      />

      <div className="portal-settings-page">
        <ProfileAvatarEditor
          name={user.name}
          image={user.image}
          roleLabel={roleLabel}
          roleBadgeClass={roleBadgeClass}
        />

        <div className="portal-settings-page__sections">
          <section className="portal-panel portal-settings-account">
            <header className="portal-panel__header portal-panel__header--compact">
              <div>
                <h2 className="portal-panel__title">Account details</h2>
                <p className="portal-panel__desc">
                  Information linked to your portal login. Contact an administrator to change your
                  email or role.
                </p>
              </div>
            </header>

            <div className="portal-settings-account__grid">
              {accountFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="portal-settings-field">
                    <div className="portal-settings-field__icon" aria-hidden>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="portal-settings-field__label">{field.label}</p>
                      <p className="portal-settings-field__value">{field.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <ChangePasswordForm />
        </div>
      </div>
    </PortalListPage>
  );
}
