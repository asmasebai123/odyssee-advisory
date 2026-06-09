import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAvocat } from "@/lib/auth-guard";
import { sendDocumentRequestedEmail, sendDossierStatusChangedEmail } from "@/lib/resend";

/**
 * POST /api/admin/dossiers/[id]/actions — Effectue des actions administratives sur un dossier
 * (création de facture, demande de document, modification de statut).
 * Réservé au cabinet (session + rôle avocat). Contourne RLS via service_role.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAvocat(request);
  if (!guard.ok) return guard.response;

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

  // Journal d'audit (§6.2.4) — best-effort, n'interrompt jamais l'action.
  const logAudit = async (auditAction: string, detail: string) => {
    try {
      await supabase.from("audit_log").insert({
        dossier_id: dossierId,
        acteur_id: guard.userId ?? null,
        acteur_label: "Cabinet",
        action: auditAction,
        detail,
      });
    } catch (e) {
      console.error("audit_log insert failed:", e);
    }
  };

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
      const { montant, reference, libelle, date_emission, date_echeance } = payload;
      if (!montant || isNaN(Number(montant))) {
        return NextResponse.json(
          { success: false, error: "Montant valide obligatoire." },
          { status: 400 }
        );
      }

      // Generate reference if not provided
      const invoiceRef = reference || `FAC-${Date.now().toString(36).toUpperCase()}`;

      // Build the libelle — can be a JSON string (structured detail) or plain text
      const invoiceLibelle = typeof libelle === "object"
        ? JSON.stringify(libelle)
        : (libelle || "Honoraires de conseil");

      const emissionDate = date_emission || new Date().toISOString().split("T")[0];
      const echeanceDate = date_echeance || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const { error } = await supabase
        .from("factures")
        .insert({
          dossier_id: dossierId,
          reference: invoiceRef,
          libelle: invoiceLibelle,
          montant: Number(montant),
          statut: "impayee",
          date_emission: emissionDate,
          date_echeance: echeanceDate,
        });

      if (error) throw new Error("Facture insert error: " + error.message);

      await logAudit("facture_emise", `Facture ${invoiceRef} de ${Number(montant)} € émise.`);

      // Notifier le client
      try {
        const { data: dossierInfo } = await supabase
          .from("dossiers")
          .select("client_id")
          .eq("id", dossierId)
          .single();

        if (dossierInfo?.client_id) {
          await supabase.from("notifications").insert({
            user_id: dossierInfo.client_id,
            message: `Une nouvelle facture d'un montant de ${Number(montant)} € a été émise (${invoiceRef}).`,
            type: "invoice",
            lu: false,
          });
        }
      } catch (err) {
        console.error("Failed to notify client on invoice:", err);
      }

      return NextResponse.json({
        success: true,
        message: "Facture émise avec succès.",
        reference: invoiceRef,
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

      // Notification par e-mail et DB
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

          // Notification database au client
          await supabase.from("notifications").insert({
            user_id: dossierInfo.client_id,
            message: `Votre avocat a demandé une pièce justificative : « ${nom.trim()} ».`,
            type: "document",
            lu: false,
          });
        }
      } catch (emailErr) {
        console.error("Failed to send document request email/db notification:", emailErr);
      }

      await logAudit("document_demande", `Pièce demandée au client : « ${nom.trim()} ».`);

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

      // Notification par e-mail et DB
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

          // Notification database au client
          const statusLabels: Record<string, string> = {
            demande: "Demande",
            en_analyse: "En analyse",
            pieces_manquantes: "Pièces manquantes",
            devis: "Devis émis",
            en_cours: "Dossier en cours",
            valide: "Dossier validé",
            cloture: "Dossier clôturé"
          };
          const friendlyStatus = statusLabels[statut] || statut;
          await supabase.from("notifications").insert({
            user_id: dossierInfo.client_id,
            message: `Le statut de votre dossier a été mis à jour : « ${friendlyStatus} ».`,
            type: "status",
            lu: false,
          });
        }
      } catch (emailErr) {
        console.error("Failed to send status update email/db notification:", emailErr);
      }

      await logAudit("statut_change", `Statut du dossier passé à « ${statut} ».`);

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

      // Notifier le client
      try {
        const { data: dossierInfo } = await supabase
          .from("dossiers")
          .select("client_id")
          .eq("id", dossierId)
          .single();

        if (dossierInfo?.client_id) {
          await supabase.from("notifications").insert({
            user_id: dossierInfo.client_id,
            message: `Nouveau message de votre avocat : « ${contenu.trim().slice(0, 50)}${contenu.trim().length > 50 ? "..." : ""} ».`,
            type: "message",
            lu: false,
          });
        }
      } catch (err) {
        console.error("Failed to notify client on message:", err);
      }

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
