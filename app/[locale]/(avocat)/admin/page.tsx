"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { KPICard } from "@/components/shared/KPICard";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DOSSIER_STATUT_LABEL, type DossierStatut } from "@/types/dossier";
import { createBrowserClient } from "@supabase/ssr";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Dossier {
  id: string;
  client_id: string;
  titre: string;
  type_service: string;
  montant: number | null;
  statut: DossierStatut;
  created_at: string;
  client?: { prenom: string; nom: string; email: string };
}

export default function AdminDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const [dossiers, setDossiers] = React.useState<Dossier[]>([]);
  const [filteredDossiers, setFilteredDossiers] = React.useState<Dossier[]>([]);
  const [kpis, setKpis] = React.useState({ actifs: 0, attente: 0, cloture: 0, totalMontant: 0 });
  const [isLoading, setIsLoading] = React.useState(true);

  // Deletion state
  const [dossierToDelete, setDossierToDelete] = React.useState<Dossier | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successCreds, setSuccessCreds] = React.useState<any>(null);

  // Client Selection / Mode
  const [clientMode, setClientMode] = React.useState<"new" | "existing">("new");
  const [allClients, setAllClients] = React.useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = React.useState("");

  // Form Fields
  const [formEmail, setFormEmail] = React.useState("");
  const [formPrenom, setFormPrenom] = React.useState("");
  const [formNom, setFormNom] = React.useState("");
  const [formTelephone, setFormTelephone] = React.useState("");
  const [formTitre, setFormTitre] = React.useState("");
  const [formTypeService, setFormTypeService] = React.useState("Acquisition Immobilière - Dubaï");
  const [formMontant, setFormMontant] = React.useState("");
  const [formStatut, setFormStatut] = React.useState<DossierStatut>("demande");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    let dossiersList: Dossier[] | null = null;
    try {
      const res = await fetch("/api/admin/dossiers");
      const resData = await res.json();
      if (resData.success && resData.dossiers) {
        dossiersList = resData.dossiers as Dossier[];
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const resClients = await fetch("/api/admin/clients");
      const resClientsData = await resClients.json();
      if (resClientsData.success && resClientsData.clients) {
        setAllClients(resClientsData.clients);
      }
    } catch (e) {
      console.error("Failed to load clients list:", e);
    }

    if (dossiersList && dossiersList.length > 0) {
      setDossiers(dossiersList);
      setFilteredDossiers(dossiersList);
      
      const totalAmount = dossiersList.reduce((acc, curr) => acc + (curr.montant || 0), 0);

      setKpis({
        actifs: dossiersList.filter(
          (d) => d.statut !== "cloture"
        ).length,
        attente: dossiersList.filter((d) =>
          ["demande", "en_analyse", "pieces_manquantes"].includes(d.statut)
        ).length,
        cloture: dossiersList.filter((d) => d.statut === "cloture").length,
        totalMontant: totalAmount
      });
    } else {
      const fallback: Dossier[] = [
        {
          id: "mock-dossier-id",
          client_id: "mock-client-id",
          titre: "Emaar Beachfront Palace - Apt. 4204",
          type_service: "Acquisition Immobilière - Dubaï",
          montant: 3420000,
          statut: "en_cours",
          created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          client: { prenom: "Jean", nom: "Dupont", email: "client@test.com" },
        },
      ];
      setDossiers(fallback);
      setFilteredDossiers(fallback);
      setKpis({ actifs: 1, attente: 0, cloture: 0, totalMontant: 3420000 });
    }
    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply search & filter
  React.useEffect(() => {
    let result = dossiers;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.titre.toLowerCase().includes(term) ||
          d.type_service.toLowerCase().includes(term) ||
          (d.client &&
            (`${d.client.prenom} ${d.client.nom}`)
              .toLowerCase()
              .includes(term)) ||
          (d.client && d.client.email.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.statut === statusFilter);
    }

    setFilteredDossiers(result);
  }, [searchTerm, statusFilter, dossiers]);

  React.useEffect(() => {
    if (clientMode === "existing" && selectedClientId) {
      const client = allClients.find((c) => c.id === selectedClientId);
      if (client) {
        setFormEmail(client.email || "");
        setFormPrenom(client.prenom || "");
        setFormNom(client.nom || "");
        setFormTelephone(client.telephone || "");
      }
    } else if (clientMode === "new") {
      setFormEmail("");
      setFormPrenom("");
      setFormNom("");
      setFormTelephone("");
      setSelectedClientId("");
    }
  }, [clientMode, selectedClientId, allClients]);

  const openModal = () => {
    setClientMode("new");
    setSelectedClientId("");
    setFormEmail("");
    setFormPrenom("");
    setFormNom("");
    setFormTelephone("");
    setFormTitre("");
    setFormMontant("");
    setFormStatut("demande");
    setSuccessCreds(null);
    setIsModalOpen(true);
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formPrenom || !formNom || !formTitre) return;

    setIsSubmitting(true);
    setSuccessCreds(null);

    try {
      // 1. Create client user account and dossier atomically via secure Server API
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formEmail,
          prenom: formPrenom,
          nom: formNom,
          telephone: formTelephone,
          titre: formTitre,
          type_service: formTypeService,
          montant: formMontant ? parseFloat(formMontant) : null,
          statut: formStatut
        })
      });

      const clientRes = await res.json();
      if (!clientRes.success) {
        throw new Error(clientRes.error || "Erreur de création du dossier.");
      }

      // 2. Success handling
      if (clientRes.credentials) {
        setSuccessCreds(clientRes.credentials);
      } else {
        setSuccessCreds({ email: formEmail, password: "password123 (existant)" });
      }

      // Reset form
      setFormEmail("");
      setFormPrenom("");
      setFormNom("");
      setFormTelephone("");
      setFormTitre("");
      setFormMontant("");
      setFormStatut("demande");

      // Reload list
      await loadData();
      setIsModalOpen(false);

    } catch (err: any) {
      alert(err.message || "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDossier = async () => {
    if (!dossierToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/dossiers/${dossierToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur de suppression.");
      setDossierToDelete(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur inconnue lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatEuro = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)}M €`;
    }
    return `${val.toLocaleString("fr-FR")} €`;
  };

  return (
    <>
      <Navbar
        title="Superadmin"
        breadcrumb="Cabinet Odyssée · Tous les dossiers"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <h1
              style={{
                fontSize: 28,
                color: "var(--ink)",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Tableau de Bord Cabinet
            </h1>
            <p style={{ color: "var(--ink-2)" }}>
              Gérez les prospects, validez les dossiers et pilotez l&apos;accompagnement d&apos;investissement immobilier.
            </p>
          </div>
          <button
            onClick={openModal}
            className="btn btn-primary"
          >
            <Icon name="plus" size={14} /> Nouveau Dossier
          </button>
        </div>

        {/* Credentials Success Banner */}
        {successCreds && (
          <div
            className="card card-dark"
            style={{
              padding: "20px 24px",
              marginBottom: 24,
              borderLeft: "4px solid var(--gold)",
              background: "var(--bg-dark)",
              color: "white"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4 style={{ color: "var(--gold)", fontSize: 16, marginBottom: 6, fontWeight: 700 }}>
                  🎉 Dossier et compte client créés avec succès !
                </h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 12 }}>
                  Le client a été inscrit avec les accès ci-dessous. Un mail automatique d&apos;accueil a été simulé.
                </p>
                <div style={{ display: "flex", gap: 24, fontSize: 13, fontFamily: "var(--mono)", background: "rgba(255,255,255,0.06)", padding: "10px 14px", borderRadius: 2 }}>
                  <span><strong>Identifiant :</strong> {successCreds.email}</span>
                  <span><strong>Mot de passe temporaire :</strong> {successCreds.password}</span>
                </div>
              </div>
              <button
                onClick={() => setSuccessCreds(null)}
                style={{ background: "transparent", border: "none", color: "white", fontSize: 16, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <KPICard
            label="Dossiers actifs"
            value={kpis.actifs.toString()}
            icon="folder"
          />
          <KPICard
            label="En attente client"
            value={kpis.attente.toString()}
            icon="clock"
            accent="warning"
          />
          <KPICard
            label="Dossiers clôturés"
            value={kpis.cloture.toString()}
            icon="check-circle"
            accent="success"
          />
          <KPICard
            label="Volume Transactions"
            value={formatEuro(kpis.totalMontant)}
            icon="trending-up"
          />
        </div>

        {/* Filters and Search Bar */}
        <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "var(--bg-light)",
                border: "1px solid var(--border)",
                borderRadius: 2,
                flex: 1,
                minWidth: 260
              }}
            >
              <Icon name="search" size={14} style={{ color: "var(--ink-3)" }} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par client, email, titre..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  width: "100%",
                  color: "var(--ink)"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>Statut :</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                  fontSize: 13,
                  background: "var(--bg-light)",
                  outline: "none",
                  color: "var(--ink)"
                }}
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(DOSSIER_STATUT_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dossiers List */}
        <div className="card" style={{ padding: "24px 32px", minHeight: 280 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Dossiers ({filteredDossiers.length})</h3>
          </div>

          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", maxWidth: "100%" }}>
          <table
            style={{
              width: "100%",
              minWidth: 720,
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  color: "var(--ink-3)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Réf. Dossier</th>
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Client</th>
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Type de projet</th>
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Montant</th>
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Date création</th>
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Statut</th>
                <th style={{ paddingBottom: 12, fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-3)" }}>
                    Chargement des dossiers en temps réel...
                  </td>
                </tr>
              ) : filteredDossiers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "var(--ink-3)",
                    }}
                  >
                    Aucun dossier trouvé correspondant aux critères.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: "1px solid var(--border-soft)",
                      fontSize: 14,
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 0",
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {((d.id && typeof d.id === 'string' && d.id.includes('-')) ? d.id.split('-')[0] : (d.id || 'N/A')).toUpperCase()}
                    </td>
                    <td style={{ padding: "16px 0", color: "var(--ink-2)" }}>
                      {d.client ? (
                        <div>
                          <strong>{d.client.prenom} {d.client.nom}</strong>
                          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{d.client.email}</div>
                        </div>
                      ) : (
                        "Client Inconnu"
                      )}
                    </td>
                    <td style={{ padding: "16px 0", color: "var(--ink-2)" }}>
                      <div>
                        <strong>{d.titre}</strong>
                        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{d.type_service}</div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 0", color: "var(--ink)", fontWeight: 600 }}>
                      {d.montant ? formatEuro(d.montant) : "-- €"}
                    </td>
                    <td style={{ padding: "16px 0", color: "var(--ink-3)" }}>
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ padding: "16px 0" }}>
                      <StatusBadge status={d.statut} />
                    </td>
                    <td style={{ padding: "16px 0" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link
                          href={`/${locale}/dossiers/${d.id}`}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex" }}
                        >
                          Gérer
                        </Link>
                        <button
                          onClick={() => setDossierToDelete(d)}
                          style={{
                            background: "rgba(220,38,38,0.08)",
                            border: "1px solid rgba(220,38,38,0.25)",
                            borderRadius: 4,
                            color: "#dc2626",
                            cursor: "pointer",
                            padding: "6px 8px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                          title="Supprimer ce dossier"
                        >
                          <Icon name="x" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Nouveau Dossier Slide-over Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(11, 19, 43, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <div
            className="page-fade"
            style={{
              width: 480,
              background: "white",
              height: "100%",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid var(--border)"
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: 24, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Créer un nouveau dossier</h3>
                <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                  Inscrit le client et ouvre un dossier d&apos;accompagnement.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--ink-3)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateDossier} style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Client Section */}
              <div style={{ borderBottom: "1px solid var(--border-soft)", paddingBottom: 14 }}>
                <h4 style={{ fontSize: 13, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>
                  1. Informations du client
                </h4>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setClientMode("new")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 4,
                      cursor: "pointer",
                      border: "1px solid " + (clientMode === "new" ? "var(--gold)" : "var(--border)"),
                      background: clientMode === "new" ? "rgba(181, 147, 86, 0.1)" : "transparent",
                      color: clientMode === "new" ? "var(--gold)" : "var(--ink-3)",
                      transition: "all 0.2s"
                    }}
                  >
                    Nouveau client
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode("existing")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 4,
                      cursor: "pointer",
                      border: "1px solid " + (clientMode === "existing" ? "var(--gold)" : "var(--border)"),
                      background: clientMode === "existing" ? "rgba(181, 147, 86, 0.1)" : "transparent",
                      color: clientMode === "existing" ? "var(--gold)" : "var(--ink-3)",
                      transition: "all 0.2s"
                    }}
                  >
                    Client existant
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {clientMode === "existing" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Sélectionner le client</label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="input-line"
                        style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)" }}
                        required
                      >
                        <option value="">-- Choisir un client --</option>
                        {allClients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.prenom} {c.nom} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Prénom</label>
                      <input
                        value={formPrenom}
                        onChange={(e) => setFormPrenom(e.target.value)}
                        placeholder="Jean"
                        className="input-line"
                        style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", opacity: clientMode === "existing" ? 0.6 : 1 }}
                        required
                        disabled={clientMode === "existing"}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Nom</label>
                      <input
                        value={formNom}
                        onChange={(e) => setFormNom(e.target.value)}
                        placeholder="Dupont"
                        className="input-line"
                        style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", opacity: clientMode === "existing" ? 0.6 : 1 }}
                        required
                        disabled={clientMode === "existing"}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="client@exemple.com"
                      className="input-line"
                      style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", opacity: clientMode === "existing" ? 0.6 : 1 }}
                      required
                      disabled={clientMode === "existing"}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Téléphone</label>
                    <input
                      value={formTelephone}
                      onChange={(e) => setFormTelephone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="input-line"
                      style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", opacity: clientMode === "existing" ? 0.6 : 1 }}
                      disabled={clientMode === "existing"}
                    />
                  </div>
                </div>
              </div>

              {/* Dossier Section */}
              <div>
                <h4 style={{ fontSize: 13, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>
                  2. Détails du projet
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Titre du dossier</label>
                    <input
                      value={formTitre}
                      onChange={(e) => setFormTitre(e.target.value)}
                      placeholder="Ex : Emaar Beachfront - T3 Apt 104"
                      className="input-line"
                      style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Type d&apos;accompagnement</label>
                    <select
                      value={formTypeService}
                      onChange={(e) => setFormTypeService(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", background: "var(--bg-light)", outline: "none", color: "var(--ink)" }}
                    >
                      <option value="Acquisition Immobilière - Dubaï">Acquisition Immobilière - Dubaï</option>
                      <option value="Structuration Corporate & ADGC">Structuration Corporate & ADGC</option>
                      <option value="Audit & Due Diligence Juridique">Audit & Due Diligence Juridique</option>
                      <option value="Succession & Planification Patrimoniale">Succession & Planification Patrimoniale</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Montant (€)</label>
                      <input
                        type="number"
                        value={formMontant}
                        onChange={(e) => setFormMontant(e.target.value)}
                        placeholder="Ex: 3420000"
                        className="input-line"
                        style={{ width: "100%", background: "var(--bg-light)", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Statut Initial</label>
                      <select
                        value={formStatut}
                        onChange={(e) => setFormStatut(e.target.value as DossierStatut)}
                        style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", background: "var(--bg-light)", outline: "none", color: "var(--ink)" }}
                      >
                        {Object.entries(DOSSIER_STATUT_LABEL).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: "auto", display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid var(--border-soft)" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer le dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de confirmation de suppression ── */}
      {dossierToDelete && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(11, 19, 43, 0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="page-fade"
            style={{
              background: "white",
              borderRadius: 6,
              padding: 36,
              width: 460,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(220,38,38,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="alert" size={20} style={{ color: "#dc2626" }} />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Supprimer ce dossier ?
                </h3>
                <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  Vous êtes sur le point de supprimer définitivement le dossier{" "}
                  <strong style={{ color: "var(--ink)" }}>"{dossierToDelete.titre}"</strong>{" "}
                  {dossierToDelete.client && (
                    <>
                      de{" "}
                      <strong style={{ color: "var(--ink)" }}>
                        {dossierToDelete.client.prenom} {dossierToDelete.client.nom}
                      </strong>
                    </>
                  )}.
                  <br />
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>
                    Cette action est irréversible
                  </span>{" "}
                  et supprimera tous les documents, messages et factures associés.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDossierToDelete(null)}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteDossier}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "11px 20px",
                  background: isDeleting ? "#fca5a5" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.15s",
                }}
              >
                <Icon name="x" size={13} />
                {isDeleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
