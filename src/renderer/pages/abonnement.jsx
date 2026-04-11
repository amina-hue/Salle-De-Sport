import React, { useState, useEffect } from "react";
import { ChevronRight, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import gym from "../../images/gym.png";
import NouvelTypeAbonnementModal from "../components/NouvelTypeAbonnementModal";
import { useLocation, useNavigate } from "react-router-dom";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3a7bd5",
};

const avatarColors = [C.accent, C.blue, C.gold, "#8b5cf6", C.green];

function initials(nom, prenom) {
  return `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase();
}

/* ── Plan Card ── */
const PlanCard = ({ plan, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const isPremium = plan.tier === "premium";
  const accent = isPremium ? C.accent : C.blue;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${hovered ? accent : C.border}`,
        borderRadius: 14, overflow: "hidden", position: "relative",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 16px 40px ${accent}22` : "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Tier badge */}
      <div style={{ position: "absolute", top: 0, right: 0, background: isPremium ? "linear-gradient(135deg,#e53935,#c1121f)" : "linear-gradient(135deg,#3a7bd5,#1a56b0)", fontSize: "0.6rem", color: "#fff", padding: "3px 10px", borderBottomLeftRadius: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Barlow', sans-serif" }}>
        {isPremium ? "Premium" : "Standard"}
      </div>

      <div style={{ padding: "20px" }}>
        <span style={{ color: C.muted, fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
          {plan.duration}
        </span>

        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "8px 0 4px" }}>
          {plan.name}
        </h3>

        <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "10px 0 2px" }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: accent, fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 }}>{plan.price}</span>
        </div>
        <p style={{ color: C.muted, fontSize: "0.72rem", margin: "0 0 14px", fontFamily: "'Barlow', sans-serif" }}>{plan.per}</p>

        {/* Features */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", minHeight: 36 }}>
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((f, i) => (
              <li key={i} style={{ fontSize: "0.78rem", color: C.subtle, display: "flex", alignItems: "center", gap: 6, marginBottom: 5, fontFamily: "'Barlow', sans-serif" }}>
                <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>✓</span>{f}
              </li>
            ))
          ) : (
            <li style={{ fontSize: "0.72rem", color: C.muted, fontStyle: "italic", fontFamily: "'Barlow', sans-serif" }}>Aucune règle définie</li>
          )}
        </ul>

        {/* Footer — ✅ nombre_adherents réel */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <span style={{ fontSize: "0.72rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>
            <span style={{ color: C.text, fontWeight: 600 }}>{plan.members}</span> adhérent{plan.members !== 1 ? 's' : ''} actif{plan.members !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20, fontFamily: "'Barlow', sans-serif", background: "rgba(34,197,94,0.12)", color: C.green }}>
            ACTIF
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button onClick={onEdit} style={{ flex: 1, padding: "8px 0", fontSize: "0.78rem", background: `${accent}18`, color: accent, border: `1px solid ${accent}33`, borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: "'Barlow', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = `${accent}30`}
            onMouseLeave={e => e.currentTarget.style.background = `${accent}18`}>
            <Edit2 size={12} /> Modifier
          </button>
          <button onClick={onDelete} style={{ padding: "8px 12px", fontSize: "0.78rem", background: C.accentDim, color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(229,57,53,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = C.accentDim}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Page ── */
const AbonnementsPage = () => {
    const location = useLocation();
  const navigate = useNavigate();
  const [types, setTypes]                 = useState([]);
  const [expirant, setExpirant]           = useState([]);   // ✅ vrais données
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [typeAEditer, setTypeAEditer]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Chargement ──────────────────────────────────────────────────────────
  const fetchTypes = async () => {
    try {
      const data = await window.api.getTypeAbonnements();
      setTypes(data);
    } catch (err) {
      console.error('getTypeAbonnements:', err);
    }
  };

  const fetchExpirant = async () => {
    try {
      const data = await window.api.getAbonnementsExpirant();
      setExpirant(data);
    } catch (err) {
      console.error('getAbonnementsExpirant:', err);
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchExpirant();
  }, []);
   useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openModal') === 'true') {
      setTypeAEditer(null);
      setModalTypeOpen(true);
      navigate('/abonnements', { replace: true });
    }
  }, [location.search]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveType = async () => {
    await fetchTypes();
    setModalTypeOpen(false);
  };

  const handleDeleteType = (id) => setDeleteConfirm(id);

  const confirmDelete = async () => {
    await window.api.deleteTypeAbonnement(deleteConfirm);
    setDeleteConfirm(null);
    fetchTypes();
  };

  // ── Statut badge expiration ──────────────────────────────────────────────
  const statusInfo = (jours) => {
    if (jours <= 3)  return { label: "Urgent",  color: C.accent };
    if (jours <= 10) return { label: "Bientôt", color: C.gold   };
    return               { label: "OK",      color: C.green  };
  };

  const nbExpirant = expirant.length;

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
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Abonnements</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Gestion des abonnements
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: types.length, label: "types disponibles", color: C.muted },
                { count: nbExpirant,   label: "expirent bientôt",  color: C.gold  },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>
                      <strong style={{ color }}>{count}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setTypeAEditer(null); setModalTypeOpen(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,57,53,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.4)"; }}>
            <Plus size={17} /> Ajouter un type
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>

        {/* Alert dynamique */}
        {nbExpirant > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, border: `1px solid ${C.accentBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
            <AlertCircle size={18} color={C.accent} />
            <div style={{ fontFamily: "'Barlow', sans-serif" }}>
              <span style={{ color: C.text, fontWeight: 600, fontSize: "0.875rem" }}>Abonnements à renouveler — </span>
              <span style={{ color: C.muted, fontSize: "0.875rem" }}>
                {nbExpirant} abonnement{nbExpirant > 1 ? 's expirent' : ' expire'} dans les 30 prochains jours. Pensez à contacter vos adhérents.
              </span>
            </div>
          </div>
        )}

        {/* Plans */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.3rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, margin: 0, color: C.text }}>Plans disponibles</h2>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: C.muted, background: "rgba(255,255,255,0.05)", padding: "2px 10px", borderRadius: 20, fontFamily: "'Barlow', sans-serif" }}>
              {types.length} plan{types.length > 1 ? "s" : ""}
            </span>
          </div>

          {types.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontSize: "0.875rem", border: `1px dashed ${C.border}`, borderRadius: 14, fontFamily: "'Barlow', sans-serif" }}>
              Aucun type d'abonnement — cliquez sur "Ajouter un type" pour commencer
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {types.map(t => (
                <PlanCard
                  key={t.id}
                  plan={{
                    name:     t.nom,
                    duration: `${t.duree} mois`,
                    price:    `${Number(t.prix).toLocaleString()} DA`,
                    per:      `par ${t.duree} mois`,
                    features: t.features ?? [],
                    members:  t.nombre_adherents ?? 0,   // ✅ depuis la BDD
                    tier:     t.nom.toLowerCase().includes("premium") ? "premium" : "standard",
                  }}
                  onEdit={() => { setTypeAEditer(t); setModalTypeOpen(true); }}
                  onDelete={() => handleDeleteType(t.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ✅ Tableau expiration — données réelles */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", margin: 0, fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.text }}>
              Abonnements arrivant à expiration
            </h2>
            <p style={{ margin: "3px 0 0", color: C.muted, fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif" }}>
              Adhérents dont l'abonnement expire dans les 30 prochains jours
            </p>
          </div>

          {expirant.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: "0.875rem", fontFamily: "'Barlow', sans-serif" }}>
              ✅ Aucun abonnement n'expire dans les 30 prochains jours.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#14161c" }}>
                  {["Adhérent", "Abonnement", "Expire dans", "Date fin", "Statut", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: "0.65rem", color: C.muted, letterSpacing: 1, fontWeight: 700, fontFamily: "'Barlow', sans-serif", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expirant.map((row, i) => {
                  const jours = Number(row.joursRestants);
                  const { label, color } = statusInfo(jours);
                  const expireLabel = jours === 0 ? "Aujourd'hui" : jours === 1 ? "Demain" : `${jours} jours`;
                  const dateFin = row.dateFin ? new Date(row.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

                  return (
                    <tr key={i} style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                      {/* Adhérent */}
                      <td style={{ padding: "13px 22px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "25", border: `1.5px solid ${avatarColors[i % avatarColors.length]}55`, display: "grid", placeItems: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.75rem", fontWeight: 700, color: avatarColors[i % avatarColors.length], flexShrink: 0 }}>
                            {initials(row.nom, row.prenom)}
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: C.text, fontFamily: "'Barlow', sans-serif" }}>
                            {row.prenom} {row.nom}
                          </span>
                        </div>
                      </td>

                      {/* Type abonnement */}
                      <td style={{ padding: "13px 22px", fontSize: "0.875rem", color: C.subtle, fontFamily: "'Barlow', sans-serif" }}>
                        {row.typeNom}
                      </td>

                      {/* Jours restants */}
                      <td style={{ padding: "13px 22px", fontSize: "0.875rem", color: color, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {expireLabel}
                      </td>

                      {/* Date fin */}
                      <td style={{ padding: "13px 22px", fontSize: "0.8rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}>
                        {dateFin}
                      </td>

                      {/* Statut */}
                      <td style={{ padding: "13px 22px" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Barlow', sans-serif", background: color + "22", color }}>
                          {label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 22px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {row.numTelephone && (
                            <a href={`tel:${row.numTelephone}`} style={{ fontSize: "0.78rem", color: C.blue, background: "rgba(58,123,213,0.12)", border: "1px solid rgba(58,123,213,0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "'Barlow', sans-serif", textDecoration: "none", display: "inline-block" }}>
                              📞 Appeler
                            </a>
                          )}
                          {row.email && (
                            <a href={`mailto:${row.email}`} style={{ fontSize: "0.78rem", color: C.gold, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "'Barlow', sans-serif", textDecoration: "none", display: "inline-block" }}>
                              ✉ Email
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalTypeOpen && (
        <NouvelTypeAbonnementModal type={typeAEditer} onSave={handleSaveType} onClose={() => setModalTypeOpen(false)} />
      )}

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div style={{ background: "#1a1d24", border: `1px solid ${C.accentBorder}`, borderRadius: 14, padding: "28px 32px", maxWidth: 380, width: "100%", margin: "0 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: C.accentDim, borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={18} color={C.accent} />
              </div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", margin: 0, fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", color: C.text }}>Supprimer ce type ?</h3>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: "0.875rem", color: C.muted, lineHeight: 1.6, fontFamily: "'Barlow', sans-serif" }}>
              Cette action est irréversible. Les abonnements liés à ce type seront supprimés.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 20px", color: C.muted, fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", cursor: "pointer" }}>Annuler</button>
              <button onClick={confirmDelete} style={{ background: C.accent, border: "none", borderRadius: 8, padding: "9px 22px", color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbonnementsPage;