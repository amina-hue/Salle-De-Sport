import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import gymBg from "../../images/Gymnastique.png";
import QuickActions from "../components/QuickActions";
import { useNavigate } from 'react-router-dom';
const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

const COLORS_PIE     = ["#e53935", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"];
const COLORS_RENEWAL = ["#22c55e", "#e53935"];

const JOURS_FR = {
  Monday: "Lun", Tuesday: "Mar", Wednesday: "Mer",
  Thursday: "Jeu", Friday: "Ven", Saturday: "Sam", Sunday: "Dim"
};

export default function StatistiquesAbonnement({ onPageChange }) {
  const routerNavigate = useNavigate(); // ajoute useNavigate dans l'import
  const navigate = (page) => {
    if (page === 'abonnement') routerNavigate('/statistiques/abonnements');
    else if (page === 'adherent') routerNavigate('/statistiques/adherents');
    else if (page === 'revenue') routerNavigate('/statistiques/revenue');
    else if (onPageChange) onPageChange(page);
  };
  const [stats,        setStats]        = useState({ total: 0, actifs: 0, expires: 0, suspendus: 0 });
  const [parType,      setParType]      = useState([]);
  const [expirants,    setExpirants]    = useState([]);
  const [frequentation, setFrequentation] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, pt, ex, fr] = await Promise.all([
        window.api.getStatsAbonnements(),
        window.api.getAbonnementsParType(),
        window.api.getAbonnementsExpirantBientot(),
        window.api.getFrequentationHebdo(),
      ]);
      setStats(s || { total: 0, actifs: 0, expires: 0, suspendus: 0 });
      setParType(pt || []);
      setExpirants(ex || []);
      // Traduire les jours en français
      setFrequentation((fr || []).map(r => ({ ...r, day: JOURS_FR[r.day] || r.day })));
    } catch (err) {
      console.error("Erreur chargement stats abonnements", err);
    } finally {
      setLoading(false);
    }
  };

  // Données renouvellement vs résiliation (actifs vs expirés)
  const renewalData = [
    { name: "Actifs",   value: Number(stats.actifs)  || 0 },
    { name: "Expirés",  value: Number(stats.expires) || 0 },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatJours = (jours) => {
    if (jours === 0) return "Expire aujourd'hui";
    if (jours < 0)  return "Expiré";
    return `Expire dans ${jours} jour${jours > 1 ? "s" : ""}`;
  };

  const STAT_CARDS = [
    { label: "Total abonnements",   value: stats.total,     trend: `${stats.actifs} actifs`,     trendColor: C.green, bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
    { label: "Abonnements actifs",  value: stats.actifs,    trend: `sur ${stats.total} total`,   trendColor: C.green, bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
    { label: "Abonnements expirés", value: stats.expires,   trend: `${stats.suspendus} suspendus`, trendColor: C.gold, bg: "linear-gradient(135deg,#2D3832,#242227)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* Hero Header */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gymBg})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />
        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <QuickActions navigate={navigate} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, marginTop: 12 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Statistiques</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Abonnement</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Statistiques Abonnement
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: stats.total,   label: "total",    color: C.muted  },
                { count: stats.actifs,  label: "actifs",   color: C.green  },
                { count: stats.expires, label: "expirés",  color: C.accent },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted }}>
                      <strong style={{ color }}>{count || 0}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: "center" }}>
        <div style={{ background: "#1a1d24", borderRadius: 9999, padding: 4, display: "inline-flex", gap: 4, border: `1px solid ${C.border}` }}>
          {[
            { label: "Abonnement", page: "abonnement", active: true  },
            { label: "Adhérent",   page: "adherent",   active: false },
            { label: "Revenue",    page: "revenue",    active: false },
          ].map(({ label, page, active }) => (
            <button key={page} onClick={() => navigate(page)}
              style={{ padding: "8px 28px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: active ? 700 : 400, background: active ? C.accent : "transparent", color: active ? "#fff" : C.muted, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>

        {loading ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 60, fontSize: "0.9rem" }}>Chargement...</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              {STAT_CARDS.map(({ label, value, trend, trendColor, bg }) => (
                <div key={label} style={{ flex: 1, borderRadius: 14, padding: "20px 22px", background: bg, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.22s", cursor: "default" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                  <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>{label}</p>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.8rem", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{value || 0}</h2>
                  <p style={{ color: trendColor, fontSize: "0.78rem", marginTop: 8, marginBottom: 0, fontWeight: 600 }}>{trend}</p>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>

              {/* Fréquentation */}
              <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
                  Abonnements débutés cette semaine
                </h3>
                <div style={{ height: 260 }}>
                  {frequentation.length === 0 ? (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: "0.85rem" }}>
                      Pas de données cette semaine
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={frequentation} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="day" stroke="#888" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
                        <YAxis stroke="#888" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }} labelStyle={{ color: C.text }} />
                        <Line type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Répartition par type */}
              <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0, textAlign: "center" }}>
                  Répartition des abonnements
                </h3>
                {parType.length === 0 ? (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: "0.85rem" }}>
                    Pas de données
                  </div>
                ) : (
                  <>
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={parType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                            {parType.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                      {parType.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS_PIE[i % COLORS_PIE.length], display: "inline-block" }} />
                          <span style={{ color: C.muted, fontSize: "0.72rem" }}>{item.name}</span>
                          <span style={{ color: C.text, fontSize: "0.72rem", fontWeight: 700 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "flex", gap: 20 }}>

              {/* Actifs vs Expirés */}
              <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0, textAlign: "center" }}>
                  Actifs vs Expirés
                </h3>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={renewalData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={12}>
                        {renewalData.map((_, i) => <Cell key={i} fill={COLORS_RENEWAL[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expirants bientôt */}
              <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.accent, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
                  Abonnements à expiration
                </h3>
                {expirants.length === 0 ? (
                  <div style={{ color: C.muted, fontSize: "0.85rem", textAlign: "center", padding: "30px 0" }}>
                    Aucun abonnement expirant bientôt
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {expirants.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < expirants.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.75rem", flexShrink: 0 }}>
                            {item.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{item.name}</span>
                        </div>
                        <span style={{ color: item.joursRestants <= 7 ? C.accent : C.muted, fontSize: "0.78rem", fontWeight: item.joursRestants <= 7 ? 600 : 400 }}>
                          {formatJours(item.joursRestants)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ textAlign: "right", marginTop: 16 }}>
                  <button
                    onClick={() => navigate("abonnements")}
                    style={{ background: C.accent, border: "none", padding: "8px 20px", borderRadius: 8, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,57,53,0.35)" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                    Voir tout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}