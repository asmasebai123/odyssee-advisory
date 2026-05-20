import * as React from "react";
import { Icon } from "@/components/shared/Icon";

interface TimelineItem {
  date: string;
  title: string;
  who: string;
  status?: string;
  upcoming?: boolean;
  current?: boolean;
  action?: boolean;
}

const ITEMS: TimelineItem[] = [
  {
    date: "24 mai",
    title: "Signature de l'acte authentique",
    who: "Notaire Al Tamimi & Co.",
    status: "À venir",
    upcoming: true,
  },
  {
    date: "20 mai",
    title: "Réception des fonds chez le notaire",
    who: "Mashreq Private Banking",
    status: "Planifié",
    upcoming: true,
  },
  {
    date: "18 mai",
    title: "Émission du contrat de vente définitif",
    who: "Emaar Properties",
    current: true,
  },
  {
    date: "17 mai",
    title: "3 documents à signer par le client",
    who: "Cabinet — Pierre Debuisson",
    action: true,
  },
  {
    date: "15 mai",
    title: "Virement de l'acompte confirmé",
    who: "342 000 € · BNP Paribas Wealth",
  },
  {
    date: "12 mai",
    title: "Rapport de due diligence complet",
    who: "Cabinet partenaire DIFC",
  },
  {
    date: "08 mai",
    title: "Visite virtuelle de l'appartement",
    who: "Emaar — service VIP",
  },
  { date: "02 mai", title: "Pré-réservation confirmée", who: "Acompte 10 %" },
  {
    date: "20 avr.",
    title: "Premier rendez-vous conseil",
    who: "Avec Pierre Debuisson — visioconférence",
  },
  {
    date: "12 mars",
    title: "Ouverture du dossier",
    who: "Demande initiale du client",
  },
];

export const FullTimeline: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {ITEMS.map((it, i) => (
      <div key={i} style={{ display: "flex", gap: 20, position: "relative" }}>
        <div
          style={{
            width: 70,
            fontSize: 11,
            color: "var(--ink-3)",
            paddingTop: 4,
            letterSpacing: "0.04em",
            flexShrink: 0,
            fontWeight: it.upcoming ? 600 : 400,
            textTransform: "uppercase",
          }}
        >
          {it.date}
        </div>
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
              width: it.current ? 14 : 10,
              height: it.current ? 14 : 10,
              borderRadius: "50%",
              background: it.upcoming ? "transparent" : "var(--gold)",
              border: it.upcoming ? "1.5px solid var(--gold)" : "none",
              boxShadow: it.current
                ? "0 0 0 5px rgba(184,150,90,0.22)"
                : "0 0 0 4px rgba(184,150,90,0.12)",
            }}
          />
          {i < ITEMS.length - 1 && <div className="activity-line" />}
        </div>
        <div style={{ flex: 1, paddingBottom: 22 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: it.current ? 700 : 500,
              color: "var(--ink)",
              marginBottom: 2,
            }}
          >
            {it.title}
            {it.current && (
              <span
                className="badge badge-gold-solid"
                style={{ marginLeft: 10, fontSize: 9 }}
              >
                EN COURS
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{it.who}</div>
          {it.action && (
            <button className="btn btn-sm btn-ghost-gold" style={{ marginTop: 8 }}>
              Voir les documents <Icon name="arrow-right" size={12} />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);
