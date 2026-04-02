import React, { useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, MoreHorizontal,
  Check, Clock, AlertCircle, Calendar, X, Users,
} from "lucide-react";
import gymBg from "../../images/gym1.png";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)", accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6", purple: "#7c3aed",
};

const ROLE_COLORS = {
  Manager: { bg: "#1d4ed8", ring: "rgba(29,78,216,0.35)" },
  Coach:   { bg: "#ea580c", ring: "rgba(234,88,12,0.35)" },
  Admin:   { bg: "#7c3aed", ring: "rgba(124,58,237,0.35)" },
};

const ALL_USERS = [
  { id: "#0001", initials: "SM", nom: "Sophie Martin",   abonnement: "Premium Mensuel",      role: "Manager", date: "2026-02-25", statut: "Payé" },
  { id: "#0002", initials: "LB", nom: "Lucas Bernard",   abonnement: "Standard Mensuel",     role: "Manager", date: "2026-02-24", statut: "Payé" },
  { id: "#0003", initials: "ED", nom: "Emma Dubois",     abonnement: "Premium Trimestriel",  role: "Coach",   date: "2026-02-23", statut: "En attente" },
  { id: "#0004", initials: "TP", nom: "Thomas Petit",    abonnement: "Standard Mensuel",     role: "Coach",   date: "2026-02-20", statut: "En retard" },
  { id: "#0005", initials: "JM", nom: "Julie Moreau",    abonnement: "Premium Annuel",       role: "Manager", date: "2026-02-20", statut: "Payé" },
  { id: "#0006", initials: "AL", nom: "Antoine Laurent", abonnement: "Standard Trimestriel", role: "Manager", date: "2026-02-18", statut: "Payé" },
  { id: "#0007", initials: "CR", nom: "Camille Roux",    abonnement: "Premium Mensuel",      role: "Manager", date: "2026-02-15", statut: "En retard" },
  { id: "#0008", initials: "MN", nom: "Marc Nguyen",     abonnement: "Standard Annuel",      role: "Admin",   date: "2026-02-10", statut: "En attente" },
];

const FORMAT_DATE = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const Avatar = ({ initials, role }) => {
  const { bg, ring } = ROLE_COLORS[role] || { bg: "#444", ring: "rgba(255,255,255,0.1)" };
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: bg, boxShadow: `0 0 0 2px ${ring}`,
      color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ statut }) => {
  const map = {
    "Payé":       { bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.2)",  icon: <Check size={11} /> },
    "En attente": { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", border: "rgba(245,158,11,0.2)", icon: <Clock size={11} /> },
    "En retard":  { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", border: "rgba(239,68,68,0.2)",  icon: <AlertCircle size={11} /> },
  };
  const s = map[statut] || map["Payé"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 600,
      whiteSpace: "nowrap", background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {s.icon}{statut}
    </span>
  );
};

const ActionBtn = ({ icon, danger, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (danger ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)") : "transparent",
        border: "none", color: hov ? (danger ? "#ef4444" : "#ccc") : "#555",
        borderRadius: 7, padding: "6px 7px", cursor: "pointer",
        display: "flex", alignItems: "center", transition: "all 0.15s",
      }}
    >
      {icon}
    </button>
  );
};

const Utilisateur = () => {
  const [search,       setSearch]       = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterRole,   setFilterRole]   = useState("");
  const [filterDate,   setFilterDate]   = useState("");

  const filtered = useMemo(() =>
    ALL_USERS.filter(u =>
      (search === ""        || u.nom.toLowerCase().includes(search.toLowerCase()))
   && (filterStatut === "" || u.statut === filterStatut)
   && (filterRole === ""   || u.role === filterRole)
   && (filterDate === ""   || u.date === filterDate)
    ), [search, filterStatut, filterRole, filterDate]);

  const hasActiveFilters = filterStatut || filterRole || filterDate;
  const resetFilters = () => { setSearch(""); setFilterStatut(""); setFilterRole(""); setFilterDate(""); };

  // ── Styles réutilisables ──
  const selectStyle = {
    background: "rgba(26,26,37,0.85)", border: `1px solid ${C.border}`,
    borderRadius: 8, color: "#ccc", padding: "7px 12px",
    fontSize: 13, outline: "none", cursor: "pointer",
    minWidth: 110, fontFamily: "inherit",
    appearance: "auto", backdropFilter: "blur(4px)",
  };
  const thStyle = {
    textAlign: "left", color: "#555", fontSize: 11,
    fontWeight: 600, letterSpacing: "0.08em", padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  };
  const tdStyle = { padding: "14px 16px", fontSize: 14, color: "#e0e0e0" };

  return (
    // ── Wrapper principal ──
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>

      {/* ── Background pleine page ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${gymBg})`,
        backgroundSize: "cover", backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.82)" }} />

      {/* ── Zone scrollable ── */}
      <div style={{
        position: "relative", zIndex: 2,
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: "32px 40px 40px",
        fontFamily: "'Barlow', sans-serif",
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ color: "#f9f1f1", fontSize: 32, fontWeight: 700, margin: "0 0 4px 0" }}>
              Gestion des utilisateurs
            </h1>
            <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
              {ALL_USERS.length} utilisateurs au total
            </p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "11px 20px", fontFamily: "inherit",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(229,57,53,0.35)",
          }}>
            <Plus size={16} /> Ajouter un utilisateur
          </button>
        </div>

        {/* Stat card */}
        <div style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #2D3832, #242227)",
          border: `1px solid rgba(255,255,255,0.09)`,
          borderRadius: 14, padding: "20px 24px",
          display: "inline-flex", alignItems: "center", gap: 20,
          minWidth: 220, backdropFilter: "blur(8px)",
        }}>
          <div>
            <p style={{ color: "#aaa", fontSize: 12, margin: "0 0 6px 0" }}>Nombre total d'utilisateurs</p>
            <p style={{ color: "#fff", fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>
              {ALL_USERS.length}
            </p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "rgba(16,185,129,0.2)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Check size={20} color="#10b981" strokeWidth={2.5} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <input
              type="text" placeholder="Rechercher par nom utilisateur..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", background: "rgba(26,26,37,0.85)",
                border: `1px solid ${C.border}`, borderRadius: 9,
                padding: "9px 14px", color: C.text,
                fontFamily: "inherit", fontSize: 13, outline: "none",
                boxSizing: "border-box", backdropFilter: "blur(4px)",
              }}
            />
          </div>

          {/* Statut */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#888", fontSize: 13, whiteSpace: "nowrap" }}>Statut :</span>
            <select style={selectStyle} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="">Tous</option>
              <option value="Payé">Payé</option>
              <option value="En attente">En attente</option>
              <option value="En retard">En retard</option>
            </select>
          </div>

          {/* Rôle */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#888", fontSize: 13, whiteSpace: "nowrap" }}>Rôle :</span>
            <select style={selectStyle} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Tous</option>
              <option value="Manager">Manager</option>
              <option value="Coach">Coach</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Date */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#888", fontSize: 13, whiteSpace: "nowrap" }}>Date :</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(26,26,37,0.85)", border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "6px 12px", backdropFilter: "blur(4px)",
            }}>
              <input
                type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                style={{ background: "none", border: "none", color: "#888", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer", colorScheme: "dark" }}
              />
              <Calendar size={14} color="#555" />
            </div>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button onClick={resetFilters} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              color: C.accent, borderRadius: 8, padding: "7px 14px",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>
              <X size={12} /> Réinitialiser
            </button>
          )}
        </div>

        {/* Légende rôles */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          {Object.entries(ROLE_COLORS).map(([role, { bg }]) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: bg, display: "block" }} />
              <span style={{ color: "#888", fontSize: 12, fontWeight: 500 }}>{role}</span>
            </div>
          ))}
        </div>

        {(search || hasActiveFilters) && (
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 12px 0" }}>
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Table */}
        <div style={{
          background: "rgba(15,15,20,0.6)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, overflow: "hidden", backdropFilter: "blur(10px)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ID", "NOM COMPLET", "ABONNEMENT", "RÔLE", "DATE", "STATUT", "ACTIONS"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ ...tdStyle, color: "#555", fontSize: 13 }}>{user.id}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={user.initials} role={user.role} />
                      <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>{user.nom}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: "#888", fontSize: 13 }}>{user.abonnement}</td>
                  <td style={{ ...tdStyle, color: C.accent, fontSize: 13, fontWeight: 600 }}>{user.role}</td>
                  <td style={{ ...tdStyle, color: "#888", fontSize: 13 }}>{FORMAT_DATE(user.date)}</td>
                  <td style={tdStyle}><StatusBadge statut={user.statut} /></td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ActionBtn icon={<Pencil size={15} />} />
                      <ActionBtn icon={<Trash2 size={15} />} danger />
                      <ActionBtn icon={<MoreHorizontal size={15} />} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: 14 }}>
                    Aucun utilisateur ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>{/* fin zone scrollable */}
    </div>
  );
};

export default Utilisateur;