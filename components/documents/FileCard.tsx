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
}

export const FileCard: React.FC<FileCardProps> = ({ doc }) => (
  <div
    className="card card-hover"
    style={{
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14,
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
      <button style={{ color: "var(--ink-3)" }}>
        <Icon name="more" size={16} />
      </button>
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
              href={`/api/documents/download?id=${doc.docId}`}
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
          <button className="btn btn-sm btn-primary" style={{ marginLeft: 4 }}>
            Signer
          </button>
        )}
      </div>
    </div>
  </div>
);
