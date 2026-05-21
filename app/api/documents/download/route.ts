import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "documents";

/**
 * GET /api/documents/download?id=<documentId>
 *
 * Télécharge un document en générant une **URL signée** courte (60 s) depuis
 * le bucket privé `documents`. Sécurité :
 *  - exige une session valide ;
 *  - autorise uniquement le client propriétaire du dossier OU un avocat.
 *
 * Compatibilité : si `documents.url` contient déjà une URL http complète
 * (anciennes données / bucket public), on redirige directement.
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const documentId = request.nextUrl.searchParams.get("id");
  if (!documentId) {
    return NextResponse.json(
      { success: false, error: "Paramètre id manquant." },
      { status: 400 },
    );
  }

  // 1. Identifier l'utilisateur via sa session
  const supabaseSession = createServerClient<Database>(url, anon, {
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

  // 2. Charger le document + le dossier associé (service_role, bypass RLS)
  const supabaseAdmin = createClient<Database>(url, serviceKey);

  const { data: docData, error: docError } = await supabaseAdmin
    .from("documents")
    .select("id, url, nom, dossier_id")
    .eq("id", documentId)
    .single();

  const doc = docData as {
    id: string;
    url: string | null;
    nom: string | null;
    dossier_id: string;
  } | null;

  if (docError || !doc) {
    return NextResponse.json(
      { success: false, error: "Document introuvable." },
      { status: 404 },
    );
  }

  // 3. Autorisation : avocat OU client propriétaire du dossier
  const { data: profileData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = profileData as { role?: string } | null;
  const isAvocat = profile?.role === "avocat";

  if (!isAvocat) {
    const { data: dossierData } = await supabaseAdmin
      .from("dossiers")
      .select("client_id")
      .eq("id", doc.dossier_id)
      .single();
    const dossier = dossierData as { client_id: string } | null;
    if (!dossier || dossier.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Accès refusé à ce document." },
        { status: 403 },
      );
    }
  }

  const stored = doc.url ?? "";
  if (!stored) {
    return NextResponse.json(
      { success: false, error: "Aucun fichier rattaché à ce document." },
      { status: 404 },
    );
  }

  // 4a. Donnée historique : URL http complète → redirection directe
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    return NextResponse.redirect(stored);
  }

  // 4b. Chemin de stockage privé → URL signée 60 s
  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(stored, 60, { download: doc.nom ?? undefined });

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      {
        success: false,
        error: "Impossible de générer le lien de téléchargement.",
      },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
