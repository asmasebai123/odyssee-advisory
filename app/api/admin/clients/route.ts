import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/clients — Récupère tous les clients avec leurs dossiers associés.
 * Utilisé par la page Clients du cabinet pour contourner les restrictions RLS.
 */
export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

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
    const { data, error } = await supabase
      .from("users")
      .select("*, dossiers(*)")
      .eq("role", "client")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Erreur de récupération clients : " + error.message);
    }

    return NextResponse.json({
      success: true,
      clients: data || []
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
