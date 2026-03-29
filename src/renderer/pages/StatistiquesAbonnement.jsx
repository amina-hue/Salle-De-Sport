import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import gymBg from "../../images/Gymnastique.png";

const lineData = [
  { day: "Lun", value: 45 }, { day: "Mar", value: 52 }, { day: "Mer", value: 48 },
  { day: "Jeu", value: 58 }, { day: "Ven", value: 63 }, { day: "Sam", value: 71 }, { day: "Dim", value: 42 },
];
const pieData     = [{ name: "Mensuel", value: 145 }, { name: "Trimestre", value: 89 }, { name: "Annuel", value: 67 }];
const renewalData = [{ name: "Renouvelemet", value: 73 }, { name: "Resiliations", value: 27 }];
const expiringData = [
  { name: "Aziz Melissa",     date: "22 Fév 2026" },
  { name: "Sonia Benazzouz",  date: "Expire dans 5 jours" },
  { name: "Albane Amina",     date: "Expire dans 6 jours" },
];
const COLORS_PIE     = ["#ef4444", "#f97316", "#22c55e"];
const COLORS_RENEWAL = ["#22c55e", "#ef4444"];

export default function StatistiquesAbonnement({ onPageChange }) {
  const navigate = (page) => { if (onPageChange) onPageChange(page); };

  return (
    <div style={{ flex: 1, height: "100%", overflowY: "auto", backgroundImage: `url(${gymBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div style={{ minHeight: "100%", backgroundColor: "rgba(0,0,0,0.81)" }}>
        <div style={{ padding: 24 }}>

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
                { label: "Abonnement", page: "abonnement", active: true  },
                { label: "Adhérent",   page: "adherent",   active: false },
                { label: "Revenue",    page: "revenue",    active: false },
              ].map(({ label, page, active }) => (
                <button key={page} onClick={() => navigate(page)} style={{ padding: "6px 24px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400, background: active ? "#ef4444" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.6)", transition: "all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Total abonnements",    value: "301", trend: "+12% ce mois",    bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
              { label: "Abonnements actifs",   value: "220", trend: "+13% ce mois",    bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
              { label: "Abonnements expirés",  value: "8",   trend: "+2 cette semaine", bg: "linear-gradient(135deg,#2D3832,#242227)" },
            ].map(({ label, value, trend, bg }) => (
              <div key={label} style={{ flex: 1, borderRadius: 12, padding: 16, background: bg,
                transition: "transform .2s", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>{label}</p>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: 0 }}>{value}</h2>
                <p style={{ color: "#4ade80", fontSize: 12, marginTop: 8 }}>{trend}</p>
              </div>
            ))}
          </div>

          {/* Graphs row */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            {/* Line chart */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Fréquentation hebdomadaire</h3>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#888" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
                    <YAxis stroke="#888" axisLine={false} tickLine={false} domain={[0, 80]} tick={{ fill: "#888", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} labelStyle={{ color: "#fff" }} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12, textAlign: "center" }}>Répartition des abonnements</h3>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                {pieData.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS_PIE[i], display: "inline-block" }} />
                    <span style={{ color: "#d1d5db", fontSize: 12 }}>{item.name}</span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "flex", gap: 24 }}>
            {/* Renewal pie */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={renewalData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={12}>
                      {renewalData.map((_, i) => <Cell key={i} fill={COLORS_RENEWAL[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expiring */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ color: "#ef4444", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Abonnement à Expiration</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {expiringData.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: i < expiringData.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                    <span style={{ color: "#fff", fontSize: 14 }}>{item.name}</span>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{item.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <button style={{ background: "#ef4444", border: "none", padding: "6px 16px", borderRadius: 6, fontSize: 12, color: "#fff", cursor: "pointer" }}>Voir Tout</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}