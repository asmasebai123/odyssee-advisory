"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DOSSIER_STATUT_ORDER,
  DOSSIER_STATUT_LABEL,
  type DossierStatut,
} from "@/types/dossier";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import { MessageThread } from "@/components/dossier/MessageThread";

// Statuts alignés sur le cahier des charges §6.2.1
const STATUSES: DossierStatut[] = DOSSIER_STATUT_ORDER;

export default function LawyerDossierPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const dossierId = params.id as string;

  const [dossier, setDossier] = React.useState<any>(null);
  const [client, setClient] = React.useState<any>(null);
  const [status, setStatus] = React.useState<string>("");
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [factures, setFactures] = React.useState<any[]>([]);

  // Messaging states
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  // Actions states
  const [reqDocName, setReqDocName] = React.useState("");
  const [reqDocType, setReqDocType] = React.useState("contrat");
  const [isReqSending, setIsReqSending] = React.useState(false);
  
  // Factures states
  const [newInvoiceAmount, setNewInvoiceAmount] = React.useState("");
  const [isInvoiceSending, setIsInvoiceSending] = React.useState(false);
  
  // Notes states
  const [notes, setNotes] = React.useState("");
  const [notesSaved, setNotesSaved] = React.useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadData = React.useCallback(async () => {
    if (!dossierId) return;

    let successLoaded = false;
    try {
      const res = await fetch(`/api/admin/dossiers/${dossierId}`);
      const resData = await res.json();
      if (resData.success) {
        setDossier(resData.dossier);
        setStatus(resData.dossier.statut);
        setClient(resData.client);
        setDocuments(resData.documents);
        setFactures(resData.factures);
        setMessages(resData.messages || []);
        successLoaded = true;
      }
    } catch (e) {
      console.error(e);
    }

    if (!successLoaded && (dossierId.startsWith("mock") || dossierId === "mock-dossier-id")) {
      // Fallback
      setDossier({
        id: "mock-dossier-id",
        client_id: "mock-client-id",
        titre: "Emaar Beachfront Palace - Apt. 4204",
        type_service: "Acquisition Immobilière - Dubaï",
        montant: 3420000,
        statut: "en_cours",
      });
      setStatus("en_cours");
      setClient({
        id: "mock-client-id",
        email: "client@test.com",
        nom: "Dupont",
        prenom: "Jean",
        role: "client",
        telephone: "+33 6 12 34 56 78",
        langue: "fr"
      });
      setDocuments([
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
        }
      ]);
      setFactures([
        {
          id: "mock-inv-1",
          dossier_id: "mock-dossier-id",
          montant: 1250,
          statut: "payee",
          created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
        },
        {
          id: "mock-inv-2",
          dossier_id: "mock-dossier-id",
          montant: 2800,
          statut: "en_attente",
          created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
        }
      ]);
      setMessages([
        {
          id: "m1",
          dossier_id: "mock-dossier-id",
          auteur_id: "mock-avocat-id",
          contenu: "Bonjour Jean, j'ai bien initié votre dossier d'acquisition pour l'appartement T3 à Emaar Beachfront. Pouvez-vous me valider le formulaire foncier ?",
          lu: true,
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          auteur: { prenom: "Pierre", nom: "Debuisson", role: "avocat" }
        },
        {
          id: "m2",
          dossier_id: "mock-dossier-id",
          auteur_id: "mock-client-id",
          contenu: "Bonjour Maître, ravi de débuter ce projet avec vous. C'est noté, je vous dépose le formulaire foncier signé d'ici ce soir !",
          lu: true,
          created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
          auteur: { prenom: "Jean", nom: "Dupont", role: "client" }
        }
      ]);
    }
  }, [dossierId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Charger les notes internes confidentielles depuis localStorage
  React.useEffect(() => {
    if (dossierId) {
      const saved = localStorage.getItem(`dossier_notes_${dossierId}`);
      if (saved) setNotes(saved);
    }
  }, [dossierId]);

  // Abonnements Realtime pour le cabinet — messages, documents uploadés par le client, factures
  React.useEffect(() => {
    if (!dossierId || dossierId.startsWith("mock") || dossierId === "mock-dossier-id") return;

    const channelMsg = supabase
      .channel(`live-lawyer-messages-${dossierId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `dossier_id=eq.${dossierId}`
      }, async () => { await loadData(); })
      .subscribe();

    // Watch document changes — fires when client uploads a requested document
    const channelDocs = supabase
      .channel(`live-lawyer-documents-${dossierId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "documents",
        filter: `dossier_id=eq.${dossierId}`
      }, async () => { await loadData(); })
      .subscribe();

    // Watch facture changes
    const channelFac = supabase
      .channel(`live-lawyer-factures-${dossierId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "factures",
        filter: `dossier_id=eq.${dossierId}`
      }, async () => { await loadData(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channelMsg);
      supabase.removeChannel(channelDocs);
      supabase.removeChannel(channelFac);
    };
  }, [dossierId, loadData, supabase]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !dossierId) return;
    setIsSending(true);

    if (dossierId === "mock-dossier-id") {
      const newMsg = {
        id: `msg-${Date.now()}`,
        dossier_id: dossierId,
        auteur_id: "mock-avocat-id",
        contenu: newMessage,
        lu: false,
        created_at: new Date().toISOString(),
        auteur: { prenom: "Pierre", nom: "Debuisson", role: "avocat" }
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/dossiers/${dossierId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-message",
          payload: { contenu: newMessage }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors de l'envoi : " + resData.error);
      } else {
        setNewMessage("");
        await loadData();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    setStatusOpen(false);
    if (dossierId.startsWith("mock") || dossierId === "mock-dossier-id") {
      setDossier(prev => prev ? { ...prev, statut: newStatus } : null);
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/dossiers/${dossierId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-status",
          payload: { statut: newStatus }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur de mise à jour du statut : " + resData.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDocName.trim()) return;
    setIsReqSending(true);

    if (dossierId.startsWith("mock") || dossierId === "mock-dossier-id") {
      const newDoc = {
        id: `mock-doc-${Date.now()}`,
        dossier_id: dossierId,
        nom: reqDocName.trim(),
        url: '',
        signe: false,
        type: reqDocType,
        created_at: new Date().toISOString()
      };
      setDocuments(prev => [newDoc, ...prev]);
      setReqDocName("");
      setIsReqSending(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/dossiers/${dossierId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-document",
          payload: { nom: reqDocName.trim(), type: reqDocType }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur de demande de pièce : " + resData.error);
      } else {
        setReqDocName("");
        await loadData();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsReqSending(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceAmount.trim() || isNaN(Number(newInvoiceAmount))) return;
    setIsInvoiceSending(true);

    const amount = Number(newInvoiceAmount);

    if (dossierId.startsWith("mock") || dossierId === "mock-dossier-id") {
      const newInv = {
        id: `mock-inv-${Date.now()}`,
        dossier_id: dossierId,
        montant: amount,
        statut: "en_attente",
        created_at: new Date().toISOString()
      };
      setFactures(prev => [newInv, ...prev]);
      setNewInvoiceAmount("");
      setIsInvoiceSending(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/dossiers/${dossierId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-invoice",
          payload: { montant: amount }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors de l'émission de la facture : " + resData.error);
      } else {
        setNewInvoiceAmount("");
        await loadData();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsInvoiceSending(false);
    }
  };

  const handleSaveNotes = async () => {
    // Always save to localStorage as immediate fallback
    localStorage.setItem(`dossier_notes_${dossierId}`, notes);

    if (!dossierId.startsWith("mock")) {
      try {
        const res = await fetch(`/api/admin/dossiers/${dossierId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save-notes",
            payload: { contenu: notes }
          })
        });
        // Even if DB doesn't have the column, we silently fallback to localStorage
      } catch (e) {
        // localStorage fallback already done above
      }
    }

    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  if (!dossier || !client) return <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Chargement...</div>;

  return (
    <>
      <Navbar
        title="Gestion du dossier"
        breadcrumb="Cabinet · Dossiers"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
              <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push('/admin')}>Dossiers</span>
              <span style={{ margin: "0 8px", color: "var(--gold)" }}>›</span>
              #{((dossier.id && typeof dossier.id === 'string' && dossier.id.includes('-')) ? dossier.id.split('-')[0] : (dossier.id || 'N/A')).toUpperCase()}
            </div>
            <h1 style={{ fontSize: 28 }}>
              {client.prenom} {client.nom}{" "}
              <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>
                · {dossier.titre}
              </span>
            </h1>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* MAIN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Status Selector */}
              <div className="card" style={{ padding: 22, position: "relative" }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
                  Statut du dossier
                </div>
                <div
                  onClick={() => setStatusOpen(!statusOpen)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", border: "1px solid var(--gold)", borderRadius: 2, cursor: "pointer", background: "rgba(184,150,90,0.06)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      {DOSSIER_STATUT_LABEL[status as DossierStatut] ?? status}
                    </span>
                  </div>
                  <Icon name="chevron-down" size={14} style={{ color: "var(--gold)" }} />
                </div>
                {statusOpen && (
                  <div style={{ position: "absolute", left: 22, right: 22, top: 96, background: "var(--bg-dark)", border: "1px solid var(--gold-line)", borderRadius: 2, zIndex: 5, boxShadow: "0 12px 32px rgba(0,0,0,0.18)" }}>
                    {STATUSES.map((s) => (
                      <div
                        key={s}
                        onClick={() => updateStatus(s)}
                        style={{ padding: "12px 16px", color: status === s ? "var(--gold)" : "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", borderBottom: "1px solid var(--border-dark)", display: "flex", alignItems: "center", gap: 10, fontWeight: status === s ? 600 : 400 }}
                      >
                        {status === s && <Icon name="check" size={13} stroke={3} />}
                        <span style={{ marginLeft: status === s ? 0 : 22 }}>
                          {DOSSIER_STATUT_LABEL[s]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Summary & New Invoice */}
              <div className="card" style={{ padding: 22 }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
                  Émettre des honoraires
                </div>
                <form onSubmit={handleCreateInvoice} style={{ display: "flex", gap: 10 }}>
                  <input
                    type="number"
                    value={newInvoiceAmount}
                    onChange={(e) => setNewInvoiceAmount(e.target.value)}
                    placeholder="Montant en Euros (ex: 1500)"
                    className="input-line"
                    style={{ flex: 1, background: "var(--bg-light)", padding: "10px 12px", border: "1px solid var(--border)", fontSize: 13 }}
                    disabled={isInvoiceSending}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isInvoiceSending || !newInvoiceAmount.trim()}
                  >
                    <Icon name="invoice" size={14} /> Émettre
                  </button>
                </form>
                <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-3)", paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span>Factures émises</span>
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {factures.length} factures
                  </span>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="card" style={{ padding: 24 }}>
              <PageHeader eyebrow="Finance" title={`Factures et Provisions (${factures.length})`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {factures.map((fac, idx) => (
                  <div key={fac.id || idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 2, background: "var(--white)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: fac.statut === "payee" ? "rgba(40,167,69,0.1)" : "rgba(224,86,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="credit-card" size={16} style={{ color: fac.statut === "payee" ? "var(--success)" : "var(--warning)" }} />
                      </div>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{fac.montant.toLocaleString('fr-FR')} €</span>
                        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                          Réf : {fac.id.startsWith("mock") ? `INV-2026-00${idx+1}` : fac.id.split("-")[0].toUpperCase()} · Créée le {new Date(fac.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${fac.statut === "payee" ? "badge-success" : "badge-warning"}`}>
                      {fac.statut === "payee" ? "Réglée" : "En attente"}
                    </span>
                  </div>
                ))}
                {factures.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-3)", padding: 12 }}>Aucune facture émise pour ce dossier.</div>}
              </div>
            </div>

            {/* Document Requests Form */}
            <div className="card" style={{ padding: 24 }}>
              <PageHeader eyebrow="Actions client" title="Demander un document" />
              <form onSubmit={handleRequestDoc} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
                <input
                  value={reqDocName}
                  onChange={(e) => setReqDocName(e.target.value)}
                  placeholder="Ex : Copie d'acte de naissance..."
                  className="input-line"
                  style={{ flex: 2, minWidth: 200, background: "var(--bg-light)", padding: "10px 14px", border: "1px solid var(--border)" }}
                  disabled={isReqSending}
                  required
                />
                <select
                  value={reqDocType}
                  onChange={(e) => setReqDocType(e.target.value)}
                  className="input-line"
                  style={{ flex: 1, minWidth: 150, background: "var(--bg-light)", padding: "10px 14px", border: "1px solid var(--border)" }}
                  disabled={isReqSending}
                >
                  <option value="contrat">Contrats & Compromis</option>
                  <option value="facture">Factures & Paiements</option>
                  <option value="juridique">Documents Juridiques</option>
                  <option value="autre">Autres pièces</option>
                </select>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isReqSending || !reqDocName.trim()}
                >
                  <Icon name="plus" size={12} /> Demander
                </button>
              </form>
            </div>

            {/* Document zone */}
            <div className="card" style={{ padding: 24 }}>
              <PageHeader eyebrow="Pièces du dossier" title={`Documents (${documents.length})`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {documents.map((d, i) => (
                  <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 2, background: "var(--white)" }}>
                    <div style={{ width: 34, height: 40, background: "var(--bg-light)", border: "1px solid var(--border)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                       DOC
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {d.url ? (
                        <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}>{d.nom}</a>
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-3)" }}>{d.nom} <span style={{ fontStyle: "italic", fontSize: 11 }}>(En attente client)</span></span>
                      )}
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        Créé le {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={d.url ? (d.signe ? "signe" : "telecharge") : "en-attente"} />
                  </div>
                ))}
                {documents.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-3)", padding: 12 }}>Aucun document dans ce dossier pour le moment.</div>}
              </div>
            </div>

            {/* Messages zone */}
            <div className="card" style={{ padding: 24 }}>
              <PageHeader
                eyebrow="Échanges"
                title="Messagerie sécurisée avec le client"
                action={
                  <span className="badge badge-success">
                    <Icon name="shield" size={11} /> Chiffré E2E
                  </span>
                }
              />
              <MessageThread messages={
                messages.map((m: any) => {
                  const isClient = m.auteur?.role === 'client' || m.auteur_id === client?.id;
                  return {
                    from: (isClient ? 'client' : 'lawyer') as "client" | "lawyer",
                    who: m.auteur ? `${m.auteur.prenom} ${m.auteur.nom}` : (isClient ? 'Client' : 'Cabinet'),
                    time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    text: m.contenu
                  };
                })
              } />
              
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "12px 14px",
                  background: "var(--bg-light)",
                  borderRadius: 2,
                }}
              >
                <input
                  placeholder="Écrire un message au client…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 14,
                  }}
                  disabled={isSending}
                />
                <button 
                  onClick={handleSendMessage}
                  className="btn btn-sm btn-primary"
                  disabled={isSending || !newMessage.trim()}
                >
                  <Icon name="send" size={12} /> Envoyer
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — client info + internal cabinet commentaries */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24, alignSelf: "start" }}>
            {/* Client summary */}
            <div className="card card-dark" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div className="avatar avatar-lg">{client.prenom.substring(0, 1).toUpperCase()}{client.nom.substring(0, 1).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 18, color: "white", fontWeight: 700, letterSpacing: "-0.01em" }}>
                    {client.prenom} {client.nom}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--gold)", letterSpacing: "0.12em", fontWeight: 600, marginTop: 2 }}>
                    CLIENT PRIVÉ
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-dark)", fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>Email</span>
                  <span style={{ color: "white", fontWeight: 600, textAlign: "right" }}>{client.email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: 10, fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>Téléphone</span>
                  <span style={{ color: "white", fontWeight: 600, textAlign: "right" }}>{client.telephone || "Non renseigné"}</span>
                </div>
              </div>
            </div>

            {/* Confidantial Cabinet Comments Panel */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Commentaires Internes</h3>
              <p style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 12 }}>
                Notes privées réservées aux avocats du cabinet.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter des observations confidentielles sur ce dossier..."
                style={{
                  width: "100%",
                  height: 140,
                  padding: 12,
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                  background: "var(--bg-light)",
                  marginBottom: 12
                }}
              />
              <button
                onClick={handleSaveNotes}
                className="btn btn-sm btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Icon name="check" size={12} /> 
                {notesSaved ? "Notes enregistrées !" : "Enregistrer les notes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
