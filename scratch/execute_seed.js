const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables manually
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let supabaseServiceKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseServiceKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("X Erreur : Clés Supabase manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSeed() {
  console.log("=== SEEDING SUPABASE DATABASE ===");
  try {
    const password = "password123";
    const clientEmail = "client@test.com";
    const avocatEmail = "avocat@test.com";

    // 1. Purger les utilisateurs auth existants
    console.log("1. Purgers les anciens comptes de test...");
    const { data: authUsersList } = await supabase.auth.admin.listUsers();
    if (authUsersList?.users) {
      const usersToPurge = authUsersList.users.filter(
        (u) => u.email === clientEmail || u.email === avocatEmail
      );
      for (const u of usersToPurge) {
        console.log(` - Suppression Auth: ${u.email}`);
        await supabase.auth.admin.deleteUser(u.id);
      }
    }
    
    // Purger les profils public.users
    await supabase.from("users").delete().in("email", [clientEmail, avocatEmail]);

    // 2. Créer le client de test
    console.log("2. Création du compte client@test.com...");
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password,
      email_confirm: true,
      user_metadata: { role: "client", prenom: "Jean", nom: "Dupont" }
    });
    if (authError) throw new Error("Auth Client: " + authError.message);
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
    if (insUserError) throw new Error("Insert Client: " + insUserError.message);

    // 3. Créer l'avocat de test
    console.log("3. Création du compte avocat@test.com...");
    const { data: authAvocat, error: authError2 } = await supabase.auth.admin.createUser({
      email: avocatEmail,
      password,
      email_confirm: true,
      user_metadata: { role: "avocat", prenom: "Pierre", nom: "Debuisson" }
    });
    if (authError2) throw new Error("Auth Avocat: " + authError2.message);
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
    if (insAvocatError) throw new Error("Insert Avocat: " + insAvocatError.message);

    // 4. Dossier d'acquisition de test
    console.log("4. Création du dossier de test...");
    const { data: dossierData, error: dosError } = await supabase
      .from("dossiers")
      .insert({
        client_id: clientUserId,
        titre: "Emaar Beachfront Palace - T3",
        type_service: "Acquisition Immobilière - Dubaï",
        montant: 3420000,
        statut: "en_cours",
      })
      .select()
      .single();
    if (dosError) throw new Error("Dossier: " + dosError.message);

    // 5. Documents de test
    console.log("5. Création des documents de test...");
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
    if (docError) throw new Error("Documents: " + docError.message);

    // 6. Factures de test
    console.log("6. Création des factures de test...");
    const { error: facError } = await supabase.from("factures").insert([
      {
        dossier_id: dossierData.id,
        montant: 12500,
        statut: "payee",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30j avant
      },
      {
        dossier_id: dossierData.id,
        montant: 28000,
        statut: "impayee",
        created_at: new Date().toISOString()
      },
      {
        dossier_id: dossierData.id,
        montant: 342000,
        statut: "payee",
        created_at: new Date().toISOString()
      },
    ]);
    if (facError) throw new Error("Factures: " + facError.message);

    // 7. Messages de test
    console.log("7. Création des messages de test...");
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
    if (msgError) throw new Error("Messages: " + msgError.message);

    // 8. Document demandé
    console.log("8. Création du document requis...");
    const { error: reqDocError } = await supabase.from("documents").insert({
      dossier_id: dossierData.id,
      nom: "Relevé bancaire des 3 derniers mois",
      url: "",
      signe: false,
      type: "autre",
    });
    if (reqDocError) throw new Error("Requested Doc: " + reqDocError.message);

    // 9. Seeder les demandes (leads)
    console.log("9. Seeder les demandes (leads)...");
    await supabase.from("demandes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: demSeedError } = await supabase.from("demandes").insert([
      { nom: "Vasseur", prenom: "Édouard", email: "edouard.vasseur@email.com", telephone: "+33 6 88 12 34 56", titre: "Acquisition Palm Jumeirah - Villa 4", type_service: "Acquisition Immobilière - Dubaï", montant: 13600000, statut: "nouveau" },
      { nom: "Holding Aurore", prenom: "Société", email: "contact@holdingaurore.com", telephone: "+971 4 999 8888", titre: "Structuration ADGC pour 4 lots", type_service: "Structuration Corporate & ADGC", montant: 8200000, statut: "nouveau" },
      { nom: "Khoury", prenom: "Famille", email: "khoury.family@email.com", telephone: "+961 3 111 222", titre: "Succession Downtown Apartment", type_service: "Succession & Planification Patrimoniale", montant: 5900000, statut: "nouveau" },
      { nom: "Bénard", prenom: "Thomas", email: "thomas.benard@email.com", telephone: "+33 7 12 99 88 77", titre: "Audit fiscal global - DTC", type_service: "Audit & Due Diligence Juridique", montant: 3100000, statut: "nouveau" }
    ]);
    if (demSeedError) throw new Error("Demandes: " + demSeedError.message);

    console.log("✔ Base de données réinitialisée et peuplée avec succès !");
    console.log(" - Client: client@test.com / password123");
    console.log(" - Avocat: avocat@test.com / password123");

  } catch (err) {
    console.error("X Erreur lors du seeding :", err.message);
    process.exit(1);
  }
}

runSeed();
