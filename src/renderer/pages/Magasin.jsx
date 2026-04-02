import React, { useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import gymBg from "../../images/gym1.png";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

const ALL_PRODUCTS = [
  { id: 1,  nom: "Haltères simples (5kg)", reference: "ALG001", stock: 40, prix: "5 000 DZD",  categorie: "Musculation"          },
  { id: 2,  nom: "Tapis de fitness",        reference: "ALG002", stock: 25, prix: "3 500 DZD",  categorie: "Accessoire"           },
  { id: 3,  nom: "Bande élastique",         reference: "ALG003", stock: 30, prix: "3 000 DZD",  categorie: "Musculation"          },
  { id: 4,  nom: "Barre de traction",       reference: "ALG004", stock: 20, prix: "4 000 DZD",  categorie: "Musculation"          },
  { id: 5,  nom: "Corde à sauter",          reference: "ALG005", stock: 15, prix: "2 000 DZD",  categorie: "Cardio / Accessoire"  },
  { id: 6,  nom: "Banc de musculation",     reference: "ALG006", stock: 8,  prix: "12 000 DZD", categorie: "Musculation"          },
  { id: 7,  nom: "Gants de sport",          reference: "ALG007", stock: 50, prix: "1 500 DZD",  categorie: "Accessoire"           },
  { id: 8,  nom: "Kettlebell 10kg",         reference: "ALG008", stock: 22, prix: "6 000 DZD",  categorie: "Musculation"          },
  { id: 9,  nom: "Vélo d'appartement",      reference: "ALG009", stock: 5,  prix: "35 000 DZD", categorie: "Cardio"               },
  { id: 10, nom: "Tapis de course",         reference: "ALG010", stock: 3,  prix: "55 000 DZD", categorie: "Cardio"               },
  { id: 11, nom: "Barre olympique 20kg",    reference: "ALG011", stock: 12, prix: "18 000 DZD", categorie: "Musculation"          },
  { id: 12, nom: "Disque de fonte 5kg",     reference: "ALG012", stock: 60, prix: "2 500 DZD",  categorie: "Musculation"          },
  { id: 13, nom: "Tapis yoga 6mm",          reference: "ALG013", stock: 35, prix: "1 800 DZD",  categorie: "Accessoire"           },
  { id: 14, nom: "Chronomètre sport",       reference: "ALG014", stock: 18, prix: "900 DZD",    categorie: "Accessoire"           },
  { id: 15, nom: "Rameur hydraulique",      reference: "ALG015", stock: 4,  prix: "42 000 DZD", categorie: "Cardio"               },
];

const PAGE_SIZE = 8;

const STAT_CARDS = [
  { label: "Produits",  value: ALL_PRODUCTS.length, sub: "articles en stock",  bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
  { label: "Achats",    value: "304",                sub: "achats enregistrés", bg: "linear-gradient(135deg,#2D3832,#242227)" },
  { label: "Ventes",    value: "503",                sub: "ventes effectuées",  bg: "linear-gradient(135deg,#4B4750,#201F21)" },
];

const categoriePalette = {
  "Musculation":         { bg: "rgba(229,57,53,0.12)",   color: C.accent },
  "Accessoire":          { bg: "rgba(59,130,246,0.12)",  color: C.blue   },
  "Cardio":              { bg: "rgba(34,197,94,0.12)",   color: C.green  },
  "Cardio / Accessoire": { bg: "rgba(245,158,11,0.12)",  color: C.gold   },
};

const Magasin = () => {
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = ALL_PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    return p.nom.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q) || p.categorie.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  const getPages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, "...", totalPages];
    if (safePage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
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
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Magasin</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Magasin
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: ALL_PRODUCTS.length, label: "produits",  color: C.muted  },
                { count: "304",               label: "achats",    color: C.blue   },
                { count: "503",               label: "ventes",    color: C.green  },
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
            <Plus size={17} /> Ajouter un produit
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 12, padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 440 }}>
          <Search size={15} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Rechercher par nom, référence, catégorie..." value={search} onChange={e => handleSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 14px 10px 38px", color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accentBorder}
            onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.78rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {STAT_CARDS.map(({ label, value, sub, bg }) => (
            <div key={label} style={{ flex: 1, borderRadius: 14, padding: "20px 22px", background: bg, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.22s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>{label}</p>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.8rem", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1 }}>{value}</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginTop: 6, marginBottom: 0 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px 12px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Liste des produits
              <span style={{ marginLeft: 10, fontSize: "0.72rem", fontWeight: 600, background: C.accentDim, color: C.accent, padding: "2px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif" }}>{ALL_PRODUCTS.length} articles</span>
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["Nom", "Référence", "Stock", "Prix", "Catégorie"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(p => {
                const catStyle = categoriePalette[p.categorie] || { bg: "rgba(255,255,255,0.06)", color: C.muted };
                const stockLow = p.stock <= 5;
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 22px", color: C.text, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif", fontWeight: 500 }}>{p.nom}</td>
                    <td style={{ padding: "14px 22px", color: C.muted, fontSize: "0.78rem", fontFamily: "monospace", letterSpacing: 0.5 }}>{p.reference}</td>
                    <td style={{ padding: "14px 22px" }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 700, color: stockLow ? C.accent : C.text }}>{p.stock}</span>
                      {stockLow && <span style={{ marginLeft: 6, fontSize: "0.65rem", fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: C.accent, background: C.accentDim, padding: "2px 6px", borderRadius: 4 }}>FAIBLE</span>}
                    </td>
                    <td style={{ padding: "14px 22px" }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 800, color: C.text }}>{p.prix}</span>
                    </td>
                    <td style={{ padding: "14px 22px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Barlow', sans-serif", background: catStyle.bg, color: catStyle.color }}>{p.categorie}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
                    Aucun produit trouvé pour « {search} »
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ background: "none", border: "none", color: safePage === 1 ? C.border : C.muted, cursor: safePage === 1 ? "default" : "pointer", fontSize: "0.875rem", padding: "6px 10px", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>← Précédent</button>
              {getPages().map((page, idx) => page === "..." ? (
                <button key={`dots-${idx}`} disabled style={{ width: 32, height: 32, background: "transparent", border: "none", color: C.muted, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif" }}>…</button>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: page === safePage ? C.accent : "transparent", color: page === safePage ? "#fff" : C.muted, fontSize: "0.82rem", cursor: "pointer", fontWeight: page === safePage ? 700 : 400, fontFamily: "'Barlow', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ background: "none", border: "none", color: safePage === totalPages ? C.border : C.muted, cursor: safePage === totalPages ? "default" : "pointer", fontSize: "0.875rem", padding: "6px 10px", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Suivant →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Magasin;