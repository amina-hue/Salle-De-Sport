import React, { useState, useEffect, useMemo } from "react";
import { ChevronRight, Plus, Pencil, Trash2, Check, Clock, AlertCircle, Calendar, X, Users } from "lucide-react";
import gymBg from "../../images/gym1.png";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

// Couleur par rôle (dynamique)
const ROLE_BG = ["#1d4ed8", "#ea580c", "#7c3aed", "#0f766e", "#15803d", "#b45309"];
const getRoleColor = (idx) => ROLE_BG[idx % ROLE_BG.length];

const FORMAT_DATE = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ nom, prenom, colorIdx = 0 }) => {
  const initials = `${nom?.charAt(0) ?? "?"}${prenom?.charAt(0) ?? ""}`.toUpperCase();
  const bg = getRoleColor(colorIdx);
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: bg + "33", border: `1.5px solid ${bg}55`, fontFamily: "'Barlow Condensed', sans-serif", color: bg, fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

// ── Action Button ────────────────────────────────────────────────────────────
const ActionBtn = ({ icon, danger, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? (danger ? "rgba(229,57,53,0.12)" : "rgba(255,255,255,0.06)") : "transparent", border: "none", color: hov ? (danger ? C.accent : C.subtle) : C.muted, borderRadius: 7, padding: "6px 7px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}>
      {icon}
    </button>
  );
};

// ── Input style ──────────────────────────────────────────────────────────────
const inp = {
  width: "100%", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(229,57,53,0.45)", borderRadius: 7,
  padding: "11px 14px", color: "#f0f0f0",
  fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem",
  outline: "none", boxSizing: "border-box",
};

const lbl = {
  fontSize: "0.78rem", color: "#7a7f8e", fontWeight: 600,
  marginBottom: 5, display: "block", fontFamily: "'Barlow', sans-serif",
};

// ── Modal Ajouter Utilisateur ────────────────────────────────────────────────
function AddUserModal({ roles, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", motDePasse: "", role_id: roles[0]?.id ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim())   { setError("Nom et prénom sont requis.");      return; }
    if (!form.email.trim())                          { setError("L'email est requis.");             return; }
    if (!form.motDePasse.trim())                     { setError("Le mot de passe est requis.");     return; }
    if (!form.role_id)                               { setError("Veuillez sélectionner un rôle."); return; }

    setSaving(true); setError("");
    try {
      await window.electron.invoke("addUtilisateur", {
        nom:        form.nom.trim(),
        prenom:     form.prenom.trim(),
        email:      form.email.trim(),
        motDePasse: form.motDePasse.trim(),
        role_id:    parseInt(form.role_id),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.message?.includes("Duplicate") ? "Cet email existe déjà." : "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#1a1d24", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 16, width: "100%", maxWidth: 480, margin: "0 20px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)", fontFamily: "'Barlow', sans-serif" }}>

        {/* Header */}
        <div style={{ padding: "22px 26px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", margin: 0, color: C.text }}>
              Ajouter un utilisateur
            </h2>
            <p style={{ fontSize: "0.78rem", color: C.muted, margin: "4px 0 0" }}>
              Créer un nouveau compte utilisateur
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, cursor: "pointer" }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 26px 24px" }}>
          {error && (
            <div style={{ background: "rgba(229,57,53,0.12)", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Nom + Prénom */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Nom *</label>
              <input style={inp} value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Dupont" />
            </div>
            <div>
              <label style={lbl}>Prénom *</label>
              <input style={inp} value={form.prenom} onChange={e => set("prenom", e.target.value)} placeholder="Jean" />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Email *</label>
            <input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jean@fitmanager.com" />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Mot de passe *</label>
            <input style={inp} type="password" value={form.motDePasse} onChange={e => set("motDePasse", e.target.value)} placeholder="••••••••" />
          </div>

          {/* Rôle */}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Rôle *</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.role_id} onChange={e => set("role_id", e.target.value)}>
              <option value="">-- Sélectionner un rôle --</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 20px", color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", cursor: "pointer" }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ background: saving ? "#7f1d1d" : C.accent, border: "none", borderRadius: 8, padding: "9px 22px", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
              {saving ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
const Utilisateur = () => {
  const [users,       setUsers]       = useState([]);
  const [roles,       setRoles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showModal,   setShowModal]   = useState(false);

  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState("");

  // ── Charger données ──
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const [u, r] = await Promise.all([
        window.electron.invoke("getUtilisateurs"),
        window.electron.invoke("getRoles"),
      ]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  // ── Supprimer ──
  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer ${nom} ?`)) return;
    try {
      await window.electron.invoke("deleteUtilisateur", id);
      await loadData();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  // ── Filtrage ──
  const filtered = useMemo(() =>
    users.filter(u =>
      (!search     || `${u.nom} ${u.prenom}`.toLowerCase().includes(search.toLowerCase())) &&
      (!filterRole || u.roleNom === filterRole)
    ), [users, search, filterRole]);

  const selectStyle = {
    background: "#14161c", border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.subtle, padding: "8px 12px", fontSize: "0.82rem",
    outline: "none", cursor: "pointer", minWidth: 110,
    fontFamily: "'Barlow', sans-serif", appearance: "auto",
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
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Utilisateurs</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Gestion des utilisateurs
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: users.length, label: "au total", color: C.muted },
                { count: users.filter(u => u.roleNom === "coach").length,   label: "coachs",         color: "#ea580c" },
                { count: users.filter(u => u.roleNom === "admin").length,   label: "admins",         color: "#7c3aed" },
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

          <button onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,57,53,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.4)"; }}>
            <Plus size={17} /> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 12, padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <input type="text" placeholder="Rechercher par nom..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 14px", color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accentBorder}
            onBlur={e => e.target.style.borderColor = C.border} />
        </div>

        {/* Filtre rôle dynamique */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif" }}>Rôle :</span>
          <select style={selectStyle} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">Tous</option>
            {roles.map(r => <option key={r.id} value={r.nom}>{r.nom}</option>)}
          </select>
        </div>

        {(search || filterRole) && (
          <button onClick={() => { setSearch(""); setFilterRole(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, borderRadius: 8, padding: "7px 14px", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
            <X size={12} /> Réinitialiser
          </button>
        )}

        <div style={{ marginLeft: "auto", fontSize: "0.78rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 36px 40px" }}>

        {/* Stat card */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg,#2D3832,#242227)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "16px 22px", display: "inline-flex", alignItems: "center", gap: 16 }}>
            <div>
              <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Total utilisateurs</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "2rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>{users.length}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users size={18} color={C.green} />
            </div>
          </div>

          {/* Légende rôles dynamique */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {roles.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: getRoleColor(i), display: "block" }} />
                <span style={{ color: C.muted, fontSize: "0.78rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{r.nom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ background: "rgba(229,57,53,0.12)", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 16, color: "#f87171", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["ID", "Nom complet", "Email", "Rôle", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontFamily: "'Barlow', sans-serif" }}>Chargement...</td></tr>
              ) : filtered.length > 0 ? filtered.map((user, idx) => (
                <tr key={user.idUtilisateur} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 22px", color: C.muted, fontSize: "0.72rem", fontFamily: "monospace" }}>
                    #{String(user.idUtilisateur).padStart(4, "0")}
                  </td>
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar nom={user.nom} prenom={user.prenom} colorIdx={roles.findIndex(r => r.nom === user.roleNom)} />
                      <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>
                        {user.nom} {user.prenom}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 22px", color: C.subtle, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "14px 22px" }}>
                    <span style={{
                      fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Barlow', sans-serif",
                      color: getRoleColor(roles.findIndex(r => r.nom === user.roleNom)),
                      background: getRoleColor(roles.findIndex(r => r.nom === user.roleNom)) + "22",
                      padding: "4px 10px", borderRadius: 8,
                    }}>
                      {user.roleNom}
                    </span>
                  </td>
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ActionBtn icon={<Trash2 size={15} />} danger onClick={() => handleDelete(user.idUtilisateur, `${user.nom} ${user.prenom}`)} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddUserModal
          roles={roles}
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}
    </div>
  );
};

export default Utilisateur;