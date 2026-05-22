"use client";

import * as React from "react";
import { Icon } from "@/components/shared/Icon";

export interface SignatureModalProps {
  isOpen: boolean;
  documentName: string;
  onClose: () => void;
  onConfirm: (fullName: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  documentName,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [hasCheckedConsent, setHasCheckedConsent] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  // Initialiser le canvas
  React.useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setFullName("");
    setHasCheckedConsent(false);
    setHasDrawn(false);

    // Timeout pour s'assurer que le DOM est monté et que le canvas a sa taille finale
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Adapter la résolution du canvas au device pixel ratio pour un tracé net
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Fond blanc type papier à lettres
      ctx.fillStyle = "#FAF8F5";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Ligne de signature en pointillés
      ctx.strokeStyle = "rgba(184, 150, 90, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(30, rect.height - 40);
      ctx.lineTo(rect.width - 30, rect.height - 40);
      ctx.stroke();

      // Texte indicateur discret sous la ligne
      ctx.fillStyle = "rgba(184, 150, 90, 0.65)";
      ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
      ctx.setLineDash([]); // reset
      ctx.fillText("Signer ci-dessus", 32, rect.height - 20);
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Récupérer les coordonnées relatives du pointeur
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Empêcher le défilement sur mobile pendant qu'on dessine
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#b8965a"; // Couleur or signature
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Ligne de signature
    ctx.strokeStyle = "rgba(184, 150, 90, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, rect.height - 40);
    ctx.lineTo(rect.width - 30, rect.height - 40);
    ctx.stroke();

    ctx.fillStyle = "rgba(184, 150, 90, 0.65)";
    ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
    ctx.setLineDash([]);
    ctx.fillText("Signer ci-dessus", 32, rect.height - 20);

    setHasDrawn(false);
  };

  const handleSubmit = async () => {
    if (!hasDrawn) return;
    if (!fullName.trim()) return;
    if (!hasCheckedConsent) return;

    await onConfirm(fullName.trim());
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(34, 23, 16, 0.65)", // brand espresso with opacity
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "var(--cream, #FFFCF5)",
          border: "1px solid var(--border, #F1E8D2)",
          borderRadius: "var(--radius, 14px)",
          boxShadow: "var(--shadow-lift, 0 10px 30px rgba(47, 36, 24, 0.08))",
          overflow: "hidden",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* En-tête premium */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid var(--border-soft, #F6EFDE)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to bottom, var(--gold-dim, rgba(201, 162, 106, 0.05)), transparent)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: "0.15em",
                color: "var(--gold, #C9A26A)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 2,
                fontFamily: "var(--sans), sans-serif",
              }}
            >
              Odyssée Advisory · Legal Sign
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink, #2F2418)",
                fontFamily: "var(--serif), Georgia, serif",
              }}
            >
              Signature Électronique Sécurisée
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ink-3, #A99784)",
              cursor: "pointer",
              padding: 6,
              borderRadius: "50%",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--beige-soft, #FBF6EB)";
              e.currentTarget.style.color = "var(--ink, #2F2418)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-3)";
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Corps de la modal */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Information du Document dans un encart beige-soft élégant */}
          <div 
            style={{ 
              fontSize: 13.5, 
              color: "var(--ink-2, #685749)", 
              lineHeight: 1.5,
              background: "var(--beige-soft, #FBF6EB)",
              border: "1px solid var(--border-soft, #F6EFDE)",
              borderRadius: "var(--radius-sm, 10px)",
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}
          >
            <span>Vous vous apprêtez à signer électroniquement le document :</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <Icon name="doc" size={16} style={{ color: "var(--gold)" }} />
              <strong style={{ color: "var(--ink, #2F2418)", fontSize: 14, fontWeight: 700, wordBreak: "break-all" }}>
                {documentName}
              </strong>
            </div>
          </div>

          {/* Zone de tracé de signature */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink, #2F2418)", fontFamily: "var(--sans)" }}>
                Dessinez votre signature manuscrite
              </span>
              {hasDrawn && (
                <button
                  onClick={clearCanvas}
                  disabled={isSubmitting}
                  style={{
                    fontSize: 11.5,
                    color: "var(--gold-deep, #AE8853)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                    textDecoration: "underline",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--gold-deep)"}
                >
                  Effacer et recommencer
                </button>
              )}
            </div>
            <div
              style={{
                width: "100%",
                height: 190,
                borderRadius: "var(--radius-sm, 10px)",
                overflow: "hidden",
                border: "1px solid var(--border, #F1E8D2)",
                boxShadow: "inset 0 2px 8px rgba(60, 40, 15, 0.03)",
                position: "relative",
                background: "#FAF8F5",
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  cursor: "crosshair",
                  touchAction: "none",
                }}
              />
            </div>
          </div>

          {/* Nom du signataire */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="sign-name-input"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--ink, #2F2418)", fontFamily: "var(--sans)" }}
            >
              Votre prénom et nom complet
            </label>
            <input
              id="sign-name-input"
              type="text"
              placeholder="Ex: Pierre Laurent"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm, 10px)",
                background: "var(--white, #FFFFFF)",
                border: "1px solid var(--border, #F1E8D2)",
                color: "var(--ink, #2F2418)",
                fontSize: 14.5,
                fontFamily: "var(--sans)",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(201, 162, 106, 0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Consentement légal */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              userSelect: "none",
              padding: "4px 0"
            }}
          >
            <input
              type="checkbox"
              checked={hasCheckedConsent}
              onChange={(e) => setHasCheckedConsent(e.target.checked)}
              disabled={isSubmitting}
              style={{
                marginTop: 3,
                accentColor: "var(--gold)",
                cursor: "pointer",
                width: 15,
                height: 15,
              }}
            />
            <span style={{ fontSize: 12.5, color: "var(--ink-2, #685749)", lineHeight: 1.5, fontFamily: "var(--sans)" }}>
              Je certifie que cette signature électronique est juridiquement contraignante et m&apos;engage
              sur l&apos;honneur à la validité des termes de ce document.
            </span>
          </label>
        </div>

        {/* Boutons d'action bas */}
        <div
          style={{
            padding: "18px 28px",
            borderTop: "1px solid var(--border-soft, #F6EFDE)",
            background: "rgba(247, 242, 230, 0.25)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-secondary"
            style={{
              padding: "11px 20px",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasDrawn || !fullName.trim() || !hasCheckedConsent}
            className="btn btn-primary"
            style={{
              padding: "11px 24px",
              fontSize: 13.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: (isSubmitting || !hasDrawn || !fullName.trim() || !hasCheckedConsent) ? 0.5 : 1,
              cursor: (isSubmitting || !hasDrawn || !fullName.trim() || !hasCheckedConsent) ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderTopColor: "#FFFFFF",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Signature en cours...
              </>
            ) : (
              <>
                <Icon name="edit" size={14} />
                Apposer la signature
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
