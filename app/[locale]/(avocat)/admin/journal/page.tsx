"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon, type IconName } from "@/components/shared/Icon";

interface AuditEntry {
  id: string;
  dossier_id: string | null;
  acteur_label: string | null;
  action: string;
  detail: string | null;
  created_at: string;
  dossier?: { titre: string | null } | null;
  acteur?: { prenom: string; nom: string } | null;
}

const ACTION_META: Record<string, { label: string; icon: IconName; color: string }> = {
  statut_change: { label: "Changement de statut", icon: "arrow-right", color: "var(--gold)" },
  document_demande: { label: "Pièce demandée", icon: "doc", color: "var(--warning)" },
  facture_emise: { label: "Facture émise", icon: "invoice", color: "var(--success)" },
  message_envoye: { label: "Message envoyé", icon: "message", color: "var(--ink-2)" },
};

export default function JournalPage(): React.ReactElement {
  const [entries, setEntries] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/audit?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && data.success) setEntries(data.entries ?? []);
      } catch {
        // silencieux
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar
        title="Journal d'audit"
        breadcrumb="Cabinet · Traçabilité"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "24px 28px",
              borderBottom: "1px solid var(--border)",
            }}
          >
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
              Traçabilité des actions
            </div>
            <h2 style={{ fontSize: 22 }}>Historique du cabinet</h2>
          </div>

          <div style={{ padding: "12px 28px 28px" }}>
            {loading && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}>
                Chargement…
              </div>
            )}

            {!loading && entries.length === 0 && (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--ink-3)",
                }}
              >
                Aucune action enregistrée pour l&apos;instant.
                <div style={{ fontSize: 12, marginTop: 8 }}>
                  (Les changements de statut, demandes de pièces et factures
                  apparaîtront ici.)
                </div>
              </div>
            )}

            {!loading &&
              entries.map((e, i) => {
                const meta = ACTION_META[e.action] ?? {
                  label: e.action,
                  icon: "info" as IconName,
                  color: "var(--ink-3)",
                };
                return (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: "16px 0",
                      borderBottom:
                        i < entries.length - 1
                          ? "1px solid var(--border-soft)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "var(--bg-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: meta.color,
                      }}
                    >
                      <Icon name={meta.icon} size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "var(--ink)",
                          }}
                        >
                          {meta.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: "var(--ink-3)",
                            flexShrink: 0,
                          }}
                        >
                          {new Date(e.created_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      {e.detail && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--ink-2)",
                            marginTop: 2,
                          }}
                        >
                          {e.detail}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--ink-3)",
                          marginTop: 4,
                        }}
                      >
                        {e.dossier?.titre ? `Dossier : ${e.dossier.titre}` : ""}
                        {e.acteur_label ? ` · ${e.acteur_label}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
