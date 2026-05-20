import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
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
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <Link href="/" className="transition-colors hover:text-gold">{t("home")}</Link>
          <Link href="/services" className="transition-colors hover:text-gold">{t("services")}</Link>
          <Link href="/expertises" className="transition-colors hover:text-gold">{t("expertises")}</Link>
          <Link href="/investissement-immobilier" className="transition-colors hover:text-gold">{t("real_estate")}</Link>
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
}
