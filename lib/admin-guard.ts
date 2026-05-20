import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde pour les routes administratives sensibles (seed, purge, diagnose…).
 *
 * En production, exige le header `x-admin-secret` qui doit correspondre à
 * la variable d'environnement `ADMIN_SEED_SECRET`. Sinon retourne 403.
 *
 * En développement, l'accès est libre pour faciliter le travail local.
 *
 * Retourne `null` si l'accès est autorisé, sinon une `NextResponse` 403.
 */
export function adminGuard(request: NextRequest): NextResponse | null {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return null;

  const expected = process.env.ADMIN_SEED_SECRET;
  const provided = request.headers.get("x-admin-secret");
  if (!expected || provided !== expected) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }
  return null;
}
