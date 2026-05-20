import * as React from "react";
import { AvocatSidebar } from "@/components/layout/AvocatSidebar";

/**
 * Layout shared by every route inside the (avocat) group — cabinet/admin.
 */
export default function AvocatLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="app-shell">
      <AvocatSidebar />
      <main style={{ background: "var(--bg-light)", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
