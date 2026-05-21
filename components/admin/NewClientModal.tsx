"use client";

import * as React from "react";
import { Icon } from "@/components/shared/Icon";
import { DOSSIER_STATUT_LABEL, DOSSIER_STATUT_ORDER } from "@/types/dossier";

export interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  /** Appelé après création réussie pour rafraîchir la liste. */
  onCreated: () => void;
}

interface FormState {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  langue: "fr" | "en" | "ar";
  titre: string;
  type_service: string;
  montant: string;
  statut: string;
}

const EMPTY: FormState = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  langue: "fr",
  titre: "",
  type_service: "Acquisition Immobilière - Dubaï",
  montant: "",
  statut: "demande",
};

/**
 * Modal de création d'un nouvel utilisateur client + ouverture de son
 * premier dossier (cahier §6.2.1 — gestion des utilisateurs).
 * Poste vers /api/admin/create-client (réservé avocat).
 */
export const NewClientModal: React.FC<NewClientModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  if (!open) return null;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]): void => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          telephone: form.telephone.trim() || null,
          langue: form.langue,
          titre: form.titre.trim() || "Nouveau dossier",
          type_service: form.type_service.trim(),
          montant: form.montant ? Number(form.montant) : null,
          statut: form.statut,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Échec de la création.");
      } else {
        setSuccess(
          data.tempPassword
            ? `Client créé. Mot de passe temporaire : ${data.tempPassword}`
            : "Client créé avec succès.",
        );
        setForm(EMPTY);
        onCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(35,49,73,0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: "100%", maxWidth: 560, padding: 0 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: "0.18em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Nouvel utilisateur
            </div>
            <h2 style={{ fontSize: 20 }}>Créer un client &amp; son dossier</h2>
          </div>
          <button onClick={onClose} style={{ color: "var(--ink-3)" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: 24, display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Prénom" value={form.prenom} onChange={(v) => update("prenom", v)} required />
            <Field label="Nom" value={form.nom} onChange={(v) => update("nom", v)} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Téléphone" value={form.telephone} onChange={(v) => update("telephone", v)} placeholder="+33 6 ..." />
            <div>
              <Label>Langue</Label>
              <select
                value={form.langue}
                onChange={(e) => update("langue", e.target.value as FormState["langue"])}
                className="input-line"
                style={{ width: "100%" }}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: "0.18em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Premier dossier
            </div>
            <Field label="Titre du dossier" value={form.titre} onChange={(v) => update("titre", v)} placeholder="Ex : Emaar Beachfront — Apt. 4204" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <Field label="Type de service" value={form.type_service} onChange={(v) => update("type_service", v)} />
              <Field label="Montant (€)" type="number" value={form.montant} onChange={(v) => update("montant", v)} placeholder="3420000" />
            </div>
            <div style={{ marginTop: 14 }}>
              <Label>Statut initial</Label>
              <select
                value={form.statut}
                onChange={(e) => update("statut", e.target.value)}
                className="input-line"
                style={{ width: "100%" }}
              >
                {DOSSIER_STATUT_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {DOSSIER_STATUT_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--error)", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>
              {success}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Fermer
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              <Icon name="plus" size={12} />{" "}
              {saving ? "Création…" : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
    {children}
  </label>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}) => (
  <div>
    <Label>{label}</Label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="input-line"
      style={{ width: "100%" }}
    />
  </div>
);
