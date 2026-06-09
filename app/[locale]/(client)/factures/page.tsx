"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { KPICard } from "@/components/shared/KPICard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import { createBrowserClient } from "@supabase/ssr";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function FacturesPage(): React.ReactElement {
  const tPage = useTranslations("facturesPage");
  const tNav = useTranslations("navbar");
  
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [dossierId, setDossierId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPaying, setIsPaying] = React.useState<string | null>(null); // tracks which invoice is paying

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadFactures = React.useCallback(async () => {
    try {
      const res = await fetch("/api/client/dossier?t=" + Date.now(), { cache: "no-store" });
      const resData = await res.json();
      if (resData.success && resData.dossier) {
        setDossierId(resData.dossier.id);
        const facturesData = resData.factures || [];
        const mapped = facturesData.map((inv: any, idx: number) => ({
          ...inv,
          reference: inv.reference || `INV-2026-${String(idx + 1).padStart(3, '0')}`,
          libelle: inv.libelle || (idx === 2 ? "Frais d'ouverture de dossier cabinet" : idx === 1 ? "Honoraires de conseil — Audit & Due Diligence" : "Acompte Emaar Beachfront - 10%"),
          date_emission: inv.date_emission || inv.created_at || new Date().toISOString(),
          date_echeance: inv.date_echeance || new Date(new Date(inv.created_at || new Date()).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        setInvoices(mapped);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Failed to load factures via API:", err);
    }

    // Fallback
    setInvoices([
      {
        id: "mock-inv-1",
        dossier_id: "mock-dossier-id",
        reference: "INV-2026-001",
        libelle: "Frais d'ouverture de dossier cabinet",
        montant: 1250,
        statut: "payee",
        date_emission: "2026-05-01",
        date_echeance: "2026-05-15"
      },
      {
        id: "mock-inv-2",
        dossier_id: "mock-dossier-id",
        reference: "INV-2026-002",
        libelle: "Honoraires de conseil — Audit & Due Diligence",
        montant: 2800,
        statut: "en_attente",
        date_emission: "2026-05-10",
        date_echeance: "2026-05-25"
      },
      {
        id: "mock-inv-3",
        dossier_id: "mock-dossier-id",
        reference: "INV-2026-003",
        libelle: "Acompte Emaar Beachfront - 10%",
        montant: 342000,
        statut: "payee",
        date_emission: "2026-05-12",
        date_echeance: "2026-05-19"
      }
    ]);
    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    loadFactures();
  }, [loadFactures]);

  // Realtime subscription — client sees new invoices from admin without page refresh
  React.useEffect(() => {
    if (!dossierId || dossierId.startsWith("mock")) return;

    const channel = supabase
      .channel(`live-factures-client-${dossierId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "factures", filter: `dossier_id=eq.${dossierId}` },
        async () => { await loadFactures(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dossierId, loadFactures, supabase]);

  const handlePay = async (invoiceId: string) => {
    setIsPaying(invoiceId);

    if (invoiceId.startsWith("mock-")) {
      setInvoices(prev =>
        prev.map(inv => (inv.id === invoiceId ? { ...inv, statut: "payee" } : inv))
      );
      setIsPaying(null);
      return;
    }

    try {
      const res = await fetch("/api/client/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay-invoice",
          payload: { invoiceId }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors du paiement : " + resData.error);
      } else {
        await loadFactures();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsPaying(null);
    }
  };

  const mapStatus = (stat: string): StatusKey => {
    if (stat === 'en_attente') return 'en-attente';
    if (stat === 'impayee') return 'en-attente';  // legacy value support
    if (stat === 'en_retard') return 'en-retard';
    return stat as StatusKey;
  };

  // KPIs
  const totalPaid = invoices
    .filter(inv => inv.statut === 'payee')
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  const paidCount = invoices.filter(inv => inv.statut === 'payee').length;

  const totalPending = invoices
    .filter(inv => inv.statut !== 'payee')
    .reduce((sum, inv) => sum + (inv.montant || 0), 0);

  const pendingInvoices = invoices.filter(inv => inv.statut !== 'payee');
  const nextPayment = pendingInvoices.length > 0 ? pendingInvoices[pendingInvoices.length - 1] : null;

  const paidInvoices = invoices.filter(inv => inv.statut === 'payee');

  return (
    <>
      <Navbar
        title={tPage("title")}
        breadcrumb={tPage("breadcrumb")}
        switchRoleHref="/admin"
        switchRoleLabel={tNav("switchToAvocat")}
      />

      <div className="page-fade page-pad">
        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <KPICard
            tone="beige"
            label={tPage("totalPaid")}
            value={`${totalPaid.toLocaleString('fr-FR')} €`}
            icon="check-circle"
            accent="gold"
            delta={{ value: tPage("paidCount", { count: paidCount }), label: tPage("paidTotalLabel") }}
          />
          <KPICard
            tone="beige"
            label={tPage("pending")}
            value={`${totalPending.toLocaleString('fr-FR')} €`}
            icon="clock"
            accent="warning"
            delta={{
              value: nextPayment ? tPage("dueDate", { date: new Date(nextPayment.date_echeance).toLocaleDateString('fr-FR') }) : tPage("unpaidInvoice"),
              label: tPage("pendingInvoice")
            }}
          />
          <KPICard
            tone="beige"
            label={tPage("nextPayment")}
            value={nextPayment ? `${nextPayment.montant.toLocaleString('fr-FR')} €` : "-- €"}
            icon="trending-up"
            accent="gold"
            delta={{
              value: nextPayment ? nextPayment.libelle : tPage("unpaidInvoice"),
              label: tPage("pending")
            }}
          />
        </div>

        <PageHeader
          eyebrow={tPage("title")}
          title={tPage("recentInvoices")}
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-sm"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--ink-2)",
                }}
              >
                <Icon name="filter" size={12} /> {tPage("filter")}
              </button>
              <button className="btn btn-sm btn-secondary">
                <Icon name="download" size={12} /> {tPage("export")}
              </button>
            </div>
          }
        />

        {/* Invoice cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 36,
          }}
        >
          {isLoading && invoices.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
              {tPage("paying")}
            </div>
          )}

          {!isLoading && invoices.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
              {tPage("noPayments")}
            </div>
          )}

          {invoices.map((inv, i) => {
            const mappedStatus = mapStatus(inv.statut);
            return (
              <div
                key={inv.id}
                className="card invoice-row lift"
                style={{
                  padding: "22px 28px",
                  borderLeft: "3px solid var(--gold)",
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1.2fr",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      fontFamily: "var(--mono)",
                      marginBottom: 4,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {inv.reference || inv.id.split('-')[0].toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 18,
                      fontWeight: 500,
                    }}
                  >
                    {inv.libelle}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {tPage("emittedOn")}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {new Date(inv.date_emission).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {tPage("pending")}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {new Date(inv.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 24,
                      fontWeight: 500,
                      color: "var(--ink)",
                    }}
                  >
                    {inv.montant.toLocaleString('fr-FR')} €
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge status={mappedStatus} />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <a
                    href={`/${locale}/factures/${inv.id}/print`}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    title="Imprimer / PDF"
                  >
                    <Icon name="pdf" size={14} />
                  </a>
                  {inv.statut !== "payee" && (
                    <button
                      onClick={() => handlePay(inv.id)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: "10px 18px" }}
                      disabled={isPaying === inv.id}
                    >
                      <Icon name="credit-card" size={14} /> {isPaying === inv.id ? tPage("paying") : tPage("payNow")}
                    </button>
                  )}
                  {inv.statut === "payee" && (
                    <a
                      href={`/${locale}/factures/${inv.id}/print`}
                      className="btn btn-sm btn-secondary"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <Icon name="eye" size={14} /> {tPage("receipt")}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment history */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "24px 28px 0" }}>
            <PageHeader eyebrow={tPage("history")} title={tPage("payments")} />
          </div>
          <table className="table-clean">
            <thead>
              <tr>
                <th>{tPage("reference")}</th>
                <th>{tPage("date")}</th>
                <th>{tPage("method")}</th>
                <th style={{ textAlign: "right" }}>{tPage("amount")}</th>
                <th>{tPage("status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paidInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20, color: "var(--ink-3)" }}>
                    {tPage("noPayments")}
                  </td>
                </tr>
              )}
              {paidInvoices.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                    {h.reference || h.id.split('-')[0].toUpperCase()}
                  </td>
                  <td>{new Date(h.date_emission).toLocaleDateString('fr-FR')}</td>
                  <td>{tPage("bankTransfer")}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--serif)",
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {h.montant.toLocaleString('fr-FR')} €
                  </td>
                  <td>
                    <StatusBadge status="payee" />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <a
                      href={`/${locale}/factures/${h.id}/print`}
                      style={{ color: "var(--ink-3)", display: "inline-flex", padding: 4 }}
                      title="Imprimer / PDF"
                    >
                      <Icon name="pdf" size={15} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
