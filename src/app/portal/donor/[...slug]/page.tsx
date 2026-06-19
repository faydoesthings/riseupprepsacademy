import PortalNotFound from "@/components/portal/PortalNotFound";

export default function DonorPlaceholderPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const path = `/portal/donor/${params.slug.join("/")}`;
  return <PortalNotFound attemptedPath={path} backHref="/portal/donor" />;
}
