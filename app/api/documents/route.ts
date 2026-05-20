import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/documents?dossier_id=... — list documents for a dossier.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dossierId = request.nextUrl.searchParams.get("dossier_id");
  if (!dossierId) {
    return NextResponse.json({ error: "dossier_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("dossier_id", dossierId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ documents: data });
}
