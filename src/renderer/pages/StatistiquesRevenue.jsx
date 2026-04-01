import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import gymBg from "../../images/Gymnastique.png";
import QuickActions from "../components/QuickActions";

const revenueData = [
  { month: "Jan",  ventes: 4000,  abonnements: 3500 },
  { month: "Fév",  ventes: 7000,  abonnements: 3800 },
  { month: "Mar",  ventes: 6500,  abonnements: 4200 },
  { month: "Avr",  ventes: 11000, abonnements: 4800 },
  { month: "Mai",  ventes: 12000, abonnements: 5200 },
  { month: "Juin", ventes: 13000, abonnements: 5800 },
];

export default function StatistiquesRevenue({ onPageChange }) {
  const navigate = (page) => { if (onPageChange) onPageChange(page); };

  return (
    <div style={{ flex: 1, height: "100%", overflowY: "auto", backgroundImage: `url(${gymBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div style={{ minHeight: "100%", backgroundColor: "rgba(0,0,0,0.81)" }}>
        <div style={{ padding: 24 }}> <QuickActions navigate={navigate} />

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
              Bienvenue dans <span style={{ fontWeight: 900 }}>FitManager</span>
            </h1>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ background: "rgba(31,41,55,0.5)", borderRadius: 9999, padding: 4, display: "inline-flex", gap: 4 }}>
              {[
                { label: "Abonnement", page: "abonnement", active: false },
                { label: "Adhérent",   page: "adherent",   active: false },
                { label: "Revenue",    page: "revenue",    active: true  },
              ].map(({ label, page, active }) => (
                <button key={page} onClick={() => navigate(page)} style={{ padding: "6px 24px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400, background: active ? "#ef4444" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, maxWidth: 960, width: "100%" }}>
              {[
                { label: "Revenu Mensuel",  value: "301",      sub: "en milliers DA", trend: "+12% ce mois",    bg: "linear-gradient(135deg,#9F362A,#9F362A)" },
                { label: "Revenus Annuel",  value: "72",       sub: "en milliers DA", trend: "+19% ce mois",    bg: "linear-gradient(135deg,#7C2F27,#271D1F)" },
                { label: "Abonnement",      value: "7 600 DA", sub: null,             trend: "+3 cette semaine", bg: "linear-gradient(135deg,#2D3832,#242227)" },
                { label: "Ventes",          value: "2 100 DA", sub: null,             trend: "-14 en cours",     bg: "linear-gradient(135deg,#4B4750,#201F21)" },
              ].map(({ label, value, sub, trend, bg }) => (
                <div key={label} style={{ borderRadius: 12, padding: 16, background: bg, minWidth: 160 }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>{label}</p>
                  <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>{value}</h2>
                  <p style={{ color: "#4ade80", fontSize: 12, marginTop: 8 }}>{trend}</p>
                  {sub && <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>{sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Revenus mensuels</h3>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="month" stroke="#888" tick={{ fill: "#888", fontSize: 12 }} axisLine={{ stroke: "#888" }} tickLine={false} />
                    <YAxis stroke="#888" tick={{ fill: "#888", fontSize: 12 }} domain={[0, 14000]} tickCount={8} axisLine={{ stroke: "#888" }} tickLine={false} ticks={[0, 2000, 4000, 6000, 8000, 10000, 12000, 14000]} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} formatter={v => [`${v} DA`, ""]} labelStyle={{ color: "#fff" }} />
                    <Legend wrapperStyle={{ color: "#fff", paddingTop: 10 }} iconType="circle"
                      formatter={v => v === "ventes" ? "Ventes" : v === "abonnements" ? "Abonnement" : v} />
                    <Bar dataKey="abonnements" fill="#649E56" name="abonnements" radius={[4, 4, 0, 0]} barSize={50} />
                    <Bar dataKey="ventes"      fill="#963B3B" name="ventes"      radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}