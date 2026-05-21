import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAvocat } from "@/lib/auth-guard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/dossiers/[id] — Récupère les détails complets d'un dossier (dossier, client, documents, factures).
 * Réservé au cabinet (session + rôle avocat). Contourne RLS via service_role.
 */
export async function GET(
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

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });

  try {
    // 1. Récupérer le dossier
    const { data: dossier, error: dosErr } = await supabase
      .from("dossiers")
      .select("*")
      .eq("id", dossierId)
      .single();

    if (dosErr || !dossier) {
      throw new Error("Impossible de trouver le dossier : " + (dosErr?.message || "Non trouvé"));
    }

    // 2. Récupérer le profil client
    const { data: client, error: cliErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", dossier.client_id)
      .single();

    if (cliErr) {
      throw new Error("Impossible de charger le client : " + cliErr.message);
    }

    // 3. Récupérer les documents associés
    const { data: documents, error: docsErr } = await supabase
      .from("documents")
      .select("*")
      .eq("dossier_id", dossierId)
      .order("created_at", { ascending: false });

    // 4. Récupérer les factures associées
    const { data: factures, error: facErr } = await supabase
      .from("factures")
      .select("*")
      .eq("dossier_id", dossierId)
      .order("created_at", { ascending: false });

    // 5. Récupérer les messages associés
    const { data: messages } = await supabase
      .from("messages")
      .select(`
        *,
        auteur:users!messages_auteur_id_fkey (
          prenom,
          nom,
          role
        )
      `)
      .eq("dossier_id", dossierId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      success: true,
      dossier,
      client,
      documents: documents || [],
      factures: factures || [],
      messages: messages || []
    });

  } catch (err: any) {
    console.error("ADMIN DOSSIER DETAILS RUNTIME ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
