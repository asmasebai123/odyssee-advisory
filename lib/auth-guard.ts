import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export interface AvocatGuardSuccess {
  ok: true;
  /** id de l'avocat connecté (null en mode bypass dev). */
  userId: string | null;
  /** client service_role prêt à l'emploi (bypass RLS). */
  supabaseAdmin: SupabaseClient<Database>;
}

export interface AvocatGuardFailure {
  ok: false;
  response: NextResponse;
}

export type AvocatGuardResult = AvocatGuardSuccess | AvocatGuardFailure;

/**
 * Garde d'accès pour les routes métier du cabinet (espace avocat).
 *
 * En production : exige une session Supabase valide ET un rôle `avocat`
 * dans la table `users`. Sinon 401 / 403.
 *
 * En développement : si aucune session valide n'est trouvée (ex. bypass
 * `avocat@test.com` qui ne crée pas de session réelle), l'accès est tout
 * de même autorisé pour ne pas bloquer le travail local.
 *
 * Retourne toujours un client `supabaseAdmin` (service_role) pour effectuer
 * les opérations en contournant RLS une fois l'autorisation validée.
 */
export async function requireAvocat(
  request: NextRequest,
): Promise<AvocatGuardResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !anon || !serviceKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Configuration Supabase manquante." },
        { status: 500 },
      ),
    };
  }

  const supabaseAdmin = createClient<Database>(url, serviceKey);
  const isProd = process.env.NODE_ENV === "production";

  // Lecture de la session depuis les cookies (lecture seule).
  const supabaseSession = createServerClient<Database>(url, anon, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });

  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (user) {
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "avocat") {
      return { ok: true, userId: user.id, supabaseAdmin };
    }

    // Session présente mais pas avocat → refus, même en dev.
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Accès réservé au cabinet." },
        { status: 403 },
      ),
    };
  }

  // Pas de session.
  if (!isProd) {
    // Fallback dev : autorise le bypass local (avocat@test.com).
    return { ok: true, userId: null, supabaseAdmin };
  }

  return {
    ok: false,
    response: NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 },
    ),
  };
}

/**
 * Variante pour l'espace client : exige une session valide (n'importe quel
 * rôle). Renvoie l'id utilisateur + un client service_role.
 */
export async function requireUser(
  request: NextRequest,
): Promise<
  | { ok: true; userId: string; supabaseAdmin: SupabaseClient<Database> }
  | { ok: false; response: NextResponse }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabaseAdmin = createClient<Database>(url, serviceKey);
  const supabaseSession = createServerClient<Database>(url, anon, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });

  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Non authentifié." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, userId: user.id, supabaseAdmin };
}
