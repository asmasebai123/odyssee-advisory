"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "@/types/user";

interface UseUserState {
  user: AppUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Subscribes to the current Supabase session and resolves the linked `users` row.
 * Returns `{ user, loading, error }`.
 */
export function useUser(): UseUserState {
  const [state, setState] = useState<UseUserState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load(): Promise<void> {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !user) {
        setState({ user: null, loading: false, error: error ?? null });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      setState({
        user: profile ?? null,
        loading: false,
        error: profileError ?? null,
      });
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
