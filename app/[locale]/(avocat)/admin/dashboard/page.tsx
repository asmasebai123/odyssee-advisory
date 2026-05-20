"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { KPICard } from "@/components/shared/KPICard";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

interface ClientRow {
  name: string;
  dossier: string;
  stage: string;
  value: string;
  status: StatusKey;
  urgent: boolean;
  avatar: string;
}

const CLIENTS: ClientRow[] = [
  {
    name: "Pierre Laurent",
    dossier: "DXB-2024-0481",
    stage: "Acquisition",
    value: "AED 13.6M",
    status: "actif",
    urgent: false,
    avatar: "PL",
  },
  {
    name: "Catherine Vauthier",
    dossier: "DXB-2024-0479",
    stage: "Devis",
    value: "AED 8.2M",
    status: "review",
    urgent: true,
    avatar: "CV",
  },
  {
    name: "Olivier Tarrieu",
    dossier: "DXB-2024-0476",
    stage: "Due diligence",
    value: "AED 22.4M",
    status: "actif",
    urgent: false,
    avatar: "OT",
  },
  {
    name: "Famille Benabdallah",
    dossier: "DXB-2024-0473",
    stage: "Signature",
    value: "AED 5.9M",
    status: "actif",
    urgent: true,
    avatar: "FB",
  },
  {
    name: "Henri-Paul Comté",
    dossier: "DXB-2024-0470",
    stage: "Contrat",
    value: "AED 18.0M",
    status: "actif",
    urgent: false,
    avatar: "HC",
  },
  {
    name: "Anaïs Roussel",
    dossier: "DXB-2024-0468",
    stage: "Demande",
    value: "AED 3.1M",
    status: "nouveau",
    urgent: false,
    avatar: "AR",
  },
];

const REQUESTS = [
  {
    who: "Édouard Vasseur",
    topic: "Acquisition résidentielle · Palm Jumeirah",
    time: "Il y a 14 min",
    urgent: true,
  },
  {
    who: "Société Holding Aurore",
    topic: "Structuration ADGC pour 4 lots",
    time: "Il y a 2 h",
  },
  {
    who: "Famille Khoury",
    topic: "Succession bien à Downtown Dubai",
    time: "Hier",
  },
  { who: "Thomas Bénard", topic: "Demande d'audit fiscal · DTC", time: "Hier" },
];

const REVENUE_SERIES = [18, 24, 22, 32, 28, 38, 42, 36, 44, 52, 48, 58];
const MONTHS = ["Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai"];

export default function LawyerDashboardPage(): React.ReactElement {
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
          className="card card-dark"
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
                color: "white",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Bonjour{" "}
              <span style={{ fontStyle: "italic", color: "var(--gold)" }}>Marie</span>
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                marginTop: 8,
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              12 dossiers actifs, 3 demandent votre attention aujourd&apos;hui — dont la
              signature Benabdallah prévue en fin de semaine.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
            <button className="btn btn-ghost-gold">
              <Icon name="plus" size={14} /> Nouveau dossier
            </button>
            <button className="btn btn-primary">
              <Icon name="send" size={14} /> Envoyer un devis
            </button>
          </div>
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
            label="Dossiers actifs"
            value="12"
            icon="folder"
            delta={{ value: "+3", label: "ce mois-ci" }}
          />
          <KPICard
            label="Volume conseillé (YTD)"
            value="186M €"
            icon="trending-up"
            delta={{ value: "+22%", label: "vs 2025" }}
          />
          <KPICard
            label="Honoraires facturés"
            value="412K €"
            icon="invoice"
            delta={{ value: "98 % réglé", label: "à 30 jours" }}
          />
          <KPICard
            label="Délai moyen / dossier"
            value="84j"
            icon="clock"
            delta={{ value: "-12j", label: "vs trimestre" }}
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
                {["12M", "6M", "3M", "1M"].map((p, i) => (
                  <button
                    key={p}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: i === 0 ? "var(--ink)" : "var(--ink-3)",
                      background: i === 0 ? "var(--gold)" : "transparent",
                      border: i === 0 ? "none" : "1px solid var(--border)",
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
                  412 380 €
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-3)",
                    marginTop: 6,
                  }}
                >
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>↑ 22%</span>{" "}
                  vs même période 2025
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
                    Pipeline
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
                    178K €
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
                    Encaissé
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
                    404K €
                  </div>
                </div>
              </div>
            </div>
            <RevenueChart data={REVENUE_SERIES} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10.5,
                color: "var(--ink-3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                paddingTop: 6,
                fontWeight: 600,
              }}
            >
              {MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Inbox */}
          <div className="card" style={{ padding: 28 }}>
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
              <span className="badge badge-gold-solid">5 nouvelles</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {REQUESTS.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    background: "var(--bg-light)",
                    borderLeft: "2px solid var(--gold)",
                    borderRadius: "0 2px 2px 0",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      {r.who}
                    </div>
                    {r.urgent && (
                      <span className="badge badge-error" style={{ fontSize: 9 }}>
                        Urgent
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--ink-2)",
                      marginBottom: 4,
                    }}
                  >
                    {r.topic}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.time}</div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
            >
              Voir toutes les demandes (12)
              <Icon name="arrow-right" size={14} />
            </button>
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
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--bg-light)",
                  borderRadius: 2,
                  width: 240,
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
              <button className="btn btn-sm btn-secondary">
                <Icon name="filter" size={12} /> Filtres
              </button>
            </div>
          </div>
          <table className="table-clean">
            <thead>
              <tr>
                <th>Client</th>
                <th>Dossier</th>
                <th>Étape</th>
                <th style={{ textAlign: "right" }}>Valeur</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((c, i) => (
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
                              style={{ marginLeft: 8, fontSize: 9 }}
                            >
                              !
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                          Client privé · France
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
                    <Link href="/dossiers">#{c.dossier}</Link>
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
                      {c.stage}
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
                    <Icon
                      name="chevron-right"
                      size={14}
                      style={{ color: "var(--gold)" }}
                    />
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
