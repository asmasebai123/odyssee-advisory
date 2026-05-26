"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface MobileNavValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const MobileNavContext = React.createContext<MobileNavValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

/** Hook consommé par la Navbar pour ouvrir/fermer le tiroir mobile. */
export const useMobileNav = (): MobileNavValue =>
  React.useContext(MobileNavContext);

export interface MobileShellProps {
  /** La barre latérale (ClientSidebar / AvocatSidebar). */
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Coque applicative responsive.
 *
 * Desktop : grille `sidebar | contenu` (inchangé).
 * Mobile (≤ 980px) : la barre latérale devient un tiroir coulissant
 * déclenché par le bouton hamburger de la Navbar, avec fond assombri.
 */
export const MobileShell: React.FC<MobileShellProps> = ({
  sidebar,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const toggle = React.useCallback(() => setOpen((v) => !v), []);

  // Fermer le tiroir à chaque navigation
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquer le défilement du corps quand le tiroir est ouvert (mobile)
  React.useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [open]);

  // Fermer avec la touche Échap
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <MobileNavContext.Provider value={{ open, setOpen, toggle }}>
      <div className="app-shell">
        <div className={"sidebar-col" + (open ? " open" : "")}>{sidebar}</div>
        <div
          className="sidebar-backdrop"
          data-open={open ? "true" : "false"}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <main style={{ background: "var(--bg-app)", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </MobileNavContext.Provider>
  );
};
