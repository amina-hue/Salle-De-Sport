import React, { useState, useMemo, useEffect } from "react";
import { ChevronRight, ChevronLeft, Filter, RotateCcw, Calendar } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; 
import gymBg from "../../images/gym1.png";
import QuickActions from "../components/QuickActions";
import gym2 from "../../images/gym2.png";

const PAGE_SIZE = 7;

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

const FORMAT_DATE = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const Avatar = ({ nom, prenom }) => {
  const initials = `${nom?.charAt(0) ?? "?"}${prenom?.charAt(0) ?? ""}`.toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.blue + "33", border: `1.5px solid ${C.blue}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", color: C.blue, fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const CategorieBadge = ({ cat }) => {
  const isAbo = cat === "Abonnement";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 20, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Barlow', sans-serif", background: isAbo ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)", color: isAbo ? "#10b981" : "#60a5fa", border: `1px solid ${isAbo ? "rgba(16,185,129,0.25)" : "rgba(59,130,246,0.25)"}` }}>
      {cat}
    </span>
  );
};

const Recette = () => {
  const [recettes, setRecettes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [dateDebut, setDateDebut]       = useState("");
  const [dateFin, setDateFin]           = useState("");
  const [activeFilter, setActiveFilter] = useState({ debut: "", fin: "" });
  const [currentPage, setCurrentPage]   = useState(1);
  const navigate = useNavigate(); 

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const [paiements, ventes] = await Promise.all([
        window.electron.invoke("getPaiements"),
        window.electron.invoke("getProduits"),
      ]);
      const lignesPaiements = paiements.map(p => ({ id: `p-${p.idPaiement}`, date: p.datePaiement, nom: p.adherentNom?.split(" ")[0] ?? "—", prenom: p.adherentNom?.split(" ")[1] ?? "", nomComplet: p.adherentNom ?? "—", description: "Abonnement", paiement: parseFloat(p.montant) || 0, remise: 0, categorie: "Abonnement" }));
      const lignesVentes = ventes.map(v => ({ id: `v-${v.idProduit}`, date: new Date().toISOString().split("T")[0], nom: "Magasin", prenom: "", nomComplet: v.nom, description: v.nom, paiement: parseFloat(v.prix) || 0, remise: 0, categorie: "Vente" }));
      setRecettes([...lignesPaiements, ...lignesVentes].sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) { setError("Impossible de charger les recettes."); }
    finally { setLoading(false); }
  };

  const handleFiltrer = () => { setActiveFilter({ debut: dateDebut, fin: dateFin }); setCurrentPage(1); };
  const handleReset   = () => { setDateDebut(""); setDateFin(""); setActiveFilter({ debut: "", fin: "" }); setCurrentPage(1); };

  const filtered = useMemo(() => recettes.filter(r => {
    if (!r.date) return true;
    const d = new Date(r.date);
    return (activeFilter.debut ? d >= new Date(activeFilter.debut) : true) && (activeFilter.fin ? d <= new Date(activeFilter.fin) : true);
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

  if (loading) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.muted, fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>Chargement des recettes...</div>;
  if (error)   return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, gap: 12 }}>
      <p style={{ color: "#f87171", fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>{error}</p>
      <button onClick={loadData} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>Réessayer</button>
    </div>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
      position: "relative"
    }}>

      {/* ── Image de fond + overlay — derrière tout le contenu ── */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `url(${gym2})`,
        backgroundSize: "cover", backgroundPosition: "center 35%",
        zIndex: -1,
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", inset: 0,
        background: "rgba(14,15,17,0.62)",
        zIndex: -1,
        pointerEvents: "none"
      }} />

      {/* ── Hero Header ── */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gym2})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.63) 0%, rgba(14,15,17,0.65) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Recettes</span>
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Recettes
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: filtered.filter(r => r.categorie === "Abonnement").length, label: "abonnements", color: C.blue  },
                { count: filtered.filter(r => r.categorie === "Vente").length,      label: "ventes",      color: C.green },
                { count: `${totalRecettes.toLocaleString("fr-FR")} DA`,             label: "total",       color: C.gold  },
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
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Filtre + Stats */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* Filtre */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", minWidth: 220, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Filtrer les recettes</p>
            {[
              { label: "Date début", value: dateDebut, onChange: setDateDebut },
              { label: "Date fin",   value: dateFin,   onChange: setDateFin   },
            ].map(({ label, value, onChange }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ color: C.muted, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Barlow', sans-serif" }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#14161c", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
                  <input type="date" value={value} onChange={e => onChange(e.target.value)} style={{ background: "none", border: "none", color: C.subtle, fontSize: 13, outline: "none", flex: 1, fontFamily: "'Barlow', sans-serif", cursor: "pointer", colorScheme: "dark" }} />
                  <Calendar size={14} color={C.muted} />
                </div>
              </div>
            ))}
            <button onClick={handleFiltrer} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.accent, border: "none", borderRadius: 8, color: "#fff", fontSize: "0.875rem", fontWeight: 700, padding: "10px 0", cursor: "pointer", fontFamily: "'Barlow', sans-serif", boxShadow: "0 4px 12px rgba(229,57,53,0.35)" }}>
              <Filter size={14} /> Filtrer
            </button>
            {(dateDebut || dateFin) && (
              <button onClick={handleReset} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, borderRadius: 8, padding: "8px 0", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                <RotateCcw size={13} /> Réinitialiser
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16 }}>
              {/* Salle */}
              <div style={{ flex: 1, borderRadius: 14, padding: "20px 22px", background: "linear-gradient(145deg,rgba(29,78,216,0.18),rgba(29,78,216,0.08))", border: "1px solid rgba(29,78,216,0.3)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,rgba(29,78,216,0.25),transparent 70%)" }} />
                <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>Recette de la salle</p>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2rem", fontWeight: 800, color: C.text, margin: "0 0 12px", lineHeight: 1 }}>{totalAbonnements.toLocaleString("fr-FR")} DA</h2>
                {[
                  { label: "Total abonnements",   val: filtered.filter(r => r.categorie === "Abonnement").length },
                  { label: "Remises",             val: `- ${totalRemises.toLocaleString("fr-FR")} DA` },
                  { label: "Paiements encaissés", val: `${(totalAbonnements - totalRemises).toLocaleString("fr-FR")} DA` },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
                    <span style={{ color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif" }}>{d.label}</span>
                    <span style={{ color: C.subtle, fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{d.val}</span>
                  </div>
                ))}
              </div>

              {/* Magasin */}
              <div style={{ flex: 1, borderRadius: 14, padding: "20px 22px", background: "linear-gradient(145deg,rgba(220,38,38,0.18),rgba(220,38,38,0.08))", border: "1px solid rgba(220,38,38,0.3)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,rgba(220,38,38,0.25),transparent 70%)" }} />
                <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>Recette du magasin</p>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2rem", fontWeight: 800, color: C.text, margin: "0 0 12px", lineHeight: 1 }}>{totalVentes.toLocaleString("fr-FR")} DA</h2>
                {[
                  { label: "Produits vendus",  val: filtered.filter(r => r.categorie === "Vente").length },
                  { label: "Tickets encaissés", val: `${totalVentes.toLocaleString("fr-FR")} DA` },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
                    <span style={{ color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif" }}>{d.label}</span>
                    <span style={{ color: C.subtle, fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{d.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: C.muted, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, margin: 0 }}>Total des recettes</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{totalRecettes.toLocaleString("fr-FR")} DA</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px 12px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Détails des recettes
              <span style={{ marginLeft: 10, fontSize: "0.72rem", fontWeight: 600, background: C.accentDim, color: C.accent, padding: "2px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif" }}>{filtered.length} entrées</span>
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["Date", "Nom complet", "Description", "Paiement", "Remise", "Catégorie"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 22px", color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap" }}>{r.date ? FORMAT_DATE(r.date) : "—"}</td>
                  <td style={{ padding: "14px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar nom={r.nom} prenom={r.prenom} />
                      <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{r.nomComplet}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 22px", color: C.subtle, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>{r.description}</td>
                  <td style={{ padding: "14px 22px" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 800, color: C.text }}>{r.paiement.toLocaleString("fr-FR")}<span style={{ fontSize: "0.72rem", fontWeight: 600, color: C.muted, marginLeft: 4 }}>DA</span></span>
                  </td>
                  <td style={{ padding: "14px 22px", color: r.remise > 0 ? C.gold : C.muted, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif", fontWeight: r.remise > 0 ? 600 : 400 }}>
                    {r.remise > 0 ? `${r.remise.toLocaleString("fr-FR")} DA` : "0 DA"}
                  </td>
                  <td style={{ padding: "14px 22px" }}><CategorieBadge cat={r.categorie} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>Aucune recette pour cette période.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ display: "flex", alignItems: "center", gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: safePage === 1 ? C.border : C.muted, fontSize: "0.82rem", fontWeight: 600, padding: "7px 14px", cursor: safePage === 1 ? "default" : "pointer", fontFamily: "'Barlow', sans-serif", opacity: safePage === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} /> Précédente
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: C.muted, fontSize: "0.78rem", marginRight: 6, fontFamily: "'Barlow', sans-serif" }}>Page {safePage}/{totalPages}</span>
              {getPages().map((page, idx) => page === "..." ? (
                <button key={`d${idx}`} disabled style={{ width: 32, height: 32, background: "transparent", border: "none", color: C.muted, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif" }}>…</button>
              ) : (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: page === safePage ? C.accent : "transparent", color: page === safePage ? "#fff" : C.muted, fontSize: "0.82rem", cursor: "pointer", fontWeight: page === safePage ? 700 : 400, fontFamily: "'Barlow', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {page}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ display: "flex", alignItems: "center", gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: safePage === totalPages ? C.border : C.muted, fontSize: "0.82rem", fontWeight: 600, padding: "7px 14px", cursor: safePage === totalPages ? "default" : "pointer", fontFamily: "'Barlow', sans-serif", opacity: safePage === totalPages ? 0.4 : 1 }}>
              Suivante <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 12, padding: "14px 28px" }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Total des recettes : <span style={{ color: C.accent }}>{totalRecettes.toLocaleString("fr-FR")} DA</span>
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Abonnements : <span style={{ color: C.blue }}>{totalAbonnements.toLocaleString("fr-FR")} DA</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default Recette;
