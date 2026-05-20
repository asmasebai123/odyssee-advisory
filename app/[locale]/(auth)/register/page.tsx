"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { OAMark } from "@/components/shared/OAMark";
import { createBrowserClient } from "@supabase/ssr";

interface FormState {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  password: string;
  consent: boolean;
}

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [form, setForm] = React.useState<FormState>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    consent: false,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setError("Vous devez accepter les conditions pour continuer.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      // Insertion dans la table public.users
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: form.email,
        nom: form.nom,
        prenom: form.prenom,
        role: 'client',
        telephone: form.telephone,
      });

      if (insertError) {
        // En cas d'erreur, on affiche mais l'auth est créée (un trigger serait préférable en prod)
        setError("Erreur lors de la création du profil : " + insertError.message);
        setIsLoading(false);
        return;
      }
    }

    router.push(`/${locale}/dashboard`);
  };

  return (
    <div
      className="login-split"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
        background: "var(--bg-light)",
      }}
    >
      <div
        className="login-hero"
        style={{ position: "relative", overflow: "hidden", color: "white" }}
      >
        <div className="dubai-bg" />
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
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Odyssée
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.36em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Advisory · Paris–Dubaï
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: 460 }}>
              <div className="rule-gold" />
              <h1
                style={{
                  fontSize: 48,
                  lineHeight: 1.05,
                  color: "white",
                  letterSpacing: "-0.01em",
                }}
              >
                Bienvenue chez{" "}
                <span style={{ fontStyle: "italic", color: "var(--gold)" }}>
                  Odyssée
                </span>
                .
              </h1>
              <p
                style={{
                  marginTop: 24,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.75)",
                  maxWidth: 420,
                }}
              >
                Créez votre espace privé. Un avocat associé examinera votre demande
                sous 24 h ouvrées et reviendra vers vous avec une proposition.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420 }}>
            <div className="rule-gold" />
            <h2 style={{ fontSize: 30, marginBottom: 8 }}>Demander un accès.</h2>
            <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 28 }}>
              Vos informations restent strictement confidentielles.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div className="input-wrap">
                <label htmlFor="prenom">Prénom</label>
                <input
                  id="prenom"
                  className="input-line"
                  value={form.prenom}
                  onChange={(e) => update("prenom", e.target.value)}
                  required
                />
              </div>
              <div className="input-wrap">
                <label htmlFor="nom">Nom</label>
                <input
                  id="nom"
                  className="input-line"
                  value={form.nom}
                  onChange={(e) => update("nom", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-wrap" style={{ marginBottom: 20 }}>
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                className="input-line"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div className="input-wrap" style={{ marginBottom: 20 }}>
              <label htmlFor="tel">Téléphone</label>
              <input
                id="tel"
                className="input-line"
                value={form.telephone}
                onChange={(e) => update("telephone", e.target.value)}
                placeholder="+33 6 ..."
              />
            </div>

            <div className="input-wrap" style={{ marginBottom: 24 }}>
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="input-line"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={8}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 12,
                color: "var(--ink-2)",
                marginBottom: 24,
                cursor: "pointer",
              }}
            >
              <span
                onClick={() => update("consent", !form.consent)}
                style={{
                  width: 18,
                  height: 18,
                  border: "1px solid var(--ink-3)",
                  borderRadius: 2,
                  background: form.consent ? "var(--gold)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {form.consent && (
                  <Icon name="check" size={11} stroke={3} style={{ color: "var(--ink)" }} />
                )}
              </span>
              <span style={{ lineHeight: 1.5 }}>
                J&apos;accepte les CGU, la politique de confidentialité ainsi que les
                conditions de conservation des données (RGPD).
              </span>
            </label>

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
                justifyContent: "center",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Icon name="arrow-right" size={14} />
              {isLoading ? "Création en cours..." : "Créer mon compte"}
            </button>

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--ink-2)",
                textAlign: "center",
              }}
            >
              Vous avez déjà un compte ?{" "}
              <a
                href="/login"
                style={{
                  color: "var(--ink)",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--gold)",
                }}
              >
                Se connecter
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
