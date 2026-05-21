import { NextResponse, type NextRequest } from "next/server";
import { requireAvocat } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/audit — journal d'audit du cabinet (cahier §6.2.4).
 * Réservé au cabinet (session + rôle avocat).
 * Filtre optionnel : ?dossier_id=<uuid>
 */
export async function GET(request: NextRequest) {
  const guard = await requireAvocat(request);
  if (!guard.ok) return guard.response;

  const dossierId = request.nextUrl.searchParams.get("dossier_id");

  let query = guard.supabaseAdmin
    .from("audit_log")
    .select("*, dossier:dossiers(titre), acteur:users(prenom, nom)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (dossierId) {
    query = query.eq("dossier_id", dossierId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, entries: data ?? [] });
}
