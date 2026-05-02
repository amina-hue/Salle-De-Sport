import React, { useState, useEffect } from "react";
import { ChevronRight, Search, Plus, Check, Clock, AlertTriangle, Receipt } from "lucide-react";
import gym from "../../images/gym.png";
import NouveauPaiementModal from "../components/NouveauPaiementModal";
import { useLocation, useNavigate } from "react-router-dom"; 
import gym2 from "../../images/gym2.png";
import QuickActions from "../components/QuickActions";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b",
};

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

const StatCard = ({ title, value, sub, icon: Icon, bg, border, color, softBg, softBorder }) => (
  <div style={{ flex: 1, background: bg, borderRadius: 14, padding: "20px 22px", border: `1px solid ${border}`, position: "relative", overflow: "hidden", transition: "transform .2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "none"}>
    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${softBg},transparent 70%)` }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>{title}</p>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{value}</h2>
        {sub && <p style={{ color, fontSize: "0.78rem", marginTop: 6, marginBottom: 0, fontWeight: 600 }}>{sub}</p>}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: softBg, border: `1px solid ${softBorder}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={17} color={color} />
      </div>
    </div>
  </div>
);

const Paiement = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  const [listePaiements, setListePaiements] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchPaiements = async () => {
    if (window.api?.getPaiements) {
      const data = await window.api.getPaiements();
      setListePaiements(data || []);
    }
  };

  useEffect(() => {
    fetchPaiements();
    const params = new URLSearchParams(location.search);
    if (params.get('openModal') === 'true') {
      setOpenModal(true);
      navigate('/paiements', { replace: true });
    }
  }, [location.search]);

  const handleSaveNewPaiement = async (formData) => {
    try {
      const response = await window.api.addPaiement(formData);
      if (response?.success) {
        setOpenModal(false);
        await fetchPaiements();
      } else {
        alert("Erreur lors de l'enregistrement : " + (response?.error || "inconnue"));
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur de communication avec la base de données.");
    }
  };

  const filtered = listePaiements.filter(p => 
    p.nom?.toLowerCase().includes(search.toLowerCase()) || 
    p.id?.toString().includes(search)
  );

  const stats = {
    paye: filtered.filter(p => p.statut === "Payé"),
    attente: filtered.filter(p => p.statut === "En attente"),
    retard: filtered.filter(p => p.statut === "En retard"),
  };

  const totalEncaisse = stats.paye.reduce((acc, p) => acc + Number(p.montant), 0);
  const totalAttente = stats.attente.reduce((acc, p) => acc + Number(p.montant), 0);
  const totalRetard = stats.retard.reduce((acc, p) => acc + Number(p.montant), 0);

  return (
        <div style={{
           display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
           backgroundImage: `url(${gym2})`,
           backgroundSize: "cover", backgroundPosition: "center 35%", backgroundAttachment: "fixed",
           position: "relative"
         }}>
             {/* ── Overlay sombre — sous tout le contenu ── */}
         <div style={{
           position: "fixed", inset: 0,
           background: "rgba(14,15,17,0.72)",
           pointerEvents: "none",
           zIndex: -1
         }} />

      {/* Hero Header */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gym})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        
        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Paiements</span>
               <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Gestion financière
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[{ count: stats.paye.length, label: "payés", color: C.green },
                { count: stats.attente.length, label: "en attente", color: C.gold },
                { count: stats.retard.length, label: "en retard", color: C.accent }
              ].map(({ count, label, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "0.82rem", color: C.muted }}><strong style={{ color }}>{count}</strong> {label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setOpenModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)" }}>
            <Plus size={17} /> Nouveau Paiement
          </button>
        </div>
      </div>

      {/* Toolbar sans boutons Filtrer/Exporter */}
      <div style={{ 
        display: "flex", 
        padding: "14px 36px", 
        background: C.bg, 
        borderBottom: `1px solid ${C.border}`, 
        alignItems: "center" 
      }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 440 }}>
          <Search size={15} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Rechercher un adhérent..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 14px 10px 38px", color: C.text, outline: "none" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px" }}>
        
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          <StatCard title="Revenus encaissés" value={`${totalEncaisse.toLocaleString()} DA`} sub={`${stats.paye.length} paiements`} icon={Check}
            bg="linear-gradient(145deg,#1F2A25,#2F4F3E)" border="rgba(46,204,113,0.2)"
            color="#22c55e" softBg="rgba(46,204,113,0.18)" softBorder="rgba(46,204,113,0.3)" />
          <StatCard title="En attente" value={`${totalAttente.toLocaleString()} DA`} sub={`${stats.attente.length} paiements`} icon={Clock}
            bg="linear-gradient(145deg,#2A2515,#4A3A10)" border="rgba(245,158,11,0.2)"
            color="#f59e0b" softBg="rgba(245,158,11,0.18)" softBorder="rgba(245,158,11,0.3)" />
          <StatCard title="En retard" value={`${totalRetard.toLocaleString()} DA`} sub={`${stats.retard.length} paiement`} icon={AlertTriangle}
            bg="linear-gradient(145deg,#2A1F1F,#5A1F1F)" border="rgba(229,57,53,0.2)"
            color="#e53935" softBg="rgba(229,57,53,0.18)" softBorder="rgba(229,57,53,0.3)" />
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14161c" }}>
                {["ID", "Adhérent", "Montant", "Date", "Méthode", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 22px", fontSize: "0.65rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const status = statusConfig[p.statut] || statusConfig["En attente"];
                const methode = methodeConfig[p.mode] || { bg: "rgba(255,255,255,0.08)", color: C.muted };
                return (
                  <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, background: hoveredRow === i ? C.cardHover : "transparent" }}
                    onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                    <td style={{ padding: "15px 22px", fontSize: "0.72rem", color: C.muted, fontFamily: "monospace" }}>#{p.id}</td>
                    <td style={{ padding: "15px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "25", border: `1px solid ${avatarColors[i % avatarColors.length]}55`, display: "grid", placeItems: "center", color: avatarColors[i % avatarColors.length], fontWeight: 800, fontSize: '0.7rem' }}>
                          {p.nom?.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: C.text }}>{p.nom}</span>
                      </div>
                    </td>
                    <td style={{ padding: "15px 22px", fontWeight: 800, color: C.text }}>{Number(p.montant).toLocaleString()} DA</td>
                    <td style={{ padding: "15px 22px", fontSize: "0.78rem", color: C.muted }}>{p.date}</td>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.7rem", background: methode.bg, color: methode.color, padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>{p.mode}</span>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot }} />
                        {p.statut}
                      </span>
                    </td>
                    <td style={{ padding: "15px 22px" }}>
                      <button style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5 }}>
                        <Receipt size={12} /> Facture
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: C.muted }}>Aucun paiement trouvé.</div>
          )}
        </div>
      </div>

      {openModal && (
        <NouveauPaiementModal
          onClose={() => setOpenModal(false)}
          onSave={handleSaveNewPaiement}
        />
      )}
    </div>
  );
};

export default Paiement;