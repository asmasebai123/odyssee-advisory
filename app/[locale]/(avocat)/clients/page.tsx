"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import { NewClientModal } from "@/components/admin/NewClientModal";
import { useParams } from "next/navigation";

export default function ClientsListPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const [clients, setClients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showNewClient, setShowNewClient] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/clients?t=" + Date.now(), { cache: "no-store" });
      const resData = await res.json();
      if (resData.success && resData.clients && resData.clients.length > 0) {
        setClients(resData.clients);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.error("Failed to load clients via API:", e);
    }

    // Fallback
    setClients([
        {
          id: "mock-client-id",
          email: "client@test.com",
          nom: "Dupont",
          prenom: "Jean",
          role: "client",
          telephone: "+33 6 12 34 56 78",
          langue: "fr",
          created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          dossiers: [
            {
              id: "mock-dossier-id",
              client_id: "mock-client-id",
              titre: "Emaar Beachfront Palace - Apt. 4204",
              type_service: "Acquisition Immobilière - Dubaï",
              montant: 3420000,
              statut: "en_cours"
            }
          ]
        }
      ]);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const getClientStatus = (dossiers: any[]): StatusKey => {
    if (!dossiers || dossiers.length === 0) return "nouveau";
    const active = dossiers.some((d) => !["cloture", "valide"].includes(d.statut));
    return active ? "actif" : "cloture";
  };

  return (
    <>
      <Navbar
        title="Clients"
        breadcrumb="Cabinet"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="OA"
      />

      <div className="page-fade page-pad">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "24px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
                Annuaire
              </div>
              <h2 style={{ fontSize: 22 }}>Tous les clients ({clients.length})</h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--bg-light)",
                  borderRadius: 2,
                  width: 280,
                }}
              >
                <Icon name="search" size={14} style={{ color: "var(--ink-3)" }} />
                <input
                  placeholder="Rechercher un client…"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 12,
                    flex: 1,
                  }}
                />
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowNewClient(true)}
              >
                <Icon name="plus" size={12} /> Nouveau client
              </button>
            </div>
          </div>
          <table className="table-clean" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 28px" }}>Client</th>
                <th style={{ padding: "12px 0" }}>Dossiers Actifs</th>
                <th style={{ padding: "12px 0" }}>Dernière Activité</th>
                <th style={{ padding: "12px 0" }}>Statut</th>
                <th style={{ padding: "12px 28px", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>Chargement...</td>
                </tr>
              )}
              {clients.map((c, i) => {
                const activeDossiers = c.dossiers?.filter((d: any) => !["cloture", "valide"].includes(d.statut)) || [];
                const latestDossier = activeDossiers.length > 0 ? activeDossiers[0] : (c.dossiers?.[0] || null);

                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)", cursor: "pointer" }}>
                    <td style={{ padding: "16px 28px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                          {c.prenom.substring(0, 1).toUpperCase()}{c.nom.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink)" }}>
                            {c.prenom} {c.nom}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                            {c.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 0", fontFamily: "var(--mono)", fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>
                      {latestDossier ? (
                        <Link href={`/${locale}/dossiers/${latestDossier.id}`}>
                          #{latestDossier.id.split('-')[0].toUpperCase()}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--ink-3)" }}>Aucun dossier</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: 13, color: "var(--ink-2)" }}>
                      {latestDossier ? new Date(latestDossier.updated_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "16px 0" }}>
                      <StatusBadge status={getClientStatus(c.dossiers)} />
                    </td>
                    <td style={{ padding: "16px 28px", textAlign: "right" }}>
                      <Icon name="chevron-right" size={14} style={{ color: "var(--gold)" }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewClientModal
        open={showNewClient}
        onClose={() => setShowNewClient(false)}
        onCreated={() => {
          loadData();
        }}
      />
    </>
  );
}
