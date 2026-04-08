import React, { useState, useEffect } from "react";
import { ChevronRight, Plus, Trash2, Shield, Check } from "lucide-react";
import gymBg from "../../images/Gymnastique.png";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

// ── Données initiales rôles ──────────────────────────────────────────────
const initialRoles = [
  { id: 1, name: "Admin",          users: 2 },
  { id: 2, name: "Manager",        users: 5 },
  { id: 3, name: "Receptionniste", users: 3 },
];

const permissionsList = [
  { key: "statistiques", label: "Accès Statistiques"       },
  { key: "adherents",    label: "Gestion des adhérents"    },
  { key: "abonnements",  label: "Gestion des abonnements"  },
  { key: "paiements",    label: "Gestion des paiements"    },
  { key: "planning",     label: "Gestion du planning"      },
  { key: "recette",      label: "Gestion de la recette"    },
  { key: "magasin",      label: "Gestion du magasin"       },
  { key: "utilisateur",  label: "Gestion des utilisateurs" },
];

const PERM_CONFIG = {
  autorise:    { label: "Autorisé",    color: C.green,  bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)"  },
  restreindre: { label: "Restreindre", color: C.gold,   bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  interdit:    { label: "Interdit",    color: C.accent, bg: C.accentDim,              border: C.accentBorder          },
};

// ── Couleurs disponibles pour les activités ──────────────────────────────
const COULEURS = [
  { label: "Vert",    value: "#22c55e" },
  { label: "Bleu",    value: "#3a7bd5" },
  { label: "Violet",  value: "#8b5cf6" },
  { label: "Rouge",   value: "#e63946" },
  { label: "Orange",  value: "#f59e0b" },
  { label: "Cyan",    value: "#06b6d4" },
  { label: "Rose",    value: "#ec4899" },
  { label: "Indigo",  value: "#6366f1" },
];

export default function Parametres({ onPageChange, onPermissionsChange }) {
  // ── Rôles ──
  const [roles, setRoles]               = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions]   = useState(() => {
    const saved = localStorage.getItem("appPermissions");
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(permissionsList.map(p => [p.key, "autorise"]));
  });
  const [showAddRole, setShowAddRole]   = useState(false);
  const [newRoleName, setNewRoleName]   = useState("");

  // ── Activités ──
  const [activites,     setActivites]     = useState([]);
  const [loadingActs,   setLoadingActs]   = useState(true);
  const [showAddAct,    setShowAddAct]    = useState(false);
  const [newActNom,     setNewActNom]     = useState("");
  const [newActCouleur, setNewActCouleur] = useState("#22c55e");
  const [savingAct,     setSavingAct]     = useState(false);
  const [errorAct,      setErrorAct]      = useState("");

  // ── Charger activités depuis MySQL ──
  useEffect(() => {
    loadActivites();
  }, []);

  const loadActivites = async () => {
    setLoadingActs(true);
    try {
      const data = await window.electron.invoke("getActivites");
      setActivites(data);
    } catch (err) {
      setErrorAct("Impossible de charger les activités.");
    } finally {
      setLoadingActs(false);
    }
  };

  // ── Ajouter une activité ──
  const handleAddActivite = async () => {
    if (!newActNom.trim()) { setErrorAct("Le nom est requis."); return; }
    setSavingAct(true);
    setErrorAct("");
    try {
      await window.electron.invoke("addActivite", {
        nom:     newActNom.trim(),
        couleur: newActCouleur,
      });
      setNewActNom("");
      setNewActCouleur("#22c55e");
      setShowAddAct(false);
      await loadActivites(); // recharger la liste
    } catch (err) {
      setErrorAct("Erreur lors de l'ajout de l'activité.");
    } finally {
      setSavingAct(false);
    }
  };

  // ── Supprimer une activité ──
  const handleDeleteActivite = async (id) => {
    if (!window.confirm("Supprimer cette activité ?")) return;
    try {
      await window.electron.invoke("deleteActivite", id);
      await loadActivites();
    } catch (err) {
      setErrorAct("Erreur lors de la suppression.");
    }
  };

  // ── Permissions ──
  useEffect(() => {
    localStorage.setItem("appPermissions", JSON.stringify(permissions));
    if (onPermissionsChange) onPermissionsChange(permissions);
  }, [permissions, onPermissionsChange]);

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      setRoles([...roles, { id: roles.length + 1, name: newRoleName, users: 0 }]);
      setNewRoleName(""); setShowAddRole(false);
    }
  };

  const handleSave = () => {
    alert(`Permissions sauvegardées pour ${selectedRole?.name}`);
    setSelectedRole(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* ── Hero Header ── */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gymBg})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />
        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Paramètres</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Paramètres
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: roles.length,                             label: "rôles",       color: C.muted },
                { count: roles.reduce((a, r) => a + r.users, 0),  label: "utilisateurs", color: C.blue  },
                { count: activites.length,                         label: "activités",   color: C.green },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>
                      <strong style={{ color }}>{count}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowAddRole(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,57,53,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.4)"; }}>
            <Plus size={17} /> Ajouter un rôle
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>

        {/* ══ SECTION RÔLES ══ */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ padding: "16px 24px 12px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Gestion des rôles
              <span style={{ marginLeft: 10, fontSize: "0.72rem", fontWeight: 600, background: C.accentDim, color: C.accent, padding: "2px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif" }}>
                {roles.length} rôles
              </span>
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["Rôle", "Utilisateurs", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id} style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.accentDim, border: `1.5px solid ${C.accentBorder}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Shield size={15} color={C.accent} />
                      </div>
                      <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{role.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 22px", color: C.subtle, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
                    {role.users} utilisateur{role.users !== 1 ? "s" : ""}
                  </td>
                  <td style={{ padding: "14px 22px" }}>
                    <button onClick={() => setSelectedRole(role)}
                      style={{ fontSize: "0.78rem", color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(229,57,53,0.22)"}
                      onMouseLeave={e => e.currentTarget.style.background = C.accentDim}>
                      Modifier permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permissions editor */}
        {selectedRole && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.3rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, margin: 0, color: C.text }}>Permissions —</h2>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.3rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: C.accent }}>{selectedRole.name}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {permissionsList.map(perm => {
                const currentVal = permissions[perm.key];
                return (
                  <div key={perm.key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: C.text, minWidth: 220 }}>{perm.label}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {Object.entries(PERM_CONFIG).map(([val, cfg]) => {
                        const isActive = currentVal === val;
                        return (
                          <button key={val} onClick={() => setPermissions(p => ({ ...p, [perm.key]: val }))}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 8, border: `1px solid ${isActive ? cfg.border : C.border}`, background: isActive ? cfg.bg : "transparent", color: isActive ? cfg.color : C.muted, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Barlow', sans-serif", transition: "all 0.15s" }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.color = cfg.color; }}}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}}>
                            {isActive && <Check size={12} />}
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setSelectedRole(null)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 22px", color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", cursor: "pointer" }}>Annuler</button>
              <button onClick={handleSave} style={{ background: C.accent, border: "none", borderRadius: 8, padding: "10px 26px", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(229,57,53,0.35)" }}>Enregistrer</button>
            </div>
          </div>
        )}

        {/* ══ SECTION ACTIVITÉS ══ */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Gestion des activités
              <span style={{ marginLeft: 10, fontSize: "0.72rem", fontWeight: 600, background: "rgba(34,197,94,0.12)", color: C.green, padding: "2px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif" }}>
                {activites.length} activités
              </span>
            </span>
            <button
              onClick={() => { setShowAddAct(true); setErrorAct(""); }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: C.accentDim, color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "7px 16px", fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(229,57,53,0.22)"}
              onMouseLeave={e => e.currentTarget.style.background = C.accentDim}>
              <Plus size={14} /> Ajouter
            </button>
          </div>

          {/* Erreur activités */}
          {errorAct && (
            <div style={{ margin: "12px 24px", background: "rgba(229,57,53,0.12)", border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem", color: "#f87171" }}>
              {errorAct}
            </div>
          )}

          {/* Liste activités */}
          {loadingActs ? (
            <div style={{ padding: "24px", textAlign: "center", color: C.muted, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
              Chargement...
            </div>
          ) : activites.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: C.muted, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
              Aucune activité. Ajoutez-en une !
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#14161c" }}>
                  {["Couleur", "Nom", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activites.map(act => (
                  <tr key={act.idActivite} style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 22px" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: act.couleur }} />
                    </td>
                    <td style={{ padding: "14px 22px" }}>
                      <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{act.nom}</span>
                    </td>
                    <td style={{ padding: "14px 22px" }}>
                      <button
                        onClick={() => handleDeleteActivite(act.idActivite)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", color: C.muted, cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", fontWeight: 600 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.color = C.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal Ajouter Rôle ── */}
      {showAddRole && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={e => e.target === e.currentTarget && setShowAddRole(false)}>
          <div style={{ background: "#1a1d24", border: `1px solid ${C.accentBorder}`, borderRadius: 14, padding: "28px 32px", maxWidth: 380, width: "100%", margin: "0 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase", color: C.text }}>Ajouter un rôle</h3>
            <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Nom du rôle"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, marginBottom: 20, color: C.text, background: "#14161c", border: `1px solid ${C.border}`, outline: "none", boxSizing: "border-box", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem" }}
              onFocus={e => e.target.style.borderColor = C.accentBorder}
              onBlur={e => e.target.style.borderColor = C.border} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowAddRole(false)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 20px", color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", cursor: "pointer" }}>Annuler</button>
              <button onClick={handleAddRole} style={{ background: C.accent, border: "none", borderRadius: 8, padding: "9px 22px", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Ajouter Activité ── */}
      {showAddAct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={e => e.target === e.currentTarget && setShowAddAct(false)}>
          <div style={{ background: "#1a1d24", border: `1px solid ${C.accentBorder}`, borderRadius: 14, padding: "28px 32px", maxWidth: 400, width: "100%", margin: "0 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase", color: C.text }}>
              Ajouter une activité
            </h3>

            {errorAct && (
              <div style={{ background: "rgba(229,57,53,0.12)", border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: "0.78rem", color: "#f87171" }}>
                {errorAct}
              </div>
            )}

            {/* Nom */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: "0.78rem", color: C.muted, fontWeight: 600, display: "block", marginBottom: 6, fontFamily: "'Barlow', sans-serif" }}>
                Nom de l'activité *
              </label>
              <input
                type="text" value={newActNom}
                onChange={e => setNewActNom(e.target.value)}
                placeholder="Ex: Zumba, Pilates..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, color: C.text, background: "#14161c", border: `1px solid ${C.border}`, outline: "none", boxSizing: "border-box", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem" }}
                onFocus={e => e.target.style.borderColor = C.accentBorder}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Couleur */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "0.78rem", color: C.muted, fontWeight: 600, display: "block", marginBottom: 10, fontFamily: "'Barlow', sans-serif" }}>
                Couleur *
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {COULEURS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNewActCouleur(c.value)}
                    title={c.label}
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: c.value, border: newActCouleur === c.value ? "3px solid #fff" : "3px solid transparent",
                      cursor: "pointer", transition: "transform 0.15s",
                      transform: newActCouleur === c.value ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: newActCouleur }} />
                <span style={{ fontSize: "0.78rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>{newActCouleur}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => { setShowAddAct(false); setErrorAct(""); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 20px", color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", cursor: "pointer" }}>
                Annuler
              </button>
              <button
                onClick={handleAddActivite}
                disabled={savingAct}
                style={{ background: savingAct ? "#7f1d1d" : C.accent, border: "none", borderRadius: 8, padding: "9px 22px", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: savingAct ? "not-allowed" : "pointer" }}>
                {savingAct ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}