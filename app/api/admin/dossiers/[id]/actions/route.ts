import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";
import { sendDocumentRequestedEmail, sendDossierStatusChangedEmail } from "@/lib/resend";

/**
 * POST /api/admin/dossiers/[id]/actions — Effectue des actions administratives sur un dossier
 * (création de facture, demande de document, modification de statut) sous service_role
 * pour contourner les politiques RLS.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const dossierId = params.id;
  if (!dossierId) {
    return NextResponse.json(
      { success: false, error: "ID du dossier manquant." },
      { status: 400 }
    );
  }

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
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action manquante." },
        { status: 400 }
      );
    }

    if (action === "create-invoice") {
      const { montant } = payload;
      if (!montant || isNaN(Number(montant))) {
        return NextResponse.json(
          { success: false, error: "Montant valide obligatoire." },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("factures")
        .insert({
          dossier_id: dossierId,
          montant: Number(montant),
          statut: "impayee"  // valeur imposée par la contrainte CHECK de Supabase
        });

      if (error) throw new Error("Facture insert error: " + error.message);

      return NextResponse.json({
        success: true,
        message: "Facture émise avec succès."
      });
    }

    if (action === "request-document") {
      const { nom, type } = payload;
      if (!nom || !nom.trim()) {
        return NextResponse.json(
          { success: false, error: "Nom du document obligatoire." },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("documents")
        .insert({
          dossier_id: dossierId,
          nom: nom.trim(),
          url: "",
          signe: false,
          type: type || "autre"
        });

      if (error) throw new Error("Document request error: " + error.message);

      // Notification par e-mail
      try {
        const { data: dossierInfo } = await supabase
          .from("dossiers")
          .select("client_id")
          .eq("id", dossierId)
          .single();

        if (dossierInfo && dossierInfo.client_id) {
          const { data: clientInfo } = await supabase
            .from("users")
            .select("email, prenom, nom")
            .eq("id", dossierInfo.client_id)
            .single();

          if (clientInfo && clientInfo.email) {
            await sendDocumentRequestedEmail(
              clientInfo.email,
              `${clientInfo.prenom} ${clientInfo.nom}`,
              nom.trim()
            );
          }
        }
      } catch (emailErr) {
        console.error("Failed to send document request email:", emailErr);
      }

      return NextResponse.json({
        success: true,
        message: "Demande de document ajoutée avec succès."
      });
    }

    if (action === "update-status") {
      const { statut } = payload;
      if (!statut) {
        return NextResponse.json(
          { success: false, error: "Statut obligatoire." },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("dossiers")
        .update({ statut })
        .eq("id", dossierId);

      if (error) throw new Error("Status update error: " + error.message);

      // Notification par e-mail
      try {
        const { data: dossierInfo } = await supabase
          .from("dossiers")
          .select("titre, client_id")
          .eq("id", dossierId)
          .single();

        if (dossierInfo && dossierInfo.client_id) {
          const { data: clientInfo } = await supabase
            .from("users")
            .select("email, prenom, nom")
            .eq("id", dossierInfo.client_id)
            .single();

          if (clientInfo && clientInfo.email) {
            await sendDossierStatusChangedEmail(
              clientInfo.email,
              `${clientInfo.prenom} ${clientInfo.nom}`,
              dossierInfo.titre || "Accompagnement",
              statut
            );
          }
        }
      } catch (emailErr) {
        console.error("Failed to send status update email:", emailErr);
      }

      return NextResponse.json({
        success: true,
        message: "Statut mis à jour avec succès."
      });
    }

    if (action === "save-notes") {
      const { contenu } = payload;
      // Notes are stored in the dossier's notes field if it exists, otherwise we use documents table
      // For now, upsert into a notes-type document record
      const { error } = await supabase
        .from("dossiers")
        .update({ notes: contenu ?? "" })
        .eq("id", dossierId);

      // If notes column doesn't exist, silently succeed (localStorage fallback on client)
      if (error && error.message && error.message.includes("column")) {
        return NextResponse.json({ success: true, fallback: true });
      }
      if (error) throw new Error("Notes save error: " + error.message);

      return NextResponse.json({
        success: true,
        message: "Notes enregistrées avec succès."
      });
    }

    if (action === "send-message") {
      const { contenu, auteurId } = payload;
      if (!contenu || !contenu.trim()) {
        return NextResponse.json(
          { success: false, error: "Contenu obligatoire." },
          { status: 400 }
        );
      }

      let finalAuteurId = auteurId;
      if (!finalAuteurId) {
        const { data: avocatUser } = await supabase
          .from("users")
          .select("id")
          .eq("role", "avocat")
          .limit(1)
          .single();
        if (avocatUser) {
          finalAuteurId = avocatUser.id;
        } else {
          throw new Error("Aucun avocat trouvé pour envoyer le message.");
        }
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          dossier_id: dossierId,
          auteur_id: finalAuteurId,
          contenu: contenu.trim(),
          lu: false
        });

      if (error) throw new Error("Message insert error: " + error.message);

      return NextResponse.json({
        success: true,
        message: "Message envoyé avec succès."
      });
    }

    return NextResponse.json(
      { success: false, error: `Action '${action}' inconnue.` },
      { status: 400 }
    );

  } catch (err: any) {
    console.error("ADMIN ACTION RUNTIME ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
