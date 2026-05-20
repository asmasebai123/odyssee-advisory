"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";
import {
  DOSSIER_STATUT_ORDER,
  DOSSIER_STATUT_LABEL,
  type DossierStatut,
} from "@/types/dossier";

const STATUSES: DossierStatut[] = DOSSIER_STATUT_ORDER;

interface SharedDoc {
  name: string;
  who: string;
  date: string;
  status: StatusKey;
}

const SHARED_DOCS: SharedDoc[] = [
  {
    name: "Contrat de vente — final Emaar.pdf",
    who: "Envoyé à Pierre",
    date: "18 mai · 14:32",
    status: "en-attente",
  },
  {
    name: "Rapport DD — DIFC partner.pdf",
    who: "Téléchargé par Pierre",
    date: "12 mai · 16:45",
    status: "telecharge",
  },
  {
    name: "Promesse de vente signée.pdf",
    who: "Signé par les 2 parties",
    date: "02 mai · 11:20",
    status: "signe",
  },
];

const LOG = [
  {
    time: "Aujourd'hui · 14:32",
    who: "Pierre Debuisson",
    what: "a envoyé le contrat de vente final au client",
  },
  {
    time: "Aujourd'hui · 11:08",
    who: "Yassine Ould-Brahim",
    what: "a ajouté une note interne sur la clause syndic",
  },
  {
    time: "Hier · 17:08",
    who: "Système",
    what: "a notifié Pierre Laurent — 3 documents à signer",
  },
  {
    time: "15 mai · 11:24",
    who: "Système",
    what: "a enregistré le virement de l'acompte (342 000 €)",
  },
  {
    time: "12 mai · 09:50",
    who: "Fatima Al-Mazrouei",
    what: "a téléversé le rapport de due diligence",
  },
];

const CLIENT_INFO: ReadonlyArray<readonly [string, string]> = [
  ["Email", "p.laurent@example.com"],
  ["Téléphone", "+33 6 12 34 56 78"],
  ["Né le", "14 juin 1968 (57 ans)"],
  ["Nationalité", "Française"],
  ["Résidence fiscale", "France (75)"],
  ["Patrimoine déclaré", "Confidentiel"],
  ["Source", "Recommandation BNP Wealth"],
];

const FIN: ReadonlyArray<readonly [string, string, boolean?]> = [
  ["Valeur du bien", "AED 13 600 000", false],
  ["Acompte versé", "AED 1 360 000", false],
  ["Honoraires facturés", "9 730 €", false],
  ["Provision en cours", "2 800 €", false],
  ["Reste à régler client", "1 250 €", true],
];

const TAGS = ["Immobilier", "Dubai Marina", "Freehold", "HNW", "France→UAE", "DIFC"];

export default function LawyerDossierPage(): React.ReactElement {
  const [status, setStatus] = React.useState<DossierStatut>("en_cours");
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [note, setNote] = React.useState<string>(
    "Pierre est très réactif sur les retours. RDV téléphonique jeudi 17h pour brief final avant signature notaire. Insister sur la clause 12.3 (syndic) qu'il a déjà soulevée.",
  );

  return (
    <>
      <Navbar
        title="Gestion du dossier"
        breadcrumb="Cabinet · Dossiers"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad">
        {/* Header strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              <span style={{ cursor: "pointer" }}>Dossiers</span>
              <span style={{ margin: "0 8px", color: "var(--gold)" }}>›</span>
              #DXB-2024-0481
            </div>
            <h1 style={{ fontSize: 28 }}>
              Pierre Laurent{" "}
              <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>
                · Marina Gate 4204
              </span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary">
              <Icon name="message" size={14} /> Message au client
            </button>
            <button className="btn btn-primary">
              <Icon name="send" size={14} /> Envoyer un devis
            </button>
            <button className="btn btn-secondary">
              <Icon name="more" size={14} />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 24,
          }}
        >
          {/* MAIN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Status */}
              <div className="card" style={{ padding: 22, position: "relative" }}>
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    color: "var(--gold)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Statut du dossier
                </div>
                <div
                  onClick={() => setStatusOpen(!statusOpen)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    border: "1px solid var(--gold)",
                    borderRadius: 2,
                    cursor: "pointer",
                    background: "rgba(184,150,90,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--gold)",
                      }}
                    />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      {DOSSIER_STATUT_LABEL[status as DossierStatut] ?? status}
                    </span>
                  </div>
                  <Icon
                    name="chevron-down"
                    size={14}
                    style={{ color: "var(--gold)" }}
                  />
                </div>
                {statusOpen && (
                  <div
                    style={{
                      position: "absolute",
                      left: 22,
                      right: 22,
                      top: 96,
                      background: "var(--bg-dark)",
                      border: "1px solid var(--gold-line)",
                      borderRadius: 2,
                      zIndex: 5,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                    }}
                  >
                    {STATUSES.map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setStatus(s);
                          setStatusOpen(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          color:
                            status === s ? "var(--gold)" : "rgba(255,255,255,0.7)",
                          fontSize: 13,
                          cursor: "pointer",
                          borderBottom: "1px solid var(--border-dark)",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: status === s ? 600 : 400,
                        }}
                      >
                        {status === s && (
                          <Icon name="check" size={13} stroke={3} />
                        )}
                        <span style={{ marginLeft: status === s ? 0 : 22 }}>
                          {DOSSIER_STATUT_LABEL[s]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Honoraires */}
              <div className="card" style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    color: "var(--gold)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Honoraires
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <Icon name="invoice" size={14} /> Envoyer facture
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <Icon name="doc" size={14} /> Nouveau devis
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    color: "var(--ink-3)",
                    paddingTop: 14,
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Provision restante</span>
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>
                    2 800 € HT
                  </span>
                </div>
              </div>
            </div>

            {/* Internal notes */}
            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10.5,
                      letterSpacing: "0.18em",
                      color: "var(--gold)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Notes internes
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--ink-3)",
                      marginTop: 4,
                    }}
                  >
                    Visibles par le cabinet uniquement
                  </div>
                </div>
                <span
                  className="badge badge-dark"
                  style={{
                    background: "var(--bg-dark)",
                    color: "var(--gold)",
                    border: "none",
                  }}
                >
                  <Icon name="lock" size={11} /> Privé
                </span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 110,
                  background: "var(--bg-light)",
                  color: "var(--ink)",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                  padding: 14,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  outline: "none",
                  resize: "vertical",
                  transition: "border-color .15s ease",
                  fontFamily: "var(--sans)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Dernière modification · il y a 2 h par Pierre Debuisson
                </div>
                <button className="btn btn-sm btn-primary">Enregistrer</button>
              </div>
            </div>

            {/* Document zone */}
            <div className="card" style={{ padding: 24 }}>
              <PageHeader
                eyebrow="Pièces du dossier"
                title="Documents partagés (14)"
                action={
                  <button className="btn btn-sm btn-secondary">
                    <Icon name="filter" size={12} /> Filtrer
                  </button>
                }
              />
              <div
                style={{
                  border: "1.5px dashed var(--gold)",
                  background: "rgba(184,150,90,0.04)",
                  borderRadius: 2,
                  padding: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    background: "var(--gold-dim)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="upload" size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
                    Glisser-déposer des documents
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                    Les pièces seront partagées automatiquement avec Pierre · PDF /
                    DOCX / IMG · max 25 MB
                  </div>
                </div>
                <button className="btn btn-ghost-gold">Parcourir</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SHARED_DOCS.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: 2,
                      background: "var(--white)",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 40,
                        background: "var(--bg-light)",
                        border: "1px solid var(--border)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--mono)",
                        fontSize: 8,
                        fontWeight: 700,
                        color: "var(--gold)",
                        flexShrink: 0,
                      }}
                    >
                      PDF
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {d.who} · {d.date}
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                    <button style={{ color: "var(--ink-3)" }}>
                      <Icon name="more" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity log */}
            <div className="card" style={{ padding: 28 }}>
              <PageHeader eyebrow="Journal" title="Activité du dossier" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                {LOG.map((it, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 14, position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        paddingTop: 4,
                      }}
                    >
                      <div className="activity-dot" />
                      {i < arr.length - 1 && <div className="activity-line" />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 18 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          letterSpacing: "0.04em",
                          marginBottom: 2,
                        }}
                      >
                        {it.time}
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "var(--ink)",
                          lineHeight: 1.6,
                        }}
                      >
                        <span style={{ color: "var(--ink)", fontWeight: 700 }}>
                          {it.who}
                        </span>
                        <span style={{ color: "var(--ink-2)" }}> {it.what}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — client info / financials / tags */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "sticky",
              top: 24,
              alignSelf: "start",
            }}
          >
            <div className="card card-dark" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div className="avatar avatar-lg">PL</div>
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      color: "white",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Pierre Laurent
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--gold)",
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    CLIENT PRIVÉ · PARIS 16ᵉ
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {CLIENT_INFO.map(([k, v], i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      paddingBottom: 10,
                      borderBottom:
                        i < arr.length - 1 ? "1px solid var(--border-dark)" : "none",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>
                      {k}
                    </span>
                    <span
                      style={{
                        color: "white",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: "1px solid var(--border-dark)",
                }}
              >
                <button
                  className="btn btn-ghost-gold"
                  style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
                >
                  <Icon name="message" size={13} /> Message
                </button>
                <button
                  className="btn btn-ghost-gold"
                  style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
                >
                  <Icon name="calendar" size={13} /> RDV
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 14 }}>
                Récapitulatif financier
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 12.5,
                }}
              >
                {FIN.map(([k, v, hl], i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: 10,
                      borderBottom:
                        i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--ink-3)" }}>{k}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: hl ? "var(--warning)" : "var(--ink)",
                        fontFamily: "var(--display)",
                        fontSize: hl ? 15 : 13,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 14 }}>Tags &amp; catégorie</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TAGS.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      padding: "5px 10px",
                      background: "var(--bg-light)",
                      border: "1px solid var(--border)",
                      borderRadius: 2,
                      color: "var(--ink-2)",
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
