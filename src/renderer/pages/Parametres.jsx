import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Shield, Check, ChevronRight, X, Settings, Activity, Lock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import gymBg from "../../images/Gymnastique.png";
import gym2 from "../../images/gym2.png";
import QuickActions from "../components/QuickActions";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg:           "#0a0b0d",
  surface:      "#111318",
  card:         "#161920",
  cardHover:    "#1c1f28",
  border:       "#1e2130",
  borderMid:    "#2a2e40",
  accent:       "#e53935",
  accentSoft:   "rgba(229,57,53,0.10)",
  accentBorder: "rgba(229,57,53,0.25)",
  accentHover:  "rgba(229,57,53,0.18)",
  text:         "#eef0f5",
  muted:        "#5a6078",
  subtle:       "#8891a8",
  green:        "#22c55e",
  greenSoft:    "rgba(34,197,94,0.10)",
  greenBorder:  "rgba(34,197,94,0.25)",
  gold:         "#f59e0b",
  goldSoft:     "rgba(245,158,11,0.10)",
  goldBorder:   "rgba(245,158,11,0.25)",
  blue:         "#3b82f6",
  blueSoft:     "rgba(59,130,246,0.10)",
  blueBorder:   "rgba(59,130,246,0.25)",
};

const PERMISSIONS = [
  { key: "statistiques", label: "Statistiques",  icon: "📊" },
  { key: "adherents",    label: "Adhérents",      icon: "👥" },
  { key: "abonnements",  label: "Abonnements",    icon: "🎫" },
  { key: "paiements",    label: "Paiements",      icon: "💳" },
  { key: "planning",     label: "Planning",       icon: "📅" },
  { key: "recette",      label: "Recette",        icon: "📈" },
  { key: "magasin",      label: "Magasin",        icon: "🛒" },
  { key: "utilisateur",  label: "Utilisateurs",   icon: "👤" },
  { key: "parametres",   label: "Paramètres",     icon: "⚙️" },
];

const PERM_STATES = {
  autorise:    { label: "Autorisé",    color: T.green,  soft: T.greenSoft,  border: T.greenBorder  },
  restreindre: { label: "Restreindre", color: T.gold,   soft: T.goldSoft,   border: T.goldBorder   },
  interdit:    { label: "Interdit",    color: T.accent, soft: T.accentSoft, border: T.accentBorder },
};

const COULEURS = [
  "#22c55e","#3a7bd5","#8b5cf6","#e63946",
  "#f59e0b","#06b6d4","#ec4899","#6366f1",
];

/* ─────────────────────────────────────────────
   KEYFRAMES (injectés une seule fois)
───────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("pm-styles")) return;
  const s = document.createElement("style");
  s.id = "pm-styles";
  s.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.95); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      to   { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.95); }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.93) translateY(14px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
  `;
  document.head.appendChild(s);
};

/* ─────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────── */
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
};

const ToastContainer = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column-reverse", gap: 10, zIndex: 9999, pointerEvents: "none", alignItems: "center" }}>
    {toasts.map(t => {
      const cfg = t.type === "success"
        ? { color: T.green,  bg: "rgba(34,197,94,0.12)",  border: T.greenBorder,  Icon: CheckCircle }
        : t.type === "error"
        ? { color: "#f87171", bg: "rgba(229,57,53,0.12)", border: T.accentBorder, Icon: XCircle     }
        : { color: T.blue,   bg: "rgba(59,130,246,0.12)", border: T.blueBorder,   Icon: CheckCircle };
      return (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "13px 20px", borderRadius: 12,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
          minWidth: 280, maxWidth: 440,
          animation: "toastIn 0.3s cubic-bezier(.34,1.4,.64,1) both",
          pointerEvents: "auto",
          whiteSpace: "nowrap",
        }}>
          <cfg.Icon size={15} color={cfg.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.83rem", fontWeight: 600, color: cfg.color, fontFamily: "'Barlow', sans-serif" }}>
            {t.message}
          </span>
        </div>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────── */
const useConfirm = () => {
  const [state, setState] = useState({ open: false });
  const confirm = useCallback((opts) => new Promise(resolve => {
    setState({ open: true, ...opts, resolve });
  }), []);
  const handleConfirm = () => { state.resolve(true);  setState({ open: false }); };
  const handleCancel  = () => { state.resolve(false); setState({ open: false }); };
  return { confirmState: state, confirm, handleConfirm, handleCancel };
};

const ConfirmDialog = ({ open, title, message, confirmLabel = "Supprimer", variant = "danger", onConfirm, onCancel }) => {
  if (!open) return null;
  const isD    = variant === "danger";
  const color  = isD ? T.accent : T.gold;
  const soft   = isD ? T.accentSoft : T.goldSoft;
  const border = isD ? T.accentBorder : T.goldBorder;
  const hover  = isD ? T.accentHover : "rgba(245,158,11,0.18)";

  return (
    <div onClick={e => e.target === e.currentTarget && onCancel()}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.84)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.card, border: `1px solid ${border}`, borderRadius: 16, padding: "30px 32px", width: "100%", maxWidth: 400, margin: "0 20px", boxShadow: `0 28px 64px rgba(0,0,0,0.75), 0 0 0 1px ${border}`, animation: "modalIn 0.22s cubic-bezier(.34,1.4,.64,1) both" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: soft, border: `1px solid ${border}`, display: "grid", placeItems: "center", marginBottom: 18 }}>
          <AlertTriangle size={20} color={color} />
        </div>
        <h3 style={{ margin: "0 0 8px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: T.text }}>{title}</h3>
        <p style={{ margin: "0 0 26px", fontSize: "0.85rem", color: T.subtle, fontFamily: "'Barlow', sans-serif", lineHeight: 1.65 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel}
            style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 20px", color: T.subtle, fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;    e.currentTarget.style.color = T.subtle; }}>
            Annuler
          </button>
          <button onClick={onConfirm}
            style={{ background: soft, border: `1px solid ${border}`, borderRadius: 8, padding: "9px 22px", color, fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = soft}>
            <Trash2 size={14} /> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   COMPOSANTS UI GÉNÉRIQUES
───────────────────────────────────────────── */
const Pill = ({ label, color, soft, border }) => (
  <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 0.5, padding: "3px 10px", borderRadius: 20, background: soft, color, border: `1px solid ${border}`, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>
    {label}
  </span>
);

const Btn = ({ children, onClick, variant = "ghost", size = "md", disabled, style: extra }) => {
  const sizes = { sm: "6px 14px", md: "9px 20px", lg: "12px 26px" };
  const fs    = { sm: "0.75rem",  md: "0.85rem",  lg: "0.9rem"   };
  const V = {
    primary: { background: T.accent,      color: "#fff",   border: "none",                        boxShadow: "0 4px 16px rgba(229,57,53,0.3)" },
    danger:  { background: T.accentSoft,  color: T.accent, border: `1px solid ${T.accentBorder}` },
    ghost:   { background: "transparent", color: T.subtle, border: `1px solid ${T.border}`       },
    success: { background: T.greenSoft,   color: T.green,  border: `1px solid ${T.greenBorder}`  },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 700, transition: "all 0.15s", opacity: disabled ? 0.5 : 1, padding: sizes[size], fontSize: fs[size], ...V[variant], ...extra }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === "primary") { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(229,57,53,0.45)"; }
        if (variant === "danger")  e.currentTarget.style.background = T.accentHover;
        if (variant === "ghost")   { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.color = T.text; }
        if (variant === "success") e.currentTarget.style.background = "rgba(34,197,94,0.18)";
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (variant === "primary") { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(229,57,53,0.3)"; }
        if (variant === "danger")  e.currentTarget.style.background = T.accentSoft;
        if (variant === "ghost")   { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.subtle; }
        if (variant === "success") e.currentTarget.style.background = T.greenSoft;
      }}>
      {children}
    </button>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.80)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: T.card, border: `1px solid ${T.borderMid}`, borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 440, margin: "0 20px", boxShadow: "0 24px 60px rgba(0,0,0,0.7)", animation: "modalIn 0.2s cubic-bezier(.34,1.4,.64,1) both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h3 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.15rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: T.text }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = T.text}
          onMouseLeave={e => e.currentTarget.style.color = T.muted}>
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: "0.72rem", color: T.muted, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Barlow', sans-serif" }}>{label}</label>}
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, background: T.surface, color: T.text, border: `1px solid ${focused ? T.accentBorder : T.borderMid}`, outline: "none", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", transition: "border-color 0.15s", ...props.style }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION RÔLES
───────────────────────────────────────────── */
const RolesSection = ({ roles, onOpenPerms, onDeleteRole, onAddRole }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAddRole(name.trim());
    setName(""); setShowAdd(false);
  };

  return (
    <>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: "grid", placeItems: "center" }}>
              <Shield size={14} color={T.accent} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: 0.5 }}>Gestion des rôles</span>
            <Pill label={`${roles.length} rôles`} color={T.accent} soft={T.accentSoft} border={T.accentBorder} />
          </div>
          <Btn variant="danger" size="sm" onClick={() => setShowAdd(true)}><Plus size={13} /> Nouveau rôle</Btn>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d0f15" }}>
              {["Rôle", "Membres", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 24px", fontSize: "0.62rem", color: T.muted, letterSpacing: 1.2, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(role => <RoleRow key={role.id} role={role} onOpenPerms={onOpenPerms} onDelete={onDeleteRole} />)}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Nouveau rôle" onClose={() => setShowAdd(false)}>
          <Input label="Nom du rôle" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Coach, Caissier…" onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Annuler</Btn>
            <Btn variant="primary" onClick={handleAdd}>Créer</Btn>
          </div>
        </Modal>
      )}
    </>
  );
};

const RoleRow = ({ role, onOpenPerms, onDelete }) => {
  const [hov, setHov] = useState(false);
  const isAdmin = role.id === 1;
  return (
    <tr style={{ borderTop: `1px solid ${T.border}`, background: hov ? T.cardHover : "transparent", transition: "background 0.15s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <td style={{ padding: "13px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: isAdmin ? T.goldSoft : T.accentSoft, border: `1px solid ${isAdmin ? T.goldBorder : T.accentBorder}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Shield size={13} color={isAdmin ? T.gold : T.accent} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: T.text, fontFamily: "'Barlow', sans-serif" }}>{role.name}</div>
            {isAdmin && <div style={{ fontSize: "0.68rem", color: T.gold, fontFamily: "'Barlow', sans-serif", marginTop: 1 }}>Super administrateur</div>}
          </div>
        </div>
      </td>
      <td style={{ padding: "13px 24px" }}>
        <span style={{ fontSize: "0.82rem", color: T.subtle, fontFamily: "'Barlow', sans-serif" }}>{role.users} membre{role.users !== 1 ? "s" : ""}</span>
      </td>
      <td style={{ padding: "13px 24px" }}>
        {isAdmin
          ? <Pill label="Accès total" color={T.gold} soft={T.goldSoft} border={T.goldBorder} />
          : <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="danger" size="sm" onClick={() => onOpenPerms(role)}><Lock size={12} /> Permissions</Btn>
              <Btn variant="ghost"  size="sm" onClick={() => onDelete(role.id, role.name)}><Trash2 size={12} /> Supprimer</Btn>
            </div>
        }
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────
   ÉDITEUR PERMISSIONS
───────────────────────────────────────────── */
const PermissionsEditor = ({ role, perms, onChange, onSave, onClose, loading }) => (
  <div style={{ background: T.card, border: `1px solid ${T.borderMid}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
    <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(229,57,53,0.06) 0%, transparent 60%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: "grid", placeItems: "center" }}>
          <Lock size={13} color={T.accent} />
        </div>
        <div>
          <div style={{ fontSize: "0.62rem", color: T.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Barlow', sans-serif" }}>Permissions</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 800, color: T.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{role.name}</div>
        </div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}
        onMouseEnter={e => e.currentTarget.style.color = T.text}
        onMouseLeave={e => e.currentTarget.style.color = T.muted}>
        <X size={17} />
      </button>
    </div>

    {loading ? (
      <div style={{ padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem" }}>Chargement…</div>
    ) : (
      <div style={{ padding: "16px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {PERMISSIONS.map(perm => {
            const current = perms[perm.key] || "autorise";
            return (
              <div key={perm.key} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{perm.icon}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: T.text, fontFamily: "'Barlow', sans-serif" }}>{perm.label}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {Object.entries(PERM_STATES).map(([val, cfg]) => {
                    const active = current === val;
                    return (
                      <button key={val} onClick={() => onChange(perm.key, val)} title={cfg.label}
                        style={{ width: 24, height: 24, borderRadius: 6, cursor: "pointer", border: `1px solid ${active ? cfg.border : T.border}`, background: active ? cfg.soft : "transparent", display: "grid", placeItems: "center", transition: "all 0.15s" }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.background = cfg.soft; }}}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border;   e.currentTarget.style.background = "transparent"; }}}>
                        {active
                          ? <Check size={11} color={cfg.color} strokeWidth={2.5} />
                          : <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, opacity: 0.35 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, padding: "10px 14px", background: T.surface, borderRadius: 8, border: `1px solid ${T.border}` }}>
          {Object.entries(PERM_STATES).map(([, cfg]) => (
            <div key={cfg.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: cfg.soft, border: `1px solid ${cfg.border}`, display: "grid", placeItems: "center" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: T.muted, fontFamily: "'Barlow', sans-serif" }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={onSave}>Enregistrer</Btn>
        </div>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   SECTION ACTIVITÉS
───────────────────────────────────────────── */
const ActivitesSection = ({ activites, loading, error, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [nom, setNom] = useState("");
  const [couleur, setCouleur] = useState("#22c55e");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!nom.trim()) { setErr("Le nom est requis."); return; }
    setSaving(true); setErr("");
    await onAdd({ nom: nom.trim(), couleur });
    setNom(""); setCouleur("#22c55e"); setShowAdd(false); setSaving(false);
  };

  return (
    <>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.greenSoft, border: `1px solid ${T.greenBorder}`, display: "grid", placeItems: "center" }}>
              <Activity size={14} color={T.green} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: 0.5 }}>Gestion des activités</span>
            <Pill label={`${activites.length} activités`} color={T.green} soft={T.greenSoft} border={T.greenBorder} />
          </div>
          <Btn variant="success" size="sm" onClick={() => { setShowAdd(true); setErr(""); }}><Plus size={13} /> Ajouter</Btn>
        </div>

        {error && (
          <div style={{ margin: "12px 24px 0", background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: T.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem" }}>Chargement…</div>
        ) : activites.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.greenSoft, border: `1px solid ${T.greenBorder}`, display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
              <Activity size={20} color={T.green} />
            </div>
            <p style={{ color: T.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", margin: 0 }}>Aucune activité. Ajoutez-en une !</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, padding: 20 }}>
            {activites.map(act => <ActiviteCard key={act.idActivite} act={act} onDelete={onDelete} />)}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Nouvelle activité" onClose={() => setShowAdd(false)}>
          {err && (
            <div style={{ background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: "0.78rem", color: "#f87171", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={13} /> {err}
            </div>
          )}
          <Input label="Nom de l'activité" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Zumba, Pilates…" />
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.72rem", color: T.muted, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Barlow', sans-serif" }}>Couleur</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COULEURS.map(c => (
                <button key={c} onClick={() => setCouleur(c)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: c, border: couleur === c ? "2.5px solid #fff" : "2.5px solid transparent", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", transform: couleur === c ? "scale(1.18)" : "scale(1)", boxShadow: couleur === c ? `0 0 0 3px ${c}55` : "none" }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: couleur, flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: T.muted, fontFamily: "'Barlow', sans-serif" }}>{couleur}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Annuler</Btn>
            <Btn variant="primary" disabled={saving} onClick={handleAdd}>{saving ? "Ajout…" : "Ajouter"}</Btn>
          </div>
        </Modal>
      )}
    </>
  );
};

const ActiviteCard = ({ act, onDelete }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? T.cardHover : T.surface, border: `1px solid ${hov ? T.borderMid : T.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: act.couleur, flexShrink: 0 }} />
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: T.text, fontFamily: "'Barlow', sans-serif" }}>{act.nom}</span>
      </div>
      <button onClick={() => onDelete(act.idActivite)}
        style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4, borderRadius: 6, transition: "all 0.15s", display: "grid", placeItems: "center" }}
        onMouseEnter={e => { e.currentTarget.style.background = T.accentSoft; e.currentTarget.style.color = T.accent; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none";       e.currentTarget.style.color = T.muted;  }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────── */
export default function Parametres({ onPageChange }) {
  const navigate = useNavigate();
  injectStyles();

  const { toasts, push: toast }                            = useToast();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();

  const [roles,        setRoles]        = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions,  setPermissions]  = useState({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [activites,    setActivites]    = useState([]);
  const [loadingAct,   setLoadingAct]   = useState(true);
  const [errorAct,     setErrorAct]     = useState("");

  useEffect(() => { loadRoles(); loadActivites(); }, []);

  const loadRoles = async () => {
    try { setRoles(await window.electron.invoke("getRolesAvecCount")); }
    catch { toast("Erreur lors du chargement des rôles.", "error"); }
  };

  const handleAddRole = async (nom) => {
    try { await window.electron.invoke("addRole", { nom }); await loadRoles(); toast(`Rôle "${nom}" créé avec succès.`); }
    catch { toast("Erreur lors de l'ajout du rôle.", "error"); }
  };

  const handleDeleteRole = async (id, name) => {
    const ok = await confirm({
      title: "Supprimer le rôle",
      message: `Le rôle "${name}" sera définitivement supprimé. Les utilisateurs associés devront être réassignés.`,
      confirmLabel: "Supprimer", variant: "danger",
    });
    if (!ok) return;
    try {
      await window.electron.invoke("deleteRole", id);
      if (selectedRole?.id === id) setSelectedRole(null);
      await loadRoles();
      toast(`Rôle "${name}" supprimé.`);
    } catch { toast("Impossible de supprimer ce rôle (utilisateurs liés ?).", "error"); }
  };

  const handleOpenPerms = async (role) => {
    setSelectedRole(role); setLoadingPerms(true);
    try {
      const loaded = await window.electron.invoke("getPermissions", role.id);
      const defaults = Object.fromEntries(PERMISSIONS.map(p => [p.key, "autorise"]));
      setPermissions(prev => ({ ...prev, [role.id]: { ...defaults, ...loaded } }));
    } catch { toast("Erreur lors du chargement des permissions.", "error"); }
    finally { setLoadingPerms(false); }
  };

  const handlePermChange = (key, val) =>
    setPermissions(p => ({ ...p, [selectedRole.id]: { ...(p[selectedRole.id] || {}), [key]: val } }));

  const handleSavePerms = async () => {
    try {
      await window.electron.invoke("savePermissions", { role_id: selectedRole.id, permissions: permissions[selectedRole.id] || {} });
      toast(`Permissions de "${selectedRole.name}" sauvegardées.`);
      setSelectedRole(null);
    } catch { toast("Erreur lors de la sauvegarde.", "error"); }
  };

  const loadActivites = async () => {
    setLoadingAct(true);
    try { setActivites(await window.electron.invoke("getActivites")); }
    catch { setErrorAct("Impossible de charger les activités."); }
    finally { setLoadingAct(false); }
  };

  const handleAddActivite = async ({ nom, couleur }) => {
    try { await window.electron.invoke("addActivite", { nom, couleur }); await loadActivites(); toast(`Activité "${nom}" ajoutée.`); }
    catch { setErrorAct("Erreur lors de l'ajout."); }
  };

  const handleDeleteActivite = async (id) => {
    const act = activites.find(a => a.idActivite === id);
    const ok = await confirm({
      title: "Supprimer l'activité",
      message: `L'activité "${act?.nom ?? ""}" sera supprimée. Les séances liées perdront leur activité assignée.`,
      confirmLabel: "Supprimer", variant: "danger",
    });
    if (!ok) return;
    try { await window.electron.invoke("deleteActivite", id); await loadActivites(); toast(`Activité "${act?.nom}" supprimée.`); }
    catch { toast("Erreur lors de la suppression.", "error"); }
  };

  const totalUsers = roles.reduce((a, r) => a + r.users, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", backgroundImage: `url(${gym2})`, backgroundSize: "cover", backgroundPosition: "center 35%", backgroundAttachment: "fixed", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,11,13,0.78)", pointerEvents: "none", zIndex: 0 }} />

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gymBg})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,11,13,0.95) 0%, rgba(10,11,13,0.80) 60%, rgba(229,57,53,0.04) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: `linear-gradient(transparent, ${T.bg})` }} />
        <div style={{ position: "relative", padding: "28px 36px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "0.68rem", color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>FitManager</span>
            <ChevronRight size={11} color={T.muted} />
            <span style={{ fontSize: "0.68rem", color: T.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>Paramètres</span>
            <QuickActions navigate={navigate} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: "grid", placeItems: "center" }}>
              <Settings size={20} color={T.accent} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.8rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: T.text }}>Paramètres</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
            {[
              { n: roles.length,     label: "rôles",        color: T.accent },
              { n: totalUsers,       label: "utilisateurs", color: T.blue   },
              { n: activites.length, label: "activités",    color: T.green  },
            ].map(({ n, label, color }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ width: 1, height: 14, background: T.border }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "0.8rem", color: T.muted, fontFamily: "'Barlow', sans-serif" }}>
                    <strong style={{ color }}>{n}</strong> {label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 36px 48px", position: "relative", zIndex: 1 }}>
        {selectedRole && (
          <PermissionsEditor
            role={selectedRole} perms={permissions[selectedRole.id] || {}}
            onChange={handlePermChange} onSave={handleSavePerms}
            onClose={() => setSelectedRole(null)} loading={loadingPerms}
          />
        )}
        <div style={{ marginBottom: 24 }}>
          <RolesSection roles={roles} onOpenPerms={handleOpenPerms} onDeleteRole={handleDeleteRole} onAddRole={handleAddRole} />
        </div>
        <ActivitesSection activites={activites} loading={loadingAct} error={errorAct} onAdd={handleAddActivite} onDelete={handleDeleteActivite} />
      </div>

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        open={confirmState.open} title={confirmState.title}
        message={confirmState.message} confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant} onConfirm={handleConfirm} onCancel={handleCancel}
      />

      {/* TOASTS */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}