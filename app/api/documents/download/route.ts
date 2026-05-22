import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "documents";

/**
 * GET /api/documents/download?id=<documentId>&dl=<0|1>
 *
 * Renvoie le fichier d'un document directement (flux d'octets), avec les
 * bons en-têtes Content-Type / Content-Disposition :
 *  - `dl=1`  → téléchargement forcé (attachment) — le fichier est enregistré ;
 *  - sinon   → affichage en ligne (inline) — ouverture dans le navigateur.
 *
 * Sécurité :
 *  - exige une session valide ;
 *  - autorise uniquement le client propriétaire du dossier OU un avocat.
 *
 * Source du fichier :
 *  - chemin de stockage privé → téléchargé via service_role ;
 *  - URL http complète (anciennes données / bucket public) → récupérée côté serveur.
 */

/** Devine le type MIME à partir de l'extension du nom de fichier. */
function guessContentType(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
}

/** En-tête Content-Disposition compatible RFC 5987 (gère les accents). */
function contentDisposition(disposition: "inline" | "attachment", name: string): string {
  const fallback = name.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const encoded = encodeURIComponent(name);
  return `${disposition}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
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

  // Mode : téléchargement forcé (dl=1) ou affichage en ligne (défaut)
  const disposition =
    request.nextUrl.searchParams.get("dl") === "1" ? "attachment" : "inline";

  // Nom de fichier propre, avec extension .pdf par défaut s'il n'y en a pas
  let filename = (doc.nom ?? "document").trim() || "document";
  if (!/\.[a-z0-9]{1,5}$/i.test(filename)) {
    filename += ".pdf";
  }
  const contentType = guessContentType(filename);

  let bytes: ArrayBuffer;

  try {
    if (stored.startsWith("http://") || stored.startsWith("https://")) {
      // 4a. URL http complète (anciennes données / bucket public)
      const upstream = await fetch(stored, { cache: "no-store" });
      if (!upstream.ok) {
        return NextResponse.json(
          { success: false, error: "Fichier source inaccessible." },
          { status: 502 },
        );
      }
      bytes = await upstream.arrayBuffer();
    } else {
      // 4b. Chemin de stockage privé → téléchargement via service_role
      const { data: blob, error: dlError } = await supabaseAdmin.storage
        .from(BUCKET)
        .download(stored);
      if (dlError || !blob) {
        return NextResponse.json(
          {
            success: false,
            error: "Impossible de récupérer le fichier.",
          },
          { status: 500 },
        );
      }
      bytes = await blob.arrayBuffer();
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la lecture du fichier." },
      { status: 500 },
    );
  }

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition(disposition, filename),
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
