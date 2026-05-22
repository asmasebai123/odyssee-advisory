import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

function isValidUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Refreshes the Supabase auth session on each request, re-issues cookies,
 * and enforces strict role-based route protections.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // No-op when Supabase isn't configured yet (placeholder values in .env.local).
  if (!isValidUrl(url) || !anonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string): string | undefined {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions): void {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions): void {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Extract the locale and base page from request pathname (e.g. /fr/dashboard -> locale="fr", page="dashboard")
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  let locale = "fr";
  let page = segments[1];

  if (["fr", "en", "ar"].includes(segments[1])) {
    locale = segments[1];
    page = segments[2] || "";
  }

  // Routes partagées (avocat ET client) : ex. impression d'une facture
  // /factures/<id>/imprimer — on exige juste une session, pas un rôle précis.
  const isSharedRoute = page === "factures" && segments.includes("print");

  // Define route categories
  const isClientRoute = !isSharedRoute && ["dashboard", "documents", "dossier", "factures", "messagerie", "parametres"].includes(page);
  const isAvocatRoute = ["admin", "clients", "dossiers"].includes(page);
  const isAuthRoute = ["login", "register"].includes(page);

  // Route partagée : exiger seulement l'authentification
  if (isSharedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(redirectUrl);
  }

  // Enforce access control
  if (isClientRoute || isAvocatRoute) {
    if (!user) {
      // User is unauthenticated, redirect to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/login`;
      return NextResponse.redirect(redirectUrl);
    }

    // Récupérer le rôle d'abord depuis user_metadata pour contourner les blocages RLS en lecture
    const metaRole = user.user_metadata?.role;

    if (metaRole) {
      if (isClientRoute && metaRole !== "client") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${locale}/admin`;
        return NextResponse.redirect(redirectUrl);
      }
      if (isAvocatRoute && metaRole !== "avocat") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${locale}/dashboard`;
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Fallback table users
      const { data: profileData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const profile = profileData as { role?: string } | null;
      if (!profile) {
        if (isAvocatRoute) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = `/${locale}/login`;
          return NextResponse.redirect(redirectUrl);
        }
      } else {
        if (isClientRoute && profile.role !== "client") {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = `/${locale}/admin`;
          return NextResponse.redirect(redirectUrl);
        }
        if (isAvocatRoute && profile.role !== "avocat") {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = `/${locale}/dashboard`;
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  } else if (isAuthRoute) {
    if (user) {
      // Already authenticated, redirect to appropriate workspace
      const metaRole = user.user_metadata?.role;
      const redirectUrl = request.nextUrl.clone();

      if (metaRole) {
        if (metaRole === "avocat") {
          redirectUrl.pathname = `/${locale}/admin`;
        } else {
          redirectUrl.pathname = `/${locale}/dashboard`;
        }
      } else {
        const { data: profileData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const profile = profileData as { role?: string } | null;
        if (profile?.role === "avocat") {
          redirectUrl.pathname = `/${locale}/admin`;
        } else {
          redirectUrl.pathname = `/${locale}/dashboard`;
        }
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
