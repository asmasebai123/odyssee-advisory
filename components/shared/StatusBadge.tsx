import * as React from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "./Icon";

export type StatusKey =
  // Documents
  | "signe"
  | "en-attente"
  | "telecharge"
  // Factures
  | "payee"
  | "impayee"
  | "en-retard"
  // Génériques
  | "actif"
  | "nouveau"
  | "urgent"
  | "draft"
  | "review"
  // Statuts dossier (cahier des charges §6.2.1)
  | "demande"
  | "analyse"
  | "en_analyse"
  | "pieces_manquantes"
  | "devis"
  | "en_cours"
  | "termine"
  | "valide"
  | "cloture";

interface BadgeShape {
  cls: string;
  /** Chemin de traduction (relatif à la racine des messages). */
  tKey: string;
  icon?: IconName;
}

const STATUS_MAP: Record<StatusKey, BadgeShape> = {
  // Documents
  signe: { cls: "badge-gold-solid", tKey: "status.document.signed", icon: "check" },
  "en-attente": { cls: "badge-warn", tKey: "status.document.pending" },
  telecharge: { cls: "badge-gray", tKey: "status.document.uploaded" },
  // Factures
  payee: { cls: "badge-gold-solid", tKey: "status.invoice.paid", icon: "check" },
  impayee: { cls: "badge-warn", tKey: "status.invoice.unpaid" },
  "en-retard": { cls: "badge-error", tKey: "status.invoice.overdue" },
  // Génériques
  actif: { cls: "badge-gold-solid", tKey: "status.generic.active" },
  nouveau: { cls: "badge-success", tKey: "status.generic.new" },
  urgent: { cls: "badge-error", tKey: "status.generic.urgent" },
  draft: { cls: "badge-gray", tKey: "status.generic.draft" },
  review: { cls: "badge-warn", tKey: "status.generic.review" },
  // Statuts dossier (cahier §6.2.1)
  demande: { cls: "badge-gray", tKey: "status.dossier.demande" },
  analyse: { cls: "badge-warn", tKey: "status.dossier.analyse" },
  en_analyse: { cls: "badge-warn", tKey: "status.dossier.en_analyse" },
  pieces_manquantes: { cls: "badge-error", tKey: "status.dossier.pieces_manquantes" },
  devis: { cls: "badge-gold", tKey: "status.dossier.devis" },
  en_cours: { cls: "badge-gold-solid", tKey: "status.dossier.en_cours" },
  termine: { cls: "badge-success", tKey: "status.dossier.termine", icon: "check" },
  valide: { cls: "badge-success", tKey: "status.dossier.valide", icon: "check" },
  cloture: { cls: "badge-gray", tKey: "status.dossier.cloture" },
};

export interface StatusBadgeProps {
  status: StatusKey | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const t = useTranslations();
  const v = STATUS_MAP[status as StatusKey];
  const label = v ? t(v.tKey) : String(status);
  const cls = v?.cls ?? "badge-gray";
  return (
    <span className={"badge " + cls}>
      {v?.icon && <Icon name={v.icon} size={11} stroke={3} />}
      {label}
    </span>
  );
};
