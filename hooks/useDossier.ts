"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dossier } from "@/types/dossier";

interface UseDossierState {
  dossier: Dossier | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetches a single dossier by id (or null while loading / on error).
 */
export function useDossier(dossierId: string | null): UseDossierState {
  const [state, setState] = useState<UseDossierState>({
    dossier: null,
    loading: Boolean(dossierId),
    error: null,
  });

  useEffect(() => {
    if (!dossierId) {
      setState({ dossier: null, loading: false, error: null });
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .eq("id", dossierId)
        .single();

      if (cancelled) return;
      setState({
        dossier: data ?? null,
        loading: false,
        error: error ?? null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [dossierId]);

  return state;
}
