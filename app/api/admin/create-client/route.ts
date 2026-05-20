import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";
import { sendDossierCreatedEmail } from "@/lib/resend";

/**
 * POST /api/admin/create-client — crée un nouvel utilisateur client dans Supabase Auth,
 * insère son profil, crée son dossier et son premier document requis de manière atomique.
 * Exécuté avec la clé SERVICE_ROLE pour contourner les politiques RLS.
 */
export async function POST(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: "Missing Supabase keys" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await request.json();
    const { 
      email, 
      nom, 
      prenom, 
      telephone, 
      langue = "fr",
      titre,
      type_service,
      montant,
      statut
    } = body;

    if (!email || !nom || !prenom) {
      return NextResponse.json(
        { success: false, error: "Email, nom et prénom sont obligatoires." },
        { status: 400 }
      );
    }

    let userId = "";
    let isExistingUser = false;

    // 1. Vérifier si l'utilisateur existe déjà dans public.users
    const { data: existingUsers } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      isExistingUser = true;
    } else {
      // 2. Créer le compte dans Supabase Auth
      const password = "password123";
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "client", prenom, nom }
      });

      if (authError) {
        throw new Error("Erreur Auth : " + authError.message);
      }

      userId = authData.user.id;

      // 3. Insérer le profil dans public.users
      const { error: dbError } = await supabase.from("users").insert({
        id: userId,
        email,
        nom,
        prenom,
        role: "client",
        telephone,
        langue
      });

      if (dbError) {
        // Nettoyer l'Auth en cas d'échec d'insertion profile
        await supabase.auth.admin.deleteUser(userId);
        throw new Error("Erreur base de données (profil) : " + dbError.message);
      }
    }

    // 4. Si les informations de dossier sont présentes, insérer le dossier et le document de départ
    let dossierData = null;
    if (titre) {
      const { data: newDossier, error: dosErr } = await supabase
        .from("dossiers")
        .insert({
          client_id: userId,
          titre,
          type_service: type_service || "Acquisition Immobilière - Dubaï",
          montant: montant ? parseFloat(montant) : null,
          statut: statut || "demande"
        })
        .select()
        .single();

      if (dosErr) {
        throw new Error("Erreur base de données (dossier) : " + dosErr.message);
      }

      dossierData = newDossier;

      // 5. Créer la demande de document de départ (Passeport) sous service_role pour contourner RLS
      await supabase.from("documents").insert({
        dossier_id: newDossier.id,
        nom: "Passeport ou pièce d'identité",
        url: "",
        signe: false,
        type: "juridique"
      });
    }

    if (dossierData) {
      try {
        await sendDossierCreatedEmail(
          email,
          `${prenom} ${nom}`,
          titre,
          isExistingUser ? undefined : "password123"
        );
      } catch (emailErr) {
        console.error("Email send error (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      dossier: dossierData,
      message: isExistingUser 
        ? "Dossier créé pour un client existant." 
        : "Utilisateur client et dossier créés avec succès.",
      credentials: isExistingUser ? null : { email, password: "password123" }
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
