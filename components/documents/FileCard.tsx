import * as React from "react";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge, type StatusKey } from "@/components/shared/StatusBadge";

export interface FileCardDoc {
  name: string;
  size: string;
  date: string;
  status: StatusKey;
  sign?: boolean;
  /** id du document — sert à générer le lien de téléchargement sécurisé. */
  docId?: string;
}

export interface FileCardProps {
  doc: FileCardDoc;
  onSign?: (docId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ doc, onSign }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="card card-hover"
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 48,
            background: "var(--bg-light)",
            border: "1px solid var(--border)",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--mono)",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--gold)",
            flexShrink: 0,
          }}
        >
          PDF
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
            {doc.name}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4 }}>
            {doc.size} · {doc.date}
          </div>
        </div>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            style={{ color: "var(--ink-3)", background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
          >
            <Icon name="more" size={16} />
          </button>
          
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 4,
                width: 180,
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                boxShadow: "0 12px 30px rgba(40, 25, 10, 0.16)",
                zIndex: 30,
                display: "flex",
                flexDirection: "column",
                padding: "4px 0",
              }}
            >
              {doc.docId ? (
                <>
                  <a
                    href={`/api/documents/download?id=${doc.docId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    style={{
                      padding: "8px 12px",
                      fontSize: 13,
                      color: "var(--ink)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,150,90,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon name="eye" size={14} /> Consulter
                  </a>
                  <a
                    href={`/api/documents/download?id=${doc.docId}&dl=1`}
                    onClick={() => setShowMenu(false)}
                    style={{
                      padding: "8px 12px",
                      fontSize: 13,
                      color: "var(--ink)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,150,90,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon name="download" size={14} /> Télécharger
                  </a>
                </>
              ) : (
                <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--ink-3)" }}>
                  Aucune action
                </div>
              )}
              {doc.sign && doc.docId && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onSign?.(doc.docId || "");
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "var(--gold)",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.2s",
                    cursor: "pointer",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Icon name="edit" size={14} /> Signer
                </button>
              )}
            </div>
          )}
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
        <StatusBadge status={doc.status} />
        <div style={{ display: "flex", gap: 4 }}>
          {doc.docId ? (
            <>
              <a
                href={`/api/documents/download?id=${doc.docId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ color: "var(--ink-3)", padding: 6 }}
                title="Consulter"
              >
                <Icon name="eye" size={14} />
              </a>
              <a
                href={`/api/documents/download?id=${doc.docId}&dl=1`}
                className="btn btn-sm"
                style={{ color: "var(--ink-3)", padding: 6 }}
                title="Télécharger"
              >
                <Icon name="download" size={14} />
              </a>
            </>
          ) : (
            <>
              <button className="btn btn-sm" style={{ color: "var(--ink-3)", padding: 6 }}>
                <Icon name="eye" size={14} />
              </button>
              <button className="btn btn-sm" style={{ color: "var(--ink-3)", padding: 6 }}>
                <Icon name="download" size={14} />
              </button>
            </>
          )}
          {doc.sign && (
            <button 
              onClick={() => onSign?.(doc.docId || "")} 
              className="btn btn-sm btn-primary" 
              style={{ marginLeft: 4 }}
            >
              Signer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

