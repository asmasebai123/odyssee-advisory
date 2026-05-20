import * as React from "react";
import { Icon } from "@/components/shared/Icon";

interface ActivityItem {
  time: string;
  title: string;
  who: string;
  tag: string;
  action?: boolean;
}

const DEFAULT_ITEMS: ActivityItem[] = [
  {
    time: "Aujourd'hui · 14:32",
    title: "Le contrat de vente a été signé par le promoteur",
    who: "Emaar Properties",
    tag: "Contrat",
  },
  {
    time: "Hier · 17:08",
    title: "Maître Debuisson vous a envoyé 3 documents à signer",
    who: "Pierre Debuisson",
    tag: "Documents",
    action: true,
  },
  {
    time: "15 mai · 11:24",
    title: "Virement de l'acompte confirmé — 342 000 €",
    who: "BNP Paribas Wealth",
    tag: "Paiement",
  },
  {
    time: "12 mai · 09:50",
    title: "Due diligence complétée — rapport disponible",
    who: "Cabinet partenaire DIFC",
    tag: "Analyse",
  },
  {
    time: "08 mai · 16:00",
    title: "Visite virtuelle de l'appartement confirmée",
    who: "Emaar Properties",
    tag: "Bien",
  },
];

export interface ActivityFeedProps {
  items?: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items = DEFAULT_ITEMS,
}) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {items.map((it, i) => (
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
          {i < items.length - 1 && <div className="activity-line" />}
        </div>
        <div style={{ flex: 1, paddingBottom: 22 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            {it.time} ·{" "}
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>{it.tag}</span>
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--ink)",
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            {it.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{it.who}</div>
          {it.action && (
            <button className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>
              Examiner les documents <Icon name="arrow-right" size={12} />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);
