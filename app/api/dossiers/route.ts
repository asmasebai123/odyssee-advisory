import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dossiers — list dossiers visible to the current user.
 * Clients see their own; avocats see all.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("dossiers")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ dossiers: data });
}

/**
 * POST /api/dossiers — create a new dossier.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;

  const insertPayload = {
    client_id: (payload.client_id as string) ?? user.id,
    titre: (payload.titre as string) ?? "Nouveau dossier",
    statut: "demande" as const,
    type_service: (payload.type_service as string) ?? "acquisition",
    montant: (payload.montant as number | null) ?? null,
  };

  const { data, error } = await supabase
    .from("dossiers")
    // Cast required until `supabase gen types` is run against the real schema.
    .insert(insertPayload as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ dossier: data }, { status: 201 });
}
