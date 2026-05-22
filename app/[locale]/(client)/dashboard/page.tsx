"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { Stepper } from "@/components/shared/Stepper";
import { KPICard } from "@/components/shared/KPICard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { createBrowserClient } from "@supabase/ssr";

import { DOSSIER_STATUT_ORDER, DOSSIER_STATUT_LABEL } from "@/types/dossier";

// Stepper aligné sur les statuts du cahier des charges §6.2.1
const STEPS = DOSSIER_STATUT_ORDER;
const LABELS = STEPS.map((s) => DOSSIER_STATUT_LABEL[s]);

export default function ClientDashboardPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [user, setUser] = React.useState<any>(null);
  const [dossier, setDossier] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [docStats, setDocStats] = React.useState({ signed: 0, total: 0 });
  const [invoiceStats, setInvoiceStats] = React.useState({ paid: 0, total: 0, unpaidAmount: 0 });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/client/dossier?t=" + Date.now(), { cache: "no-store" });
        const resData = await res.json();
        if (resData.success && resData.dossier) {
          setUser(resData.profile);
          setDossier(resData.dossier);
          
          const docs = resData.documents || [];
          const signed = docs.filter((d: any) => d.signe).length;
          setDocStats({ signed, total: docs.length });

          const factures = resData.factures || [];
          const paid = factures.filter((f: any) => f.statut === 'payee').length;
          const unpaidAmount = factures
            .filter((f: any) => f.statut !== 'payee')
            .reduce((acc: number, cur: any) => acc + (cur.montant || 0), 0);
          setInvoiceStats({ paid, total: factures.length, unpaidAmount });
          
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to load client dossier from API:", err);
      }

      // Fallback
      setUser({
        id: "mock-client-id",
        email: "client@test.com",
        nom: "Dupont",
        prenom: "Pierre",
        role: "client",
        telephone: "+33 6 12 34 56 78",
        langue: "fr"
      });
      setDossier({
        id: "mock-dossier-id",
        client_id: "mock-client-id",
        titre: "Marina Gate Tower 2, Dubai Marina",
        type_service: "Acquisition Immobilière - Dubaï",
        montant: 3420000,
        statut: "en_cours",
      });
      setDocStats({ signed: 2, total: 3 });
      setInvoiceStats({ paid: 2, total: 3, unpaidAmount: 2800 });
      setIsLoading(false);
    }
    loadData();
  }, [supabase]);

  const current = dossier ? Math.max(0, STEPS.indexOf(dossier.statut)) : 0;

  const getAcquisitionValue = () => {
    if (!dossier || !dossier.montant) return "-- €";
    if (dossier.montant >= 1000000) {
      return `${(dossier.montant / 1000000).toFixed(2)}M €`;
    }
    return `${dossier.montant.toLocaleString('fr-FR')} €`;
  };

  const getAcquisitionDelta = () => {
    if (!dossier || !dossier.montant) return { value: "-- AED", label: "à la signature" };
    const aedValue = dossier.montant * 4.02; // Taux EUR/AED moyen
    return {
      value: `AED ${(aedValue / 1000000).toFixed(1)}M`,
      label: "à la signature"
    };
  };

  const getNextStepInfo = () => {
    if (!dossier) return { value: "--", delta: { value: "Aucun dossier", label: "" } };
    switch (dossier.statut) {
      case "demande":
        return { value: "Analyse", delta: { value: "Attente cabinet", label: "Vérification initiale" } };
      case "en_analyse":
        return { value: "Devis", delta: { value: "Émission devis", label: "Frais & propositions d'honoraires" } };
      case "pieces_manquantes":
        return { value: "Pièces", delta: { value: "Action requise", label: "Téléverser les justificatifs" } };
      case "devis":
        return { value: "Acceptation", delta: { value: "Mandat de conseil", label: "Validation des conditions" } };
      case "en_cours":
        return { value: "Notaire", delta: { value: "Signature finale", label: "Land Department" } };
      case "valide":
        return { value: "Clôture", delta: { value: "Dossier validé", label: "Finalisation administrative" } };
      case "cloture":
        return { value: "Clôturé", delta: { value: "Félicitations", label: "Propriété transférée" } };
      default:
        return { value: "Suivi", delta: { value: "En cours", label: "Odyssée Advisory" } };
    }
  };

  return (
    <>
      <Navbar
        title="Tableau de bord"
        breadcrumb="Espace client"
        switchRoleHref="/admin"
        switchRoleLabel="Vue cabinet"
      />

      <div className="page-fade page-pad">
        {/* Welcome banner */}
        <div
          className="hero-card"
          style={{
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            gap: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 260,
              height: 260,
              borderRadius: "50%",
              border: "1px solid rgba(184,150,90,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 20,
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1px solid rgba(184,150,90,0.12)",
            }}
          />
          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              {dossier ? `Dossier #${dossier.id.split('-')[0].toUpperCase()}` : "Aucun dossier actif"}
            </div>
            <h1 style={{ fontSize: 32, color: "var(--ink)", marginBottom: 8, fontWeight: 500, fontFamily: "var(--serif)", letterSpacing: "-0.02em" }}>
              Bonjour <span className="gold-italic">{user?.prenom || "Client"}</span>,
            </h1>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: 14.5,
                maxWidth: 540,
                lineHeight: 1.7,
              }}
            >
              {dossier ? (
                <>Votre dossier d&apos;acquisition à <strong style={{ color: "var(--ink)", fontWeight: 700 }}>{dossier.titre}</strong> est en cours de finalisation. Le notaire local a validé les pièces cette semaine — signature prévue le 24 mai.</>
              ) : (
                "Vous n'avez pas encore de dossier. Un avocat vous contactera sous peu."
              )}
            </p>
            <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
              <Link href={`/${locale}/dossier`} className="btn btn-primary" style={{ borderRadius: 999, padding: "12px 24px" }}>
                Voir mon dossier
                <Icon name="arrow-right" size={14} />
              </Link>
              <Link href={`/${locale}/messagerie`} className="btn btn-secondary" style={{ borderRadius: 999, padding: "12px 24px", borderColor: "var(--gold-line)" }}>
                <Icon name="message" size={14} style={{ color: "var(--gold)" }} />
                Contacter Maître Debuisson
              </Link>
            </div>
          </div>
          <div
            className="property-card desktop-only"
            style={{ width: 200, height: 220, flexShrink: 0 }}
          >
            <div className="property-sub" style={{ fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {dossier ? dossier.titre : "Odyssée Advisory"}
            </div>
            <div className="property-label">
              <Icon name="pin" size={11} /> {dossier ? dossier.type_service : "Paris - Dubaï"}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="card" style={{ marginTop: 24, padding: "28px 36px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Avancement du dossier
              </div>
              <h3 style={{ fontSize: 18 }}>Étape {current + 1} sur 5 — {LABELS[current] || "Attente"}</h3>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              Dernière mise à jour :{" "}
              <strong style={{ color: "var(--ink)" }}>
                {dossier && dossier.updated_at ? new Date(dossier.updated_at).toLocaleDateString() : "Aujourd'hui"}
              </strong>
            </div>
          </div>
          <Stepper steps={LABELS} current={current} />
        </div>

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 24,
          }}
        >
          <KPICard
            label="Valeur d'acquisition"
            value={getAcquisitionValue()}
            icon="building"
            delta={getAcquisitionDelta()}
          />
          <KPICard
            label="Documents signés"
            value={`${docStats.signed}/${docStats.total}`}
            icon="check-circle"
            delta={{ value: `${docStats.total - docStats.signed} restants`, label: "requis" }}
            accent={docStats.total - docStats.signed > 0 ? "warning" : "success"}
          />
          <KPICard
            label="Factures réglées"
            value={`${invoiceStats.paid}/${invoiceStats.total}`}
            icon="invoice"
            delta={{ value: `${invoiceStats.unpaidAmount.toLocaleString('fr-FR')} €`, label: "en attente" }}
            accent={invoiceStats.unpaidAmount > 0 ? "warning" : "success"}
          />
          <KPICard
            label="Prochaine étape"
            value={getNextStepInfo().value}
            icon="calendar"
            delta={getNextStepInfo().delta}
          />
        </div>

        {/* Two-col: activity + actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
            marginTop: 32,
          }}
        >
          <div className="card" style={{ padding: 28 }}>
            <PageHeader
              eyebrow="Suivi"
              title="Activité récente"
              action={
                <a className="tab-link active" style={{ fontSize: 12 }}>
                  Tout voir
                </a>
              }
            />
            <ActivityFeed />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ marginBottom: 18 }}>
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
                  À faire
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Actions rapides</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href={`/${locale}/documents`}
                  className="btn btn-primary"
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "14px 18px",
                  }}
                >
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Icon name="edit" size={15} /> {docStats.total - docStats.signed > 0 ? `Signer ${docStats.total - docStats.signed} document(s)` : "Signer les documents"}
                  </span>
                  {docStats.total - docStats.signed > 0 && (
                    <span
                      className="badge"
                      style={{
                        background: "rgba(255,255,255,0.22)",
                        color: "var(--white)",
                        fontSize: 10,
                        padding: "3px 8px",
                        border: "none",
                      }}
                    >
                      Urgent
                    </span>
                  )}
                </Link>
                <Link
                  href={`/${locale}/factures`}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "13px 18px",
                  }}
                >
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Icon name="credit-card" size={15} style={{ color: "var(--gold)" }} />{" "}
                    Régler une facture
                  </span>
                  <Icon name="arrow-right" size={14} style={{ color: "var(--ink-3)" }} />
                </Link>
                <Link
                  href={`/${locale}/messagerie?sujet=rendez-vous`}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "13px 18px",
                  }}
                >
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Icon name="calendar" size={15} style={{ color: "var(--gold)" }} />{" "}
                    Réserver un rendez-vous
                  </span>
                  <Icon name="arrow-right" size={14} style={{ color: "var(--ink-3)" }} />
                </Link>
                <Link
                  href={`/${locale}/documents`}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "13px 18px",
                  }}
                >
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Icon name="upload" size={15} style={{ color: "var(--gold)" }} />{" "}
                    Téléverser un justificatif
                  </span>
                  <Icon name="arrow-right" size={14} style={{ color: "var(--ink-3)" }} />
                </Link>
              </div>
            </div>

            <div
              className="card"
              style={{ padding: 22, position: "relative", overflow: "hidden" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 4,
                  background: "var(--gold)",
                }}
              />
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                Votre conseil
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  className="avatar avatar-lg"
                  style={{ width: 48, height: 48, fontSize: 15 }}
                >
                  MD
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Pierre Debuisson
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--ink-3)",
                      marginTop: 3,
                      fontWeight: 500,
                    }}
                  >
                    Associée · Droit immobilier UAE
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-2)",
                  lineHeight: 1.65,
                  marginBottom: 18,
                  borderLeft: "2px solid var(--gold)",
                  paddingLeft: 12,
                  fontStyle: "italic",
                }}
              >
                &quot;Tout est en place pour la signature de vendredi prochain. Je vous
                appellerai jeudi en fin de journée pour le brief final.&quot;
              </p>
              <Link
                href={`/${locale}/messagerie`}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Icon name="message" size={14} /> Envoyer un message
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
