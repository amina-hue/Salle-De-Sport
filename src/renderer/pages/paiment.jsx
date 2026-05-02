



import React, { useState, useEffect } from "react";
import { ChevronRight, Search, Plus, Check, Clock, Receipt, Users } from "lucide-react";
import gym from "../../images/gym.png";
import NouveauPaiementModal from "../components/NouveauPaiementModal";
import { useLocation, useNavigate } from "react-router-dom";

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
  "Payé":       { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", dot: "#22c55e" },
  "En attente": { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b" },
};

const methodeConfig = {
  "carte":    { label: "Carte bancaire", bg: "rgba(58,123,213,0.12)",  color: "#3a7bd5" },
  "virement": { label: "Virement",       bg: "rgba(139,92,246,0.12)",  color: "#8b5cf6" },
  "cash":     { label: "Espèces",        bg: "rgba(34,197,94,0.12)",   color: "#22c55e" },
};

const MODES = [
  { value: "cash",     label: "Espèces",        icon: "💵" },
  { value: "carte",    label: "Carte bancaire",  icon: "💳" },
  { value: "virement", label: "Virement",        icon: "🏦" },
];

// ── Montant à afficher : montantDu si en attente, sinon montant ─────────────
function getMontantAffiche(p) {
  if (p.statut === "En attente") return Number(p.montantDu || 0);
  return Number(p.montant || 0);
}

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

// ── Modal : choisir mode de paiement pour marquer comme payé ────────────────
function MarquerPayeModal({ paiement, onClose, onConfirm }) {
  const [mode, setMode] = useState("cash");
  const [loading, setLoading] = useState(false);
  const montant = getMontantAffiche(paiement);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm({ paiement, mode });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#1a1516", border: "1px solid #3d3233", borderRadius: 14, width: 420, padding: "28px 28px 24px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)", fontFamily: "'Barlow', sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: C.text, margin: 0, textTransform: "uppercase" }}>
            Marquer comme payé
          </h2>
          <p style={{ color: C.muted, fontSize: "0.82rem", marginTop: 6, marginBottom: 0 }}>
            {paiement.nom}
          </p>
        </div>

        {/* Montant */}
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: C.muted, fontWeight: 600 }}>Montant à encaisser</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: C.green }}>
            {montant.toLocaleString("fr-DZ")} DA
          </span>
        </div>

        {/* Mode de paiement */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: "0.78rem", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>
            Mode de paiement
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {MODES.map(m => {
              const selected = mode === m.value;
              return (
                <button key={m.value} onClick={() => setMode(m.value)} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                  border: selected ? `2px solid ${C.accent}` : "1px solid rgba(255,255,255,0.12)",
                  background: selected ? "rgba(229,57,53,0.12)" : "rgba(255,255,255,0.04)",
                  color: selected ? C.accent : C.muted,
                  fontFamily: "'Barlow', sans-serif", fontWeight: selected ? 700 : 400, fontSize: "0.78rem",
                  transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 20px", color: C.muted, fontFamily: "'Barlow', sans-serif", cursor: "pointer" }}>
            Annuler
          </button>
          <button onClick={handleConfirm} disabled={loading} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: loading ? "#555" : C.green, border: "none", borderRadius: 8,
            padding: "10px 22px", color: "#fff", fontFamily: "'Barlow', sans-serif",
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          }}>
            <Check size={14} /> {loading ? "Enregistrement..." : "Confirmer le paiement"}
          </button>
        </div>
      </div>
    </div>
  );
}

const generateFacturePDF = async (paiement) => {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const montant = getMontantAffiche(paiement);

    doc.setFillColor(14, 15, 17);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(240, 240, 240);
    doc.text('FACTURE FITMANAGER', 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Gestion des adhésions & paiements', 20, 32);

    doc.setFillColor(19, 21, 26);
    doc.rect(18, 50, 174, 65, 'F');
    doc.setDrawColor(60, 65, 70);
    doc.setLineWidth(0.8);
    doc.rect(18, 50, 174, 65, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(80, 85, 90);
    doc.text(`FACTURE #${paiement.id}`, 22, 62);
    doc.setFontSize(14);
    doc.setTextColor(180, 185, 190);
    doc.text('ADHÉRENT', 22, 75);
    doc.setFont('helvetica', 'bold');
    doc.text(`${paiement.nom || 'N/A'}`, 22, 83);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140, 145, 150);
    doc.text(`Date: ${paiement.date || 'N/A'}`, 22, 94);
    doc.text(`Méthode: ${methodeConfig[paiement.mode]?.label || paiement.mode || 'N/A'}`, 22, 102);
    doc.text(`Statut: ${paiement.statut || 'N/A'}`, 22, 110);

    doc.setFillColor(26, 29, 36);
    doc.rect(20, 118, 170, 28, 'F');
    doc.setDrawColor(229, 57, 53);
    doc.setLineWidth(1);
    doc.rect(20, 118, 170, 28, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(240, 240, 240);
    doc.text('MONTANT', 25, 133);
    const statusColor = paiement.statut === "Payé" ? [34, 197, 94] : [245, 158, 11];
    doc.setTextColor(...statusColor);
    doc.setFontSize(22);
    doc.text(`${montant.toLocaleString()} DA`, 185, 135, { align: 'right' });

    doc.setFillColor(14, 15, 17);
    doc.rect(0, 250, 210, 40, 'F');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('FitManager © 2026 - Tous droits réservés', 20, 265);
    doc.text(`Généré le ${new Date().toLocaleString('fr-DZ')}`, 20, 272);

    doc.save(`facture_${paiement.id}_${(paiement.nom || 'client').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  } catch (error) {
    console.error('Erreur facture PDF:', error);
    alert('Erreur génération facture');
  }
};

// ── Page principale ──────────────────────────────────────────────────────────
const Paiement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [listePaiements, setListePaiements] = useState([]);
  const [search, setSearch]                 = useState("");
  const [hoveredRow, setHoveredRow]         = useState(null);
  const [openModal, setOpenModal]           = useState(false);
  const [marquerModal, setMarquerModal]     = useState(null); // paiement ciblé

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

  // ── Confirmer le paiement : insère dans Paiement avec le montantDu ────────
  const handleConfirmerPaiement = async ({ paiement, mode }) => {
    try {
      const montant = getMontantAffiche(paiement);
      // On insère un vrai paiement dans la table Paiement
      const res = await window.api.addPaiement({
        abonnement_id: paiement.id, // id = idAbonnement pour les "En attente"
        montant,
        date: new Date().toISOString().split('T')[0],
        mode,
      });
      if (res?.success) {
        setMarquerModal(null);
        await fetchPaiements();
      } else {
        alert("Erreur : " + (res?.error || "inconnue"));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de communication.");
    }
  };

  const handleSaveNewPaiement = async (formData) => {
    try {
      const response = await window.api.addPaiement(formData);
      if (response?.success) {
        setOpenModal(false);
        await fetchPaiements();
      } else {
        alert("Erreur : " + (response?.error || "inconnue"));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de communication.");
    }
  };

  const filtered = listePaiements.filter(p =>
    p.nom?.toLowerCase().includes(search.toLowerCase()) ||
    p.id?.toString().includes(search)
  );

  const payés   = filtered.filter(p => p.statut === "Payé");
  const attente = filtered.filter(p => p.statut === "En attente");

  const totalEncaisse = payés.reduce((acc, p)   => acc + Number(p.montant   || 0), 0);
  const totalAttente  = attente.reduce((acc, p) => acc + Number(p.montantDu || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gym})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Paiements</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Gestion financière
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: filtered.length,  label: "total",      color: C.subtle },
                { count: payés.length,     label: "payés",      color: C.green  },
                { count: attente.length,   label: "en attente", color: C.gold   },
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

      {/* Toolbar */}
      <div style={{ display: "flex", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 440 }}>
          <Search size={15} color={C.muted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Rechercher un adhérent..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 14px 10px 38px", color: C.text, outline: "none", fontFamily: "'Barlow', sans-serif" }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px" }}>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          <StatCard title="Total paiements" value={filtered.length}
            sub={`${totalEncaisse.toLocaleString("fr-DZ")} DA encaissés`} icon={Users}
            bg="linear-gradient(145deg,#1a1d24,#252833)" border="rgba(107,114,128,0.2)"
            color={C.subtle} softBg="rgba(107,114,128,0.12)" softBorder="rgba(107,114,128,0.3)" />
          <StatCard title="Revenus encaissés" value={`${totalEncaisse.toLocaleString("fr-DZ")} DA`}
            sub={`${payés.length} paiements`} icon={Check}
            bg="linear-gradient(145deg,#1F2A25,#2F4F3E)" border="rgba(46,204,113,0.2)"
            color="#22c55e" softBg="rgba(46,204,113,0.18)" softBorder="rgba(46,204,113,0.3)" />
          <StatCard title="En attente" value={`${totalAttente.toLocaleString("fr-DZ")} DA`}
            sub={`${attente.length} paiements`} icon={Clock}
            bg="linear-gradient(145deg,#2A2515,#4A3A10)" border="rgba(245,158,11,0.2)"
            color="#f59e0b" softBg="rgba(245,158,11,0.18)" softBorder="rgba(245,158,11,0.3)" />
        </div>

        {/* Table */}
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
                const status  = statusConfig[p.statut] || statusConfig["En attente"];
                const mConfig = methodeConfig[p.mode] || { label: p.mode || "—", bg: "rgba(255,255,255,0.08)", color: C.muted };
                const montantAffiche = getMontantAffiche(p);
                return (
                  <tr key={`${p.id}-${i}`}
                    style={{ borderTop: `1px solid ${C.border}`, background: hoveredRow === i ? C.cardHover : "transparent" }}
                    onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>

                    <td style={{ padding: "15px 22px", fontSize: "0.72rem", color: C.muted, fontFamily: "monospace" }}>#{p.id}</td>

                    <td style={{ padding: "15px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "25", border: `1px solid ${avatarColors[i % avatarColors.length]}55`, display: "grid", placeItems: "center", color: avatarColors[i % avatarColors.length], fontWeight: 800, fontSize: "0.7rem" }}>
                          {p.nom?.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: C.text }}>{p.nom}</span>
                      </div>
                    </td>

                    {/* Montant : montantDu si en attente, sinon montant */}
                    <td style={{ padding: "15px 22px", fontWeight: 800, color: p.statut === "En attente" ? C.gold : C.text }}>
                      {montantAffiche.toLocaleString("fr-DZ")} DA
                      {p.statut === "En attente" && (
                        <span style={{ display: "block", fontSize: "0.65rem", color: C.muted, fontWeight: 400 }}>à collecter</span>
                      )}
                    </td>

                    <td style={{ padding: "15px 22px", fontSize: "0.78rem", color: C.muted }}>
                      {p.datePaiementRaw ? new Date(p.datePaiementRaw).toLocaleDateString("fr-FR") : "—"}
                    </td>

                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.7rem", background: mConfig.bg, color: mConfig.color, padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>
                        {mConfig.label}
                      </span>
                    </td>

                    <td style={{ padding: "15px 22px" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot }} />
                        {p.statut}
                      </span>
                    </td>

                    <td style={{ padding: "15px 22px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => generateFacturePDF(p)} style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent; }}>
                          <Receipt size={12} /> Facture
                        </button>

                        {p.statut === "En attente" && (
                          <button onClick={() => setMarquerModal(p)} style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5, fontWeight: 600, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.22)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(34,197,94,0.12)"}>
                            <Check size={12} /> Marquer payé
                          </button>
                        )}
                      </div>
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

      {/* Modal marquer payé */}
      {marquerModal && (
        <MarquerPayeModal
          paiement={marquerModal}
          onClose={() => setMarquerModal(null)}
          onConfirm={handleConfirmerPaiement}
        />
      )}

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