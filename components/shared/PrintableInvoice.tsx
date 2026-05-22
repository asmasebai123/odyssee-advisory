"use client";

import * as React from "react";
import { Icon } from "@/components/shared/Icon";

export interface PrintableInvoiceProps {
  facture: {
    id: string;
    reference?: string | null;
    libelle?: string | null;
    montant: number;
    statut: string;
    stripe_payment_id?: string | null;
    date_emission?: string | null;
    date_echeance?: string | null;
    created_at: string;
    dossier?: {
      id: string;
      titre: string;
      type_service: string;
      client?: {
        prenom: string;
        nom: string;
        email: string;
        telephone?: string | null;
      } | null;
    } | null;
  };
  backPath: string;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  facture,
  backPath,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const clientName = facture.dossier?.client
    ? `${facture.dossier.client.prenom} ${facture.dossier.client.nom}`
    : "Client Inconnu";
  const clientEmail = facture.dossier?.client?.email || "—";
  const clientPhone = facture.dossier?.client?.telephone || "—";

  const refDisplay =
    facture.reference ||
    `FAC-${new Date(facture.created_at).getFullYear()}-${facture.id
      .split("-")[0]
      .toUpperCase()}`;

  const emissionDate = facture.date_emission
    ? new Date(facture.date_emission).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(facture.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const echeanceDate = facture.date_echeance
    ? new Date(facture.date_echeance).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const isPaid = facture.statut === "payee";

  // Calculate totals (Prestation de conseil à l'international: souvent 0% TVA)
  const montantHT = facture.montant;
  const tvaRate = 0; // 0% default
  const tvaAmount = (montantHT * tvaRate) / 100;
  const montantTTC = montantHT + tvaAmount;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        color: "var(--ink)",
        padding: "40px 20px",
        fontFamily: "var(--sans)",
      }}
      className="invoice-print-container"
    >
      {/* Print styles overrides */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #1a1a1a !important;
          }
          .invoice-print-container {
            padding: 0 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card-wrapper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: #ffffff !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 15mm 20mm 15mm 20mm;
          }
        }
      `}</style>

      {/* Screen action bar */}
      <div
        className="no-print"
        style={{
          maxWidth: 800,
          margin: "0 auto 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href={backPath}
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="chevron-left" size={14} /> Retour
        </a>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Icon name="download" size={14} /> Imprimer / Exporter PDF
          </button>
        </div>
      </div>

      {/* Main Invoice Card Wrapper (replicates A4 sheet dimensions on screen) */}
      <div
        className="print-card-wrapper"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "var(--white)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
          borderRadius: 8,
          padding: "50px 60px",
          position: "relative",
          minHeight: 1000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header Block */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid var(--gold)",
              paddingBottom: 24,
              marginBottom: 32,
            }}
          >
            <div>
              <span
                className="oa-mark"
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--gold)",
                  letterSpacing: "0.08em",
                }}
              >
                ODYSSÉE ADVISORY
              </span>
              <p
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  letterSpacing: "0.05em",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                Legal Services & Business Consulting
              </p>
            </div>

            <div style={{ textAlign: "right", fontSize: 12, color: "var(--ink-2)", lineHeight: "1.6" }}>
              <p style={{ fontWeight: 700, color: "var(--ink)" }}>Odyssée Advisory LLC</p>
              <p>The Opus by Omniyat, Office 1203</p>
              <p>Business Bay, Dubai, UAE</p>
              <p>contact@odyssee-advisory.com</p>
              <p>+971 4 123 4567</p>
            </div>
          </div>

          {/* Invoice Meta and Client Information */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: 40,
              marginBottom: 40,
            }}
          >
            {/* Left side: Bill To */}
            <div>
              <h4
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Facturé à :
              </h4>
              <div style={{ fontSize: 14, lineHeight: "1.6" }}>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{clientName}</p>
                {facture.dossier && (
                  <p style={{ color: "var(--ink-2)", fontSize: 13, marginBottom: 4 }}>
                    Dossier : {facture.dossier.titre}
                  </p>
                )}
                <p style={{ color: "var(--ink-2)" }}>Email : {clientEmail}</p>
                <p style={{ color: "var(--ink-2)" }}>Tél : {clientPhone}</p>
              </div>
            </div>

            {/* Right side: Invoice Details */}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 16,
                  background: isPaid ? "rgba(45, 122, 79, 0.1)" : "rgba(200, 134, 10, 0.1)",
                  color: isPaid ? "var(--success)" : "var(--warning)",
                  border: `1px solid ${isPaid ? "rgba(45, 122, 79, 0.2)" : "rgba(200, 134, 10, 0.2)"}`,
                }}
              >
                {isPaid ? "Facture Réglée" : "En attente de paiement"}
              </div>

              <div style={{ fontSize: 13, lineHeight: "1.7" }}>
                <p>
                  <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>N° Facture : </span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14 }}>
                    {refDisplay}
                  </span>
                </p>
                <p>
                  <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>Date d&apos;émission : </span>
                  <strong>{emissionDate}</strong>
                </p>
                <p>
                  <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>Date d&apos;échéance : </span>
                  <strong>{echeanceDate}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Table Items */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 40,
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid var(--ink)" }}>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>
                  Description de la prestation
                </th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", width: 80 }}>
                  Qté
                </th>
                <th style={{ textAlign: "right", padding: "12px 8px", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", width: 140 }}>
                  Prix Unitaire HT
                </th>
                <th style={{ textAlign: "right", padding: "12px 8px", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", width: 100 }}>
                  TVA
                </th>
                <th style={{ textAlign: "right", padding: "12px 8px", color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em", width: 140 }}>
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "16px 8px", verticalAlign: "top" }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
                    {facture.libelle || "Prestation de conseil juridique"}
                  </p>
                  {facture.dossier && (
                    <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      Assistance et accompagnement dans le cadre du dossier : {facture.dossier.titre}
                    </p>
                  )}
                </td>
                <td style={{ padding: "16px 8px", textAlign: "center", verticalAlign: "top" }}>
                  1
                </td>
                <td style={{ padding: "16px 8px", textAlign: "right", verticalAlign: "top", fontVariantNumeric: "tabular-nums" }}>
                  {montantHT.toLocaleString("fr-FR")} €
                </td>
                <td style={{ padding: "16px 8px", textAlign: "right", verticalAlign: "top", color: "var(--ink-3)" }}>
                  0% *
                </td>
                <td style={{ padding: "16px 8px", textAlign: "right", verticalAlign: "top", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {montantHT.toLocaleString("fr-FR")} €
                </td>
              </tr>
            </tbody>
          </table>

          {/* Subtotal and Total block */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 60,
            }}
          >
            <div style={{ width: 280 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--ink-3)" }}>Sous-total HT :</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {montantHT.toLocaleString("fr-FR")} €
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--ink-3)" }}>TVA (0%) :</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>0,00 €</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0 8px",
                  borderTop: "1px solid var(--border)",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                <span>Total TTC :</span>
                <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                  {montantTTC.toLocaleString("fr-FR")} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer block (Payment info and legal notes) */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 24,
            fontSize: 11,
            color: "var(--ink-3)",
            lineHeight: "1.6",
          }}
          className="print-avoid-break"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 30,
              marginBottom: 20,
            }}
          >
            <div>
              <h5 style={{ fontSize: 11, color: "var(--ink)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Coordonnées Bancaires
              </h5>
              <p>Banque : Emirates NBD Dubai</p>
              <p>Titulaire : Odyssée Advisory LLC</p>
              <p style={{ fontFamily: "var(--mono)" }}>IBAN : AE76 0230 0000 1234 5678 901</p>
              <p style={{ fontFamily: "var(--mono)" }}>BIC / SWIFT : EBILAEADXXX</p>
            </div>
            <div>
              <h5 style={{ fontSize: 11, color: "var(--ink)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Notes légales / Conditions
              </h5>
              <p>* Prestation de services de conseil fournie hors Union Européenne.</p>
              <p>TVA non applicable conformément aux règles internationales sur l&apos;autoliquidation.</p>
              <p>Paiement exigible sous 14 jours à compter de la date d&apos;émission.</p>
            </div>
          </div>

          <p style={{ textAlign: "center", borderTop: "1px solid var(--border-soft)", paddingTop: 14, color: "var(--ink-3)", fontSize: 10 }}>
            Odyssée Advisory LLC — Registre du commerce n° 1029384 — Licence Juridique N° 987654.
          </p>
        </div>
      </div>
    </div>
  );
};
