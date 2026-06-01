import ComingSoon from "@/components/portal/ComingSoon";

export default function StudentPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const moduleName = params.slug[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return <ComingSoon moduleName={moduleName} backHref="/portal/student" />;
}
