"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PrintableInvoice } from "@/components/shared/PrintableInvoice";

export default function LawyerPrintInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const locale = (params?.locale as string) || "fr";

  const [facture, setFacture] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;

    const fetchFacture = async () => {
      try {
        const res = await fetch(`/api/factures/${id}`);
        const data = await res.json();
        if (data.success && data.facture) {
          setFacture(data.facture);
        } else {
          setError(data.error || "Impossible de récupérer la facture.");
        }
      } catch (err: any) {
        setError("Erreur de connexion au serveur.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacture();
  }, [id]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-light)",
          color: "var(--ink-3)",
        }}
      >
        Chargement de la facture en cours...
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-light)",
          gap: 16,
        }}
      >
        <p style={{ color: "var(--error)", fontWeight: 600 }}>
          ⚠️ {error || "Facture introuvable"}
        </p>
        <a
          href={`/${locale}/admin/factures`}
          className="btn btn-secondary btn-sm"
        >
          Retour aux factures cabinet
        </a>
      </div>
    );
  }

  return (
    <PrintableInvoice
      facture={facture}
      backPath={`/${locale}/admin/factures`}
    />
  );
}
