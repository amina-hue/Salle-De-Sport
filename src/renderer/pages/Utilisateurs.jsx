import React, { useState, useMemo } from "react";
import { ChevronRight, Plus, Pencil, Trash2, MoreHorizontal, Check, Clock, AlertCircle, Calendar, X, Users } from "lucide-react";
import gymBg from "../../images/gym1.png";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

const ROLE_COLORS = {
  Manager: { bg: "#1d4ed8", ring: "rgba(29,78,216,0.35)" },
  Coach:   { bg: "#ea580c", ring: "rgba(234,88,12,0.35)"  },
  Admin:   { bg: "#7c3aed", ring: "rgba(124,58,237,0.35)" },
};

const ALL_USERS = [
  { id: "#0001", initials: "SM", nom: "Sophie Martin",   abonnement: "Premium Mensuel",      role: "Manager", date: "2026-02-25", statut: "Payé"       },
  { id: "#0002", initials: "LB", nom: "Lucas Bernard",   abonnement: "Standard Mensuel",     role: "Manager", date: "2026-02-24", statut: "Payé"       },
  { id: "#0003", initials: "ED", nom: "Emma Dubois",     abonnement: "Premium Trimestriel",  role: "Coach",   date: "2026-02-23", statut: "En attente" },
  { id: "#0004", initials: "TP", nom: "Thomas Petit",    abonnement: "Standard Mensuel",     role: "Coach",   date: "2026-02-20", statut: "En retard"  },
  { id: "#0005", initials: "JM", nom: "Julie Moreau",    abonnement: "Premium Annuel",       role: "Manager", date: "2026-02-20", statut: "Payé"       },
  { id: "#0006", initials: "AL", nom: "Antoine Laurent", abonnement: "Standard Trimestriel", role: "Manager", date: "2026-02-18", statut: "Payé"       },
  { id: "#0007", initials: "CR", nom: "Camille Roux",    abonnement: "Premium Mensuel",      role: "Manager", date: "2026-02-15", statut: "En retard"  },
  { id: "#0008", initials: "MN", nom: "Marc Nguyen",     abonnement: "Standard Annuel",      role: "Admin",   date: "2026-02-10", statut: "En attente" },
];

const FORMAT_DATE = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const Avatar = ({ initials, role }) => {
  const { bg, ring } = ROLE_COLORS[role] || { bg: "#444", ring: "rgba(255,255,255,0.1)" };
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: bg + "33", border: `1.5px solid ${bg}55`, boxShadow: `0 0 0 2px ${ring}`, fontFamily: "'Barlow Condensed', sans-serif", color: bg, fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ statut }) => {
  const map = {
    "Payé":       { bg: "rgba(34,197,94,0.12)",   color: C.green,  border: "rgba(34,197,94,0.25)",   icon: <Check size={11} /> },
    "En attente": { bg: "rgba(245,158,11,0.12)",   color: C.gold,   border: "rgba(245,158,11,0.25)",  icon: <Clock size={11} /> },
    "En retard":  { bg: "rgba(229,57,53,0.12)",    color: C.accent, border: "rgba(229,57,53,0.25)",   icon: <AlertCircle size={11} /> },
  };
  const s = map[statut] || map["Payé"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 20, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Barlow', sans-serif", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.icon}{statut}
    </span>
  );
};

const ActionBtn = ({ icon, danger, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? (danger ? "rgba(229,57,53,0.12)" : "rgba(255,255,255,0.06)") : "transparent", border: "none", color: hov ? (danger ? C.accent : C.subtle) : C.muted, borderRadius: 7, padding: "6px 7px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}>
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

  const activeCount  = ALL_USERS.filter(u => u.statut === "Payé").length;
  const managerCount = ALL_USERS.filter(u => u.role === "Manager").length;

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
                { count: ALL_USERS.length, label: "au total",   color: C.muted  },
                { count: activeCount,      label: "actifs",     color: C.green  },
                { count: managerCount,     label: "managers",   color: C.blue   },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}><strong style={{ color }}>{count}</strong> {label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <button style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,57,53,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.4)"; }}>
            <Plus size={17} /> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 12, padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <input type="text" placeholder="Rechercher par nom..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 14px", color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accentBorder}
            onBlur={e => e.target.style.borderColor = C.border} />
        </div>

        {/* Statut */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap" }}>Statut :</span>
          <select style={selectStyle} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="">Tous</option>
            <option value="Payé">Payé</option>
            <option value="En attente">En attente</option>
            <option value="En retard">En retard</option>
          </select>
        </div>

        {/* Rôle */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap" }}>Rôle :</span>
          <select style={selectStyle} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">Tous</option>
            <option value="Manager">Manager</option>
            <option value="Coach">Coach</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap" }}>Date :</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#14161c", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px" }}>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ background: "none", border: "none", color: C.subtle, fontSize: "0.82rem", outline: "none", fontFamily: "'Barlow', sans-serif", cursor: "pointer", colorScheme: "dark" }} />
            <Calendar size={14} color={C.muted} />
          </div>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button onClick={resetFilters} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, borderRadius: 8, padding: "7px 14px", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
            <X size={12} /> Réinitialiser
          </button>
        )}

        <div style={{ marginLeft: "auto", fontSize: "0.78rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 36px 40px" }}>

        {/* Stat card + légende rôles */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg,#2D3832,#242227)", border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 14, padding: "16px 22px", display: "inline-flex", alignItems: "center", gap: 16 }}>
            <div>
              <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Total utilisateurs</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "2rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>{ALL_USERS.length}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users size={18} color={C.green} />
            </div>
          </div>

          {/* Légende rôles */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {Object.entries(ROLE_COLORS).map(([role, { bg }]) => (
              <div key={role} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: bg, display: "block" }} />
                <span style={{ color: C.muted, fontSize: "0.78rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["ID", "Nom complet", "Abonnement", "Rôle", "Date", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 22px", color: C.muted, fontSize: "0.72rem", fontFamily: "monospace" }}>{user.id}</td>
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={user.initials} role={user.role} />
                      <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{user.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 22px", color: C.subtle, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif" }}>{user.abonnement}</td>
                  <td style={{ padding: "14px 22px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Barlow', sans-serif", color: (ROLE_COLORS[user.role]?.bg ?? C.muted), background: (ROLE_COLORS[user.role]?.bg ?? "#444") + "22", padding: "4px 10px", borderRadius: 8 }}>{user.role}</span>
                  </td>
                  <td style={{ padding: "14px 22px", color: C.muted, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif" }}>{FORMAT_DATE(user.date)}</td>
                  <td style={{ padding: "14px 22px" }}><StatusBadge statut={user.statut} /></td>
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ActionBtn icon={<Pencil size={15} />} />
                      <ActionBtn icon={<Trash2 size={15} />} danger />
                      <ActionBtn icon={<MoreHorizontal size={15} />} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
                    Aucun utilisateur ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Utilisateur;