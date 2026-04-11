import React, { useState } from "react";
import { ChevronRight, Search, Filter, Download, Plus, Check, Clock, AlertTriangle, Receipt } from "lucide-react";
import gym from "../../images/gym.png";
import NouveauPaiementModal from "../components/NouveauPaiementModal";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b",
};

const paiements = [
  { id: "#0001", nom: "Sophie Martin",  abonnement: "Premium Mensuel",      montant: 799,  date: "25 Fév 2026", methode: "Carte bancaire", statut: "Payé"       },
  { id: "#0002", nom: "Lucas Bernard",  abonnement: "Standard Mensuel",     montant: 499,  date: "24 Fév 2026", methode: "Virement",       statut: "Payé"       },
  { id: "#0003", nom: "Emma Dubois",    abonnement: "Premium Trimestriel",  montant: 2199, date: "23 Fév 2026", methode: "Carte bancaire", statut: "En attente" },
  { id: "#0004", nom: "Thomas Petit",   abonnement: "Standard Mensuel",     montant: 499,  date: "20 Fév 2026", methode: "Espèces",        statut: "En retard"  },
  { id: "#0005", nom: "Julie Moreau",   abonnement: "Premium Annuel",       montant: 7990, date: "18 Fév 2026", methode: "Virement",       statut: "Payé"       },
  { id: "#0006", nom: "Marc Lefebvre",  abonnement: "Standard Trimestriel", montant: 1290, date: "15 Fév 2026", methode: "Carte bancaire", statut: "Payé"       },
];

const avatarColors = ["#e53935", "#3a7bd5", "#f59e0b", "#8b5cf6", "#22c55e", "#06b6d4"];

const statusConfig = {
  "Payé":       { bg: "rgba(34,197,94,0.12)",   color: "#22c55e", dot: "#22c55e" },
  "En attente": { bg: "rgba(245,158,11,0.12)",   color: "#f59e0b", dot: "#f59e0b" },
  "En retard":  { bg: "rgba(229,57,53,0.12)",    color: "#e53935", dot: "#e53935" },
};

const methodeConfig = {
  "Carte bancaire": { bg: "rgba(58,123,213,0.12)", color: "#3a7bd5" },
  "Virement":       { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" },
  "Espèces":        { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
};

/* ── Stat card with original gradient style ── */
const StatCard = ({ title, value, sub, icon: Icon, bg, border, color, softBg, softBorder }) => (
  <div style={{ flex: 1, background: bg, borderRadius: 14, padding: "20px 22px", border: `1px solid ${border}`, position: "relative", overflow: "hidden", transition: "transform .2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "none"}>
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${softBg},transparent 70%)` }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>{title}</p>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2rem", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{value}</h2>
        {sub && <p style={{ color, fontSize: "0.78rem", marginTop: 6, marginBottom: 0, fontWeight: 600 }}>{sub}</p>}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: softBg, border: `1px solid ${softBorder}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={17} color={color} />
      </div>
    </div>
  </div>
);

const Paiement = () => {
  const [search, setSearch]     = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openModal, setOpenModal]   = useState(false);
  const filtered = paiements.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  const payeCount     = paiements.filter(p => p.statut === "Payé").length;
  const attenteCount  = paiements.filter(p => p.statut === "En attente").length;
  const retardCount   = paiements.filter(p => p.statut === "En retard").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* ── Hero Header ── */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gym})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Paiements</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Gestion des paiements
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: payeCount,    label: "payés",       color: C.green  },
                { count: attenteCount, label: "en attente",  color: C.gold   },
                { count: retardCount,  label: "en retard",   color: C.accent },
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

          <button onClick={() => setOpenModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,57,53,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.4)"; }}>
            <Plus size={17} /> Ajouter un paiement
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 12, padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 440 }}>
          <Search size={15} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Rechercher par nom, abonnement..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 14px 10px 38px", color: C.text, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = C.accentBorder}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ icon: Filter, label: "Filtrer" }, { icon: Download, label: "Exporter" }].map(({ icon: Icon, label }) => (
            <button key={label} style={{ display: "flex", alignItems: "center", gap: 6, background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 9, padding: "9px 16px", fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.8rem", color: C.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Barlow', sans-serif" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          <StatCard title="Revenus encaissés" value="10 577 DA" sub="4 paiements" icon={Check}
            bg="linear-gradient(145deg,#1F2A25,#2F4F3E)" border="rgba(46,204,113,0.2)"
            color="#22c55e" softBg="rgba(46,204,113,0.18)" softBorder="rgba(46,204,113,0.3)" />
          <StatCard title="En attente" value="2 887 DA" sub="3 paiements" icon={Clock}
            bg="linear-gradient(145deg,#2A2515,#4A3A10)" border="rgba(245,158,11,0.2)"
            color="#f59e0b" softBg="rgba(245,158,11,0.18)" softBorder="rgba(245,158,11,0.3)" />
          <StatCard title="En retard" value="499 DA" sub="1 paiement" icon={AlertTriangle}
            bg="linear-gradient(145deg,#2A1F1F,#5A1F1F)" border="rgba(229,57,53,0.2)"
            color="#e53935" softBg="rgba(229,57,53,0.18)" softBorder="rgba(229,57,53,0.3)" />
        </div>

        {/* Table */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Transactions récentes
              <span style={{ marginLeft: 10, fontSize: "0.72rem", fontWeight: 600, background: C.accentDim, color: C.accent, padding: "2px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif" }}>{filtered.length} résultats</span>
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["ID", "Adhérent", "Abonnement", "Montant", "Date", "Méthode", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const status  = statusConfig[p.statut]  || {};
                const methode = methodeConfig[p.methode] || { bg: "rgba(255,255,255,0.08)", color: C.muted };
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}`, background: hoveredRow === i ? C.cardHover : "transparent", transition: "background .15s" }}
                    onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.muted, fontFamily: "monospace", letterSpacing: 0.5 }}>{p.id}</span>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "25", border: `1.5px solid ${avatarColors[i % avatarColors.length]}55`, display: "grid", placeItems: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 800, color: avatarColors[i % avatarColors.length], flexShrink: 0 }}>
                          {p.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: C.text, fontFamily: "'Barlow', sans-serif" }}>{p.nom}</span>
                      </div>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.78rem", color: C.subtle, background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 8, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{p.abonnement}</span>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>{p.montant.toLocaleString()}<span style={{ fontSize: "0.72rem", fontWeight: 600, color: C.muted, marginLeft: 4 }}>DA</span></span>
                    </td>
                    <td style={{ padding: "15px 22px", fontSize: "0.78rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>{p.date}</td>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.72rem", background: methode.bg, color: methode.color, padding: "4px 10px", borderRadius: 8, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{p.methode}</span>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Barlow', sans-serif" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                        {p.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <button style={{ fontSize: "0.78rem", color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "'Barlow', sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(229,57,53,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.background = C.accentDim}>
                        <Receipt size={12} /> Facture
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: "0.875rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>Aucun résultat pour "<span style={{ color: C.accent }}>{search}</span>"</div>
            </div>
          )}

          <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>
              Affichage de <span style={{ color: C.text, fontWeight: 600 }}>{filtered.length}</span> sur <span style={{ color: C.text, fontWeight: 600 }}>{paiements.length}</span> transactions
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["←", "1", "2", "→"].map((l, i) => (
                <button key={i} style={{ width: 30, height: 30, borderRadius: 7, fontSize: "0.78rem", fontWeight: 600, background: l === "1" ? C.accentDim : C.card, color: l === "1" ? C.accent : C.muted, border: l === "1" ? `1px solid ${C.accentBorder}` : `1px solid ${C.border}`, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "'Barlow', sans-serif" }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {openModal && (
        <NouveauPaiementModal
          onClose={() => setOpenModal(false)}
          onSave={(data) => { console.log(data); setOpenModal(false); }}
        />
      )}
    </div>
  );
};

export default Paiement;
