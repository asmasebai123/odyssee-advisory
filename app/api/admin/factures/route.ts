import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAvocat } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/factures
 * Crée une facture en base via le service role (bypass RLS).
 * Réservé au cabinet (session + rôle avocat).
 */
export async function POST(request: NextRequest) {
  const guard = await requireAvocat(request);
  if (!guard.ok) return guard.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: "Missing Supabase keys" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requête invalide" },
      { status: 400 }
    );
  }

  const { dossier_id, montant, libelle, reference, date_echeance, date_emission } = body;

  if (!dossier_id || montant === undefined || montant === null) {
    return NextResponse.json(
      { success: false, error: "dossier_id et montant sont obligatoires" },
      { status: 400 }
    );
  }

  const amt = Number(montant);
  if (isNaN(amt) || amt <= 0) {
    return NextResponse.json(
      { success: false, error: "Montant invalide" },
      { status: 400 }
    );
  }

  // Service role — bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("factures")
    .insert({
      dossier_id,
      montant: amt,
      statut: "impayee",
      libelle: libelle || null,
      reference: reference || null,
      date_echeance: date_echeance || null,
      date_emission: date_emission || new Date().toISOString().split("T")[0],
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erreur création facture:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, facture: data });
}

/**
 * GET /api/admin/factures
 * Retourne toutes les factures avec leur dossier et client.
 */
export async function GET(request: NextRequest) {
  const guard = await requireAvocat(request);
  if (!guard.ok) return guard.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("factures")
    .select("*, dossier:dossiers(*, client:users(prenom, nom, email))")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, factures: data || [] });
}
