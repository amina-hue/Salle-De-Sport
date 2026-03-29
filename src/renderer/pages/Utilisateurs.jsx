import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal, Check, Clock, AlertCircle, Calendar, X } from "lucide-react";
import Button from "../components/AddButton";
import SearchInput from "../components/Searchinput";
import gymBg from "../../images/gym1.png";
import "../../styles/utilisateurs.css";

const ROLE_COLORS = {
  Manager: { bg: "#1d4ed8", ring: "rgba(29,78,216,0.35)" },
  Coach:   { bg: "#ea580c", ring: "rgba(234,88,12,0.35)"  },
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

const FORMAT_DATE = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const StatusBadge = ({ statut }) => {
  const map = {
    "Payé":       { cls: "paye",    icon: <Check size={11} /> },
    "En attente": { cls: "attente", icon: <Clock size={11} /> },
    "En retard":  { cls: "retard",  icon: <AlertCircle size={11} /> },
  };
  const cfg = map[statut] || map["Payé"];
  return <span className={`status-badge ${cfg.cls}`}>{cfg.icon}{statut}</span>;
};

const Avatar = ({ initials, role }) => {
  const { bg, ring } = ROLE_COLORS[role] || { bg: "#444", ring: "rgba(255,255,255,0.1)" };
  return <div className="avatar" style={{ background: bg, boxShadow: `0 0 0 2px ${ring}` }}>{initials}</div>;
};

const ActionBtn = ({ icon, danger }) => (
  <button className={`action-btn ${danger ? "danger" : ""}`}>{icon}</button>
);

const Utilisateur = () => {
  const [search,       setSearch]       = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterRole,   setFilterRole]   = useState("");
  const [filterDate,   setFilterDate]   = useState("");

  const filtered = useMemo(() => ALL_USERS.filter(u => {
    return (search === ""       || u.nom.toLowerCase().includes(search.toLowerCase()))
        && (filterStatut === "" || u.statut === filterStatut)
        && (filterRole === ""   || u.role === filterRole)
        && (filterDate === ""   || u.date === filterDate);
  }), [search, filterStatut, filterRole, filterDate]);

  const hasActiveFilters = filterStatut || filterRole || filterDate;
  const resetFilters = () => { setSearch(""); setFilterStatut(""); setFilterRole(""); setFilterDate(""); };

  return (
    <div className="utilisateur-page" style={{ flex: 1, height: "100%", overflowY: "auto" }}>
      <div className="utilisateur-bg" style={{ backgroundImage: `url(${gymBg})` }} />
      <div className="utilisateur-overlay" />

      <div className="utilisateur-content">

        {/* Header */}
        <div className="utilisateur-header">
          <div>
            <h1 className="utilisateur-title">Gestion des utilisateurs</h1>
            <p className="utilisateur-subtitle">8 transactions ce mois-ci</p>
          </div>
          <Button variant="primary" icon={Plus}>Ajouter un utilisateur</Button>
        </div>

        {/* Stat card */}
        <div className="utilisateur-stat-card">
          <div>
            <p className="utilisateur-stat-label">Nombre total d'utilisateurs</p>
            <p className="utilisateur-stat-value">{ALL_USERS.length}</p>
          </div>
          <div className="utilisateur-stat-icon">
            <Check size={20} color="#10b981" strokeWidth={2.5} />
          </div>
        </div>

        {/* Filters */}
        <div className="utilisateur-filters">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par nom utilisateur..." />
          <div className="filter-group">
            <span className="filter-label">Statut :</span>
            <select className="filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="">Tous</option>
              <option value="Payé">Payé</option>
              <option value="En attente">En attente</option>
              <option value="En retard">En retard</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">Role :</span>
            <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Tous</option>
              <option value="Manager">Manager</option>
              <option value="Coach">Coach</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="filter-group">
            <span className="filter-label">Date :</span>
            <div className="filter-date-wrapper">
              <input type="date" className="filter-date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              <Calendar size={14} color="#555" />
            </div>
          </div>
          {hasActiveFilters && (
            <button className="reset-filters-btn" onClick={resetFilters}>
              <X size={12} style={{ display: "inline", marginRight: 4 }} /> Réinitialiser
            </button>
          )}
        </div>

        {/* Role legend */}
        <div className="role-legend">
          {Object.entries(ROLE_COLORS).map(([role, { bg }]) => (
            <div key={role} className="role-legend-item">
              <span className="role-legend-dot" style={{ background: bg }} />
              <span className="role-legend-label">{role}</span>
            </div>
          ))}
        </div>

        {(search || hasActiveFilters) && (
          <p className="utilisateur-results-count">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}</p>
        )}

        {/* Table */}
        <div className="utilisateur-table-wrapper">
          <table className="utilisateur-table">
            <thead>
              <tr>
                <th>ID</th><th>NOM COMPLET</th><th>EMAIL</th><th>ROLE</th><th>DATE</th><th>STATUT</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(user => (
                <tr key={user.id}>
                  <td className="id-cell">{user.id}</td>
                  <td><div className="nom-cell"><Avatar initials={user.initials} role={user.role} /><span className="nom-text">{user.nom}</span></div></td>
                  <td className="email-cell">{user.abonnement}</td>
                  <td className="role-cell">{user.role}</td>
                  <td className="date-cell">{FORMAT_DATE(user.date)}</td>
                  <td><StatusBadge statut={user.statut} /></td>
                  <td>
                    <div className="action-buttons">
                      <ActionBtn icon={<Pencil size={15} />} />
                      <ActionBtn icon={<Trash2 size={15} />} danger />
                      <ActionBtn icon={<MoreHorizontal size={15} />} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="utilisateur-empty">Aucun utilisateur ne correspond aux filtres sélectionnés.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Utilisateur;