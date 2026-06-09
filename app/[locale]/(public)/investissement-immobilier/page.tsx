import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvestissementPage() {
  const t = useTranslations("publicPages.investissement");

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

          <div className="aspect-[21/9] w-full rounded-2xl bg-sidebar-deep overflow-hidden mb-12 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <h2 className="relative z-10 text-white font-display text-3xl font-bold tracking-widest uppercase">Off-Plan &amp; Ready Properties</h2>
          </div>

          <div className="space-y-8 text-text-muted text-lg leading-relaxed">
            <p>
              {t("p1")}
            </p>
            
            <h3 className="font-display text-2xl font-semibold text-sidebar-deep mt-10">{t("legal_title")}</h3>
            <p>
              {t("legal_desc")}
            </p>

            <h3 className="font-display text-2xl font-semibold text-sidebar-deep mt-10">{t("why_title")}</h3>
            <p>
              {t("why_desc")}
            </p>
          </div>

          <div className="mt-16 rounded-2xl bg-beige-soft p-8 text-center border border-border-soft">
            <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-4">{t("cta_title")}</h3>
            <p className="text-text-muted mb-6">
              {t("cta_desc")}
            </p>
            <Link href="/contact">
              <Button size="lg">{t("cta_btn")}</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
