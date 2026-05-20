import * as React from "react";

export interface Message {
  from: "lawyer" | "client";
  who: string;
  time: string;
  text: string;
}

interface MessageThreadProps {
  messages: Message[];
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxHeight: 360,
        overflowY: "auto",
        paddingRight: 8,
      }}
    >
      {messages.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--ink-3)", padding: "20px 0" }}>
          Aucun message pour le moment.
        </div>
      ) : (
        messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: m.from === "client" ? "row-reverse" : "row",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {m.who.substring(0, 2).toUpperCase()}
            </div>
            <div
              style={{
                maxWidth: "72%",
                padding: "12px 16px",
                background: m.from === "lawyer" ? "var(--bg-dark)" : "var(--beige)",
                color: m.from === "lawyer" ? "white" : "var(--ink)",
                border: m.from === "client" ? "1px solid var(--gold)" : "none",
                borderRadius: 2,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 6,
                  fontSize: 11,
                  color: m.from === "lawyer" ? "var(--gold)" : "var(--ink-3)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                <span>{m.who}</span>
                <span>{m.time}</span>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{m.text}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
