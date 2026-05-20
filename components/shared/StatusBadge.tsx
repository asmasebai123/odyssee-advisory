import * as React from "react";
import { Icon, type IconName } from "./Icon";

export type StatusKey =
  // Documents
  | "signe"
  | "en-attente"
  | "telecharge"
  // Factures
  | "payee"
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
  label: string;
  icon?: IconName;
}

const STATUS_MAP: Record<StatusKey, BadgeShape> = {
  // Documents
  signe: { cls: "badge-gold-solid", label: "Signé", icon: "check" },
  "en-attente": { cls: "badge-warn", label: "En attente" },
  telecharge: { cls: "badge-gray", label: "Téléchargé" },
  // Factures
  payee: { cls: "badge-gold-solid", label: "Payée", icon: "check" },
  "en-retard": { cls: "badge-error", label: "En retard" },
  // Génériques
  actif: { cls: "badge-gold-solid", label: "Actif" },
  nouveau: { cls: "badge-success", label: "Nouveau" },
  urgent: { cls: "badge-error", label: "Urgent" },
  draft: { cls: "badge-gray", label: "Brouillon" },
  review: { cls: "badge-warn", label: "Révision" },
  // Statuts dossier (cahier §6.2.1)
  demande: { cls: "badge-gray", label: "Demande" },
  analyse: { cls: "badge-warn", label: "En analyse / Pièces" },
  en_analyse: { cls: "badge-warn", label: "En analyse" },
  pieces_manquantes: { cls: "badge-error", label: "Pièces manquantes" },
  devis: { cls: "badge-gold", label: "Devis" },
  en_cours: { cls: "badge-gold-solid", label: "En cours" },
  termine: { cls: "badge-success", label: "Terminé", icon: "check" },
  valide: { cls: "badge-success", label: "Validé", icon: "check" },
  cloture: { cls: "badge-gray", label: "Clôturé" },
};

export interface StatusBadgeProps {
  status: StatusKey | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const v = STATUS_MAP[status as StatusKey] ?? { cls: "badge-gray", label: status };
  return (
    <span className={"badge " + v.cls}>
      {v.icon && <Icon name={v.icon} size={11} stroke={3} />}
      {v.label}
    </span>
  );
};
