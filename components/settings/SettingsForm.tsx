"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/components/shared/Icon";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

type Lang = "fr" | "en" | "ar";

export interface SettingsFormUser {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  langue: Lang;
}

export interface SettingsFormProps {
  /** User chargé depuis Supabase ou mock. */
  user: SettingsFormUser | null;
  /** "client" ou "avocat" — pour adapter les libellés. */
  role?: "client" | "avocat";
}

/**
 * Formulaire de paramètres partagé client + cabinet.
 * - Profil (nom, prénom, téléphone)
 * - Langue préférée (FR / EN / AR)
 * - Changement de mot de passe
 * - Préférences notifications (toggle email on/off)
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({ user, role = "client" }) => {
  const supabase = React.useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [prenom, setPrenom] = React.useState(user?.prenom ?? "");
  const [nom, setNom] = React.useState(user?.nom ?? "");
  const [telephone, setTelephone] = React.useState(user?.telephone ?? "");
  const [langue, setLangue] = React.useState<Lang>(user?.langue ?? "fr");
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [emailNotif, setEmailNotif] = React.useState(true);

  const [saving, setSaving] = React.useState(false);
  const tSettings = useTranslations("settings");
  const [feedback, setFeedback] = React.useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    if (!user) return;
    setPrenom(user.prenom);
    setNom(user.nom);
    setTelephone(user.telephone ?? "");
    setLangue(user.langue);
  }, [user]);

  const saveProfile = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user?.id) {
      setFeedback({ kind: "err", text: "Profil non chargé." });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ prenom, nom, telephone, langue })
      .eq("id", user.id);
    setSaving(false);
    setFeedback(
      error
        ? { kind: "err", text: "Erreur : " + error.message }
        : { kind: "ok", text: "Profil enregistré." },
    );
    setTimeout(() => setFeedback(null), 3500);
  };

  const savePassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (pw1.length < 8) {
      setFeedback({ kind: "err", text: "Mot de passe trop court (8 min)." });
      return;
    }
    if (pw1 !== pw2) {
      setFeedback({ kind: "err", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setSaving(false);
    if (error) {
      setFeedback({ kind: "err", text: "Erreur : " + error.message });
    } else {
      setPw1("");
      setPw2("");
      setFeedback({ kind: "ok", text: "Mot de passe mis à jour." });
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Profil */}
      <section className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.18em",
              color: "var(--gold)",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Profil
          </div>
          <h2 style={{ fontSize: 18 }}>Vos informations personnelles</h2>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
            Ces informations apparaissent sur vos communications avec{" "}
            {role === "avocat" ? "vos clients" : "le cabinet"}.
          </p>
        </div>

        <form onSubmit={saveProfile} style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Prénom" value={prenom} onChange={setPrenom} />
            <Field label="Nom" value={nom} onChange={setNom} />
          </div>
          <Field
            label="Email"
            value={user?.email ?? ""}
            disabled
            hint="Pour changer d'email, contactez le support."
          />
          <Field
            label="Téléphone"
            value={telephone}
            onChange={setTelephone}
            placeholder="+33 6 ..."
          />

          <div>
            <label
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                fontWeight: 600,
              }}
            >
              {tSettings("languageSection")}
            </label>
            <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6, marginBottom: 10 }}>
              {tSettings("languageHint")}
            </p>
            <LanguageSwitcher variant="default" />
          </div>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              alignItems: "center",
            }}
          >
            {feedback && (
              <span
                style={{
                  fontSize: 12,
                  color:
                    feedback.kind === "ok" ? "var(--success)" : "var(--error)",
                  fontWeight: 600,
                }}
              >
                {feedback.text}
              </span>
            )}
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={saving}
            >
              <Icon name="check" size={12} />{" "}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>

      {/* Mot de passe */}
      <section className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.18em",
              color: "var(--gold)",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Sécurité
          </div>
          <h2 style={{ fontSize: 18 }}>Changer mon mot de passe</h2>
        </div>

        <form onSubmit={savePassword} style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Field
              label="Nouveau mot de passe"
              value={pw1}
              onChange={setPw1}
              type="password"
            />
            <Field
              label="Confirmation"
              value={pw2}
              onChange={setPw2}
              type="password"
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              alignItems: "center",
            }}
          >
            <button
              type="submit"
              className="btn btn-sm btn-secondary"
              disabled={saving || !pw1 || !pw2}
            >
              <Icon name="lock" size={12} /> Mettre à jour
            </button>
          </div>
        </form>
      </section>

      {/* Notifications */}
      <section className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: "0.18em",
              color: "var(--gold)",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Notifications
          </div>
          <h2 style={{ fontSize: 18 }}>Préférences d&apos;emails</h2>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
              Recevoir les emails de notification
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              MAJ de statut, demandes de pièces, validation de dossier, etc.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotif(!emailNotif)}
            aria-pressed={emailNotif}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: emailNotif ? "var(--gold)" : "var(--border)",
              position: "relative",
              transition: "background .15s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: emailNotif ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--white)",
                transition: "left .15s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </label>
      </section>
    </div>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  disabled,
}) => (
  <div>
    <label
      style={{
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-3)",
        fontWeight: 600,
        display: "block",
        marginBottom: 6,
      }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="input-line"
      style={{ width: "100%", opacity: disabled ? 0.55 : 1 }}
    />
    {hint && (
      <div
        style={{
          fontSize: 11,
          color: "var(--ink-3)",
          marginTop: 4,
          fontStyle: "italic",
        }}
      >
        {hint}
      </div>
    )}
  </div>
);
