import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET /api/admin/seed-dossier?email=... — rattache un dossier de démo
 * complet à un utilisateur existant (identifié par email).
 * Protégé par adminGuard.
 */
export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Veuillez fournir un paramètre email. Exemple : ?email=client@odyssee.com',
      },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: "Supabase keys missing in .env.local" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.trim())
      .maybeSingle();

    if (userError)
      throw new Error("Database query error: " + userError.message);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: `L'utilisateur avec l'email "${email}" n'a pas été trouvé. Créez d'abord le compte.`,
        },
        { status: 404 },
      );
    }

    // Nettoyer les anciens dossiers de ce client
    await supabase.from("dossiers").delete().eq("client_id", user.id);

    // Dossier Emaar Beachfront
    const { data: dossierData, error: dosError } = await supabase
      .from("dossiers")
      .insert({
        client_id: user.id,
        titre: "Emaar Beachfront Palace — Apt. 4204",
        type_service: "Acquisition Immobilière - Dubaï",
        montant: 3420000,
        statut: "en_cours",
      })
      .select()
      .single();
    if (dosError)
      throw new Error("Dossier insertion error: " + dosError.message);

    // Documents
    await supabase.from("documents").delete().eq("dossier_id", dossierData.id);
    const { error: docError } = await supabase.from("documents").insert([
      {
        dossier_id: dossierData.id,
        nom: "Compromis de vente signé.pdf",
        url: `${supabaseUrl}/storage/v1/object/public/documents/sample.pdf`,
        signe: true,
        type: "contrat",
      },
      {
        dossier_id: dossierData.id,
        nom: "Formulaire d'enregistrement foncier.pdf",
        url: `${supabaseUrl}/storage/v1/object/public/documents/sample.pdf`,
        signe: false,
        type: "autre",
      },
      {
        dossier_id: dossierData.id,
        nom: "Passeport certifié conforme.pdf",
        url: `${supabaseUrl}/storage/v1/object/public/documents/sample.pdf`,
        signe: true,
        type: "juridique",
      },
    ]);
    if (docError)
      throw new Error("Documents insertion error: " + docError.message);

    // Factures
    await supabase.from("factures").delete().eq("dossier_id", dossierData.id);
    const { error: facError } = await supabase.from("factures").insert([
      {
        dossier_id: dossierData.id,
        montant: 1250,
        statut: "payee",
      },
      {
        dossier_id: dossierData.id,
        montant: 2800,
        statut: "impayee",
      },
      {
        dossier_id: dossierData.id,
        montant: 342000,
        statut: "payee",
      },
    ]);
    if (facError)
      throw new Error("Factures insertion error: " + facError.message);

    // Messages
    await supabase.from("messages").delete().eq("dossier_id", dossierData.id);
    const { error: msgError } = await supabase.from("messages").insert([
      {
        dossier_id: dossierData.id,
        auteur_id: user.id,
        contenu:
          "Bonjour Maître Debuisson, j'ai bien complété mon profil d'acquisition. Pouvons-nous valider la due diligence ?",
        lu: true,
      },
    ]);
    if (msgError)
      throw new Error("Messages insertion error: " + msgError.message);

    return NextResponse.json({
      success: true,
      message: `Le dossier premium Emaar Beachfront a été rattaché avec succès au compte "${email}".`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
