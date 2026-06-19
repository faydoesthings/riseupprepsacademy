import PortalNotFound from "@/components/portal/PortalNotFound";

export default function AccountantPlaceholderPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const path = `/portal/accountant/${params.slug.join("/")}`;
  return <PortalNotFound attemptedPath={path} backHref="/portal/accountant" />;
}
