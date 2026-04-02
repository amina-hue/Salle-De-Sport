import React, { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronRight, ChevronLeft, Filter, TrendingUp, ShoppingBag, RotateCcw } from "lucide-react";
import gymBg from "../../images/gym1.png";

const PAGE_SIZE = 7;

const C = {
  bg: "#0e0f11",
  card: "#1a1d24",
  cardHover: "#1f2330",
  border: "#252833",
  accent: "#e53935",
  accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0",
  muted: "#6b7280",
  subtle: "#9ca3af",
  green: "#22c55e",
  blue: "#3b82f6",
  gold: "#f59e0b",
};

const FORMAT_DATE = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const Avatar = ({ nom, prenom }) => {
  const initials = `${nom?.charAt(0) ?? "?"}${prenom?.charAt(0) ?? ""}`.toUpperCase();
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: C.blue, display: "flex", alignItems: "center",
      justifyContent: "center", color: "#fff", fontSize: 11,
      fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const CategorieBadge = ({ cat }) => {
  const isAbo = cat === "Abonnement";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      borderRadius: 20, padding: "4px 14px",
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
      background: isAbo ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
      color: isAbo ? "#10b981" : "#60a5fa",
      border: `1px solid ${isAbo ? "rgba(16,185,129,0.25)" : "rgba(59,130,246,0.25)"}`,
    }}>
      {cat}
    </span>
  );
};

const StatCard = ({ title, value, detail1Label, detail1Val, detail2Label, detail2Val, detail3Label, detail3Val, color }) => (
  <div style={{
    flex: 1, borderRadius: 14, padding: "18px 22px",
    backdropFilter: "blur(10px)", display: "flex",
    flexDirection: "column", gap: 8,
    background: color === "blue" ? "rgba(29,78,216,0.18)" : "rgba(220,38,38,0.18)",
    border: `1px solid ${color === "blue" ? "rgba(29,78,216,0.3)" : "rgba(220,38,38,0.3)"}`,
  }}>
    <p style={{ color: "#aaa", fontSize: 12, fontWeight: 500, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
    <p style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}</p>
    {[
      { label: detail1Label, val: detail1Val },
      { label: detail2Label, val: detail2Val },
      { label: detail3Label, val: detail3Val },
    ].filter(d => d.label).map((d, i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#888", fontSize: 12 }}>{d.label}</span>
        <span style={{ color: "#ccc", fontSize: 12, fontWeight: 600 }}>{d.val}</span>
      </div>
    ))}
  </div>
);

const Recette = () => {
  const [recettes, setRecettes]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [dateDebut, setDateDebut]   = useState("");
  const [dateFin, setDateFin]       = useState("");
  const [activeFilter, setActiveFilter] = useState({ debut: "", fin: "" });
  const [currentPage, setCurrentPage]   = useState(1);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [paiements, ventes] = await Promise.all([
        window.electron.invoke("getPaiements"),
        window.electron.invoke("getProduits"),
      ]);
      const lignesPaiements = paiements.map((p) => ({
        id: `p-${p.idPaiement}`,
        date: p.datePaiement,
        nom: p.adherentNom?.split(" ")[0] ?? "—",
        prenom: p.adherentNom?.split(" ")[1] ?? "",
        nomComplet: p.adherentNom ?? "—",
        description: "Abonnement",
        paiement: parseFloat(p.montant) || 0,
        remise: 0,
        categorie: "Abonnement",
      }));
      const lignesVentes = ventes.map((v) => ({
        id: `v-${v.idProduit}`,
        date: new Date().toISOString().split("T")[0],
        nom: "Magasin",
        prenom: "",
        nomComplet: v.nom,
        description: v.nom,
        paiement: parseFloat(v.prix) || 0,
        remise: 0,
        categorie: "Vente",
      }));
      const toutes = [...lignesPaiements, ...lignesVentes].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setRecettes(toutes);
    } catch (err) {
      setError("Impossible de charger les recettes.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrer = () => { setActiveFilter({ debut: dateDebut, fin: dateFin }); setCurrentPage(1); };
  const handleReset   = () => { setDateDebut(""); setDateFin(""); setActiveFilter({ debut: "", fin: "" }); setCurrentPage(1); };

  const filtered = useMemo(() => recettes.filter((r) => {
    if (!r.date) return true;
    const d = new Date(r.date);
    return (activeFilter.debut ? d >= new Date(activeFilter.debut) : true)
        && (activeFilter.fin   ? d <= new Date(activeFilter.fin)   : true);
  }), [recettes, activeFilter]);

  const totalAbonnements = filtered.filter(r => r.categorie === "Abonnement").reduce((a, r) => a + r.paiement, 0);
  const totalVentes      = filtered.filter(r => r.categorie === "Vente").reduce((a, r) => a + r.paiement, 0);
  const totalRemises     = filtered.reduce((a, r) => a + r.remise, 0);
  const totalRecettes    = totalAbonnements + totalVentes;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getPages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, "...", totalPages];
    if (safePage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  // ── Écrans de chargement / erreur ──
  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.muted, fontSize: 14 }}>
      Chargement des recettes...
    </div>
  );
  if (error) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, gap: 12 }}>
      <p style={{ color: "#f87171", fontSize: 14 }}>{error}</p>
      <button onClick={loadData} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: "inherit" }}>
        Réessayer
      </button>
    </div>
  );

  // ── Styles réutilisables ──
  const dateInputStyle = {
    background: "none", border: "none", color: "#ccc",
    fontSize: 13, outline: "none", flex: 1,
    fontFamily: "inherit", cursor: "pointer",
    colorScheme: "dark",
  };
  const thStyle = {
    textAlign: "left", color: "#555", fontSize: 11,
    fontWeight: 600, letterSpacing: "0.08em",
    paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)",
  };
  const tdStyle = { padding: "13px 0", fontSize: 13, color: "#ddd" };

  return (
    // ── Wrapper principal : remplit exactement l'espace du Layout ──
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
        padding: "28px 40px 40px",
        display: "flex", flexDirection: "column", gap: 24,
        fontFamily: "'Barlow', sans-serif",
      }}>

        {/* Titre */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h1 style={{
            color: "#fff", fontSize: 26, fontWeight: 700, margin: 0,
            background: "rgba(229,62,62,0.15)", border: "1.5px solid #e53e3e",
            borderRadius: 10, padding: "8px 60px", letterSpacing: "0.04em",
          }}>
            Recettes
          </h1>
        </div>

        {/* ── Section haute : filtre + stats ── */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Filtre */}
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 14, padding: "22px 24px", backdropFilter: "blur(10px)",
            minWidth: 220, display: "flex", flexDirection: "column", gap: 14,
          }}>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: 0 }}>Filtrer les recettes :</p>

            {[
              { label: "Date Debut", value: dateDebut, onChange: setDateDebut },
              { label: "Date Fin",   value: dateFin,   onChange: setDateFin   },
            ].map(({ label, value, onChange }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ color: "#999", fontSize: 12, fontWeight: 500 }}>{label}</label>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(26,26,37,0.9)", border: "1px solid #2e2e3e",
                  borderRadius: 8, padding: "8px 12px",
                }}>
                  <input type="date" value={value} onChange={e => onChange(e.target.value)} style={dateInputStyle} />
                  <Calendar size={15} color="#888" />
                </div>
              </div>
            ))}

            <button onClick={handleFiltrer} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: C.accent, border: "none", borderRadius: 8, color: "#fff",
              fontSize: 14, fontWeight: 600, padding: "10px 0", cursor: "pointer",
              fontFamily: "inherit", marginTop: 4,
            }}>
              <Filter size={14} /> Filtrer
            </button>

            {(dateDebut || dateFin) && (
              <button onClick={handleReset} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.25)",
                color: C.accent, borderRadius: 8, padding: "8px 0",
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>
                <RotateCcw size={13} /> Réinitialiser
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <StatCard
                title="Recette de la salle" value={`${totalAbonnements.toLocaleString("fr-FR")} DA`}
                color="blue"
                detail1Label="Total abonnement" detail1Val={filtered.filter(r => r.categorie === "Abonnement").length}
                detail2Label="Remise" detail2Val={`- ${totalRemises.toLocaleString("fr-FR")} DA`}
                detail3Label="Paiements encaissés" detail3Val={`${(totalAbonnements - totalRemises).toLocaleString("fr-FR")} DA`}
              />
              <StatCard
                title="Recette du magasin" value={`${totalVentes.toLocaleString("fr-FR")} DA`}
                color="red"
                detail1Label="Produits vendus" detail1Val={filtered.filter(r => r.categorie === "Vente").length}
                detail2Label="Tickets encaissés" detail2Val={`${totalVentes.toLocaleString("fr-FR")} DA`}
              />
            </div>

            {/* Total */}
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: "18px 24px", backdropFilter: "blur(10px)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <p style={{ color: "#aaa", fontSize: 14, fontWeight: 500, margin: 0 }}>Total des recettes</p>
              <p style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                {totalRecettes.toLocaleString("fr-FR")} DA
              </p>
            </div>
          </div>
        </div>

        {/* ── Tableau ── */}
        <div style={{
          background: "rgba(15,15,20,0.6)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "24px 28px", backdropFilter: "blur(10px)",
        }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: "0 0 18px 0" }}>
            Détails des recettes :
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["DATE", "NOM COMPLET", "DESCRIPTION", "PAIEMENT", "REMISE", "CATÉGORIE"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ ...tdStyle, color: "#888", fontSize: 12, whiteSpace: "nowrap" }}>
                    {r.date ? FORMAT_DATE(r.date) : "—"}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar nom={r.nom} prenom={r.prenom} />
                      <span style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 500 }}>{r.nomComplet}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: "#aaa" }}>{r.description}</td>
                  <td style={{ ...tdStyle, color: "#e0e0e0", fontWeight: 600 }}>
                    {r.paiement.toLocaleString("fr-FR")} DA
                  </td>
                  <td style={{ ...tdStyle, color: "#f97316", fontWeight: 500 }}>
                    {r.remise > 0 ? `${r.remise.toLocaleString("fr-FR")} DA` : "0 DA"}
                  </td>
                  <td style={tdStyle}><CategorieBadge cat={r.categorie} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: 14 }}>
                    Aucune recette pour cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#ccc", fontSize: 13, fontWeight: 500,
                padding: "7px 14px", cursor: safePage === 1 ? "default" : "pointer",
                opacity: safePage === 1 ? 0.3 : 1, fontFamily: "inherit",
              }}
            >
              <ChevronLeft size={14} /> Page précédente
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#666", fontSize: 13, marginRight: 6 }}>
                Page {safePage}/{totalPages}
              </span>
              {getPages().map((page, idx) =>
                page === "..." ? (
                  <button key={`d${idx}`} disabled style={{ width: 32, height: 32, background: "transparent", border: "none", color: "#aaa", fontSize: 13, fontFamily: "inherit" }}>…</button>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page)} style={{
                    width: 32, height: 32, borderRadius: "50%", border: "none",
                    background: page === safePage ? C.accent : "transparent",
                    color: page === safePage ? "#fff" : "#aaa",
                    fontSize: 13, cursor: "pointer", fontWeight: page === safePage ? 700 : 400,
                    fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#ccc", fontSize: 13, fontWeight: 500,
                padding: "7px 14px", cursor: safePage === totalPages ? "default" : "pointer",
                opacity: safePage === totalPages ? 0.3 : 1, fontFamily: "inherit",
              }}
            >
              Page suivante <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "linear-gradient(135deg, rgba(229,62,62,0.25), rgba(180,30,30,0.35))",
          border: "1px solid rgba(229,62,62,0.35)", borderRadius: 12,
          padding: "14px 28px", backdropFilter: "blur(8px)",
        }}>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
            Total des recettes : {totalRecettes.toLocaleString("fr-FR")} DA
          </span>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
            Abonnements : {totalAbonnements.toLocaleString("fr-FR")} DA
          </span>
        </div>

      </div>{/* fin zone scrollable */}
    </div>
  );
};

export default Recette;