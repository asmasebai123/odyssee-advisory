"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DossierDocument } from "@/types/dossier";

interface UseDocumentsState {
  documents: DossierDocument[];
  loading: boolean;
  error: Error | null;
}

/**
 * Lists documents attached to a dossier, ordered newest first.
 */
export function useDocuments(dossierId: string | null): UseDocumentsState {
  const [state, setState] = useState<UseDocumentsState>({
    documents: [],
    loading: Boolean(dossierId),
    error: null,
  });

  useEffect(() => {
    if (!dossierId) {
      setState({ documents: [], loading: false, error: null });
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("dossier_id", dossierId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setState({
        documents: data ?? [],
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
