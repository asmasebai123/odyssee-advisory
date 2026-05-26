import * as React from "react";
import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { MobileShell } from "@/components/layout/MobileShell";

/**
 * Layout shared by every route inside the (client) group — investor portal.
 * Each page renders its own <Navbar /> so it can supply its own title / breadcrumb.
 * MobileShell adds the responsive slide-in drawer on phones.
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <MobileShell sidebar={<ClientSidebar />}>{children}</MobileShell>;
}
