"use client";

import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const t = useTranslations("publicPages.contact");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
                {t("title")}
              </h1>
              <p className="text-lg text-text-muted mb-8">
                {t("subtitle")}
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sidebar-deep">{t("office_label")}</h3>
                  <p className="text-text-muted">Dubai International Financial Centre (DIFC)<br/>Dubaï, UAE</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sidebar-deep">{t("email_label")}</h3>
                  <p className="text-text-muted">contact@odyssee-advisory.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-soft bg-card p-8 shadow-sm">
              <form className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("form_firstName")}</Label>
                    <Input id="firstName" placeholder={t("form_firstName_ph")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("form_lastName")}</Label>
                    <Input id="lastName" placeholder={t("form_lastName_ph")} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t("form_email")}</Label>
                  <Input id="email" type="email" placeholder={t("form_email_ph")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("form_phone")}</Label>
                  <Input id="phone" type="tel" placeholder={t("form_phone_ph")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t("form_subject")}</Label>
                  <Input id="subject" placeholder={t("form_subject_ph")} />
                </div>

                <Button type="button" className="w-full">{t("form_submit")}</Button>
                <p className="text-xs text-text-muted text-center mt-4">
                  {t("form_privacy")}
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
