import type { ReactNode } from "react";

export default function PortalListPage({ children }: { children: ReactNode }) {
  return <div className="portal-list-page animate-fade-in">{children}</div>;
}
