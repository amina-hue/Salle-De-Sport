// import React, { useState } from "react";
// import { Plus } from "lucide-react";
// import Button from "../components/AddButton";
// import SearchInput from "../components/Searchinput";
// import "../../styles/magasin.css"; // adapte selon ta structure

// // ── Données mock ───────────────────────────────────────────────────────────
// const ALL_PRODUCTS = [
//   { id: 1,  nom: "Haltères simples (5kg)",  reference: "ALG001", stock: 40, prix: "5000 DZD",  categorie: "Musculation" },
//   { id: 2,  nom: "Tapis de fitness",         reference: "ALG002", stock: 25, prix: "3500 DZD",  categorie: "Accessoire" },
//   { id: 3,  nom: "Bande élastique",          reference: "ALG003", stock: 30, prix: "3000 DZD",  categorie: "Musculation" },
//   { id: 4,  nom: "Barre de traction",        reference: "ALG004", stock: 20, prix: "4000 DZD",  categorie: "Musculation" },
//   { id: 5,  nom: "Corde à sauter",           reference: "ALG005", stock: 15, prix: "2000 DZD",  categorie: "Cardio / Accessoire" },
//   { id: 6,  nom: "Banc de musculation",      reference: "ALG006", stock: 8,  prix: "12000 DZD", categorie: "Musculation" },
//   { id: 7,  nom: "Gants de sport",           reference: "ALG007", stock: 50, prix: "1500 DZD",  categorie: "Accessoire" },
//   { id: 8,  nom: "Kettlebell 10kg",          reference: "ALG008", stock: 22, prix: "6000 DZD",  categorie: "Musculation" },
//   { id: 9,  nom: "Vélo d'appartement",       reference: "ALG009", stock: 5,  prix: "35000 DZD", categorie: "Cardio" },
//   { id: 10, nom: "Tapis de course",          reference: "ALG010", stock: 3,  prix: "55000 DZD", categorie: "Cardio" },
//   { id: 11, nom: "Barre olympique 20kg",     reference: "ALG011", stock: 12, prix: "18000 DZD", categorie: "Musculation" },
//   { id: 12, nom: "Disque de fonte 5kg",      reference: "ALG012", stock: 60, prix: "2500 DZD",  categorie: "Musculation" },
//   { id: 13, nom: "Tapis yoga 6mm",           reference: "ALG013", stock: 35, prix: "1800 DZD",  categorie: "Accessoire" },
//   { id: 14, nom: "Chronomètre sport",        reference: "ALG014", stock: 18, prix: "900 DZD",   categorie: "Accessoire" },
//   { id: 15, nom: "Rameur hydraulique",       reference: "ALG015", stock: 4,  prix: "42000 DZD", categorie: "Cardio" },
// ];

// const PAGE_SIZE = 5;

// // ── Stat card ──────────────────────────────────────────────────────────────
// const MagasinStatCard = ({ title, value, subtitle }) => (
//   <div className="magasin-stat-card">
//     <p className="magasin-stat-label">{title}</p>
//     <p className="magasin-stat-value">{value}</p>
//     <p className="magasin-stat-sub">{subtitle}</p>
//   </div>
// );

// // ── Composant principal ────────────────────────────────────────────────────
// const Magasin = () => {
//   const [search, setSearch]           = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   // Filtrage en temps réel
//   const filtered = ALL_PRODUCTS.filter((p) => {
//     const q = search.toLowerCase();
//     return (
//       p.nom.toLowerCase().includes(q) ||
//       p.reference.toLowerCase().includes(q) ||
//       p.categorie.toLowerCase().includes(q)
//     );
//   });

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const safePage   = Math.min(currentPage, totalPages);
//   const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

//   const handleSearch = (val) => {
//     setSearch(val);
//     setCurrentPage(1);
//   };

//   const getPages = () => {
//     if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
//     if (safePage <= 3)   return [1, 2, 3, 4, "...", totalPages];
//     if (safePage >= totalPages - 2)
//       return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//     return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
//   };

//   return (
//     <div className="magasin-page">
//       <div className="magasin-bg" />

//       <div className="magasin-content">
//         <h1 className="magasin-title">Magasin</h1>

//         {/* Stat cards */}
//         <div className="magasin-stats">
//           <MagasinStatCard title="Produits" value={ALL_PRODUCTS.length} subtitle="Articles" />
//           <MagasinStatCard title="Achats"   value="304"                 subtitle="Achats" />
//           <MagasinStatCard title="Ventes"   value="503"                 subtitle="Ventes" />
//         </div>

//         {/* Table section */}
//         <div className="magasin-table-section">
//           <div className="magasin-table-header">
//             <h2 className="magasin-table-title">Liste des produits</h2>
//             <div className="magasin-table-actions">
//               <SearchInput
//                 value={search}
//                 onChange={handleSearch}
//                 placeholder="Rechercher un produit..."
//               />
//               <Button variant="primary" icon={Plus}>
//                 Ajouter un produit
//               </Button>
//             </div>
//           </div>

//           <table className="magasin-table">
//             <thead>
//               <tr>
//                 <th>NOM</th>
//                 <th>RÉFÉRENCE</th>
//                 <th>STOCK</th>
//                 <th>PRIX</th>
//                 <th>CATÉGORIE</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginated.length > 0 ? (
//                 paginated.map((p) => (
//                   <tr key={p.id}>
//                     <td>{p.nom}</td>
//                     <td className="ref">{p.reference}</td>
//                     <td>{p.stock}</td>
//                     <td className="prix">{p.prix}</td>
//                     <td>{p.categorie}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="magasin-empty">
//                     Aucun produit trouvé pour « {search} »
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="magasin-pagination">
//               <button
//                 className="page-nav"
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 disabled={safePage === 1}
//               >
//                 {"< Précédent"}
//               </button>

//               {getPages().map((page, idx) =>
//                 page === "..." ? (
//                   <button key={`dots-${idx}`} className="page-btn dots" disabled>
//                     …
//                   </button>
//                 ) : (
//                   <button
//                     key={page}
//                     className={`page-btn ${page === safePage ? "active" : ""}`}
//                     onClick={() => setCurrentPage(page)}
//                   >
//                     {page}
//                   </button>
//                 )
//               )}

//               <button
//                 className="page-nav"
//                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={safePage === totalPages}
//               >
//                 {"Suivant >"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Magasin;




import React, { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../components/AddButton";
import SearchInput from "../components/Searchinput";
import Sidebar from "../components/Sidebar";
import gymBg from "../../images/gym1.png"; // ← mets le chemin exact de ton image
import "../../styles/magasin.css";

// ── Données mock ───────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id: 1,  nom: "Haltères simples (5kg)",  reference: "ALG001", stock: 40, prix: "5000 DZD",  categorie: "Musculation" },
  { id: 2,  nom: "Tapis de fitness",         reference: "ALG002", stock: 25, prix: "3500 DZD",  categorie: "Accessoire" },
  { id: 3,  nom: "Bande élastique",          reference: "ALG003", stock: 30, prix: "3000 DZD",  categorie: "Musculation" },
  { id: 4,  nom: "Barre de traction",        reference: "ALG004", stock: 20, prix: "4000 DZD",  categorie: "Musculation" },
  { id: 5,  nom: "Corde à sauter",           reference: "ALG005", stock: 15, prix: "2000 DZD",  categorie: "Cardio / Accessoire" },
  { id: 6,  nom: "Banc de musculation",      reference: "ALG006", stock: 8,  prix: "12000 DZD", categorie: "Musculation" },
  { id: 7,  nom: "Gants de sport",           reference: "ALG007", stock: 50, prix: "1500 DZD",  categorie: "Accessoire" },
  { id: 8,  nom: "Kettlebell 10kg",          reference: "ALG008", stock: 22, prix: "6000 DZD",  categorie: "Musculation" },
  { id: 9,  nom: "Vélo d'appartement",       reference: "ALG009", stock: 5,  prix: "35000 DZD", categorie: "Cardio" },
  { id: 10, nom: "Tapis de course",          reference: "ALG010", stock: 3,  prix: "55000 DZD", categorie: "Cardio" },
  { id: 11, nom: "Barre olympique 20kg",     reference: "ALG011", stock: 12, prix: "18000 DZD", categorie: "Musculation" },
  { id: 12, nom: "Disque de fonte 5kg",      reference: "ALG012", stock: 60, prix: "2500 DZD",  categorie: "Musculation" },
  { id: 13, nom: "Tapis yoga 6mm",           reference: "ALG013", stock: 35, prix: "1800 DZD",  categorie: "Accessoire" },
  { id: 14, nom: "Chronomètre sport",        reference: "ALG014", stock: 18, prix: "900 DZD",   categorie: "Accessoire" },
  { id: 15, nom: "Rameur hydraulique",       reference: "ALG015", stock: 4,  prix: "42000 DZD", categorie: "Cardio" },
];

const PAGE_SIZE = 5;

// ── Stat card ──────────────────────────────────────────────────────────────
const MagasinStatCard = ({ title, value, subtitle }) => (
  <div className="magasin-stat-card">
    <p className="magasin-stat-label">{title}</p>
    <p className="magasin-stat-value">{value}</p>
    <p className="magasin-stat-sub">{subtitle}</p>
  </div>
);

// ── Composant principal ────────────────────────────────────────────────────
const Magasin = () => {
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = ALL_PRODUCTS.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nom.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      p.categorie.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const getPages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, "...", totalPages];
    if (safePage >= totalPages - 2)
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  return (
    /* ── Layout racine : sidebar + page ── */
    <div className="app-layout">
      <Sidebar />

      {/* ── Zone principale ── */}
      <div className="magasin-page">

        {/* Image de fond réelle */}
        <div
          className="magasin-bg"
          style={{ backgroundImage: `url(${gymBg})` }}
        />
        {/* Overlay noir semi-transparent */}
        <div className="magasin-overlay" />

        <div className="magasin-content">
          <h1 className="magasin-title">Magasin</h1>

          {/* Stat cards */}
          <div className="magasin-stats">
            <MagasinStatCard title="Produits" value={ALL_PRODUCTS.length} subtitle="Articles" />
            <MagasinStatCard title="Achats"   value="304"                 subtitle="Achats" />
            <MagasinStatCard title="Ventes"   value="503"                 subtitle="Ventes" />
          </div>

          {/* Table section */}
          <div className="magasin-table-section">
            <div className="magasin-table-header">
              <h2 className="magasin-table-title">Liste des produits</h2>
              <div className="magasin-table-actions">
                <SearchInput
                  value={search}
                  onChange={handleSearch}
                  placeholder="Rechercher un produit..."
                />
                <Button variant="primary" icon={Plus}>
                  Ajouter un produit
                </Button>
              </div>
            </div>

            <table className="magasin-table">
              <thead>
                <tr>
                  <th>NOM</th>
                  <th>RÉFÉRENCE</th>
                  <th>STOCK</th>
                  <th>PRIX</th>
                  <th>CATÉGORIE</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nom}</td>
                      <td className="ref">{p.reference}</td>
                      <td>{p.stock}</td>
                      <td className="prix">{p.prix}</td>
                      <td>{p.categorie}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="magasin-empty">
                      Aucun produit trouvé pour « {search} »
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="magasin-pagination">
                <button
                  className="page-nav"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  {"< Précédent"}
                </button>

                {getPages().map((page, idx) =>
                  page === "..." ? (
                    <button key={`dots-${idx}`} className="page-btn dots" disabled>…</button>
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

                <button
                  className="page-nav"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  {"Suivant >"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Magasin;