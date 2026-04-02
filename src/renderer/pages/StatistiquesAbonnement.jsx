import React from "react";
import { ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import gymBg from "../../images/Gymnastique.png";
import QuickActions from "../components/QuickActions";

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e", gold: "#f59e0b", blue: "#3b82f6",
};

const lineData = [
  { day: "Lun", value: 45 }, { day: "Mar", value: 52 }, { day: "Mer", value: 48 },
  { day: "Jeu", value: 58 }, { day: "Ven", value: 63 }, { day: "Sam", value: 71 }, { day: "Dim", value: 42 },
];
const pieData     = [{ name: "Mensuel", value: 145 }, { name: "Trimestre", value: 89 }, { name: "Annuel", value: 67 }];
const renewalData = [{ name: "Renouvellement", value: 73 }, { name: "Résiliations", value: 27 }];
const expiringData = [
  { name: "Aziz Melissa",    date: "22 Fév 2026" },
  { name: "Sonia Benazzouz", date: "Expire dans 5 jours" },
  { name: "Albane Amina",    date: "Expire dans 6 jours" },
];
const COLORS_PIE     = ["#e53935", "#f59e0b", "#22c55e"];
const COLORS_RENEWAL = ["#22c55e", "#e53935"];

const STAT_CARDS = [
  { label: "Total abonnements",   value: "301", trend: "+12% ce mois",    trendColor: C.green, bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
  { label: "Abonnements actifs",  value: "220", trend: "+13% ce mois",    trendColor: C.green, bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
  { label: "Abonnements expirés", value: "8",   trend: "+2 cette semaine", trendColor: C.gold,  bg: "linear-gradient(135deg,#2D3832,#242227)" },
];

export default function StatistiquesAbonnement({ onPageChange }) {
  const navigate = (page) => { if (onPageChange) onPageChange(page); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* ── Hero Header ── */}
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
                { count: "301", label: "total", color: C.muted },
                { count: "220", label: "actifs", color: C.green },
                { count: "8",   label: "expirés", color: C.accent },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted }}><strong style={{ color }}>{count}</strong> {label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, alignItems: "center" }}>
        <div style={{ background: "#1a1d24", borderRadius: 9999, padding: 4, display: "inline-flex", gap: 4, border: `1px solid ${C.border}` }}>
          {[
            { label: "Abonnement", page: "abonnement", active: true  },
            { label: "Adhérent",   page: "adherent",   active: false },
            { label: "Revenue",    page: "revenue",    active: false },
          ].map(({ label, page, active }) => (
            <button key={page} onClick={() => navigate(page)} style={{ padding: "8px 28px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: active ? 700 : 400, background: active ? C.accent : "transparent", color: active ? "#fff" : C.muted, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {STAT_CARDS.map(({ label, value, trend, trendColor, bg }) => (
            <div key={label} style={{ flex: 1, borderRadius: 14, padding: "20px 22px", background: bg, border: `1px solid rgba(255,255,255,0.06)`, transition: "all 0.22s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>{label}</p>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.8rem", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{value}</h2>
              <p style={{ color: trendColor, fontSize: "0.78rem", marginTop: 8, marginBottom: 0, fontWeight: 600 }}>{trend}</p>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>Fréquentation hebdomadaire</h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="#888" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
                  <YAxis stroke="#888" axisLine={false} tickLine={false} domain={[0, 80]} tick={{ fill: "#888", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }} labelStyle={{ color: C.text }} />
                  <Line type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0, textAlign: "center" }}>Répartition des abonnements</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
              {pieData.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS_PIE[i], display: "inline-block" }} />
                  <span style={{ color: C.muted, fontSize: "0.72rem" }}>{item.name}</span>
                  <span style={{ color: C.text, fontSize: "0.72rem", fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0, textAlign: "center" }}>Renouvellements vs Résiliations</h3>
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

          <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.accent, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>Abonnements à expiration</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {expiringData.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < expiringData.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.75rem", flexShrink: 0 }}>
                      {item.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ color: C.text, fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{item.name}</span>
                  </div>
                  <span style={{ color: C.muted, fontSize: "0.78rem" }}>{item.date}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <button style={{ background: C.accent, border: "none", padding: "8px 20px", borderRadius: 8, fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(229,57,53,0.35)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                Voir tout
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}