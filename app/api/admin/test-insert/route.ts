import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const dossierId = "a5a8036c-fffc-40e6-8b2c-2335989e7536";

    const { data: documents, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("dossier_id", dossierId);

    const { data: factures, error: facErr } = await supabase
      .from("factures")
      .select("*")
      .eq("dossier_id", dossierId);

    return NextResponse.json({
      success: true,
      documents,
      docErr,
      factures,
      facErr
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
