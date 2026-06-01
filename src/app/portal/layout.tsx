import Providers from "@/components/Providers";
import PortalLayout from "@/components/portal/PortalLayout";

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <PortalLayout>{children}</PortalLayout>
    </Providers>
  );
}
