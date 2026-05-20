export type UserRole = "client" | "avocat";
export type UserLangue = "fr" | "en" | "ar";

export interface AppUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  langue: UserLangue;
  telephone: string | null;
  created_at: string;
}
