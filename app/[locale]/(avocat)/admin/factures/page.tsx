"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { KPICard } from "@/components/shared/KPICard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import { useParams } from "next/navigation";

export default function LawyerFacturesPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [dossiers, setDossiers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form states for new invoice
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedDossierId, setSelectedDossierId] = React.useState("");
  const [libelle, setLibelle] = React.useState("");
  const [montant, setMontant] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [dateEcheance, setDateEcheance] = React.useState("");

  const loadAccountingData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Fetch factures via API route (uses service role — bypasses RLS)
      const res = await fetch("/api/admin/factures");
      const data = await res.json();
      if (data.success && Array.isArray(data.factures)) {
        setInvoices(data.factures);
      } else {
        setErrorMsg(data.error || "Erreur lors du chargement des factures.");
      }
    } catch (e) {
      setErrorMsg("Impossible de contacter le serveur.");
    }

    try {
      // Fetch dossiers for the dropdown
      const res = await fetch("/api/admin/dossiers");
      const data = await res.json();
      if (data.success && Array.isArray(data.dossiers)) {
        setDossiers(data.dossiers);
      }
    } catch (e) {
      console.error("Erreur chargement dossiers:", e);
    }

    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadAccountingData();
  }, [loadAccountingData]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossierId || !libelle || !montant || !dateEcheance) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const amt = parseFloat(montant);
    if (isNaN(amt) || amt <= 0) {
      alert("Le montant doit être un nombre valide et positif.");
      return;
    }

    const refVal =
      reference.trim() ||
      `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossier_id: selectedDossierId,
          montant: amt,
          libelle,
          reference: refVal,
          date_echeance: dateEcheance,
          date_emission: new Date().toISOString().split("T")[0],
        }),
      });

      const result = await res.json();
      if (!result.success) {
        alert("Erreur lors de la création : " + result.error);
      } else {
        setIsModalOpen(false);
        setSelectedDossierId("");
        setLibelle("");
        setMontant("");
        setReference("");
        setDateEcheance("");
        await loadAccountingData();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapStatus = (stat: string): StatusKey => {
    if (stat === "impayee") return "impayee";
    if (stat === "en_retard") return "en-retard";
    if (stat === "payee") return "payee";
    return stat as StatusKey;
  };

  // KPI calculations
  const totalPaid = invoices
    .filter((inv) => inv.statut === "payee")
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  const totalPending = invoices
    .filter((inv) => inv.statut === "impayee")
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  const totalOverdue = invoices
    .filter((inv) => inv.statut === "en_retard")
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  return (
    <>
      <Navbar
        title="Facturation Cabinet"
        breadcrumb="Cabinet · Comptabilité"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <KPICard
            label="Encaissé global"
            value={`${totalPaid.toLocaleString("fr-FR")} €`}
            icon="check-circle"
            accent="gold"
            delta={{
              value: `${invoices.filter((i) => i.statut === "payee").length} réglées`,
              label: "au total",
            }}
          />
          <KPICard
            label="En attente de règlement"
            value={`${totalPending.toLocaleString("fr-FR")} €`}
            icon="clock"
            accent="warning"
            delta={{
              value: `${invoices.filter((i) => i.statut === "impayee").length} factures`,
              label: "impayées",
            }}
          />
          <KPICard
            label="En retard de règlement"
            value={`${totalOverdue.toLocaleString("fr-FR")} €`}
            icon="alert"
            accent="error"
            delta={{
              value: `${invoices.filter((i) => i.statut === "en_retard").length} factures`,
              label: "à relancer",
            }}
          />
        </div>

        <PageHeader
          eyebrow="Toutes vos factures"
          title="Facturation cabinet"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-sm btn-secondary"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--ink-2)",
                }}
              >
                <Icon name="download" size={12} /> Export
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-sm btn-primary"
              >
                <Icon name="plus" size={12} /> Nouvelle facture
              </button>
            </div>
          }
        />

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading && (
            <div
              style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}
            >
              Chargement des factures du cabinet...
            </div>
          )}

          {!isLoading && errorMsg && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#dc2626",
                fontSize: 13,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {!isLoading && !errorMsg && invoices.length === 0 && (
            <div
              style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}
            >
              Aucune facture répertoriée. Créez votre première facture via le
              bouton ci-dessus.
            </div>
          )}

          {!isLoading && invoices.length > 0 && (
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Libellé</th>
                  <th>Émise le</th>
                  <th>Échéance</th>
                  <th style={{ textAlign: "right" }}>Montant</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => {
                  const clientName = inv.dossier?.client
                    ? `${inv.dossier.client.prenom} ${inv.dossier.client.nom}`
                    : "Client Inconnu";

                  const refDisplay =
                    inv.reference ||
                    `INV-${new Date(inv.created_at).getFullYear()}-${String(
                      idx + 1
                    ).padStart(3, "0")}`;

                  const emissionDate = inv.date_emission || inv.created_at;
                  const echeanceDate = inv.date_echeance;

                  return (
                    <tr key={inv.id} style={{ cursor: "default" }}>
                      <td
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {refDisplay}
                      </td>
                      <td style={{ fontWeight: 600 }}>{clientName}</td>
                      <td style={{ color: "var(--ink-2)" }}>
                        {inv.libelle || "—"}
                      </td>
                      <td>
                        {emissionDate
                          ? new Date(emissionDate).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td>
                        {echeanceDate
                          ? new Date(echeanceDate).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "var(--display)",
                          fontSize: 15,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {(inv.montant || 0).toLocaleString("fr-FR")} €
                      </td>
                      <td>
                        <StatusBadge status={mapStatus(inv.statut)} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <a
                          href={`/${locale}/factures/${inv.id}/print`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: 6, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          title="Imprimer / PDF"
                        >
                          <Icon name="pdf" size={14} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - Nouvelle Facture */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: 32,
              background: "var(--bg-light)",
              borderTop: "4px solid var(--gold)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>
                  Émettre une Facture
                </h3>
                <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                  La facture sera visible par le client dans son espace.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-3)",
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateInvoice}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="input-wrap">
                <label>Dossier Client Associé *</label>
                <select
                  value={selectedDossierId}
                  onChange={(e) => setSelectedDossierId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid var(--border)",
                    borderRadius: 2,
                    background: "white",
                    fontSize: 13,
                  }}
                  required
                >
                  <option value="">-- Sélectionner un dossier client --</option>
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.client
                        ? `${d.client.prenom} ${d.client.nom}`
                        : "Inconnu"}{" "}
                      · {d.titre}
                    </option>
                  ))}
                </select>
                {dossiers.length === 0 && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      marginTop: 4,
                    }}
                  >
                    Aucun dossier disponible. Créez d&apos;abord un dossier
                    client.
                  </p>
                )}
              </div>

              <div className="input-wrap">
                <label>Référence Facture (Optionnel)</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex : INV-2026-001"
                  className="input-line"
                  style={{ background: "white" }}
                />
              </div>

              <div className="input-wrap">
                <label>Libellé de la Prestation *</label>
                <input
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  placeholder="Ex : Honoraires de conseil — Due Diligence"
                  className="input-line"
                  style={{ background: "white" }}
                  required
                />
              </div>

              <div className="input-wrap">
                <label>Montant (€) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex : 2500"
                  className="input-line"
                  style={{ background: "white" }}
                  required
                />
              </div>

              <div className="input-wrap">
                <label>Date d&apos;Échéance *</label>
                <input
                  type="date"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  className="input-line"
                  style={{ background: "white" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
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
                  {isSubmitting ? "Création..." : "Créer et Émettre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
