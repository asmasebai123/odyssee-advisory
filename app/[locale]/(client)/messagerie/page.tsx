"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/shared/Icon";
import { PageHeader } from "@/components/shared/PageHeader";
import { MessageThread, type Message } from "@/components/dossier/MessageThread";
import { createBrowserClient } from "@supabase/ssr";

export default function MessageriePage(): React.ReactElement {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [user, setUser] = React.useState<any>(null);
  const [dossierId, setDossierId] = React.useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadMessages = React.useCallback(async () => {
    try {
      const res = await fetch("/api/client/dossier?t=" + Date.now(), { cache: "no-store" });
      const resData = await res.json();
      if (resData.success && resData.dossier) {
        setUser(resData.profile);
        setDossierId(resData.dossier.id);
        const formatted: Message[] = (resData.messages || []).map((m: any) => {
          const isClient = m.auteur?.role === "client" || m.auteur_id === resData.profile.id;
          return {
            from: isClient ? "client" : "lawyer",
            who: m.auteur ? `${m.auteur.prenom} ${m.auteur.nom}` : (isClient ? "Client" : "Cabinet"),
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: m.contenu
          };
        });
        setMessages(formatted);
        return;
      }
    } catch (err) {
      console.error("Failed to load messagerie via API:", err);
    }
  }, [supabase]);

  React.useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  React.useEffect(() => {
    if (!dossierId || dossierId === "mock-dossier-id") return;

    const channel = supabase
      .channel(`live-messages-client-chat-${dossierId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `dossier_id=eq.${dossierId}`
        },
        async () => {
          await loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dossierId, loadMessages, supabase]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !dossierId) return;

    try {
      const res = await fetch("/api/client/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-message",
          payload: { contenu: inputText }
        })
      });
      const resData = await res.json();
      if (!resData.success) {
        alert("Erreur lors de l'envoi : " + resData.error);
      } else {
        setInputText("");
        await loadMessages();
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    }
  };

  return (
    <>
      <Navbar
        title="Messagerie"
        breadcrumb="Espace client"
        switchRoleHref="/admin"
        switchRoleLabel="Vue cabinet"
      />

      <div className="page-fade page-pad">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 24,
          }}
        >
          {/* Conversation list */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "20px 22px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Conversations
              </div>
              <h2 style={{ fontSize: 18 }}>Boîte de réception</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <button
                style={{
                  textAlign: "left",
                  padding: "14px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderBottom: "1px solid var(--border-soft)",
                  borderLeft: "3px solid var(--gold)",
                  background: "var(--beige-soft)",
                  transition: "background .15s ease",
                }}
              >
                <div className="avatar" style={{ width: 36, height: 36 }}>
                  OA
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      Cabinet Odyssée
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-3)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Dossier en cours
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Thread */}
          <div className="card" style={{ padding: 28 }}>
            <PageHeader
              eyebrow="Échanges"
              title="Conversation sécurisée"
              action={
                <span className="badge badge-success">
                  <Icon name="shield" size={11} /> Chiffré E2E
                </span>
              }
            />
            <MessageThread messages={messages} />
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
                placeholder="Écrire un message…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                }}
              />
              <button 
                onClick={handleSend}
                className="btn btn-sm btn-primary"
                disabled={!dossierId}
              >
                <Icon name="send" size={12} /> Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
