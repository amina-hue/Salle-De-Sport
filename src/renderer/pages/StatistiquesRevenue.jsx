import React from "react";
import { ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
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

const revenueData = [
  { month: "Jan",  ventes: 4000,  abonnements: 3500 },
  { month: "Fév",  ventes: 7000,  abonnements: 3800 },
  { month: "Mar",  ventes: 6500,  abonnements: 4200 },
  { month: "Avr",  ventes: 11000, abonnements: 4800 },
  { month: "Mai",  ventes: 12000, abonnements: 5200 },
  { month: "Juin", ventes: 13000, abonnements: 5800 },
];

const STAT_CARDS = [
  { label: "Revenu Mensuel", value: "301", sub: "en milliers DA", trend: "+12% ce mois",     trendColor: "#22c55e", bg: "linear-gradient(135deg,#9F362A,#9F362A)" },
  { label: "Revenu Annuel",  value: "72",  sub: "en milliers DA", trend: "+19% ce mois",     trendColor: "#22c55e", bg: "linear-gradient(135deg,#7C2F27,#271D1F)" },
  { label: "Abonnement",     value: "7 600 DA", sub: null,        trend: "+3 cette semaine", trendColor: "#f59e0b", bg: "linear-gradient(135deg,#2D3832,#242227)" },
  { label: "Ventes",         value: "2 100 DA", sub: null,        trend: "-14 en cours",     trendColor: "#e53935", bg: "linear-gradient(135deg,#4B4750,#201F21)" },
];

export default function StatistiquesRevenue({ onPageChange }) {
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
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Revenue</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Statistiques Revenue
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: "301k", label: "DA mensuel", color: C.green },
                { count: "72k",  label: "DA annuel",  color: C.gold  },
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
      <div style={{ display: "flex", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ background: "#1a1d24", borderRadius: 9999, padding: 4, display: "inline-flex", gap: 4, border: `1px solid ${C.border}` }}>
          {[
            { label: "Abonnement", page: "abonnement", active: false },
            { label: "Adhérent",   page: "adherent",   active: false },
            { label: "Revenue",    page: "revenue",    active: true  },
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {STAT_CARDS.map(({ label, value, sub, trend, trendColor, bg }) => (
            <div key={label} style={{ borderRadius: 14, padding: "20px 22px", background: bg, border: `1px solid rgba(255,255,255,0.06)`, transition: "all 0.22s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 0 }}>{label}</p>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{value}</h2>
              <p style={{ color: trendColor, fontSize: "0.78rem", marginTop: 8, marginBottom: 0, fontWeight: 600 }}>{trend}</p>
              {sub && <p style={{ color: C.muted, fontSize: "0.72rem", marginTop: 4, marginBottom: 0 }}>{sub}</p>}
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: C.text, fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20, marginTop: 0 }}>Revenus mensuels</h3>
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252833" vertical={false} />
                <XAxis dataKey="month" stroke="#888" tick={{ fill: "#888", fontSize: 12 }} axisLine={{ stroke: "#888" }} tickLine={false} />
                <YAxis stroke="#888" tick={{ fill: "#888", fontSize: 12 }} domain={[0, 14000]} tickCount={8} axisLine={{ stroke: "#888" }} tickLine={false} ticks={[0, 2000, 4000, 6000, 8000, 10000, 12000, 14000]} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }} formatter={v => [`${v} DA`, ""]} labelStyle={{ color: C.text }} />
                <Legend wrapperStyle={{ color: C.muted, paddingTop: 12, fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem" }} iconType="circle"
                  formatter={v => v === "ventes" ? "Ventes" : "Abonnement"} />
                <Bar dataKey="abonnements" fill="#649E56" name="abonnements" radius={[4, 4, 0, 0]} barSize={44} />
                <Bar dataKey="ventes"      fill={C.accent} name="ventes"    radius={[4, 4, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}