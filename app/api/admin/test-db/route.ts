import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET /api/admin/test-db — diagnostic : compte utilisateurs Auth vs public.users.
 * Protégé par adminGuard (header x-admin-secret en production).
 */
export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase keys" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: publicUsers } = await supabase.from("users").select("*");

    return NextResponse.json({
      authUsersCount: authUsers?.users?.length || 0,
      authUsers: authUsers?.users?.map((u) => ({ id: u.id, email: u.email })),
      publicUsersCount: publicUsers?.length || 0,
      publicUsers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
