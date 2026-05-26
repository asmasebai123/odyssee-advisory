"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { OAMark } from "@/components/shared/OAMark";
import { createBrowserClient } from "@supabase/ssr";

type Lang = "fr" | "en" | "ar";

const T: Record<Lang, {
  hero_title: string;
  hero_title_accent: string;
  hero_desc: string;
  investors: string;
  accompanied: string;
  since: string;
  difc: string;
  privacy: string;
  cgv: string;
  difc_compliance: string;
  welcome: string;
  subtitle: string;
  email: string;
  password: string;
  remember: string;
  forgot_password: string;
  sign_in: string;
  signing_in: string;
  or: string;
  france_connect: string;
  no_account: string;
  request_access: string;
  error_creds: string;
}> = {
  fr: {
    hero_title: "Votre investissement,",
    hero_title_accent: "sécurisé.",
    hero_desc: "Conseil juridique d'excellence pour vos acquisitions immobilières à Dubaï — de la due diligence à la signature notariée, en français, sous droit émirien.",
    investors: "investisseurs",
    accompanied: "accompagnés",
    since: "DEPUIS 2014",
    difc: "Cabinet inscrit au DIFC",
    privacy: "Confidentialité",
    cgv: "CGV",
    difc_compliance: "Conformité DIFC",
    welcome: "Bon retour.",
    subtitle: "Accédez à votre espace privé pour suivre l'avancement de votre dossier.",
    email: "Adresse email",
    password: "Mot de passe",
    remember: "Rester connecté",
    forgot_password: "Mot de passe oublié ?",
    sign_in: "Se connecter",
    signing_in: "Connexion...",
    or: "ou",
    france_connect: "Connexion via FranceConnect+",
    no_account: "Pas encore de compte ?",
    request_access: "Demander un accès",
    error_creds: "Identifiants incorrects. Veuillez réessayer."
  },
  en: {
    hero_title: "Your investment,",
    hero_title_accent: "secured.",
    hero_desc: "Exceptional legal advice for your real estate acquisitions in Dubai — from due diligence to notarized signature, in English, under UAE law.",
    investors: "investors",
    accompanied: "supported",
    since: "SINCE 2014",
    difc: "Cabinet registered at DIFC",
    privacy: "Privacy Policy",
    cgv: "T&C",
    difc_compliance: "DIFC Compliance",
    welcome: "Welcome back.",
    subtitle: "Access your private portal to track the progress of your dossier.",
    email: "Email address",
    password: "Password",
    remember: "Remember me",
    forgot_password: "Forgot password?",
    sign_in: "Sign In",
    signing_in: "Signing in...",
    or: "or",
    france_connect: "Sign in with FranceConnect+",
    no_account: "Don't have an account?",
    request_access: "Request access",
    error_creds: "Incorrect credentials. Please try again."
  },
  ar: {
    hero_title: "استثمارك،",
    hero_title_accent: "مؤمّن.",
    hero_desc: "استشارات قانونية متميزة للاستحواذ العقاري في دبي — من العناية الواجبة إلى التوقيع الموثق، باللغة العربية، بموجب قوانين دولة الإمارات.",
    investors: "مستثمر",
    accompanied: "تمت مرافقتهم",
    since: "منذ عام 2014",
    difc: "مكتب مسجل في مركز دبي المالي العالمي",
    privacy: "سياسة الخصوصية",
    cgv: "الشروط والأحكام",
    difc_compliance: "الامتثال لـ DIFC",
    welcome: "أهلاً بك مجدداً.",
    subtitle: "تسجيل الدخول إلى مساحتك الخاصة لمتابعة تقدم ملفك.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot_password: "هل نسيت كلمة المرور؟",
    sign_in: "تسجيل الدخول",
    signing_in: "جاري الدخول...",
    or: "أو",
    france_connect: "الدخول عبر FranceConnect+",
    no_account: "ليس لديك حساب؟",
    request_access: "طلب تسجيل جديد",
    error_creds: "بيانات الاعتماد غير صحيحة. يرجى المحاولة مرة أخرى."
  }
};

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  // Drive everything from URL locale — no local lang state to avoid hydration mismatch
  const rawLocale = (params?.locale as string) ?? "fr";
  const locale: Lang = (["fr", "en", "ar"].includes(rawLocale) ? rawLocale : "fr") as Lang;
  const t = T[locale];
  const isRTL = locale === "ar";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      setError(t.error_creds);
      setIsLoading(false);
      return;
    }

    const metaRole = authData.user.user_metadata?.role;

    if (metaRole === "avocat") {
      router.push(`/${locale}/admin`);
    } else if (metaRole === "client") {
      router.push(`/${locale}/dashboard`);
    } else {
      const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (dbUser?.role === "avocat") {
        router.push(`/${locale}/admin`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    }
  };

  const LANG_LABELS: Record<Lang, string> = { fr: "FR", en: "EN", ar: "AR" };

  return (
    <div
      className="login-split"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
        background: "var(--bg-light)",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Dark hero panel — always LTR internally */}
      <div
        className="login-hero"
        style={{ position: "relative", overflow: "hidden", color: "white", direction: "ltr" }}
      >
        <div className="dubai-bg" />
        <svg
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "32%",
            opacity: 0.55,
          }}
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#233149" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <path
            fill="#1A2438"
            d="M0 240 V160 L20 160 L20 130 L40 130 L40 175 L60 175 L60 110 L80 110 L80 100 L95 88 L110 100 L110 145 L130 145 L130 90 L155 90 L155 170 L175 170 L175 60 L185 50 L195 60 L195 180 L215 180 L215 120 L240 120 L240 70 L250 60 L260 70 L260 155 L285 155 L285 140 L305 140 L305 175 L325 175 L325 95 L345 95 L345 165 L370 165 L370 50 L380 40 L390 50 L390 180 L410 180 L410 130 L435 130 L435 160 L460 160 L460 80 L475 70 L490 80 L490 175 L515 175 L515 115 L540 115 L540 145 L560 145 L560 70 L580 60 L600 70 L600 170 L625 170 L625 100 L650 100 L650 160 L675 160 L675 85 L695 75 L715 85 L715 175 L740 175 L740 130 L760 130 L760 150 L780 150 L780 165 L800 165 L800 240 Z"
          />
          <rect width="800" height="240" fill="url(#sky)" />
        </svg>

        <div
          style={{
            position: "relative",
            padding: "48px 56px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <OAMark size={48} />
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, letterSpacing: "0.02em" }}>
                Odyssée
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.36em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>
                Advisory · Paris–Dubaï
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 460 }}>
              <div className="rule-gold" />
              <h1 style={{ fontSize: "clamp(30px, 7.5vw, 54px)", lineHeight: 1.08, color: "white", letterSpacing: "-0.01em", overflowWrap: "break-word", maxWidth: "100%" }}>
                {t.hero_title}
                <br />
                <span style={{ fontStyle: "italic", color: "var(--gold)" }}>
                  {t.hero_title_accent}
                </span>
              </h1>
              <p style={{ marginTop: 24, fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", maxWidth: 420 }}>
                {t.hero_desc}
              </p>

              <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    background: "rgba(184,150,90,0.12)",
                    border: "1px solid var(--gold-line)",
                    borderRadius: 2,
                  }}
                >
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--gold)", fontWeight: 500 }}>
                    500+
                  </div>
                  <div style={{ fontSize: 11, lineHeight: 1.3, color: "rgba(255,255,255,0.8)" }}>
                    {t.investors}
                    <br />
                    {t.accompanied}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
                  {t.since}
                  <br />
                  <span style={{ color: "var(--gold)" }}>{t.difc}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <div>© 2026 Odyssée Advisory SARL</div>
            <div style={{ display: "flex", gap: 18 }}>
              <a style={{ cursor: "pointer" }}>{t.privacy}</a>
              <a style={{ cursor: "pointer" }}>{t.cgv}</a>
              <a style={{ cursor: "pointer" }}>{t.difc_compliance}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        {/* Language switcher — navigates to the localized URL, no local state */}
        <div
          style={{
            display: "flex",
            justifyContent: isRTL ? "flex-start" : "flex-end",
            padding: "32px 48px 0",
            gap: 4,
          }}
        >
          {(["fr", "en", "ar"] as Lang[]).map((l) => (
            <a
              key={l}
              href={`/${l}/login`}
              style={{
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textDecoration: "none",
                color: locale === l ? "var(--ink)" : "var(--ink-3)",
                borderBottom: locale === l ? "2px solid var(--gold)" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {LANG_LABELS[l]}
            </a>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380, direction: isRTL ? "rtl" : "ltr" }}>
            <div className="rule-gold" />
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>{t.welcome}</h2>
            <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 36 }}>
              {t.subtitle}
            </p>

            <div className="input-wrap" style={{ marginBottom: 22 }}>
              <label htmlFor="email" style={{ display: "block", textAlign: isRTL ? "right" : "left" }}>
                {t.email}
              </label>
              <input
                id="email"
                className="input-line"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === "ar" ? "بريدك@email.com" : "vous@email.com"}
                type="email"
                dir="ltr"
                style={{ textAlign: isRTL ? "right" : "left" }}
              />
            </div>

            <div className="input-wrap" style={{ marginBottom: 22 }}>
              <label htmlFor="password" style={{ display: "block", textAlign: isRTL ? "right" : "left" }}>
                {t.password}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="input-line"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  dir="ltr"
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 10,
                    color: "var(--ink-3)",
                  }}
                >
                  <Icon name="eye" size={16} />
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  cursor: "pointer",
                }}
              >
                <span
                  onClick={() => setRemember(!remember)}
                  style={{
                    width: 16,
                    height: 16,
                    border: "1px solid var(--ink-3)",
                    borderRadius: 2,
                    background: remember ? "var(--gold)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {remember && (
                    <Icon name="check" size={11} stroke={3} style={{ color: "var(--ink)" }} />
                  )}
                </span>
                {t.remember}
              </label>
              <a style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, cursor: "pointer" }}>
                {t.forgot_password}
              </a>
            </div>

            {error && (
              <div style={{ color: "var(--error)", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "14px 20px",
                fontSize: 13,
                justifyContent: "center",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Icon name="lock" size={14} />
              {isLoading ? t.signing_in : t.sign_in}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                margin: "28px 0",
                color: "var(--ink-3)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              {t.or}
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", padding: "12px 20px", justifyContent: "center" }}
            >
              <Icon name="shield" size={14} />
              {t.france_connect}
            </button>

            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--ink-2)",
                textAlign: "center",
              }}
            >
              {t.no_account}{" "}
              <a
                href={`/${locale}/register`}
                style={{ color: "var(--ink)", fontWeight: 600, borderBottom: "1px solid var(--gold)" }}
              >
                {t.request_access}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
