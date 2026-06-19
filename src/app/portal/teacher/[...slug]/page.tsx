import PortalNotFound from "@/components/portal/PortalNotFound";

export default function TeacherPlaceholderPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const path = `/portal/teacher/${params.slug.join("/")}`;
  return <PortalNotFound attemptedPath={path} backHref="/portal/teacher" />;
}
