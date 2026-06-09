import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function HonorairesPage() {
  const t = useTranslations("publicPages.honoraires");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
            {t("title")}
          </h1>
          <p className="text-xl text-text-muted mb-12">
            {t("subtitle")}
          </p>

          <div className="rounded-2xl border border-border-soft bg-card p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mb-4">{t("consultation_title")}</h2>
            <p className="text-text-muted mb-6">
              {t("consultation_desc")}
            </p>
            <div className="flex items-center justify-between border-t border-border-soft pt-6">
              <span className="font-medium text-sidebar-deep">{t("consultation_duration")}</span>
              <span className="font-display text-xl font-bold text-gold">{t("consultation_price")}</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border-soft bg-card p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mb-4">{t("forfait_title")}</h2>
            <p className="text-text-muted mb-6">
              {t("forfait_desc")}
            </p>
            <ul className="list-disc pl-5 text-text-muted space-y-2">
              <li>{t("forfait_li1")}</li>
              <li>{t("forfait_li2")}</li>
              <li>{t("forfait_li3")}</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
