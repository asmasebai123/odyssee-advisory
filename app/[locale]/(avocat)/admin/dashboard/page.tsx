"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { KPICard } from "@/components/shared/KPICard";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

interface ClientRow {
  name: string;
  dossier: string;
  dossierId: string;
  stage: string;
  value: string;
  status: StatusKey;
  urgent: boolean;
  avatar: string;
}

interface Demande {
  id: string;
  who: string;
  topic: string;
  time: string;
  urgent: boolean;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  montant: number;
  type_service: string;
}

interface DashboardStats {
  kpis: {
    dossiersActifs: number;
    volumeConseilleYTD: string;
    honorairesFactures: string;
    honorairesPayes: string;
    pipeline: string;
    delaiMoyen: string;
  };
  revenueSeries: number[];
  monthsLabels: string[];
  demandes: Demande[];
  recentClients: ClientRow[];
}

export default function LawyerDashboardPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state for the client table
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "actif" | "review" | "nouveau">("all");
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  // Modal State
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
  const [formPrenom, setFormPrenom] = useState("");
  const [formNom, setFormNom] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelephone, setFormTelephone] = useState("");
  const [formTitre, setFormTitre] = useState("");
  const [formService, setFormService] = useState("");
  const [formMontant, setFormMontant] = useState("");
  const [formStatut, setFormStatut] = useState("demande");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard-stats");
      if (!res.ok) {
        throw new Error(`Erreur lors du chargement des statistiques: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setStats(data);
      } else {
        throw new Error(data.error || "Une erreur inconnue est survenue.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Pre-fill form when a lead is selected
  useEffect(() => {
    if (selectedDemande) {
      setFormPrenom(selectedDemande.prenom || "");
      setFormNom(selectedDemande.nom || "");
      setFormEmail(selectedDemande.email || "");
      setFormTelephone(selectedDemande.telephone || "");
      setFormTitre(selectedDemande.topic || "");
      setFormService(selectedDemande.type_service || "Acquisition Immobilière - Dubaï");
      setFormMontant(selectedDemande.montant ? selectedDemande.montant.toString() : "");
      setFormStatut("demande");
      setSubmitError(null);
    }
  }, [selectedDemande]);

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande) return;

    if (!formPrenom || !formNom || !formEmail || !formTitre) {
      setSubmitError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: formPrenom,
          nom: formNom,
          email: formEmail,
          telephone: formTelephone,
          titre: formTitre,
          type_service: formService,
          montant: formMontant ? parseFloat(formMontant) : null,
          statut: formStatut,
          demandeId: selectedDemande.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccess(true);
        // Laisse l'animation de succès s'afficher pendant 2 secondes
        setTimeout(() => {
          setSelectedDemande(null);
          setShowSuccess(false);
          setIsLoading(true);
          fetchStats(); // Recharger les statistiques du dashboard
        }, 2200);
      } else {
        throw new Error(data.error || "Une erreur est survenue lors de la conversion.");
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Une erreur réseau est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & search client rows
  const filteredClients = stats?.recentClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dossier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.stage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading && !stats) {
    return (
      <>
        <Navbar
          title="Vue d'ensemble"
          breadcrumb="Cabinet · Direction"
          switchRoleHref="/dashboard"
          switchRoleLabel="Vue client"
          initials="PD"
        />
        <div className="page-pad page-fade" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Skeleton welcome banner */}
          <div className="hero-card" style={{ padding: "28px 36px", height: 160, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ width: 150, height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
            <div style={{ width: 220, height: 28, background: "rgba(255,255,255,0.2)", borderRadius: 4 }} />
            <div style={{ width: "60%", height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
          </div>

          {/* Skeleton KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card" style={{ padding: 24, height: 120, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ width: "50%", height: 12, background: "rgba(0,0,0,0.06)", borderRadius: 4 }} />
                <div style={{ width: "70%", height: 28, background: "rgba(184,150,90,0.15)", borderRadius: 4 }} />
                <div style={{ width: "40%", height: 10, background: "rgba(0,0,0,0.04)", borderRadius: 4 }} />
              </div>
            ))}
          </div>

          {/* Skeleton Main Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            <div className="card" style={{ padding: 28, height: 380, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "30%", height: 20, background: "rgba(0,0,0,0.06)", borderRadius: 4 }} />
                <div style={{ width: "20%", height: 20, background: "rgba(0,0,0,0.06)", borderRadius: 4 }} />
              </div>
              <div style={{ flex: 1, background: "rgba(0,0,0,0.02)", borderRadius: 8, position: "relative", overflow: "hidden" }}>
                {/* Simulated chart shimmer */}
                <div style={{ position: "absolute", bottom: 40, left: "10%", right: "10%", height: "60%", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  {Array(12).fill(0).map((_, idx) => (
                    <div key={idx} style={{ width: "6%", height: `${20 + idx * 6}%`, background: "rgba(184,150,90,0.15)", borderRadius: "2px 2px 0 0" }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 28, height: 380, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ width: "40%", height: 22, background: "rgba(0,0,0,0.06)", borderRadius: 4 }} />
              {Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ padding: 14, background: "rgba(0,0,0,0.02)", borderRadius: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ width: "60%", height: 12, background: "rgba(0,0,0,0.05)", borderRadius: 4 }} />
                  <div style={{ width: "90%", height: 10, background: "rgba(0,0,0,0.03)", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <Navbar
          title="Vue d'ensemble"
          breadcrumb="Cabinet · Direction"
          switchRoleHref="/dashboard"
          switchRoleLabel="Vue client"
          initials="PD"
        />
        <div className="page-pad page-fade" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
          <div className="avatar avatar-lg" style={{ background: "rgba(192, 57, 43, 0.1)", color: "var(--error)", border: "1px solid var(--error)" }}>
            <Icon name="alert" size={28} />
          </div>
          <h2 style={{ color: "var(--ink)" }}>Une erreur est survenue</h2>
          <p style={{ color: "var(--ink-3)", maxWidth: 460, textAlign: "center" }}>{error || "Impossible de charger les données du dashboard."}</p>
          <button className="btn btn-primary" onClick={() => { setIsLoading(true); fetchStats(); }}>
            Réessayer
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        title="Vue d'ensemble"
        breadcrumb="Cabinet · Direction"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad">
        {/* Welcome banner */}
        <div
          className="hero-card"
          style={{
            padding: "28px 36px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 260,
              height: 260,
              borderRadius: "50%",
              border: "1px solid rgba(184,150,90,0.14)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1px solid rgba(184,150,90,0.10)",
            }}
          />
          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Cabinet · Lundi 18 mai 2026
            </div>
            <h1
              style={{
                fontSize: 28,
                color: "#FFFFFF",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Bonjour <span style={{ fontStyle: "italic", color: "var(--gold-soft)" }}>Pierre</span>
            </h1>
            <p
              style={{
                color: "rgba(255,245,220,0.78)",
                fontSize: 14,
                marginTop: 8,
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              Vous avez {stats.kpis.dossiersActifs} dossiers actifs et {stats.demandes.length} nouvelles demandes en attente de traitement dans votre boîte d&apos;entrée.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
            <Link href={`/${locale}/admin`} className="btn btn-ghost-gold">
              <Icon name="folder" size={14} /> Voir les dossiers
            </Link>
          </div>
        </div>

        {/* Dynamic KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 24,
          }}
        >
          <KPICard
            label="Dossiers actifs"
            value={stats.kpis.dossiersActifs.toString()}
            icon="folder"
            delta={{ value: "+1", label: "ce mois-ci" }}
          />
          <KPICard
            label="Volume conseillé (YTD)"
            value={stats.kpis.volumeConseilleYTD}
            icon="trending-up"
            delta={{ value: "Réel", label: "Volume transactions" }}
          />
          <KPICard
            label="Honoraires facturés"
            value={stats.kpis.honorairesFactures}
            icon="invoice"
            delta={{ value: stats.kpis.honorairesPayes + " encaissé", label: "Payé vs Facturé" }}
          />
          <KPICard
            label="Délai moyen / dossier"
            value={stats.kpis.delaiMoyen}
            icon="clock"
            delta={{ value: "Automatique", label: "Calculé sur dossiers clos" }}
          />
        </div>

        {/* Revenue + Inbox */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 20,
            marginTop: 24,
          }}
        >
          {/* Revenue Evolution Chart */}
          <div className="card" style={{ padding: 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18,
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
                  Honoraires
                </div>
                <h2 style={{ fontSize: 22 }}>Évolution sur 12 mois</h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["12M"].map((p, i) => (
                  <button
                    key={p}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ink)",
                      background: "var(--gold)",
                      border: "none",
                      borderRadius: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 28,
                alignItems: "baseline",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 38,
                    color: "var(--ink)",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stats.kpis.honorairesPayes}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-3)",
                    marginTop: 6,
                  }}
                >
                  Total des honoraires réglés encaissés
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 28 }}>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                    }}
                  >
                    Pipeline (Impayé)
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 20,
                      color: "var(--ink)",
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    {stats.kpis.pipeline}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                    }}
                  >
                    Total Facturé
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 20,
                      color: "var(--ink)",
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    {stats.kpis.honorairesFactures}
                  </div>
                </div>
              </div>
            </div>
            <RevenueChart data={stats.revenueSeries} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10.5,
                color: "var(--ink-3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                paddingTop: 12,
                fontWeight: 600,
              }}
            >
              {stats.monthsLabels.map((m, idx) => (
                <span key={idx}>{m}</span>
              ))}
            </div>
          </div>

          {/* Inbox for leads (demandes) */}
          <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 18,
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
                  Boîte d&apos;entrée
                </div>
                <h2 style={{ fontSize: 22 }}>Nouvelles demandes</h2>
              </div>
              <span className="badge badge-gold-solid">
                {stats.demandes.length} {stats.demandes.length > 1 ? "demandes" : "demande"}
              </span>
            </div>

            {stats.demandes.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "40px 20px",
                  background: "var(--bg-light)",
                  borderRadius: "var(--radius)",
                  border: "1px dashed var(--border)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(184, 150, 90, 0.1)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="check" size={24} />
                </div>
                <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>
                  Toutes les demandes sont traitées
                </div>
                <p style={{ color: "var(--ink-3)", fontSize: 12, textAlign: "center", margin: 0 }}>
                  Les prospects convertis apparaissent maintenant dans votre liste de clients actifs.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "360px", paddingRight: 4 }}>
                {stats.demandes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedDemande(r)}
                    style={{
                      padding: 14,
                      background: "var(--bg-light)",
                      borderLeft: r.urgent ? "3px solid var(--error)" : "3px solid var(--gold)",
                      borderRadius: "0 6px 6px 0",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderTop: "1px solid var(--border-soft)",
                      borderRight: "1px solid var(--border-soft)",
                      borderBottom: "1px solid var(--border-soft)",
                    }}
                    className="card-hover"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
                        {r.who}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {r.urgent && (
                          <span className="badge badge-error" style={{ fontSize: 8, padding: "2px 6px" }}>
                            Urgent
                          </span>
                        )}
                        <span className="badge badge-gold" style={{ fontSize: 8, padding: "2px 6px" }}>
                          {r.montant ? `${(r.montant / 1000000).toFixed(1)}M €` : "Lead"}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--ink-2)",
                        marginBottom: 6,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {r.topic}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 500 }}>{r.time}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDemande(r);
                        }}
                        className="btn btn-ghost-gold btn-sm"
                        style={{ padding: "4px 8px", fontSize: 10.5, gap: 4 }}
                      >
                        Transformer <Icon name="plus" size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clients table */}
        <div
          className="card"
          style={{ padding: 0, overflow: "hidden", marginTop: 24 }}
        >
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
                Dossiers actifs
              </div>
              <h2 style={{ fontSize: 22 }}>Vos clients</h2>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
              {/* Search input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--bg-light)",
                  borderRadius: 6,
                  width: 240,
                  border: "1px solid var(--border-soft)",
                }}
              >
                <Icon name="search" size={14} style={{ color: "var(--ink-3)" }} />
                <input
                  placeholder="Rechercher un client ou dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 12.5,
                    flex: 1,
                    color: "var(--ink)"
                  }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} style={{ color: "var(--ink-3)" }}>
                    <Icon name="x" size={12} />
                  </button>
                )}
              </div>

              {/* Status Filter Trigger */}
              <button
                className={`btn btn-sm ${statusFilter !== "all" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setShowFiltersMenu(!showFiltersMenu)}
              >
                <Icon name="filter" size={12} />
                <span>Statut : {statusFilter === "all" ? "Tous" : statusFilter.toUpperCase()}</span>
              </button>

              {/* Floating Filter Menu */}
              {showFiltersMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: 40,
                    right: 0,
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    boxShadow: "var(--shadow-lift)",
                    zIndex: 100,
                    width: 160,
                    overflow: "hidden"
                  }}
                >
                  {(["all", "actif", "review", "nouveau"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatusFilter(opt);
                        setShowFiltersMenu(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: 12.5,
                        color: statusFilter === opt ? "var(--gold)" : "var(--ink)",
                        fontWeight: statusFilter === opt ? 700 : 500,
                        background: statusFilter === opt ? "var(--bg-light)" : "transparent",
                        borderBottom: "1px solid var(--border-soft)",
                      }}
                    >
                      {opt === "all" ? "Tous" : opt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-3)" }}>
              <Icon name="info" size={24} style={{ marginBottom: 8, color: "var(--gold)" }} />
              <div>Aucun client ne correspond aux critères de recherche.</div>
            </div>
          ) : (
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Dossier</th>
                  <th>Étape / Service</th>
                  <th style={{ textAlign: "right" }}>Valeur</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c, i) => (
                  <tr key={i} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar">{c.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                            {c.name}
                            {c.urgent && (
                              <span
                                className="badge badge-error"
                                style={{ marginLeft: 8, fontSize: 9, padding: "2px 6px" }}
                              >
                                Urgent
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                            Client privé
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                        color: "var(--gold)",
                        fontWeight: 600,
                      }}
                    >
                      <Link href={`/${locale}/dossiers/${c.dossierId}`}>#{c.dossier}</Link>
                    </td>
                    <td>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--gold)",
                          }}
                        />
                        <span>{c.stage}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "var(--display)",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--ink)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {c.value}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/${locale}/dossiers/${c.dossierId}`}>
                        <Icon
                          name="chevron-right"
                          size={14}
                          style={{ color: "var(--gold)" }}
                        />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Premium Lead Conversion Overlay Modal */}
      {selectedDemande && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(35, 49, 73, 0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--bg-dark)",
              border: "1px solid var(--gold)",
              borderRadius: "16px",
              width: "650px",
              maxWidth: "100%",
              boxShadow: "0 24px 64px rgba(184, 150, 90, 0.25)",
              overflow: "hidden",
              position: "relative",
              color: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Success Overlay Animation */}
            {showSuccess && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--bg-dark-deep)",
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  color: "white",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(184, 150, 90, 0.15)",
                    border: "2px solid var(--gold)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="check" size={36} stroke={2.5} />
                </div>
                <h3 style={{ color: "white", fontSize: 24, margin: 0 }}>Client Converti !</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", maxWidth: "340px", fontSize: 13.5, margin: 0 }}>
                  Le compte client a été créé avec succès, le dossier est initialisé et un email de bienvenue contenant son mot de passe temporaire a été expédié.
                </p>
              </div>
            )}

            {/* Modal Header */}
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-dark-deep)"
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    fontWeight: 700,
                  }}
                >
                  Intégration Prospect · Premium
                </span>
                <h3 style={{ fontSize: 20, color: "white", marginTop: 4 }}>Transformer en Client</h3>
              </div>
              <button
                onClick={() => setSelectedDemande(null)}
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: 8,
                  borderRadius: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConvertLead} style={{ padding: "28px", overflowY: "auto", maxHeight: "80vh" }}>
              {submitError && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(192, 57, 43, 0.15)",
                    borderLeft: "3px solid var(--error)",
                    color: "#E74C3C",
                    borderRadius: 4,
                    marginBottom: 20,
                    fontSize: 13,
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Informative banner about lead */}
              <div
                style={{
                  background: "rgba(184, 150, 90, 0.08)",
                  border: "1px solid rgba(184, 150, 90, 0.2)",
                  padding: "14px 18px",
                  borderRadius: 8,
                  marginBottom: 24,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)"
                }}
              >
                <strong>Demande initiale :</strong> {selectedDemande.topic} <br />
                <span style={{ fontSize: 11, color: "var(--gold)" }}>
                  Reçu par le site vitrine. Email : {selectedDemande.email}
                </span>
              </div>

              {/* Personal Information Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formPrenom}
                    onChange={(e) => setFormPrenom(e.target.value)}
                    placeholder="ex: Jean"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none"
                    }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formNom}
                    onChange={(e) => setFormNom(e.target.value)}
                    placeholder="ex: Dupont"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none"
                    }}
                    required
                  />
                </div>
              </div>

              {/* Contact Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ex: client@email.com"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none"
                    }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formTelephone}
                    onChange={(e) => setFormTelephone(e.target.value)}
                    placeholder="ex: +33 6 12 34 56 78"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Dossier Titre Row */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                  Titre du Projet / Dossier *
                </label>
                <input
                  type="text"
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="ex: Emaar Beachfront Palace - T3"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    padding: "10px 14px",
                    color: "white",
                    outline: "none"
                  }}
                  required
                />
              </div>

              {/* Service & Montant Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Type de Service
                  </label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    style={{
                      background: "var(--bg-dark-deep)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="Acquisition Immobilière - Dubaï">Acquisition Immobilière - Dubaï</option>
                    <option value="Structuration Corporate & ADGC">Structuration Corporate & ADGC</option>
                    <option value="Succession & Planification Patrimoniale">Succession & Planification Patrimoniale</option>
                    <option value="Audit & Due Diligence Juridique">Audit & Due Diligence Juridique</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Montant de Transaction (€)
                  </label>
                  <input
                    type="number"
                    value={formMontant}
                    onChange={(e) => setFormMontant(e.target.value)}
                    placeholder="ex: 3420000"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Statut initial & Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, marginBottom: 28, alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold)", fontWeight: 600 }}>
                    Statut Initial Dossier
                  </label>
                  <select
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value)}
                    style={{
                      background: "var(--bg-dark-deep)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "white",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="demande">Demande (Nouveau)</option>
                    <option value="en_cours">En Cours (Actif)</option>
                    <option value="pieces_manquantes">Pièces Manquantes (Revue)</option>
                  </select>
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  Un compte sera créé. Le mot de passe temporaire <span style={{ color: "var(--gold)", fontWeight: 700 }}>password123</span> lui sera assigné et expédié dans le mail de bienvenue.
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: 24,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDemande(null)}
                  className="btn btn-secondary"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "white"
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: 160, justifyContent: "center" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="spinner-mini" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <span>Traitement...</span>
                    </div>
                  ) : (
                    <>
                      <span>Confirmer la conversion</span>
                      <Icon name="check" size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded CSS for animations & spinners */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
