"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { FileCard, type FileCardDoc } from "@/components/documents/FileCard";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useParams } from "next/navigation";
import { SignatureModal } from "@/components/documents/SignatureModal";
import { useTranslations } from "next-intl";

interface Tab {
  id: string;
  label: string;
}

const TABS: Tab[] = [
  { id: "contrat", label: "Contrats" },
  { id: "facture", label: "Factures" },
  { id: "juridique", label: "Juridiques" },
  { id: "autre", label: "Autres" },
];

export default function DocumentsPage(): React.ReactElement {
  const tPage = useTranslations("documentsPage");
  const tNav = useTranslations("navbar");
  
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [tab, setTab] = React.useState<string>("contrat");
  const [docs, setDocs] = React.useState<any[]>([]);
  const [dossierId, setDossierId] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [activeSignDoc, setActiveSignDoc] = React.useState<{ id: string; name: string } | null>(null);
  const [isSigning, setIsSigning] = React.useState(false);

  const TABS_KEYS: Record<string, string> = {
    contrat: "tabContrats",
    facture: "tabFactures",
    juridique: "tabJuridique",
    autre: "tabAutres"
  };

  const handleSignDocument = (docId: string) => {
    const doc = docs.find(d => d.id === docId);
    if (doc) {
      setActiveSignDoc({ id: docId, name: doc.nom });
    }
  };

  const confirmSignature = async (fullName: string) => {
    if (!activeSignDoc || !dossierId) return;
    setIsSigning(true);

    const docId = activeSignDoc.id;

    if (dossierId === "mock-dossier-id") {
      setDocs(prev => prev.map(d => d.id === docId ? { ...d, signe: true } : d));
      setActiveSignDoc(null);
      setIsSigning(false);
      alert(`Document "${activeSignDoc.name}" signé numériquement avec succès par ${fullName} (Mode Démo) !`);
      return;
    }

    try {
      const res = await fetch("/api/client/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sign-document",
          payload: { documentId: docId }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors de la signature : " + resData.error);
      } else {
        alert(`Document "${activeSignDoc.name}" signé numériquement avec succès par ${fullName} !`);
        setActiveSignDoc(null);
        await loadDocuments();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsSigning(false);
    }
  };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadDocuments = React.useCallback(async () => {
    try {
      const res = await fetch("/api/client/dossier?t=" + Date.now(), { cache: "no-store" });
      const resData = await res.json();
      if (resData.success && resData.dossier) {
        setDossierId(resData.dossier.id);
        setDocs(resData.documents || []);
        return;
      }
    } catch (err) {
      console.error("Failed to load documents via API:", err);
    }

    // Fallback
    setDossierId("mock-dossier-id");
    setDocs([
      {
        id: "mock-doc-1",
        dossier_id: "mock-dossier-id",
        nom: "Compromis de vente signé.pdf",
        url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
        signe: true,
        type: "contrat",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "mock-doc-2",
        dossier_id: "mock-dossier-id",
        nom: "Formulaire d'enregistrement foncier.pdf",
        url: "",
        signe: false,
        type: "autre",
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: "mock-doc-3",
        dossier_id: "mock-dossier-id",
        nom: "Passeport certifié conforme.pdf",
        url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
        signe: true,
        type: "juridique",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "mock-doc-4",
        dossier_id: "mock-dossier-id",
        nom: "INV-2026-001 — Frais d'ouverture.pdf",
        url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
        signe: true,
        type: "facture",
        created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
      },
      {
        id: "mock-doc-5",
        dossier_id: "mock-dossier-id",
        nom: "INV-2026-002 — Honoraires Audit.pdf",
        url: "",
        signe: false,
        type: "facture",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]);
  }, [supabase]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Realtime — client voit instantanément les nouvelles demandes de l'admin
  React.useEffect(() => {
    if (!dossierId || dossierId === "mock-dossier-id") return;

    const channel = supabase
      .channel(`live-documents-client-${dossierId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `dossier_id=eq.${dossierId}` },
        async () => { await loadDocuments(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dossierId, loadDocuments, supabase]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !dossierId) return;

    setIsUploading(true);

    if (dossierId === "mock-dossier-id") {
      // Simulate file upload with 1s latency
      setTimeout(() => {
        const newDoc = {
          id: `mock-doc-${Date.now()}`,
          dossier_id: dossierId,
          nom: file.name,
          url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
          type: tab,
          signe: false,
          created_at: new Date().toISOString()
        };
        setDocs(prev => [newDoc, ...prev]);
        setIsUploading(false);
        if (event.target) event.target.value = '';
      }, 1000);
      return;
    }

    try {
      // Upload côté serveur (service_role) → contourne les policies Storage.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", tab);

      const res = await fetch("/api/client/documents/upload", {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors de l'envoi du document : " + resData.error);
      } else {
        await loadDocuments();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleFileUploadForRequest = async (event: React.ChangeEvent<HTMLInputElement>, reqDoc: any) => {
    const file = event.target.files?.[0];
    if (!file || !dossierId) return;

    setIsUploading(true);

    if (dossierId === "mock-dossier-id") {
      setTimeout(() => {
        setDocs(prev => prev.map(d => d.id === reqDoc.id ? {
          ...d,
          url: "https://qecoamfqucciqmwqxwlw.supabase.co/storage/v1/object/public/documents/sample.pdf",
          nom: file.name
        } : d));
        setIsUploading(false);
        if (event.target) event.target.value = '';
      }, 1000);
      return;
    }

    try {
      // Upload côté serveur (service_role) → contourne les policies Storage.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentId", reqDoc.id);
      formData.append("type", reqDoc.type || "autre");

      const res = await fetch("/api/client/documents/upload", {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors de l'envoi du document : " + resData.error);
      } else {
        await loadDocuments();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const pendingRequests = docs.filter(d => !d.url);
  const list = docs.filter(d => d.type === tab && d.url).map(d => ({
    name: d.nom,
    size: "Document",
    date: new Date(d.created_at).toLocaleDateString(),
    status: d.signe ? "signe" : "telecharge" as any,
    docId: d.id,
    sign: !d.signe
  }));

  return (
    <>
      <Navbar
        title={tPage("title")}
        breadcrumb={tPage("breadcrumb")}
        switchRoleHref="/admin"
        switchRoleLabel={tNav("switchToAvocat")}
      />

      <div className="page-fade page-pad">
        {/* Signature banner */}
        {list.some(d => d.sign) && (
          <div
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              borderRadius: 2,
              marginBottom: 28,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 2, background: "var(--bg-dark)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
              <Icon name="edit" size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>
                {tPage("actionRequired")}
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500 }}>
                {tPage("pendingSignatures")}
              </div>
            </div>
            <button className="btn btn-dark">
              {tPage("consult")} <Icon name="arrow-right" size={14} />
            </button>
          </div>
        )}

        {/* Pending document requests */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {tPage("requestedDocs")}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {pendingRequests.map((d) => (
                <div
                  key={d.id}
                  className="card"
                  style={{
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    borderLeft: "3.5px solid var(--gold)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 48,
                        background: "rgba(184,150,90,0.06)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--gold)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="upload" size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.nom}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                        {tPage("requestedOn", { date: new Date(d.created_at).toLocaleDateString() })}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span className="badge badge-warn">{tPage("pending")}</span>
                    <label
                      className="btn btn-primary btn-sm"
                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12 }}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUploadForRequest(e, d)}
                      />
                      <Icon name="upload" size={11} /> {tPage("upload")}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 28,
            borderBottom: "1px solid var(--border)",
            marginBottom: 24,
            alignItems: "flex-end",
          }}
        >
          {TABS.map((t) => {
            const count = docs.filter(d => d.type === t.id).length;
            return (
              <button
                key={t.id}
                className={"tab-link " + (tab === t.id ? "active" : "")}
                onClick={() => setTab(t.id)}
              >
                {tPage(TABS_KEYS[t.id])}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    padding: "2px 6px",
                    background: tab === t.id ? "var(--gold-dim)" : "var(--bg-light)",
                    borderRadius: 10,
                    color: tab === t.id ? "var(--gold)" : "var(--ink-3)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
        </div>

        {/* File grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {list.map((d, i) => (
            <FileCard key={i} doc={d as any} onSign={handleSignDocument} />
          ))}

          {/* Drag and drop Upload Zone */}
          <label
            style={{
              border: "1.5px dashed var(--gold)",
              background: "rgba(184,150,90,0.04)",
              borderRadius: 3,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 174,
              cursor: isUploading ? "wait" : "pointer",
              transition: "background .15s ease",
              opacity: isUploading ? 0.7 : 1
            }}
          >
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png" 
              style={{ display: "none" }} 
              onChange={handleFileUpload}
              disabled={isUploading || !dossierId}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--gold-dim)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="upload" size={22} />
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>
              {isUploading ? tPage("uploading") : tPage("uploadZoneTitle")}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {tPage("uploadZoneSub", { tab: tPage(TABS_KEYS[tab]) })}
            </div>
          </label>
        </div>
      </div>

      <SignatureModal
        isOpen={activeSignDoc !== null}
        documentName={activeSignDoc?.name || ""}
        onClose={() => setActiveSignDoc(null)}
        onConfirm={confirmSignature}
        isSubmitting={isSigning}
      />
    </>
  );
}
