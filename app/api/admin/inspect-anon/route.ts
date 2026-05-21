import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET /api/admin/inspect-anon — diagnostic RLS via la clé anon.
 * Protégé par adminGuard (header x-admin-secret en production).
 */
export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Initialize client with ANON key, simulating browser client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Attempt to select from users
    const { data: usersData, error: usersErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", "d6434a80-0669-4864-bbf8-d236e54766d7")
      .maybeSingle();

    // Attempt to select from dossiers
    const { data: dossiersData, error: dossiersErr } = await supabase
      .from("dossiers")
      .select("*")
      .limit(5);

    return NextResponse.json({
      success: true,
      usersResult: {
        data: usersData || null,
        error: usersErr ? {
          message: usersErr.message,
          details: usersErr.details,
          hint: usersErr.hint,
          code: usersErr.code
        } : null
      },
      dossiersResult: {
        data: dossiersData || null,
        error: dossiersErr ? {
          message: dossiersErr.message,
          details: dossiersErr.details,
          hint: dossiersErr.hint,
          code: dossiersErr.code
        } : null
      }
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
