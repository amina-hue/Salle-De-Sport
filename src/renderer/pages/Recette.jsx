import React, { useState, useMemo } from "react";
import { Calendar, ChevronRight, ChevronLeft, Filter } from "lucide-react";
import Sidebar from "../components/Sidebar";
import gymBg from "../../images/gym1.png";
import "../../styles/recette.css";

// ── Couleur par rôle (avatars) ─────────────────────────────────────────────
const ROLE_COLORS = {
  Manager: { bg: "#1d4ed8" },
  Coach:   { bg: "#ea580c" },
  Admin:   { bg: "#7c3aed" },
  Client:  { bg: "#0f766e" },
};

// ── Données mock ───────────────────────────────────────────────────────────
const ALL_RECETTES = [
  { id: 1,  date: "2026-02-25", initials: "SM", role: "Manager", nom: "Sophie Martin",   description: "Abonnement Mensuel",   paiement: 1500, remise: 500, categorie: "Abonnement" },
  { id: 2,  date: "2026-02-24", initials: "LB", role: "Manager", nom: "Lucas Bernard",   description: "Abonnement Mensuel",   paiement: 1500, remise: 500, categorie: "Abonnement" },
  { id: 3,  date: "2026-02-23", initials: "ED", role: "Coach",   nom: "Emma Dubois",     description: "Bouteille d'eau",      paiement: 100,  remise: 0,   categorie: "Vente" },
  { id: 4,  date: "2026-02-20", initials: "TP", role: "Coach",   nom: "Thomas Petit",    description: "Protéine",             paiement: 2500, remise: 0,   categorie: "Vente" },
  { id: 5,  date: "2026-02-20", initials: "JM", role: "Manager", nom: "Julie Moreau",    description: "Abonnement Annuel",    paiement: 3000, remise: 500, categorie: "Abonnement" },
  { id: 6,  date: "2026-02-18", initials: "AL", role: "Manager", nom: "Antoine Laurent", description: "Protéine",             paiement: 2500, remise: 0,   categorie: "Vente" },
  { id: 7,  date: "2026-02-15", initials: "CR", role: "Manager", nom: "Camille Roux",    description: "Abonnement Mensuel",   paiement: 1500, remise: 500, categorie: "Abonnement" },
  { id: 8,  date: "2026-02-14", initials: "MN", role: "Admin",   nom: "Marc Nguyen",     description: "Abonnement Trimestriel",paiement: 4000, remise: 200, categorie: "Abonnement" },
  { id: 9,  date: "2026-02-12", initials: "AL", role: "Coach",   nom: "Amina Leroy",     description: "Gants de sport",      paiement: 800,  remise: 0,   categorie: "Vente" },
  { id: 10, date: "2026-02-10", initials: "PD", role: "Admin",   nom: "Paul Durand",     description: "Abonnement Annuel",   paiement: 8000, remise: 1000,categorie: "Abonnement" },
  { id: 11, date: "2026-02-08", initials: "SC", role: "Coach",   nom: "Sara Chevalier",  description: "Corde à sauter",      paiement: 500,  remise: 0,   categorie: "Vente" },
  { id: 12, date: "2026-02-05", initials: "KB", role: "Manager", nom: "Kevin Blanc",     description: "Abonnement Mensuel",  paiement: 1500, remise: 170, categorie: "Abonnement" },
  { id: 13, date: "2026-02-03", initials: "RD", role: "Client",  nom: "Rita Dupont",     description: "Tapis de fitness",    paiement: 3500, remise: 0,   categorie: "Vente" },
  { id: 14, date: "2026-02-01", initials: "HM", role: "Client",  nom: "Hugo Mercier",    description: "Abonnement Mensuel",  paiement: 1500, remise: 0,   categorie: "Abonnement" },
  { id: 15, date: "2026-01-28", initials: "LF", role: "Coach",   nom: "Léa Fontaine",    description: "Kettlebell 10kg",     paiement: 3200, remise: 0,   categorie: "Vente" },
  { id: 16, date: "2026-01-25", initials: "NB", role: "Manager", nom: "Nicolas Bonnet",  description: "Abonnement Annuel",   paiement: 8000, remise: 500, categorie: "Abonnement" },
  { id: 17, date: "2026-01-20", initials: "CM", role: "Client",  nom: "Chloé Martin",    description: "Barre de traction",   paiement: 4000, remise: 0,   categorie: "Vente" },
  { id: 18, date: "2026-01-18", initials: "AB", role: "Coach",   nom: "Ali Benali",      description: "Abonnement Mensuel",  paiement: 1500, remise: 170, categorie: "Abonnement" },
];

const PAGE_SIZE = 7;

const FORMAT_DATE = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

// ── Avatar ─────────────────────────────────────────────────────────────────
const Avatar = ({ initials, role }) => {
  const { bg } = ROLE_COLORS[role] || { bg: "#444" };
  return (
    <div className="recette-avatar" style={{ background: bg }}>
      {initials}
    </div>
  );
};

// ── Catégorie badge ────────────────────────────────────────────────────────
const CategorieBadge = ({ cat }) => (
  <span className={`cat-badge ${cat === "Abonnement" ? "cat-abo" : "cat-vente"}`}>
    {cat}
  </span>
);

// ── Composant principal ────────────────────────────────────────────────────
const Recette = () => {
  const [dateDebut,    setDateDebut]    = useState("");
  const [dateFin,      setDateFin]      = useState("");
  const [activeFilter, setActiveFilter] = useState({ debut: "", fin: "" });
  const [currentPage,  setCurrentPage]  = useState(1);

  // Applique le filtre seulement au clic sur "Filtrer"
  const handleFiltrer = () => {
    setActiveFilter({ debut: dateDebut, fin: dateFin });
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return ALL_RECETTES.filter((r) => {
      const d = new Date(r.date);
      const after  = activeFilter.debut ? d >= new Date(activeFilter.debut) : true;
      const before = activeFilter.fin   ? d <= new Date(activeFilter.fin)   : true;
      return after && before;
    });
  }, [activeFilter]);

  // ── Stats calculées sur les données filtrées ──
  const totalAbonnements = filtered
    .filter((r) => r.categorie === "Abonnement")
    .reduce((acc, r) => acc + r.paiement, 0);

  const totalVentes = filtered
    .filter((r) => r.categorie === "Vente")
    .reduce((acc, r) => acc + r.paiement, 0);

  const totalRemises = filtered.reduce((acc, r) => acc + r.remise, 0);
  const totalRecettes = totalAbonnements + totalVentes;

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getPages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, "...", totalPages];
    if (safePage >= totalPages - 2)
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  const hasActiveFilters = dateDebut || dateFin;
  
 const handleReset = () => {
  setActiveFilter({ debut: "", fin: "" }); // reset filtre appliqué
  setCurrentPage(1);
};

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="recette-page">
        {/* Fond image + overlay */}
        <div className="recette-bg" style={{ backgroundImage: `url(${gymBg})` }} />
        <div className="recette-overlay" />

        <div className="recette-content">

          {/* ── Titre centré ── */}
          <div className="recette-title-wrapper">
            <h1 className="recette-title">Recettes</h1>
          </div>

          {/* ── Section haute : filtre + stats ── */}
          <div className="recette-top">

            {/* Bloc filtre */}
            <div className="recette-filter-card">
              <p className="recette-filter-heading">Filtrer les recettes :</p>

              <div className="recette-filter-field">
                <label>Date Debut</label>
                <div className="recette-date-wrapper">
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="recette-date-input"
                  />
                  <Calendar size={15} color="#888" />
                </div>
              </div>

              <div className="recette-filter-field">
                <label>Date Fin</label>
                <div className="recette-date-wrapper">
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="recette-date-input"
                  />
                  <Calendar size={15} color="#888" />
                </div>
              </div>

              <button className="recette-filter-btn" onClick={handleFiltrer}>
                <Filter size={14} />
                Filtrer
              </button>
              {hasActiveFilters && (
  <button className="recette-reset-btn" onClick={handleReset}>
    Réinitialiser
  </button>
)}
            </div>

            {/* Bloc stats droite */}
            <div className="recette-stats-col">

              <div className="recette-stats-row">
                {/* Recette de la salle */}
                <div className="recette-stat-card recette-stat-salle">
                  <p className="rsc-title">Recette de la salle</p>
                  <p className="rsc-value">{totalAbonnements.toLocaleString("fr-FR")} DA</p>
                  <div className="rsc-detail">
                    <span>Total abonnement</span>
                    <span className="rsc-num">{filtered.filter(r => r.categorie === "Abonnement").length}</span>
                  </div>
                  <div className="rsc-detail">
                    <span className="rsc-remise-label">Remise</span>
                    <span className="rsc-remise-val">- {totalRemises.toLocaleString("fr-FR")} DA</span>
                  </div>
                  <div className="rsc-detail">
                    <span>Paiements encaissés</span>
                    <span className="rsc-num">{(totalAbonnements - totalRemises).toLocaleString("fr-FR")} DA</span>
                  </div>
                </div>

                {/* Recette du magasin */}
                <div className="recette-stat-card recette-stat-magasin">
                  <p className="rsc-title">Recette du magasin</p>
                  <p className="rsc-value">{totalVentes.toLocaleString("fr-FR")} DA</p>
                  <div className="rsc-detail">
                    <span>Produits vendus</span>
                    <span className="rsc-num">{filtered.filter(r => r.categorie === "Vente").length}</span>
                  </div>
                  <div className="rsc-detail">
                    <span>Tickets encaissés</span>
                    <span className="rsc-num">{totalVentes.toLocaleString("fr-FR")} DA</span>
                  </div>
                </div>
              </div>

              {/* Total des recettes */}
              <div className="recette-stat-total">
                <p className="rst-label">Total des recettes</p>
                <p className="rst-value">{totalRecettes.toLocaleString("fr-FR")} DA</p>
              </div>

            </div>
          </div>

          {/* ── Table ── */}
          <div className="recette-table-section">
            <h2 className="recette-table-title">Details des recettes :</h2>

            <table className="recette-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>NOM COMPLET</th>
                  <th>DESCRIPTION</th>
                  <th>PAIEMENT</th>
                  <th>REMISE</th>
                  <th>CATÉGORIE</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((r) => (
                    <tr key={r.id}>
                      <td className="rtd-date">{FORMAT_DATE(r.date)}</td>
                      <td>
                        <div className="recette-nom-cell">
                          <Avatar initials={r.initials} role={r.role} />
                          <span className="recette-nom-text">{r.nom}</span>
                        </div>
                      </td>
                      <td className="rtd-desc">{r.description}</td>
                      <td className="rtd-paiement">{r.paiement.toLocaleString("fr-FR")} DA</td>
                      <td className="rtd-remise">
                        {r.remise > 0 ? `${r.remise.toLocaleString("fr-FR")} DA` : "0 DA"}
                      </td>
                      <td>
                        <CategorieBadge cat={r.categorie} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="recette-empty">
                      Aucune recette pour cette période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="recette-pagination">
              <button
                className="page-nav"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft size={14} />
                Page précédente
              </button>

              <div className="page-numbers">
                <span className="page-info">Page {safePage}/{totalPages}</span>
                {getPages().map((page, idx) =>
                  page === "..." ? (
                    <button key={`d${idx}`} className="page-btn dots" disabled>…</button>
                  ) : (
                    <button
                      key={page}
                      className={`page-btn ${page === safePage ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                className="page-nav"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Page suivante
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* ── Barre résumé bas ── */}
          <div className="recette-footer-bar">
            <span>Total des recettes : {totalRecettes.toLocaleString("fr-FR")} DA</span>
            <span>Abonnements : {totalAbonnements.toLocaleString("fr-FR")} DA</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Recette;