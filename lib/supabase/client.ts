import { createBrowserClient } from "@supabase/ssr";
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
 * Supabase client for use in Client Components.
 * Reads keys from public envs (NEXT_PUBLIC_*).
 *
 * If env vars are missing or placeholders, falls back to a safe localhost stub
 * so the UI still mounts during early development.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const safeUrl = isValidUrl(url) ? (url as string) : "https://placeholder.supabase.co";
  const safeKey = anonKey && anonKey.length > 0 ? anonKey : "placeholder-anon-key";

  return createBrowserClient<Database>(safeUrl, safeKey);
}
