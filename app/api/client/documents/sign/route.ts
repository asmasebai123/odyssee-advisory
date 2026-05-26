import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/client/documents/sign
 * Body JSON : { documentId: string }
 *
 * Marque un document comme signé (documents.signe = true).
 *
 * Sécurité :
 *  - exige une session valide ;
 *  - autorise le client propriétaire du dossier OU un avocat.
 *
 * NB : pour une signature électronique à valeur légale, brancher Yousign
 * (YOUSIGN_API_KEY). Ici il s'agit d'une validation/acceptation in-app
 * enregistrée côté serveur.
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

  // 1. Lire le corps de la requête
  let documentId: string | null = null;
  try {
    const body = await request.json();
    documentId = typeof body?.documentId === "string" ? body.documentId : null;
  } catch {
    return NextResponse.json(
      { success: false, error: "Requête invalide (JSON attendu)." },
      { status: 400 },
    );
  }

  if (!documentId) {
    return NextResponse.json(
      { success: false, error: "Paramètre documentId manquant." },
      { status: 400 },
    );
  }

  // 2. Identifier l'utilisateur via sa session
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

  const admin = createClient(url, serviceKey);

  try {
    // 3. Charger le document + dossier associé
    const { data: docRow, error: docErr } = await admin
      .from("documents")
      .select("id, dossier_id, signe, nom")
      .eq("id", documentId)
      .single();

    const doc = docRow as {
      id: string;
      dossier_id: string;
      signe: boolean | null;
      nom: string | null;
    } | null;

    if (docErr || !doc) {
      return NextResponse.json(
        { success: false, error: "Document introuvable." },
        { status: 404 },
      );
    }

    // 4. Autorisation : avocat OU client propriétaire du dossier
    const { data: profileRow } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAvocat = (profileRow as { role?: string } | null)?.role === "avocat";

    if (!isAvocat) {
      const { data: dossierRow } = await admin
        .from("dossiers")
        .select("client_id")
        .eq("id", doc.dossier_id)
        .single();
      const ownerId = (dossierRow as { client_id?: string } | null)?.client_id;
      if (ownerId !== user.id) {
        return NextResponse.json(
          { success: false, error: "Accès refusé à ce document." },
          { status: 403 },
        );
      }
    }

    if (doc.signe) {
      return NextResponse.json({ success: true, alreadySigned: true });
    }

    // 5. Marquer comme signé
    const { error: updErr } = await admin
      .from("documents")
      .update({ signe: true })
      .eq("id", documentId);

    if (updErr) {
      return NextResponse.json(
        { success: false, error: "Échec de la signature : " + updErr.message },
        { status: 500 },
      );
    }

    // 6. Notifier l'avocat (best-effort, ne bloque pas la réponse)
    try {
      const { data: avocat } = await admin
        .from("users")
        .select("id")
        .eq("role", "avocat")
        .limit(1)
        .maybeSingle();
      const avocatId = (avocat as { id?: string } | null)?.id;
      if (avocatId) {
        await admin.from("notifications").insert({
          user_id: avocatId,
          message: `Le document « ${doc.nom ?? "document"} » a été signé par le client.`,
          type: "signature",
          lu: false,
        });
      }
    } catch (e) {
      console.error("sign notification failed:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
