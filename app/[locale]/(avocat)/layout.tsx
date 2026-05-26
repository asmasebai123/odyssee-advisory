import * as React from "react";
import { AvocatSidebar } from "@/components/layout/AvocatSidebar";
import { MobileShell } from "@/components/layout/MobileShell";

/**
 * Layout shared by every route inside the (avocat) group — cabinet/admin.
 * MobileShell adds the responsive slide-in drawer on phones.
 */
export default function AvocatLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <MobileShell sidebar={<AvocatSidebar />}>{children}</MobileShell>;
}
