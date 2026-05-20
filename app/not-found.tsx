import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

export default function NotFound(): React.ReactElement {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          padding: "48px 56px",
          maxWidth: 520,
          textAlign: "center",
        }}
      >
        <div className="rule-gold" style={{ margin: "0 auto 16px" }} />
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Page introuvable</h1>
        <p
          style={{
            color: "var(--ink-2)",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{ justifyContent: "center" }}
        >
          <Icon name="arrow-right" size={14} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
