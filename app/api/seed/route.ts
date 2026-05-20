import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/seed — réinitialise et peuple la base avec 2 comptes de test
 * + 1 dossier + documents + factures + messages.
 *
 * Protection :
 *  - en production, exige un header `x-admin-secret` correspondant à
 *    process.env.ADMIN_SEED_SECRET, sinon 403.
 *  - en développement (NODE_ENV !== 'production'), accès libre.
 */
async function handler(request: NextRequest): Promise<NextResponse> {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    const expected = process.env.ADMIN_SEED_SECRET;
    const provided = request.headers.get("x-admin-secret");
    if (!expected || provided !== expected) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase URL or Service Role Key missing in .env.local",
      },
      { status: 500 },
    );
  }

  // Client admin — bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const password = "password123";
    const clientEmail = "client@test.com";
    const avocatEmail = "avocat@test.com";

    // 1. Purger les utilisateurs auth existants
    const { data: authUsersList } = await supabase.auth.admin.listUsers();
    if (authUsersList?.users) {
      const usersToPurge = authUsersList.users.filter(
        (u) => u.email === clientEmail || u.email === avocatEmail,
      );
      for (const u of usersToPurge) {
        await supabase.auth.admin.deleteUser(u.id);
      }
    }
    await supabase
      .from("users")
      .delete()
      .in("email", [clientEmail, avocatEmail]);

    // 2. Créer le client de test
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: clientEmail,
        password,
        email_confirm: true,
        user_metadata: { role: "client", prenom: "Jean", nom: "Dupont" }
      });
    if (authError)
      throw new Error("Auth Client creation error: " + authError.message);
    const clientUserId = authUser.user.id;

    const { error: insUserError } = await supabase.from("users").insert({
      id: clientUserId,
      email: clientEmail,
      nom: "Dupont",
      prenom: "Jean",
      role: "client",
      telephone: "+33 6 12 34 56 78",
      langue: "fr",
    });
    if (insUserError)
      throw new Error("Insert Client User error: " + insUserError.message);

    // 3. Créer l'avocat de test (Pierre Debuisson)
    const { data: authAvocat, error: authError2 } =
      await supabase.auth.admin.createUser({
        email: avocatEmail,
        password,
        email_confirm: true,
        user_metadata: { role: "avocat", prenom: "Pierre", nom: "Debuisson" }
      });
    if (authError2)
      throw new Error("Auth Avocat creation error: " + authError2.message);
    const avocatUserId = authAvocat.user.id;

    const { error: insAvocatError } = await supabase.from("users").insert({
      id: avocatUserId,
      email: avocatEmail,
      nom: "Debuisson",
      prenom: "Pierre",
      role: "avocat",
      telephone: "+971 4 123 4567",
      langue: "fr",
    });
    if (insAvocatError)
      throw new Error("Insert Avocat User error: " + insAvocatError.message);

    // 4. Dossier d'acquisition de test
    const { data: dossierData, error: dosError } = await supabase
      .from("dossiers")
      .insert({
        client_id: clientUserId,
        titre: "Emaar Beachfront Palace - T3",
        type_service: "Acquisition Immobilière - Dubaï",
        montant: 3420000,
        statut: "en_cours", // aligné cahier §6.2.1
      })
      .select()
      .single();
    if (dosError)
      throw new Error("Dossier insertion error: " + dosError.message);

    // 5. Documents de test
    const { error: docError } = await supabase.from("documents").insert([
      {
        dossier_id: dossierData.id,
        nom: "Compromis de vente signé.pdf",
        url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
        signe: true,
        type: "contrat",
      },
      {
        dossier_id: dossierData.id,
        nom: "Formulaire d'enregistrement foncier.pdf",
        url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
        signe: false,
        type: "autre",
      },
      {
        dossier_id: dossierData.id,
        nom: "Passeport certifié conforme.pdf",
        url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
        signe: true,
        type: "juridique",
      },
    ]);
    if (docError)
      throw new Error("Documents insertion error: " + docError.message);

    // 6. Factures de test
    const { error: facError } = await supabase.from("factures").insert([
      {
        dossier_id: dossierData.id,
        montant: 1250,
        statut: "payee",
      },
      {
        dossier_id: dossierData.id,
        montant: 2800,
        statut: "impayee",  // valeur attendue par la contrainte CHECK
      },
      {
        dossier_id: dossierData.id,
        montant: 342000,
        statut: "payee",
      },
    ]);
    if (facError)
      throw new Error("Factures insertion error: " + facError.message);

    // 7. Messages de test (avocat → client puis client → avocat)
    const { error: msgError } = await supabase.from("messages").insert([
      {
        dossier_id: dossierData.id,
        auteur_id: avocatUserId,
        contenu:
          "Bonjour Jean, j'ai bien initié votre dossier d'acquisition pour l'appartement T3 à Emaar Beachfront. J'ai besoin de votre passeport certifié et du formulaire foncier signé pour avancer.",
        lu: false,
      },
      {
        dossier_id: dossierData.id,
        auteur_id: clientUserId,
        contenu:
          "Bonjour Maître, ravi de débuter ce projet avec vous. C'est noté, je vous dépose le formulaire foncier signé d'ici ce soir !",
        lu: true,
      },
    ]);
    if (msgError)
      throw new Error("Messages insertion error: " + msgError.message);

    // 8. Document demandé par l'avocat au client (en attente de dépôt)
    const { error: reqDocError } = await supabase.from("documents").insert({
      dossier_id: dossierData.id,
      nom: "Relevé bancaire des 3 derniers mois",
      url: "",
      signe: false,
      type: "autre",
    });
    if (reqDocError)
      throw new Error("Requested doc insertion error: " + reqDocError.message);

    return NextResponse.json({
      success: true,
      message: "Base de données réinitialisée et peuplée avec succès.",
      credentials: {
        client: { email: clientEmail, password, role: "client" },
        avocat: { email: avocatEmail, password, role: "avocat" },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
