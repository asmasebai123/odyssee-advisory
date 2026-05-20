"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const LINKS = [
    { href: "/services", label: t("services") },
    { href: "/expertises", label: t("expertises") },
    { href: "/investissement-immobilier", label: t("real_estate") },
    { href: "/honoraires", label: t("fees") },
    { href: "/blog", label: t("blog") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-sidebar-deep">
              Odyssée <span className="text-gold">Advisory</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest text-text-muted uppercase">
              Legal Consulting UAE
            </span>
          </div>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-muted">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-gold ${pathname.includes(link.href) ? "text-sidebar-deep border-b-2 border-gold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex">{t("client_space")}</Button>
          </Link>
          <Link href="/contact">
            <Button>{t("contact")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
