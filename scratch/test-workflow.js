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

console.log("=== DIAGNOSTIC WORKFLOW ODYSSÉE ADVISORY ===");
console.log("Supabase URL:", supabaseUrl);
console.log("Service Key length:", supabaseServiceKey.length);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erreur : Clés Supabase manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostic() {
  try {
    // 1. Vérification des utilisateurs auth
    console.log("\n[1/5] Vérification des comptes d'authentification...");
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
      console.error("X Erreur listUsers Auth:", authErr.message);
    } else {
      console.log("✔ Comptes Auth trouvés:", authData.users.length);
      authData.users.forEach(u => {
        console.log(` - ID: ${u.id} | Email: ${u.email} | Rôle metadata: ${u.user_metadata?.role}`);
      });
    }

    // 2. Vérification de la table public.users
    console.log("\n[2/5] Vérification de la table public.users...");
    const { data: publicUsers, error: usersErr } = await supabase.from("users").select("*");
    if (usersErr) {
      console.error("X Erreur lecture public.users:", usersErr.message);
    } else {
      console.log("✔ Profils utilisateurs trouvés:", publicUsers.length);
      publicUsers.forEach(u => {
        console.log(` - ID: ${u.id} | Email: ${u.email} | Rôle: ${u.role} | Nom: ${u.prenom} ${u.nom}`);
      });
    }

    // 3. Récupération du dossier client de test (Jean Dupont)
    console.log("\n[3/5] Recherche du dossier de test...");
    const clientUser = publicUsers ? publicUsers.find(u => u.email === "client@test.com") : null;
    if (!clientUser) {
      console.error("X Client de test client@test.com introuvable. Veuillez exécuter le seed (/api/seed) !");
      return;
    }

    const { data: dossiers, error: dosErr } = await supabase
      .from("dossiers")
      .select("*")
      .eq("client_id", clientUser.id);

    if (dosErr) {
      console.error("X Erreur lecture dossiers:", dosErr.message);
    } else if (!dossiers || dossiers.length === 0) {
      console.error("X Aucun dossier trouvé pour client@test.com");
    } else {
      const dossier = dossiers[0];
      console.log(`✔ Dossier de test trouvé :`);
      console.log(` - ID: ${dossier.id}`);
      console.log(` - Titre: ${dossier.titre}`);
      console.log(` - Service: ${dossier.type_service}`);
      console.log(` - Montant: ${dossier.montant} €`);
      console.log(` - Statut: ${dossier.statut}`);

      // 4. Vérification des documents liés
      console.log("\n[4/5] Vérification des documents du dossier...");
      const { data: docs, error: docsErr } = await supabase
        .from("documents")
        .select("*")
        .eq("dossier_id", dossier.id);

      if (docsErr) {
        console.error("X Erreur lecture documents:", docsErr.message);
      } else {
        console.log(`✔ Documents trouvés (${docs.length}) :`);
        docs.forEach(d => {
          console.log(` - Nom: "${d.nom}" | Type: ${d.type} | Signé: ${d.signe} | URL: ${d.url ? d.url : "(Vide - En attente)"}`);
        });
      }

      // 5. Vérification des factures liées
      console.log("\n[5/5] Vérification des factures...");
      const { data: factures, error: facErr } = await supabase
        .from("factures")
        .select("*")
        .eq("dossier_id", dossier.id);

      if (facErr) {
        console.error("X Erreur lecture factures:", facErr.message);
      } else {
        console.log(`✔ Factures trouvées (${factures.length}) :`);
        factures.forEach(f => {
          console.log(` - ID: ${f.id} | Montant: ${f.montant} € | Statut: ${f.statut}`);
        });
      }

      // 6. Échanges de messages
      console.log("\n[6/6] Vérification de la messagerie...");
      const { data: messages, error: msgErr } = await supabase
        .from("messages")
        .select(`
          *,
          auteur:users!messages_auteur_id_fkey(prenom, nom, role)
        `)
        .eq("dossier_id", dossier.id)
        .order("created_at", { ascending: true });

      if (msgErr) {
        console.error("X Erreur lecture messages:", msgErr.message);
      } else {
        console.log(`✔ Messages trouvés (${messages.length}) :`);
        messages.forEach(m => {
          const name = m.auteur ? `${m.auteur.prenom} ${m.auteur.nom} (${m.auteur.role})` : "Inconnu";
          console.log(` - [${name}]: "${m.contenu}"`);
        });
      }
    }
  } catch (err) {
    console.error("Erreur inattendue durant le diagnostic :", err);
  }
}

runDiagnostic();
