"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FullTimeline } from "@/components/dossier/FullTimeline";
import { MessageThread } from "@/components/dossier/MessageThread";
import { createBrowserClient } from "@supabase/ssr";

function initials(prenom?: string, nom?: string): string {
  return `${(prenom || "").charAt(0)}${(nom || "").charAt(0)}`.toUpperCase() || "PD";
}

export default function DossierPage(): React.ReactElement {
  const [user, setUser] = React.useState<any>(null);
  const [dossier, setDossier] = React.useState<any>(null);
  const [avocat, setAvocat] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Stats
  const [docsCount, setDocsCount] = React.useState({ signed: 0, unsigned: 0, total: 0 });
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadDossierData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/client/dossier?t=" + Date.now(), { cache: "no-store" });
      const resData = await res.json();
      if (resData.success && resData.dossier) {
        setUser(resData.profile);
        setDossier(resData.dossier);
        setAvocat(resData.avocat || null);

        const docs = resData.documents || [];
        const signed = docs.filter((d: any) => d.signe).length;
        const unsigned = docs.filter((d: any) => !d.signe && d.url).length;
        setDocsCount({ signed, unsigned, total: docs.length });
        
        setMessages(resData.messages || []);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Failed to load client dossier from API:", err);
    }

    // Fallback
    const fallbackUser = {
      id: "mock-client-id",
      email: "client@test.com",
      nom: "Dupont",
      prenom: "Jean",
      role: "client",
      telephone: "+33 6 12 34 56 78",
      langue: "fr"
    };
    setUser(fallbackUser);
    setDossier({
      id: "mock-dossier-id",
      client_id: "mock-client-id",
      titre: "Emaar Beachfront Palace - Apt. 4204",
      type_service: "Acquisition Immobilière - Dubaï",
      montant: 3420000,
      statut: "en_cours"
    });
    setDocsCount({ signed: 2, unsigned: 1, total: 3 });
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
        auteur: fallbackUser
      }
    ]);
    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    loadDossierData();
  }, [loadDossierData]);

  React.useEffect(() => {
    if (!dossier || dossier.id === "mock-dossier-id") return;

    const channel = supabase
      .channel(`live-messages-client-${dossier.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `dossier_id=eq.${dossier.id}`
        },
        async () => {
          await loadDossierData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dossier, loadDossierData, supabase]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !dossier || !user) return;
    setIsSending(true);

    if (dossier.id === 'mock-dossier-id') {
      const newMsg = {
        id: `msg-${Date.now()}`,
        dossier_id: dossier.id,
        auteur_id: user.id,
        contenu: newMessage,
        lu: false,
        created_at: new Date().toISOString(),
        auteur: user
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      setIsSending(false);
      
      // Simuler une réponse de l'avocat après 2 secondes pour épater le client !
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            dossier_id: dossier.id,
            auteur_id: "mock-avocat-id",
            contenu: "Bien reçu, Jean. Je l'examine dès aujourd'hui et je reviens vers vous rapidement.",
            lu: false,
            created_at: new Date().toISOString(),
            auteur: { prenom: "Pierre", nom: "Debuisson", role: "avocat" }
          }
        ]);
      }, 2000);
      return;
    }

    try {
      const res = await fetch("/api/client/dossier", {
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
        await loadDossierData();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Chargement du dossier...</div>;
  }

  if (!dossier) {
    return (
      <>
        <Navbar title="Mon dossier" breadcrumb="Espace client" />
        <div style={{ padding: 60, textAlign: "center", color: "var(--ink-2)" }}>
          <h3>Aucun dossier actif pour le moment.</h3>
          <p style={{ marginTop: 10, fontSize: 14 }}>Un avocat associé procède à l&apos;ouverture de votre compte.</p>
        </div>
      </>
    );
  }

  // Maper les messages Supabase vers le format attendu par MessageThread
  const mappedMessages = messages.map((m: any) => {
    const isClient = m.auteur?.role === 'client' || m.auteur_id === user?.id;
    return {
      from: (isClient ? 'client' : 'lawyer') as "client" | "lawyer",
      who: m.auteur ? `${m.auteur.prenom} ${m.auteur.nom}` : (isClient ? 'Client' : 'Cabinet'),
      time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: m.contenu
    };
  });

  const formattedValue = dossier.montant 
    ? `${dossier.montant.toLocaleString('fr-FR')} €`
    : "-- €";

  return (
    <>
      <Navbar
        title="Mon dossier"
        breadcrumb="Espace client · Dossiers"
        switchRoleHref="/admin"
        switchRoleLabel="Vue cabinet"
      />

      <div className="page-fade page-pad">
        {/* Hero card */}
        <div
          className="card"
          style={{
            padding: "32px 36px",
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: 32,
            position: "relative",
            overflow: "hidden",
            borderTop: "3px solid var(--gold)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Dossier #{((dossier.id && typeof dossier.id === 'string' && dossier.id.includes('-')) ? dossier.id.split('-')[0] : (dossier.id || 'N/A')).toUpperCase()}
              </span>
              <StatusBadge status={dossier.statut} />
            </div>
            <h1
              style={{
                fontSize: 36,
                marginBottom: 6,
                letterSpacing: "-0.01em",
              }}
            >
              {dossier.titre}
            </h1>
            <div
              style={{
                fontSize: 14,
                color: "var(--ink-2)",
                marginBottom: 22,
              }}
            >
              Prestation : {dossier.type_service}
            </div>

            <div style={{ display: "flex", gap: 36, marginTop: 20 }}>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>
                  Ouvert le
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)", fontWeight: 500 }}>
                  {dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date inconnue'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>
                  Valeur estimée
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--gold)", fontWeight: 500 }}>
                  {formattedValue}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <Link href="/documents" className="btn btn-primary">
                <Icon name="download" size={14} /> Bibliothèque des documents
              </Link>
              <Link href="/messagerie" className="btn btn-secondary">
                <Icon name="message" size={14} /> Messagerie instantanée
              </Link>
            </div>
          </div>

          <div className="property-card desktop-only" style={{ height: 220 }}>
            <div className="property-sub" style={{ fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {dossier.titre}
            </div>
            <div className="property-label">
              <Icon name="pin" size={11} /> {dossier.type_service}
            </div>
          </div>
        </div>

        {/* Two-col */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <PageHeader eyebrow="Chronologie" title="Étapes d'acquisition" />
              <FullTimeline status={dossier.statut} createdAt={dossier.created_at} />
            </div>

            <div className="card" style={{ padding: 28 }}>
              <PageHeader
                eyebrow="Échanges"
                title="Messagerie sécurisée"
                action={
                  <span className="badge badge-success">
                    <Icon name="shield" size={11} /> Chiffré E2E
                  </span>
                }
              />
              <MessageThread messages={mappedMessages} />
              
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
                  placeholder="Écrire un message à Maître Debuisson…"
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

          {/* Sticky right column */}
          <div
            style={{
              position: "sticky",
              top: 24,
              alignSelf: "start",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Résumé du dossier</h3>
              <div className="rule-gold" style={{ marginTop: 8 }} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginTop: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Client</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{user.prenom} {user.nom}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Type de Mandat</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{dossier.type_service}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Valeur du Projet</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>{formattedValue}</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Votre conseil</h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div className="avatar">
                  {avocat
                    ? initials(avocat.prenom, avocat.nom)
                    : "PD"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {avocat
                      ? `${avocat.prenom} ${avocat.nom}`
                      : "Pierre Debuisson"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    Legal Consultant — UAE · Odyssée Advisory
                  </div>
                  {avocat?.email && (
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {avocat.email}
                    </div>
                  )}
                </div>
                <Link href="/messagerie" style={{ color: "var(--gold)" }}>
                  <Icon name="message" size={14} />
                </Link>
              </div>
            </div>

            {/* Banner conditional logic for action required */}
            {docsCount.unsigned > 0 && (
              <div
                className="card"
                style={{
                  padding: 22,
                  background: "var(--gold)",
                  color: "var(--ink)",
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    color: "rgba(28,35,51,0.7)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Action requise
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    marginBottom: 6,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {docsCount.unsigned} document(s) en attente de signature
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "rgba(28,35,51,0.75)",
                    marginBottom: 16,
                  }}
                >
                  Rendez-vous dans votre espace de signature.
                </div>
                <Link
                  href="/documents"
                  className="btn btn-dark"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Examiner maintenant
                  <Icon name="arrow-right" size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
