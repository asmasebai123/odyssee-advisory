import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth — return the current Supabase user (or 401).
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

/**
 * DELETE /api/auth — sign the current user out.
 */
export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
