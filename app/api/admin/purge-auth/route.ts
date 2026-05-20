import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET /api/admin/purge-auth — diagnostic and reset utility.
 * Deletes test users client@test.com and avocat@test.com from both Supabase Auth GoTrue and the public.users table.
 * Protected by adminGuard (x-admin-secret header required in production).
 */
export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: "Missing Supabase keys in environment" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const results: any[] = [];
  const testEmails = ["client@test.com", "avocat@test.com"];

  try {
    // 1. Fetch all users from Supabase Auth
    const { data: authUsersList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json(
        { success: false, error: "List users error: " + listError.message },
        { status: 500 },
      );
    }

    const targetUsers = authUsersList?.users?.filter(u => u.email && testEmails.includes(u.email.toLowerCase())) || [];

    if (targetUsers.length === 0) {
      // Still clear public.users table to be completely clean
      await supabase.from("users").delete().in("email", testEmails);
      return NextResponse.json({
        success: true,
        message: "Aucun utilisateur de test à purger dans Auth GoTrue. Table public.users nettoyée.",
      });
    }

    // 2. Delete each targeted test user from Supabase Auth
    for (const u of targetUsers) {
      const { error: delError } = await supabase.auth.admin.deleteUser(u.id);
      results.push({
        email: u.email,
        id: u.id,
        authStatus: delError ? "FAILED" : "SUCCESS",
        error: delError ? delError.message : null,
      });
    }

    // 3. Clear public.users profiles for clean seeding
    const { error: dbDeleteError } = await supabase.from("users").delete().in("email", testEmails);
    
    return NextResponse.json({
      success: true,
      message: "Purge terminée avec succès.",
      dbClearStatus: dbDeleteError ? "FAILED: " + dbDeleteError.message : "SUCCESS",
      results,
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
