import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function ExpertisesPage() {
  const t = useTranslations("publicPages.expertises");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider mb-6">
            {t("eyebrow")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-8">
            {t("title")}
          </h1>
          <div className="prose prose-lg text-text-muted">
            <p className="lead text-xl text-text mb-10">
              {t("intro")}
            </p>
            
            <div className="space-y-12">
              <div className="border-l-2 border-gold pl-6">
                <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-3">{t("e1_title")}</h3>
                <p>
                  {t("e1_desc")}
                </p>
              </div>

              <div className="border-l-2 border-gold pl-6">
                <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-3">{t("e2_title")}</h3>
                <p>
                  {t("e2_desc")}
                </p>
              </div>

              <div className="border-l-2 border-gold pl-6">
                <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-3">{t("e3_title")}</h3>
                <p>
                  {t("e3_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
