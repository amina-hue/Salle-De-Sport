

import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import gymBg from "../../images/Gymnastique.png";
import QuickActions from "../components/QuickActions";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b",
};

const noScrollbar = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export default function StatistiquesAdherent({ onPageChange }) {
  const navigate = (page) => { if (onPageChange) onPageChange(page); };

  const [stats, setStats]         = useState({ total: 0, actifs: 0, nouveauxCeMois: 0 });
  const [nouveaux, setNouveaux]   = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 1. Les 3 compteurs
        const s = await window.api.getStatsPageAdherent();
        setStats(s);

        // 2. Fréquentation par jour de la semaine (handler déjà existant !)
        // Retourne : [{ day: "Lun", value: 12 }, { day: "Mar", value: 7 }, ...]
        const freq = await window.api.getFrequentationSemaine();
        setGraphData(freq);

        // 3. Liste des nouveaux adhérents ce mois
        const tous = await window.api.getAdherentsAvecAbonnement();
        const now = new Date();
        const nouveauxCeMois = tous.filter(ad => {
          const d = new Date(ad.dateCreation);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        setNouveaux(nouveauxCeMois);

      } catch (err) {
        console.error('Stats adhérent:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total adhérents",
      value: stats.total,
      trend: "Tous les adhérents inscrits",
      trendColor: C.muted,
      bg: "linear-gradient(135deg,#4B4750,#201F21)",
    },
    {
      label: "Adhérents actifs",
      value: stats.actifs,
      trend: "Abonnement en cours",
      trendColor: C.green,
      bg: "linear-gradient(135deg,#9F362A,#271D1F)",
    },
    {
      label: "Nouveaux ce mois",
      value: stats.nouveauxCeMois,
      trend: "Inscrits ce mois-ci",
      trendColor: C.gold,
      bg: "linear-gradient(135deg,#2D3832,#242227)",
    },
  ];

  // Ticks Y dynamiques : 0, 5, 10, ... jusqu'au max arrondi au multiple de 5 supérieur
  const maxVal = graphData.reduce((acc, d) => Math.max(acc, d.value ?? 0), 0);
  const yMax   = Math.ceil(Math.max(maxVal, 5) / 5) * 5;
  const yTicks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* ── Hero Header ── */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gymBg})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: "relative", padding: "32px 36px 36px" }}>
          <QuickActions navigate={navigate} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, marginTop: 12 }}>
            <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
            <ChevronRight size={12} color={C.muted} />
            <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Statistiques</span>
            <ChevronRight size={12} color={C.muted} />
            <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Adhérent</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
            Statistiques Adhérent
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
            {[
              { count: stats.total,          label: "au total", color: C.muted },
              { count: stats.actifs,         label: "actifs",   color: C.green },
              { count: stats.nouveauxCeMois, label: "nouveaux", color: C.gold  },
            ].map(({ count, label, color }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "0.82rem", color: C.muted }}>
                    <strong style={{ color }}>{loading ? "…" : count}</strong> {label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ background: "#1a1d24", borderRadius: 9999, padding: 4, display: "inline-flex", gap: 4, border: `1px solid ${C.border}` }}>
          {[
            { label: "Abonnement", page: "abonnement", active: false },
            { label: "Adhérent",   page: "adherent",   active: true  },
            { label: "Revenue",    page: "revenue",    active: false },
          ].map(({ label, page, active }) => (
            <button key={page} onClick={() => navigate(page)} style={{ padding: "8px 28px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: active ? 700 : 400, background: active ? C.accent : "transparent", color: active ? "#fff" : C.muted, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px", ...noScrollbar }}>

        {/* ── 3 Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          {STAT_CARDS.map(({ label, value, trend, trendColor, bg }) => (
            <div key={label}
              style={{ borderRadius: 14, padding: "20px 22px", background: bg, border: `1px solid rgba(255,255,255,0.06)`, transition: "all 0.22s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>
                {label}
              </p>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.8rem", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>
                {loading ? "…" : value}
              </h2>
              <p style={{ color: trendColor, fontSize: "0.78rem", marginTop: 8, marginBottom: 0, fontWeight: 600 }}>
                {trend}
              </p>
            </div>
          ))}
        </div>

        {/* ── Graph + liste nouveaux ── */}
        <div style={{ display: "flex", gap: 20 }}>

          {/* ── Line chart : inscriptions par jour de la semaine ── */}
          <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
              Inscriptions par jour de la semaine
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#888"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#888"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 11 }}
                    allowDecimals={false}
                    ticks={yTicks}
                    domain={[0, yMax]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }}
                    labelStyle={{ color: C.text }}
                    formatter={(value) => [value, "Inscriptions"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={C.accent}
                    strokeWidth={2}
                    dot={{ fill: C.accent, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Liste nouveaux adhérents ce mois ── */}
          <div style={{ width: 380, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.accent, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
              Nouveaux adhérents
            </h3>
            <div className="no-scrollbar" style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0, ...noScrollbar }}>
              {loading ? (
                <p style={{ color: C.muted, fontSize: "0.85rem", textAlign: "center", marginTop: 40 }}>Chargement…</p>
              ) : nouveaux.length === 0 ? (
                <p style={{ color: C.muted, fontSize: "0.85rem", textAlign: "center", marginTop: 40 }}>Aucun nouvel adhérent ce mois</p>
              ) : (
                nouveaux.map((member, i) => {
                  const initials = `${member.nom?.[0] ?? ''}${member.prenom?.[0] ?? ''}`.toUpperCase();
                  const date = new Date(member.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                  const status = member.abonnementStatut === 'actif' ? 'Actif' : 'Sans abonnement';

                  return (
                    <div key={member.idAdherent}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < nouveaux.length - 1 ? `1px solid ${C.border}` : "none" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.75rem", flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <p style={{ color: C.text, fontSize: "0.875rem", fontWeight: 600, margin: 0, fontFamily: "'Barlow', sans-serif" }}>
                            {member.nom} {member.prenom}
                          </p>
                          <p style={{ color: C.muted, fontSize: "0.72rem", margin: 0 }}>{date}</p>
                        </div>
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Barlow', sans-serif", color: "#fff", background: status === 'Actif' ? "#16a34a" : "#ca8a04" }}>
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}