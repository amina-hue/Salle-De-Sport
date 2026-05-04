import React, { useCallback, useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

/* ─────────────────────────────────────────────
   TOKENS (identiques au reste de l'app)
───────────────────────────────────────────── */
const T = {
  card:         "#161920",
  border:       "#1e2130",
  borderMid:    "#2a2e40",
  accent:       "#e53935",
  accentSoft:   "rgba(229,57,53,0.10)",
  accentBorder: "rgba(229,57,53,0.25)",
  accentHover:  "rgba(229,57,53,0.18)",
  text:         "#eef0f5",
  muted:        "#5a6078",
  subtle:       "#8891a8",
  gold:         "#f59e0b",
  goldSoft:     "rgba(245,158,11,0.10)",
  goldBorder:   "rgba(245,158,11,0.25)",
};

/* ─────────────────────────────────────────────
   INJECT KEYFRAME (once)
───────────────────────────────────────────── */
const injectAnim = () => {
  if (document.getElementById("dc-style")) return;
  const s = document.createElement("style");
  s.id = "dc-style";
  s.textContent = `
    @keyframes dc-backdrop { from { opacity:0 } to { opacity:1 } }
    @keyframes dc-panel {
      from { opacity:0; transform: scale(0.92) translateY(16px); }
      to   { opacity:1; transform: scale(1)    translateY(0);    }
    }
  `;
  document.head.appendChild(s);
};

/* ─────────────────────────────────────────────
   <DeleteConfirm />

   Props:
     open          boolean           — afficher ou non
     title         string            — ex: "Supprimer l'activité"
     message       string            — phrase de confirmation
     confirmLabel  string?           — texte du bouton (défaut: "Supprimer")
     variant       "danger"|"warn"   — rouge (défaut) ou orange
     onConfirm     () => void
     onCancel      () => void

   Usage direct :
     <DeleteConfirm
       open={open}
       title="Supprimer le rôle"
       message={`Le rôle "${name}" sera supprimé définitivement.`}
       onConfirm={handleConfirm}
       onCancel={() => setOpen(false)}
     />

   Usage avec le hook useDeleteConfirm (voir ci-dessous) :
     const { confirmProps, askConfirm } = useDeleteConfirm();
     await askConfirm({ title, message });  // retourne true/false
     <DeleteConfirm {...confirmProps} />
───────────────────────────────────────────── */
export default function DeleteConfirm({
  open,
  title        = "Confirmer la suppression",
  message      = "Cette action est irréversible.",
  confirmLabel = "Supprimer",
  variant      = "danger",
  onConfirm,
  onCancel,
}) {
  injectAnim();
  if (!open) return null;

  const isWarn  = variant === "warn";
  const color   = isWarn ? T.gold   : T.accent;
  const soft    = isWarn ? T.goldSoft   : T.accentSoft;
  const border  = isWarn ? T.goldBorder : T.accentBorder;
  const hover   = isWarn ? "rgba(245,158,11,0.20)" : T.accentHover;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onCancel?.()}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "dc-backdrop 0.18s ease both",
      }}
    >
      <div style={{
        background: T.card,
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: "30px 32px",
        width: "100%", maxWidth: 400,
        margin: "0 20px",
        boxShadow: `0 28px 64px rgba(0,0,0,0.75), 0 0 0 1px ${border}`,
        animation: "dc-panel 0.22s cubic-bezier(.34,1.4,.64,1) both",
      }}>

        {/* Icône */}
        <div style={{
          width: 48, height: 48, borderRadius: 13,
          background: soft, border: `1px solid ${border}`,
          display: "grid", placeItems: "center",
          marginBottom: 20,
        }}>
          <AlertTriangle size={22} color={color} />
        </div>

        {/* Titre */}
        <h3 style={{
          margin: "0 0 8px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "1.12rem", fontWeight: 800,
          textTransform: "uppercase", letterSpacing: 0.5,
          color: T.text,
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          margin: "0 0 26px",
          fontSize: "0.85rem", lineHeight: 1.65,
          color: T.subtle,
          fontFamily: "'Barlow', sans-serif",
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {/* Annuler */}
          <button
            onClick={onCancel}
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "9px 20px",
              color: T.subtle,
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.85rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = T.borderMid;
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.subtle;
            }}
          >
            Annuler
          </button>

          {/* Confirmer */}
          <button
            onClick={onConfirm}
            style={{
              background: soft,
              border: `1px solid ${border}`,
              borderRadius: 8, padding: "9px 22px",
              color,
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 7,
            }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = soft}
          >
            <Trash2 size={14} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   useDeleteConfirm — hook Promise-based

   Permet d'utiliser DeleteConfirm comme un
   window.confirm() mais en async/await :

     const { confirmProps, askConfirm } = useDeleteConfirm();

     const handleDelete = async () => {
       const ok = await askConfirm({
         title: "Supprimer ?",
         message: "Action irréversible.",
       });
       if (!ok) return;
       // ... supprimer
     };

     // Dans le JSX :
     <DeleteConfirm {...confirmProps} />
───────────────────────────────────────────── */
export function useDeleteConfirm() {
  const [state, setState] = useState({ open: false });

  const askConfirm = useCallback((opts = {}) =>
    new Promise(resolve => {
      setState({ open: true, ...opts, resolve });
    }), []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ open: false });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ open: false });
  };

  const confirmProps = {
    open:         state.open,
    title:        state.title,
    message:      state.message,
    confirmLabel: state.confirmLabel,
    variant:      state.variant,
    onConfirm:    handleConfirm,
    onCancel:     handleCancel,
  };

  return { confirmProps, askConfirm };
}