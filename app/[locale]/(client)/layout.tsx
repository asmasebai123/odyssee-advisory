import * as React from "react";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

/**
 * Layout shared by every route inside the (client) group — investor portal.
 * Each page renders its own <Navbar /> so it can supply its own title / breadcrumb.
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="app-shell">
      <ClientSidebar />
      <main style={{ background: "var(--bg-light)", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
