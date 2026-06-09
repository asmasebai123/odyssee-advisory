import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { HtmlDir } from "@/components/i18n/HtmlDir";

export const metadata: Metadata = {
  title: "Odyssée Advisory",
  description:
    "Conseil juridique d'excellence pour vos acquisitions immobilières à Dubaï.",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <HtmlDir locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
