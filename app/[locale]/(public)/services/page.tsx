import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ServicesPage() {
  const t = useTranslations("publicPages.services");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
            {t("title")}
          </h1>
          <p className="text-xl text-text-muted mb-16 max-w-3xl">
            {t("subtitle")}
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">01</span>
                </div>
                <CardTitle>{t("s1_title")}</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  {t("s1_desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">02</span>
                </div>
                <CardTitle>{t("s2_title")}</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  {t("s2_desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">03</span>
                </div>
                <CardTitle>{t("s3_title")}</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  {t("s3_desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">04</span>
                </div>
                <CardTitle>{t("s4_title")}</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  {t("s4_desc")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
