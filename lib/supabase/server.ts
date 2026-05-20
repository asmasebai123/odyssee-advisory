import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

function isValidUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Supabase client for use in Server Components, route handlers, and server actions.
 * Reads cookies from the incoming request.
 *
 * If env vars are missing or placeholders, falls back to a safe localhost stub
 * so server-side rendering does not crash during early development.
 */
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const safeUrl = isValidUrl(url) ? (url as string) : "https://placeholder.supabase.co";
  const safeKey = anonKey && anonKey.length > 0 ? anonKey : "placeholder-anon-key";

  return createServerClient<Database>(safeUrl, safeKey, {
    cookies: {
      get(name: string): string | undefined {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions): void {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — Next disallows mutating cookies there.
          // Middleware handles session refresh in that case.
        }
      },
      remove(name: string, options: CookieOptions): void {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Same as above.
        }
      },
    },
  });
}
