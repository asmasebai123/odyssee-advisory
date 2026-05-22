import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sendDocumentUploadedEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "documents";

/**
 * Crée le bucket privé « documents » s'il n'existe pas (idempotent).
 * Exécuté avec service_role → contourne toute policy Storage.
 */
async function ensureBucket(admin: SupabaseClient): Promise<void> {
  try {
    const { data } = await admin.storage.getBucket(BUCKET);
    if (!data) {
      await admin.storage.createBucket(BUCKET, { public: false });
    }
  } catch {
    // tente la création si getBucket échoue
    try {
      await admin.storage.createBucket(BUCKET, { public: false });
    } catch {
      // déjà existant — on ignore
    }
  }
}

/**
 * POST /api/client/documents/upload  (multipart/form-data)
 * Champs : file (obligatoire), documentId (optionnel — pièce demandée), type (optionnel)
 *
 * Téléverse côté serveur via service_role (contourne les policies Storage),
 * stocke le CHEMIN privé dans documents.url, puis notifie l'avocat.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !anon || !serviceKey) {
    return NextResponse.json(
      { success: false, error: "Configuration Supabase manquante." },
      { status: 500 },
    );
  }

  // 1. Identifier l'utilisateur via sa session
  const supabaseSession = createServerClient(url, anon, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 },
    );
  }

  // 2. Lire le fichier du form-data
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Requête invalide (form-data attendu)." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const documentId = (form.get("documentId") as string | null) || null;
  const type = (form.get("type") as string | null) || "autre";

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { success: false, error: "Aucun fichier fourni." },
      { status: 400 },
    );
  }

  const blob = file as File;
  if (blob.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, error: "Fichier trop volumineux (max 25 MB)." },
      { status: 400 },
    );
  }

  const admin = createClient(url, serviceKey);
  await ensureBucket(admin);

  try {
    // 3. Déterminer le dossier cible
    let dossierId: string | null = null;

    if (documentId) {
      const { data: docRow } = await admin
        .from("documents")
        .select("dossier_id")
        .eq("id", documentId)
        .single();
      dossierId = (docRow as { dossier_id?: string } | null)?.dossier_id ?? null;
    }

    if (!dossierId) {
      const { data: dossiers } = await admin
        .from("dossiers")
        .select("id")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      dossierId = (dossiers as { id: string }[] | null)?.[0]?.id ?? null;
    }

    if (!dossierId) {
      return NextResponse.json(
        { success: false, error: "Aucun dossier rattaché à votre compte." },
        { status: 400 },
      );
    }

    // 4. Téléverser dans le bucket privé
    const safeName = blob.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `clients/${dossierId}/${Date.now()}_${safeName}`;
    const arrayBuffer = await blob.arrayBuffer();

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: blob.type || "application/octet-stream",
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json(
        { success: false, error: "Échec du stockage : " + upErr.message },
        { status: 500 },
      );
    }

    // 5. Enregistrer / mettre à jour la ligne documents
    if (documentId) {
      const { error: updErr } = await admin
        .from("documents")
        .update({ url: path })
        .eq("id", documentId);
      if (updErr)
        throw new Error("Mise à jour document : " + updErr.message);
    } else {
      const { error: insErr } = await admin.from("documents").insert({
        dossier_id: dossierId,
        nom: blob.name,
        url: path,
        type,
        signe: false,
      });
      if (insErr) throw new Error("Insertion document : " + insErr.message);
    }

    // 6. Notifier l'avocat (best-effort)
    try {
      const { data: clientProfile } = await admin
        .from("users")
        .select("prenom, nom")
        .eq("id", user.id)
        .single();
      const { data: avocat } = await admin
        .from("users")
        .select("email")
        .eq("role", "avocat")
        .limit(1)
        .maybeSingle();
      const profile = clientProfile as { prenom?: string; nom?: string } | null;
      const avocatEmail = (avocat as { email?: string } | null)?.email;
      if (avocatEmail) {
        await sendDocumentUploadedEmail(
          avocatEmail,
          `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim() || "Client",
          "Accompagnement",
          blob.name,
        );
      }
    } catch (e) {
      console.error("doc uploaded email failed:", e);
    }

    return NextResponse.json({ success: true, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
