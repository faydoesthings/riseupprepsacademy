import PortalNotFound from "@/components/portal/PortalNotFound";

export default function AdminPlaceholderPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const path = `/portal/admin/${params.slug.join("/")}`;
  return <PortalNotFound attemptedPath={path} backHref="/portal/admin" />;
}
