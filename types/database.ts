/**
 * Supabase Database type stub.
 * Replace with the generated schema from:
 *   npx supabase gen types typescript --project-id <ref> --schema public
 */
import type {
  AppUser,
  UserRole,
  UserLangue,
} from "./user";
import type {
  Dossier,
  DossierStatut,
  Message,
  DossierDocument,
  DocumentType,
  Devis,
  DevisStatut,
  Facture,
  FactureStatut,
  Notification,
} from "./dossier";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: AppUser;
        Insert: Omit<AppUser, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AppUser>;
      };
      dossiers: {
        Row: Dossier;
        Insert: Omit<Dossier, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Dossier>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at" | "lu"> & {
          id?: string;
          created_at?: string;
          lu?: boolean;
        };
        Update: Partial<Message>;
      };
      documents: {
        Row: DossierDocument;
        Insert: Omit<DossierDocument, "id" | "created_at" | "signe"> & {
          id?: string;
          created_at?: string;
          signe?: boolean;
        };
        Update: Partial<DossierDocument>;
      };
      devis: {
        Row: Devis;
        Insert: Omit<Devis, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Devis>;
      };
      factures: {
        Row: Facture;
        Insert: Omit<Facture, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Facture>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at" | "lu"> & {
          id?: string;
          created_at?: string;
          lu?: boolean;
        };
        Update: Partial<Notification>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      user_langue: UserLangue;
      dossier_statut: DossierStatut;
      document_type: DocumentType;
      devis_statut: DevisStatut;
      facture_statut: FactureStatut;
    };
    CompositeTypes: Record<string, never>;
  };
}
