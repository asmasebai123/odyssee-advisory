import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface TimelineStep {
  key: string;
  title: string;
  who: string;
  action?: boolean;
}

/** Étapes réelles d'un dossier d'acquisition immobilière Dubaï */
const STEPS: TimelineStep[] = [
  {
    key: "demande",
    title: "Ouverture du dossier",
    who: "Demande initiale du client · Cabinet Odyssée Advisory",
  },
  {
    key: "en_analyse",
    title: "Analyse de la demande",
    who: "Étude de faisabilité · Pierre Debuisson",
  },
  {
    key: "pieces_manquantes",
    title: "Collecte des pièces justificatives",
    who: "Documents requis par le cabinet",
    action: true,
  },
  {
    key: "devis",
    title: "Devis & convention d'honoraires",
    who: "Proposition tarifaire envoyée au client",
  },
  {
    key: "en_cours",
    title: "Traitement juridique en cours",
    who: "Pierre Debuisson · Cabinet Odyssée Advisory",
  },
  {
    key: "valide",
    title: "Validation finale",
    who: "Acte authentique — Notaire & DLD Dubai",
  },
  {
    key: "cloture",
    title: "Clôture du dossier",
    who: "Remise des clés · Archivage Cabinet",
  },
];

const STATUS_ORDER = [
  "demande",
  "en_analyse",
  "pieces_manquantes",
  "devis",
  "en_cours",
  "valide",
  "cloture",
];

interface Props {
  /** Statut courant du dossier depuis la base de données */
  status?: string;
  /** Date de création du dossier (ISO string) */
  createdAt?: string;
}

export const FullTimeline: React.FC<Props> = ({ status = "demande", createdAt }) => {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Reverse display: most recent on top */}
      {[...STEPS].reverse().map((step, revI) => {
        const stepIdx = STATUS_ORDER.indexOf(step.key);
        const isDone = stepIdx < currentIdx;
        const isCurrent = stepIdx === currentIdx;
        const isUpcoming = stepIdx > currentIdx;

        return (
          <div key={step.key} style={{ display: "flex", gap: 20, position: "relative" }}>
            {/* Date / état colonne gauche */}
            <div
              style={{
                width: 78,
                fontSize: 10.5,
                color: isCurrent
                  ? "var(--gold)"
                  : isDone
                  ? "var(--ink-3)"
                  : "var(--ink-3)",
                paddingTop: 4,
                letterSpacing: "0.04em",
                flexShrink: 0,
                fontWeight: isCurrent ? 700 : isDone ? 500 : 400,
                textTransform: "uppercase",
                opacity: isUpcoming ? 0.5 : 1,
              }}
            >
              {isCurrent ? "En cours" : isDone ? "Réalisé" : "À venir"}
            </div>

            {/* Dot + line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 4,
              }}
            >
              <div
                style={{
                  width: isCurrent ? 14 : 10,
                  height: isCurrent ? 14 : 10,
                  borderRadius: "50%",
                  background: isUpcoming
                    ? "transparent"
                    : isDone
                    ? "var(--gold)"
                    : "var(--gold)",
                  border: isUpcoming
                    ? "1.5px solid rgba(184,150,90,0.35)"
                    : isCurrent
                    ? "none"
                    : "none",
                  boxShadow: isCurrent
                    ? "0 0 0 5px rgba(184,150,90,0.22)"
                    : isDone
                    ? "0 0 0 3px rgba(184,150,90,0.1)"
                    : "none",
                  transition: "all .2s ease",
                }}
              />
              {revI < STEPS.length - 1 && <div className="activity-line" />}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                paddingBottom: 22,
                opacity: isUpcoming ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: isCurrent ? 700 : 500,
                  color: "var(--ink)",
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {step.title}
                {isCurrent && (
                  <span
                    className="badge badge-gold-solid"
                    style={{ fontSize: 9 }}
                  >
                    EN COURS
                  </span>
                )}
                {isDone && (
                  <span style={{ color: "var(--gold)", fontSize: 12 }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {step.who}
              </div>
              {step.action && isCurrent && (
                <Link
                  href="/documents"
                  className="btn btn-sm btn-ghost-gold"
                  style={{ marginTop: 8, display: "inline-flex" }}
                >
                  Déposer les documents{" "}
                  <Icon name="arrow-right" size={12} />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
