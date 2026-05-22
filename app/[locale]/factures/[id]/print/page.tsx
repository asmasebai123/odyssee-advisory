"use client";

import * as React from "react";
import { useParams } from "next/navigation";

interface Facture {
  id: string;
  reference?: string | null;
  libelle?: string | null;
  montant: number;
  statut: string;
  date_emission?: string | null;
  date_echeance?: string | null;
  tva_taux?: number | null;
  created_at: string;
  dossier?: {
    titre?: string;
    type_service?: string;
    client?: {
      prenom?: string;
      nom?: string;
      email?: string;
      telephone?: string;
    } | null;
  } | null;
}

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function FactureImprimerPage(): React.ReactElement {
  const params = useParams();
  const factureId = params.id as string;

  const [facture, setFacture] = React.useState<Facture | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/factures/${factureId}?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success) setFacture(data.facture);
        else setError(data.error || "Facture introuvable.");
      } catch (e) {
        if (!cancelled) setError("Erreur réseau.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [factureId]);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#8C8275" }}>
        Chargement de la facture…
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#C0392B" }}>
        {error || "Facture introuvable."}
      </div>
    );
  }

  const taux = Number(facture.tva_taux ?? 0);
  const total = Number(facture.montant);
  const ht = taux > 0 ? total / (1 + taux / 100) : total;
  const tva = total - ht;
  const client = facture.dossier?.client;

  return (
    <div style={{ background: "#F0EBE0", minHeight: "100vh", padding: "24px 0" }}>
      {/* Barre d'actions (cachée à l'impression) */}
      <div
        className="no-print"
        style={{
          maxWidth: 800,
          margin: "0 auto 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            background: "transparent",
            border: "1px solid #E8E2D8",
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 13,
            color: "#555",
            cursor: "pointer",
          }}
        >
          ← Retour
        </button>
        <button
          onClick={() => window.print()}
          style={{
            background: "#B8965A",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      {/* Feuille A4 */}
      <div
        className="invoice-sheet"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "#fff",
          padding: 48,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          color: "#2C2C2C",
          fontFamily: "var(--font-sans), Inter, sans-serif",
        }}
      >
        {/* En-tête */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "3px solid #B8965A",
            paddingBottom: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#2C3E5C",
              }}
            >
              Odyssée <span style={{ color: "#B8965A" }}>Advisory</span>
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8C8275",
                marginTop: 4,
              }}
            >
              Legal Consulting — UAE
            </div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 12, lineHeight: 1.6 }}>
              Pierre Debuisson — French Lawyer / Legal Consultant
              <br />
              Dubai International Financial Centre (DIFC)
              <br />
              Dubaï, Émirats Arabes Unis
              <br />
              contact@odyssee-advisory.com
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#2C3E5C",
                letterSpacing: "-0.02em",
              }}
            >
              FACTURE
            </div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>
              N° {facture.reference || facture.id.slice(0, 8).toUpperCase()}
            </div>
            <div
              style={{
                marginTop: 10,
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                background: facture.statut === "payee" ? "rgba(45,122,79,0.12)" : "rgba(200,134,10,0.12)",
                color: facture.statut === "payee" ? "#2D7A4F" : "#C8860A",
              }}
            >
              {facture.statut === "payee" ? "Payée" : facture.statut === "en_retard" ? "En retard" : "À régler"}
            </div>
          </div>
        </div>

        {/* Émetteur / Client + dates */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8C8275", fontWeight: 700, marginBottom: 8 }}>
              Facturé à
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {client ? `${client.prenom ?? ""} ${client.nom ?? ""}`.trim() : "Client"}
            </div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.6 }}>
              {client?.email || ""}
              {client?.telephone ? <><br />{client.telephone}</> : null}
            </div>
            {facture.dossier?.titre && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
                <strong>Dossier :</strong> {facture.dossier.titre}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: "#8C8275" }}>Date d&apos;émission : </span>
              <strong>{fmtDate(facture.date_emission || facture.created_at)}</strong>
            </div>
            <div>
              <span style={{ color: "#8C8275" }}>Échéance : </span>
              <strong>{fmtDate(facture.date_echeance)}</strong>
            </div>
          </div>
        </div>

        {/* Tableau lignes */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr style={{ background: "#FBF6EC" }}>
              <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8C8275", borderBottom: "1px solid #E8E2D8" }}>
                Désignation
              </th>
              <th style={{ textAlign: "right", padding: "12px 14px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8C8275", borderBottom: "1px solid #E8E2D8" }}>
                Montant HT
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "16px 14px", fontSize: 14, borderBottom: "1px solid #EFE7D2" }}>
                {facture.libelle || "Honoraires de conseil"}
              </td>
              <td style={{ padding: "16px 14px", fontSize: 14, textAlign: "right", borderBottom: "1px solid #EFE7D2", fontVariantNumeric: "tabular-nums" }}>
                {fmtEUR(ht)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totaux */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
          <div style={{ width: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#555" }}>
              <span>Total HT</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(ht)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#555" }}>
              <span>TVA ({taux}%)</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(tva)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                marginTop: 6,
                borderTop: "2px solid #2C3E5C",
                fontSize: 16,
                fontWeight: 700,
                color: "#2C3E5C",
              }}
            >
              <span>Total TTC</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtEUR(total)}</span>
            </div>
          </div>
        </div>

        {/* Mentions légales */}
        <div style={{ borderTop: "1px solid #E8E2D8", paddingTop: 16, fontSize: 10.5, color: "#8C8275", lineHeight: 1.7 }}>
          {taux === 0 && (
            <p style={{ margin: "0 0 6px" }}>
              TVA non applicable — prestation de conseil juridique transfrontalière (autoliquidation / hors champ).
            </p>
          )}
          <p style={{ margin: "0 0 6px" }}>
            Règlement à réception. En cas de retard de paiement, des pénalités au taux légal en vigueur seront appliquées,
            sans préjudice d&apos;une indemnité forfaitaire pour frais de recouvrement.
          </p>
          <p style={{ margin: 0 }}>
            Odyssée Advisory — Pierre Debuisson, French Lawyer acting as a Legal Consultant in the UAE · DIFC, Dubaï.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          .invoice-sheet {
            box-shadow: none !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
