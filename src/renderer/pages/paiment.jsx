import React, { useState } from "react";
import { Search, Filter, Download, Plus, Check, Clock, AlertTriangle, Receipt } from "lucide-react";
import Button from "../components/AddButton";
import gym from "../../images/gym.png";
import AddButton from "../components/AddButton";
import NouveauPaiementModal from '../components/NouveauPaiementModal';
const paiements = [
  { id: "#0001", nom: "Sophie Martin",  abonnement: "Premium Mensuel",      montant: 799,  date: "25 Fév 2026", methode: "Carte bancaire", statut: "Payé" },
  { id: "#0002", nom: "Lucas Bernard",  abonnement: "Standard Mensuel",     montant: 499,  date: "24 Fév 2026", methode: "Virement",       statut: "Payé" },
  { id: "#0003", nom: "Emma Dubois",    abonnement: "Premium Trimestriel",  montant: 2199, date: "23 Fév 2026", methode: "Carte bancaire", statut: "En attente" },
  { id: "#0004", nom: "Thomas Petit",   abonnement: "Standard Mensuel",     montant: 499,  date: "20 Fév 2026", methode: "Espèces",        statut: "En retard" },
  { id: "#0005", nom: "Julie Moreau",   abonnement: "Premium Annuel",       montant: 7990, date: "18 Fév 2026", methode: "Virement",       statut: "Payé" },
  { id: "#0006", nom: "Marc Lefebvre",  abonnement: "Standard Trimestriel", montant: 1290, date: "15 Fév 2026", methode: "Carte bancaire", statut: "Payé" },
];

const avatarColors = ["#e63946", "#3a7bd5", "#f59e0b", "#8b5cf6", "#22c55e", "#06b6d4"];

const statusConfig = {
  "Payé":       { bg: "#22c55e18", color: "#22c55e", dot: "#22c55e" },
  "En attente": { bg: "#f59e0b18", color: "#f59e0b", dot: "#f59e0b" },
  "En retard":  { bg: "#e6394618", color: "#e63946", dot: "#e63946" },
};

const methodeConfig = {
  "Carte bancaire": { bg: "#3a7bd518", color: "#3a7bd5" },
  "Virement":       { bg: "#8b5cf618", color: "#8b5cf6" },
  "Espèces":        { bg: "#22c55e18", color: "#22c55e" },
};

const StatCard = ({ title, value, sub, icon: Icon, type = "success" }) => {
  const themes = {
    success: { gradient: "linear-gradient(145deg,#1F2A25,#2F4F3E)", border: "rgba(46,204,113,0.2)", glow: "rgba(46,204,113,0.25)", color: "#2ECC71", softBg: "rgba(46,204,113,0.18)", softBorder: "rgba(46,204,113,0.3)" },
    warning: { gradient: "linear-gradient(145deg,#2A1F1A,#5A2E1F)", border: "rgba(255,159,67,0.2)", glow: "rgba(255,159,67,0.25)", color: "#FF9F43", softBg: "rgba(255,159,67,0.18)", softBorder: "rgba(255,159,67,0.3)" },
    danger:  { gradient: "linear-gradient(145deg,#2A1F1F,#5A1F1F)", border: "rgba(255,77,77,0.2)",  glow: "rgba(255,77,77,0.25)",  color: "#FF4D4D", softBg: "rgba(255,77,77,0.18)",  softBorder: "rgba(255,77,77,0.3)"  },
  };
  const theme = themes[type];
  return (
    <div style={{ background: theme.gradient, borderRadius: 16, padding: "22px 24px", border: `1px solid ${theme.border}`, flex: 1, position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${theme.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${theme.glow},transparent 70%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{value}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: theme.color, marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: theme.softBg, border: `1px solid ${theme.softBorder}`, display: "grid", placeItems: "center" }}>
          <Icon size={17} color={theme.color} />
        </div>
      </div>
    </div>
  );
};

const Paiement = () => {
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const filtered = paiements.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));
  const [openModal, setOpenModal] = useState(false);
  return (
    <div style={{
      flex: 1,
      height: "100%",
      overflowY: "auto",
      padding: "32px 36px",
      backgroundImage: `linear-gradient(rgba(11,11,18,0.6), rgba(11,11,18,0.95)), url(${gym})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      color: "#f1f1f1",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: "linear-gradient(180deg,#e63946,#c1121f)" }} />
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-.5px" }}>Gestion des paiements</h1>
          </div>
          <p style={{ margin: "0 0 0 14px", color: "#444", fontSize: 13 }}>8 transactions ce mois-ci</p>
        </div>
        <AddButton
  variant="primary"
  icon={Plus}
  onClick={() => setOpenModal(true)}
>
  Ajouter un paiement
</AddButton>
{openModal && (
  <NouveauPaiementModal
    onClose={() => setOpenModal(false)}
    onSave={(data) => {
      console.log(data);
      setOpenModal(false);
    }}
  />
)}
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <StatCard type="success" title="Revenus encaissés" value="10 577 DA" sub="4 paiements" icon={Check} />
        <StatCard type="warning" title="En attente"        value="2 887 DA"  sub="3 paiements" icon={Clock} />
        <StatCard type="danger"  title="En retard"         value="499 DA"    sub="1 paiement"  icon={AlertTriangle} />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, gap: 14, background: "rgba(39,29,31,0.85)", padding: "14px 18px", borderRadius: 18, border: "1px solid rgba(205,73,53,0.25)", backdropFilter: "blur(6px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(39,29,31,0.9)", border: "1px solid #CD4935", borderRadius: 14, padding: "12px 16px", flex: 1, maxWidth: 460 }}>
          <Search size={18} color="#CD4935" />
          <input type="text" placeholder="Rechercher par nom, abonnement..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "#f1f1f1", fontSize: 14, width: "100%" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#CD4935", cursor: "pointer", fontSize: 18 }}>×</button>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="filter" icon={Filter}>Filtrer</Button>
          <Button variant="export" icon={Download}>Exporter</Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "linear-gradient(145deg,#271D1F,#1F1618)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#D9B48F" }}>
            Transactions récentes
            <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, background: "rgba(166,124,82,0.2)", color: "#A67C52", padding: "2px 8px", borderRadius: 20 }}>{filtered.length} résultats</span>
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#2E1F1B" }}>
              {["ID", "ADHÉRENT", "ABONNEMENT", "MONTANT", "DATE", "MÉTHODE", "STATUT", "ACTIONS"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: 10, color: "#A67C52", letterSpacing: ".9px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const status  = statusConfig[p.statut]  || {};
              const methode = methodeConfig[p.methode] || { bg: "rgba(255,255,255,0.1)", color: "#aaa" };
              const isHovered = hoveredRow === i;
              return (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#1e1819", transition: "background .15s" }}
                  onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                  <td style={{ padding: "15px 22px" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#6B3F3A", fontFamily: "monospace", letterSpacing: ".5px" }}>{p.id}</span></td>
                  <td style={{ padding: "15px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "25", border: `1.5px solid ${avatarColors[i % avatarColors.length]}40`, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, color: avatarColors[i % avatarColors.length], flexShrink: 0 }}>
                        {p.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#D9B48F" }}>{p.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding: "15px 22px" }}><span style={{ fontSize: 12, color: "#A67C52", background: "rgba(166,124,82,0.06)", padding: "4px 10px", borderRadius: 8, fontWeight: 500 }}>{p.abonnement}</span></td>
                  <td style={{ padding: "15px 22px" }}><span style={{ fontSize: 15, fontWeight: 800, color: "#F5DEB3", letterSpacing: "-.3px" }}>{p.montant.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 600, color: "#555", marginLeft: 4 }}>DA</span></span></td>
                  <td style={{ padding: "15px 22px", fontSize: 12, color: "#555", fontWeight: 500 }}>{p.date}</td>
                  <td style={{ padding: "15px 22px" }}><span style={{ fontSize: 12, background: methode.bg, color: methode.color, padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{p.methode}</span></td>
                  <td style={{ padding: "15px 22px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                      {p.statut}
                    </span>
                  </td>
                  <td style={{ padding: "15px 22px" }}>
                    <button style={{ fontSize: 12, color: "#A67C52", background: isHovered ? "rgba(166,124,82,0.15)" : "rgba(166,124,82,0.08)", border: "1px solid rgba(166,124,82,0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
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
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, color: "#777" }}>Aucun résultat pour "<span style={{ color: "#A67C52" }}>{search}</span>"</div>
          </div>
        )}
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#A67C52" }}>Affichage de <span style={{ color: "#D9B48F", fontWeight: 600 }}>{filtered.length}</span> sur <span style={{ color: "#D9B48F", fontWeight: 600 }}>{paiements.length}</span> transactions</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["←", "1", "2", "→"].map((l, i) => (
              <button key={i} style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 600, background: l === "1" ? "rgba(166,124,82,0.2)" : "#271D1F", color: l === "1" ? "#A67C52" : "#777", border: l === "1" ? "1px solid rgba(166,124,82,0.3)" : "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "grid", placeItems: "center" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paiement;