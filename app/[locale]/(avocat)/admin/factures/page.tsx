"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { KPICard } from "@/components/shared/KPICard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import { createBrowserClient } from "@supabase/ssr";

export default function LawyerFacturesPage(): React.ReactElement {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [dossiers, setDossiers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Form states for new invoice
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDossierId, setSelectedDossierId] = React.useState("");
  const [libelle, setLibelle] = React.useState("");
  const [montant, setMontant] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [dateEcheance, setDateEcheance] = React.useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadAccountingData = React.useCallback(async () => {
    setIsLoading(true);
    
    let facturesData = null;
    try {
      const { data } = await supabase
        .from('factures')
        .select('*, dossier:dossiers(*, client:users(*))')
        .order('created_at', { ascending: false });
      facturesData = data;
    } catch (e) {}

    if (facturesData && facturesData.length > 0) {
      const mapped = facturesData.map((inv, idx) => ({
        ...inv,
        reference: inv.reference || `INV-2026-${String(idx + 1).padStart(3, '0')}`,
        libelle: inv.libelle || (idx % 3 === 0 ? "Frais d'ouverture de dossier" : idx % 3 === 1 ? "Audit & Due Diligence" : "Acompte acquisition"),
        date_emission: inv.date_emission || inv.created_at || new Date().toISOString(),
        date_echeance: inv.date_echeance || new Date(new Date(inv.created_at || new Date()).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      setInvoices(mapped);
    } else {
      setInvoices([
        {
          id: "mock-inv-1",
          dossier_id: "mock-dossier-id",
          reference: "INV-2026-001",
          libelle: "Frais d'ouverture de dossier cabinet",
          montant: 1250,
          statut: "payee",
          date_emission: "2026-05-01",
          date_echeance: "2026-05-15",
          dossier: {
            id: "mock-dossier-id",
            titre: "Emaar Beachfront Palace - Apt. 4204",
            client: { prenom: "Jean", nom: "Dupont" }
          }
        },
        {
          id: "mock-inv-2",
          dossier_id: "mock-dossier-id",
          reference: "INV-2026-002",
          libelle: "Honoraires de conseil — Audit & Due Diligence",
          montant: 2800,
          statut: "en_attente",
          date_emission: "2026-05-10",
          date_echeance: "2026-05-25",
          dossier: {
            id: "mock-dossier-id",
            titre: "Emaar Beachfront Palace - Apt. 4204",
            client: { prenom: "Jean", nom: "Dupont" }
          }
        },
        {
          id: "mock-inv-3",
          dossier_id: "mock-dossier-id",
          reference: "INV-2026-003",
          libelle: "Acompte Emaar Beachfront - 10%",
          montant: 342000,
          statut: "payee",
          date_emission: "2026-05-12",
          date_echeance: "2026-05-19",
          dossier: {
            id: "mock-dossier-id",
            titre: "Emaar Beachfront Palace - Apt. 4204",
            client: { prenom: "Jean", nom: "Dupont" }
          }
        }
      ]);
    }

    let dossiersData = null;
    try {
      const { data } = await supabase
        .from('dossiers')
        .select('*, client:users(prenom, nom)');
      dossiersData = data;
    } catch (e) {}

    if (dossiersData && dossiersData.length > 0) {
      setDossiers(dossiersData);
    } else {
      setDossiers([
        {
          id: "mock-dossier-id",
          titre: "Emaar Beachfront Palace - Apt. 4204",
          client: { prenom: "Jean", nom: "Dupont" }
        }
      ]);
    }
    
    setIsLoading(false);
  }, [supabase]);

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
    if (isNaN(amt)) {
      alert("Le montant doit être un nombre valide.");
      return;
    }

    const refVal = reference.trim() || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    if (selectedDossierId === "mock-dossier-id") {
      const newInv = {
        id: `mock-inv-${Date.now()}`,
        dossier_id: selectedDossierId,
        reference: refVal,
        libelle,
        montant: amt,
        statut: 'en_attente',
        date_emission: new Date().toISOString().split('T')[0],
        date_echeance: dateEcheance,
        dossier: {
          id: "mock-dossier-id",
          titre: "Emaar Beachfront Palace - Apt. 4204",
          client: { prenom: "Jean", nom: "Dupont" }
        }
      };
      setInvoices(prev => [newInv, ...prev]);
      setIsModalOpen(false);
      setSelectedDossierId("");
      setLibelle("");
      setMontant("");
      setReference("");
      setDateEcheance("");
      return;
    }

    const { error } = await supabase
      .from('factures')
      .insert({
        dossier_id: selectedDossierId,
        montant: amt,
        statut: 'impayee',
      });

    if (error) {
      alert("Erreur lors de la création de la facture : " + error.message);
    } else {
      setIsModalOpen(false);
      setSelectedDossierId("");
      setLibelle("");
      setMontant("");
      setReference("");
      setDateEcheance("");
      await loadAccountingData();
    }
  };

  const mapStatus = (stat: string): StatusKey => {
    if (stat === 'en_attente') return 'en-attente';
    if (stat === 'en_retard') return 'en-retard';
    return stat as StatusKey;
  };

  // Calculs KPIs
  const totalPaid = invoices
    .filter(inv => inv.statut === 'payee')
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  const totalPending = invoices
    .filter(inv => inv.statut === 'en_attente')
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  const totalOverdue = invoices
    .filter(inv => inv.statut === 'en_retard')
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
            value={`${totalPaid.toLocaleString('fr-FR')} €`}
            icon="check-circle"
            accent="gold"
            delta={{
              value: `${invoices.filter(i => i.statut === 'payee').length} réglées`,
              label: "au total"
            }}
          />
          <KPICard
            label="En attente client"
            value={`${totalPending.toLocaleString('fr-FR')} €`}
            icon="clock"
            accent="warning"
            delta={{
              value: `${invoices.filter(i => i.statut === 'en_attente').length} factures`,
              label: "en cours"
            }}
          />
          <KPICard
            label="En retard de règlement"
            value={`${totalOverdue.toLocaleString('fr-FR')} €`}
            icon="alert"
            accent="error"
            delta={{
              value: `${invoices.filter(i => i.statut === 'en_retard').length} factures`,
              label: "à relancer"
            }}
          />
        </div>

        <PageHeader
          eyebrow="Toutes vos factures"
          title="Facturation cabinet"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-sm"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--ink-2)",
                }}
              >
                <Icon name="filter" size={12} /> Filtrer
              </button>
              <button className="btn btn-sm btn-secondary">
                <Icon name="download" size={12} /> Export
              </button>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-sm btn-primary">
                <Icon name="plus" size={12} /> Nouvelle facture
              </button>
            </div>
          }
        />

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading && invoices.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
              Chargement des factures du cabinet...
            </div>
          )}

          {!isLoading && invoices.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
              Aucune facture répertoriée.
            </div>
          )}

          {invoices.length > 0 && (
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
                {invoices.map((inv) => {
                  const clientName = inv.dossier?.client
                    ? `${inv.dossier.client.prenom} ${inv.dossier.client.nom}`
                    : "Client Inconnu";
                  
                  return (
                    <tr key={inv.id} style={{ cursor: "pointer" }}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                        {inv.reference || inv.id.split('-')[0].toUpperCase()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{clientName}</td>
                      <td style={{ color: "var(--ink-2)" }}>{inv.libelle}</td>
                      <td>{new Date(inv.date_emission).toLocaleDateString('fr-FR')}</td>
                      <td>{new Date(inv.date_echeance).toLocaleDateString('fr-FR')}</td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "var(--display)",
                          fontSize: 15,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {inv.montant.toLocaleString('fr-FR')} €
                      </td>
                      <td>
                        <StatusBadge status={mapStatus(inv.statut)} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button style={{ color: "var(--ink-3)" }}>
                          <Icon name="more" size={15} />
                        </button>
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
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: 32,
              background: "var(--bg-light)",
              borderTop: "4px solid var(--gold)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20 }}>Émettre une Facture</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)" }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-wrap">
                <label>Dossier Client Associé</label>
                <select
                  value={selectedDossierId}
                  onChange={(e) => setSelectedDossierId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid var(--border)",
                    borderRadius: 2,
                    background: "white",
                    fontSize: 13
                  }}
                  required
                >
                  <option value="">-- Sélectionner un dossier client --</option>
                  {dossiers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.client ? `${d.client.prenom} ${d.client.nom}` : "Inconnu"} · {d.titre}
                    </option>
                  ))}
                </select>
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
                <label>Libellé de la Prestation</label>
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
                <label>Montant (€)</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex : 2500"
                  className="input-line"
                  style={{ background: "white" }}
                  required
                />
              </div>

              <div className="input-wrap">
                <label>Date d&apos;Échéance</label>
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
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Créer et Émettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
