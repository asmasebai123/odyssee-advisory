/**
 * Statuts dossier — alignés sur le cahier des charges Odyssée Advisory §6.2.1.
 *
 * Le cahier impose : "en cours, pièces manquantes, en analyse, validé, clôturé".
 * On ajoute "demande" (création initiale) et "devis" (proposition d'honoraires)
 * pour couvrir le cycle de vie complet d'un dossier.
 */
export type DossierStatut =
  | "demande"
  | "en_analyse"
  | "pieces_manquantes"
  | "devis"
  | "en_cours"
  | "valide"
  | "cloture";

/** Libellés FR pour l'UI. */
export const DOSSIER_STATUT_LABEL: Record<DossierStatut, string> = {
  demande: "Demande",
  en_analyse: "En analyse",
  pieces_manquantes: "Pièces manquantes",
  devis: "Devis",
  en_cours: "En cours",
  valide: "Validé",
  cloture: "Terminé / Clôturé",
};

/** Ordre canonique pour stepper / progression. */
export const DOSSIER_STATUT_ORDER: DossierStatut[] = [
  "demande",
  "en_analyse",
  "pieces_manquantes",
  "devis",
  "en_cours",
  "valide",
  "cloture",
];

export type DocumentType = "contrat" | "facture" | "juridique" | "autre";

export type DevisStatut = "en_attente" | "accepte" | "refuse";

/** Aligné sur la contrainte DB : check (statut in ('impayee','payee','en_retard')) */
export type FactureStatut = "impayee" | "payee" | "en_retard";

export interface Dossier {
  id: string;
  client_id: string;
  titre: string;
  statut: DossierStatut;
  type_service: string;
  montant: number | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  dossier_id: string;
  auteur_id: string;
  contenu: string;
  lu: boolean;
  created_at: string;
}

export interface DossierDocument {
  id: string;
  dossier_id: string;
  nom: string;
  url: string;
  type: DocumentType;
  signe: boolean;
  created_at: string;
}

export interface Devis {
  id: string;
  dossier_id: string;
  montant: number;
  description: string;
  statut: DevisStatut;
  created_at: string;
}

export interface Facture {
  id: string;
  dossier_id: string;
  montant: number;
  statut: FactureStatut;
  stripe_payment_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  lu: boolean;
  type: string;
  created_at: string;
}
