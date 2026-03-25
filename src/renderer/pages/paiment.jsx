import React, { useState } from "react";
import { Search, Filter, Download, Plus, TrendingUp, Clock, AlertTriangle, Receipt, ChevronDown } from "lucide-react";
import Sidebar from '../components/Sidebar';
import Button from "../components/Button";

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
  "Carte bancaire": { icon: "💳", bg: "#3a7bd518", color: "#3a7bd5" },
  "Virement":       { icon: "🏦", bg: "#8b5cf618", color: "#8b5cf6" },
  "Espèces":        { icon: "💵", bg: "#22c55e18", color: "#22c55e" },
};

const StatCard = ({ title, value, sub, icon: Icon, accent, trend }) => (
  <div style={{
    background: "linear-gradient(145deg, #1a1a26 0%, #16161f 100%)",
    borderRadius: 16, padding: "22px 24px",
    border: `1px solid ${accent}22`, flex: 1,
    position: "relative", overflow: "hidden",
    transition: "transform .2s, box-shadow .2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${accent}18`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
  >
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${accent}25, transparent 70%)`, pointerEvents: "none" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}30`, display: "grid", placeItems: "center" }}>
        <Icon size={17} color={accent} />
      </div>
      {trend && <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", background: "#22c55e15", padding: "3px 8px", borderRadius: 20 }}>{trend}</span>}
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: "#f1f1f1", letterSpacing: "-.5px", marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>{title}</div>
    {sub && <div style={{ fontSize: 11, color: accent, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const Paiement = () => {
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  const filtered = paiements.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "#0b0b12",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#f1f1f1",
    }}>

      {/* ── Sidebar fixe ── */}
      <div style={{ flexShrink: 0, height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}>
        <Sidebar />
      </div>

      {/* ── Contenu scrollable ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 4, height: 28, borderRadius: 4, background: "linear-gradient(180deg, #e63946, #c1121f)" }} />
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-.5px" }}>
                Gestion des paiements
              </h1>
            </div>
            <p style={{ margin: "0 0 0 14px", color: "#444", fontSize: 13 }}>
              8 transactions ce mois-ci · Dernière mise à jour il y a 2 min
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "#1a1a26", border: "1px solid #ffffff0f",
              color: "#888", borderRadius: 10, padding: "10px 16px",
              fontSize: 13, cursor: "pointer", fontWeight: 500, transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#22222f"; e.currentTarget.style.color = "#ddd"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a1a26"; e.currentTarget.style.color = "#888"; }}
            >
              <Download size={14} /> Exporter
            </button>
            <Button variant="primary" icon={Plus}>Ajouter un paiement</Button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <StatCard title="Revenus encaissés" value="10 577 DA" sub="↑ +12% ce mois"  icon={TrendingUp}     accent="#22c55e" trend="+12%" />
          <StatCard title="En attente"         value="2 887 DA"  sub="3 paiements"     icon={Clock}          accent="#f59e0b" />
          <StatCard title="En retard"          value="499 DA"    sub="1 paiement"      icon={AlertTriangle}  accent="#e63946" />
          <StatCard title="Total transactions" value="6"         sub="Ce mois-ci"      icon={Receipt}        accent="#3a7bd5" />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#1a1a26", border: "1px solid #ffffff0a",
            borderRadius: 12, padding: "10px 16px", flex: 1, maxWidth: 440,
          }}>
            <Search size={15} color="#444" />
            <input
              type="text"
              placeholder="Rechercher par nom, abonnement..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: "#f1f1f1", fontSize: 13, width: "100%" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
            )}
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#1a1a26", border: "1px solid #ffffff0a",
            color: "#777", borderRadius: 10, padding: "10px 14px",
            fontSize: 13, cursor: "pointer", fontWeight: 500, transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#22222f"; e.currentTarget.style.color = "#ddd"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a1a26"; e.currentTarget.style.color = "#777"; }}
          >
            <Filter size={14} /> Filtres <ChevronDown size={12} />
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "linear-gradient(145deg, #1a1a26, #16161f)", borderRadius: 18, border: "1px solid #ffffff08", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.4)" }}>

          {/* Table title bar */}
          <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid #ffffff08", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#ddd" }}>
              Transactions récentes
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, background: "#3a7bd520", color: "#3a7bd5", padding: "2px 8px", borderRadius: 20 }}>
                {filtered.length} résultats
              </span>
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#13131e" }}>
                {["ID", "ADHÉRENT", "ABONNEMENT", "MONTANT", "DATE", "MÉTHODE", "STATUT", "ACTIONS"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: 10, color: "#444", letterSpacing: ".9px", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const status = statusConfig[p.statut] || {};
                const methode = methodeConfig[p.methode] || { icon: "💰", bg: "#ffffff10", color: "#aaa" };
                const isHovered = hoveredRow === i;

                return (
                  <tr key={i}
                    style={{ borderTop: "1px solid #ffffff05", background: isHovered ? "#ffffff04" : "transparent", transition: "background .15s" }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* ID */}
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#333", fontFamily: "monospace", letterSpacing: ".5px" }}>{p.id}</span>
                    </td>

                    {/* Adhérent */}
                    <td style={{ padding: "15px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: avatarColors[i % avatarColors.length] + "25",
                          border: `1.5px solid ${avatarColors[i % avatarColors.length]}40`,
                          display: "grid", placeItems: "center",
                          fontSize: 11, fontWeight: 800, color: avatarColors[i % avatarColors.length],
                        }}>
                          {p.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8e8" }}>{p.nom}</span>
                      </div>
                    </td>

                    {/* Abonnement */}
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: 12, color: "#666", background: "#ffffff06", padding: "4px 10px", borderRadius: 8, fontWeight: 500 }}>{p.abonnement}</span>
                    </td>

                    {/* Montant */}
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#f1f1f1", letterSpacing: "-.3px" }}>
                        {p.montant.toLocaleString()}
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#555", marginLeft: 4 }}>DA</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "15px 22px", fontSize: 12, color: "#555", fontWeight: 500 }}>{p.date}</td>

                    {/* Méthode */}
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: 12, background: methode.bg, color: methode.color, padding: "4px 10px", borderRadius: 8, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span>{methode.icon}</span> {p.methode}
                      </span>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                        {p.statut}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "15px 22px" }}>
                      <button style={{
                        fontSize: 12, color: "#3a7bd5",
                        background: isHovered ? "#3a7bd528" : "#3a7bd515",
                        border: "1px solid #3a7bd530", borderRadius: 8,
                        padding: "6px 14px", cursor: "pointer", fontWeight: 600,
                        transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 5,
                      }}>
                        <Receipt size={12} /> Facture
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, color: "#555" }}>Aucun résultat pour "<span style={{ color: "#888" }}>{search}</span>"</div>
            </div>
          )}

          {/* Footer / pagination */}
          <div style={{ padding: "14px 24px", borderTop: "1px solid #ffffff06", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#444" }}>
              Affichage de <span style={{ color: "#777", fontWeight: 600 }}>{filtered.length}</span> sur <span style={{ color: "#777", fontWeight: 600 }}>{paiements.length}</span> transactions
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["←", "1", "2", "→"].map((l, i) => (
                <button key={i} style={{
                  width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: l === "1" ? "#e6394620" : "#1a1a26",
                  color: l === "1" ? "#e63946" : "#555",
                  border: l === "1" ? "1px solid #e6394630" : "1px solid #ffffff08",
                  cursor: "pointer", display: "grid", placeItems: "center",
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Paiement;