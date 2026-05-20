import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: dossiers, error: dosErr } = await supabase
      .from("dossiers")
      .select("*, client:users(*)");

    const { data: users, error: usrErr } = await supabase
      .from("users")
      .select("*");

    return NextResponse.json({
      success: true,
      dossiers,
      users
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
