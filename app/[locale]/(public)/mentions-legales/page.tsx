import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function MentionsLegalesPage() {
  const t = useTranslations("publicPages.mentionsLegales");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-10">
            {t("title")}
          </h1>
          
          <div className="prose prose-lg text-text-muted">
            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mt-8 mb-4">{t("s1_title")}</h2>
            <p
              dangerouslySetInnerHTML={{ __html: t("s1_desc") }}
            />
            <p>
              {t("s1_address")}<br/>
              {t("s1_email")}
            </p>

            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mt-8 mb-4">{t("s2_title")}</h2>
            <p>
              {t("s2_desc")}
            </p>

            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mt-8 mb-4">{t("s3_title")}</h2>
            <p>
              {t("s3_desc")}
            </p>
            <p>
              {t("s3_desc2")}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
