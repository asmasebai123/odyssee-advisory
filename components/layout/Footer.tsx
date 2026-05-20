import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const Footer: React.FC = () => {
  const t = useTranslations("Navigation");

  return (
    <footer className="border-t border-border bg-sidebar-deep py-16 text-sidebar-textAlt">
      <div className="container grid gap-12 md:grid-cols-4">
        <div className="flex flex-col space-y-4">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Odyssée <span className="text-gold">Advisory</span>
          </span>
          <p className="text-sm leading-relaxed text-white/70">
            Accompagnement juridique et stratégique pour les investisseurs souhaitant acquérir un bien immobilier aux Émirats Arabes Unis.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <h4 className="font-semibold text-gold tracking-widest uppercase text-xs">Plateforme</h4>
          <Link href="/services" className="text-sm hover:text-white transition-colors">{t("services")}</Link>
          <Link href="/expertises" className="text-sm hover:text-white transition-colors">{t("expertises")}</Link>
          <Link href="/investissement-immobilier" className="text-sm hover:text-white transition-colors">{t("real_estate")}</Link>
          <Link href="/honoraires" className="text-sm hover:text-white transition-colors">{t("fees")}</Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="font-semibold text-gold tracking-widest uppercase text-xs">Ressources</h4>
          <Link href="/blog" className="text-sm hover:text-white transition-colors">{t("blog")}</Link>
          <Link href="/mentions-legales" className="text-sm hover:text-white transition-colors">Mentions Légales</Link>
          <Link href="/confidentialite" className="text-sm hover:text-white transition-colors">Confidentialité</Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="font-semibold text-gold tracking-widest uppercase text-xs">Contact</h4>
          <p className="text-sm text-white/70">DIFC · Dubaï, UAE</p>
          <Link href="mailto:contact@odyssee-advisory.com" className="text-sm hover:text-white transition-colors">
            contact@odyssee-advisory.com
          </Link>
        </div>
      </div>
      <div className="container mt-16 flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Odyssée Advisory. Tous droits réservés.</p>
        <p className="mt-4 md:mt-0">French lawyer acting as a <span className="text-gold font-medium">Legal Consultant in the UAE</span></p>
      </div>
    </footer>
  );
};
