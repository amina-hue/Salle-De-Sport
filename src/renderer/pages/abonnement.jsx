import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import Button from "../components/AddButton";
import gym from "../../images/gym.png";
import NouvelTypeAbonnementModal from '../components/NouvelTypeAbonnementModal';

/* ─── PLAN CARD ─── */
const PlanCard = ({ plan, onEdit, onDelete }) => {
  const isPremium = plan.tier === "premium";
  const accent = isPremium ? "#e63946" : "#3a7bd5";
  return (
    <div
      style={{ background: "rgba(21,20,20,0.75)", borderRadius: 14, padding: "20px", border: "1px solid rgb(20,19,19)", position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${accent}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Badge tier */}
      <div style={{ position: "absolute", top: 0, right: 0, background: isPremium ? "linear-gradient(135deg,#e63946,#c1121f)" : "linear-gradient(135deg,#3a7bd5,#1a56b0)", fontSize: 9, color: "#fff", padding: "3px 10px", borderBottomLeftRadius: 8, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" }}>
        {isPremium ? "Premium" : "Standard"}
      </div>

      {/* Durée */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: "#999", fontSize: 10, background: "#ffffff0d", padding: "2px 8px", borderRadius: 20 }}>
          {plan.duration}
        </span>
      </div>

      {/* Nom */}
      <h3 style={{ color: "#f1f1f1", fontSize: 14, fontWeight: 700, margin: "6px 0 2px" }}>{plan.name}</h3>

      {/* Prix */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "10px 0 4px" }}>
        <span style={{ color: accent, fontSize: 24, fontWeight: 800 }}>{plan.price}</span>
      </div>
      <p style={{ color: "#555", fontSize: 11, margin: "0 0 14px" }}>{plan.per}</p>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", minHeight: 36 }}>
        {plan.features && plan.features.length > 0 ? (
          plan.features.map((f, i) => (
            <li key={i} style={{ fontSize: 12, color: "#aaa", display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{ color: accent, fontSize: 14 }}>✓</span>{f}
            </li>
          ))
        ) : (
          <li style={{ fontSize: 12, color: "#444", fontStyle: "italic" }}>Aucune règle définie</li>
        )}
      </ul>

      {/* Footer carte */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ffffff08", paddingTop: 12 }}>
        <span style={{ fontSize: 11, color: "#666" }}>
          <span style={{ color: "#f1f1f1", fontWeight: 600 }}>{plan.members}</span> adhérents
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: plan.full ? "#e6394620" : "#22c55e20", color: plan.full ? "#e63946" : "#22c55e" }}>
          {plan.full ? "COMPLET" : "ACTIF"}
        </span>
      </div>

      {/* Boutons */}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button
          onClick={onEdit}
          style={{ flex: 1, padding: "7px 0", fontSize: 11, background: `${accent}18`, color: accent, border: `1px solid ${accent}33`, borderRadius: 7, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = `${accent}30`}
          onMouseLeave={e => e.currentTarget.style.background = `${accent}18`}
        >
          <Edit2 size={12} /> Modifier
        </button>
        <button
          onClick={onDelete}
          style={{ padding: "7px 10px", fontSize: 11, background: "#e6394615", color: "#e63946", border: "1px solid #e6394633", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center" }}
          onMouseEnter={e => e.currentTarget.style.background = "#e6394630"}
          onMouseLeave={e => e.currentTarget.style.background = "#e6394615"}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

/* ─── EXPIRY TABLE (statique pour l'instant) ─── */
const expiryData = [
  { initials: "SM", name: "Sophie Martin", plan: "Premium Mensuel",     days: "2 jours",  status: "urgent",  color: "#e63946" },
  { initials: "LB", name: "Lucas Bernard", plan: "Standard Mensuel",    days: "4 jours",  status: "warning", color: "#f59e0b" },
  { initials: "ED", name: "Emma Dubois",   plan: "Premium Trimestriel", days: "4 jours",  status: "warning", color: "#f59e0b" },
  { initials: "TP", name: "Thomas Petit",  plan: "Standard Mensuel",    days: "6 jours",  status: "warning", color: "#f59e0b" },
  { initials: "JM", name: "Julie Moreau",  plan: "Premium Annuel",      days: "22 jours", status: "ok",      color: "#22c55e" },
];
const avatarColors = ["#e63946", "#3a7bd5", "#f59e0b", "#8b5cf6", "#22c55e"];

/* ─── PAGE PRINCIPALE ─── */
const AbonnementsPage = () => {
  const [types, setTypes]               = useState([]);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [typeAEditer, setTypeAEditer]   = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id du type à supprimer

  /* Charge les types depuis la DB */
  const fetchTypes = async () => {
    const data = await window.electron.getTypeAbonnements();
    setTypes(data);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  /* Suppression */
  const handleDeleteType = async (id) => {
    setDeleteConfirm(id); // ouvre la confirmation
  };

  const confirmDelete = async () => {
    await window.electron.deleteTypeAbonnement(deleteConfirm);
    setDeleteConfirm(null);
    fetchTypes();
  };

  /* Après ajout ou modification */
  const handleSaveType = async () => {
    await fetchTypes();
    setModalTypeOpen(false);
  };

  return (
    <div style={{
      flex: 1,
      height: "100%",
      overflowY: "auto",
      padding: "30px 32px",
      backgroundImage: `linear-gradient(rgba(11,11,18,0.6), rgba(11,11,18,0.95)), url(${gym})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#f1f1f1",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.3px" }}>Gestion des abonnements</h1>
          <p style={{ margin: "4px 0 0", color: "#c2bcbc", fontSize: 13 }}>Gérez vos types d'abonnements disponibles</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setTypeAEditer(null);
            setModalTypeOpen(true);
          }}
        >
          Ajouter un type
        </Button>
      </div>

      {/* ── Modal ajout / modification ── */}
      {modalTypeOpen && (
        <NouvelTypeAbonnementModal
          type={typeAEditer}
          onSave={handleSaveType}
          onClose={() => setModalTypeOpen(false)}
        />
      )}

      {/* ── Modal confirmation suppression ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#1a1516", borderRadius: 14, padding: "28px 32px", maxWidth: 380, width: "100%", margin: "0 20px", border: "1px solid #e6394633", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#e6394622", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={18} color="#e63946" />
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f1f1f1" }}>Supprimer ce type ?</h3>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>
              Cette action est irréversible. Les abonnements liés à ce type pourraient être affectés.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 20px", color: "#888", fontFamily: "inherit", fontSize: "0.875rem", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                style={{ background: "#e63946", border: "none", borderRadius: 8, padding: "9px 22px", color: "#fff", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1a1a26", border: "1px solid #e6394633", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
        <AlertCircle size={18} color="#e63946" />
        <div>
          <span style={{ color: "#f1f1f1", fontWeight: 600, fontSize: 13 }}>Abonnements à renouveler — </span>
          <span style={{ color: "#888", fontSize: 13 }}>8 abonnements expirent dans les 15 prochains jours. Pensez à contacter vos adhérents.</span>
        </div>
      </div>

      {/* ── Plans cards depuis DB ── */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#ccc", letterSpacing: "-.2px" }}>
          Plans disponibles
          <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#555", background: "#ffffff0d", padding: "2px 10px", borderRadius: 20 }}>
            {types.length} plan{types.length > 1 ? "s" : ""}
          </span>
        </h2>

        {types.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#444", fontSize: 13, border: "1px dashed #333", borderRadius: 14 }}>
            Aucun type d'abonnement — cliquez sur "Ajouter un type" pour commencer
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {types.map((t) => (
              <PlanCard
                key={t.id}
                plan={{
                  name:     t.nom,
                  duration: `${t.duree} mois`,
                  price:    `${Number(t.prix).toLocaleString()} DA`,
                  per:      `par ${t.duree} mois`,
                  features: [],
                  members:  0,
                  full:     false,
                  tier:     t.nom.toLowerCase().includes('premium') ? 'premium' : 'standard',
                }}
                onEdit={() => {
                  setTypeAEditer(t);
                  setModalTypeOpen(true);
                }}
                onDelete={() => handleDeleteType(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Expiry table ── */}
      <div style={{ background: "#271D1F", borderRadius: 16, border: "1px solid #2a2a3a", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #1e1819" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#eee" }}>Abonnements arrivant à expiration</h2>
          <p style={{ margin: "3px 0 0", color: "#888", fontSize: 12 }}>Quotas des renouvellements à venir</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1e1819" }}>
              {["ADHÉRENT", "ABONNEMENT", "EXPIRE DANS", "STATUT", "ACTIONS"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: 10, color: "#aaa", letterSpacing: ".8px", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            {expiryData.map((row, i) => (
              <tr key={i}
                style={{ borderTop: "1px solid #2a2a3a", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#2a2a3a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "13px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "33", border: `1px solid ${avatarColors[i % avatarColors.length]}55`, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: avatarColors[i % avatarColors.length] }}>
                      {row.initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#eee" }}>{row.name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 22px", fontSize: 13, color: "#ccc" }}>{row.plan}</td>
                <td style={{ padding: "13px 22px", fontSize: 13, color: "#bbb", fontWeight: 600 }}>{row.days}</td>
                <td style={{ padding: "13px 22px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: row.color + "33", color: row.color }}>
                    {row.status === "urgent" ? "Urgent" : row.status === "warning" ? "Bientôt" : "OK"}
                  </span>
                </td>
                <td style={{ padding: "13px 22px" }}>
                  <button
                    style={{ fontSize: 12, color: "#3a7bd5", background: "#3a7bd533", border: "1px solid #3a7bd544", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#3a7bd544"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#3a7bd533"; e.currentTarget.style.color = "#3a7bd5"; }}
                  >
                    Contacter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AbonnementsPage;