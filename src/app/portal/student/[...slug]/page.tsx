import PortalNotFound from "@/components/portal/PortalNotFound";

export default function StudentPlaceholderPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const path = `/portal/student/${params.slug.join("/")}`;
  return <PortalNotFound attemptedPath={path} backHref="/portal/student" />;
}
