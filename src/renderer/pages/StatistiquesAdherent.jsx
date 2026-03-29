import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import gymBg from "../../images/Gymnastique.png";

const lineData = [
  { day: "Lun", value: 45 }, { day: "Mar", value: 52 }, { day: "Mer", value: 48 },
  { day: "Jeu", value: 58 }, { day: "Ven", value: 63 }, { day: "Sam", value: 71 }, { day: "Dim", value: 42 },
];

const newMembersData = [
  { initials: "SM", name: "Sophie Martin", date: "22 Fév 2026", status: "Actif" },
  { initials: "LB", name: "Lucas Bernard", date: "20 Fév 2026", status: "Actif" },
  { initials: "ED", name: "Emma Dubois",   date: "18 Fév 2026", status: "En attente" },
  { initials: "TP", name: "Thomas Petit",  date: "15 Fév 2026", status: "Actif" },
  { initials: "SM", name: "Sophie Martin", date: "22 Fév 2026", status: "Actif" },
  { initials: "LB", name: "Lucas Bernard", date: "20 Fév 2026", status: "Actif" },
  { initials: "ED", name: "Emma Dubois",   date: "18 Fév 2026", status: "En attente" },
  { initials: "TP", name: "Thomas Petit",  date: "15 Fév 2026", status: "Actif" },
];

export default function StatistiquesAdherent({ onPageChange }) {
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
                { label: "Abonnement", page: "abonnement", active: false },
                { label: "Adhérent",   page: "adherent",   active: true  },
                { label: "Revenue",    page: "revenue",    active: false },
              ].map(({ label, page, active }) => (
                <button key={page} onClick={() => navigate(page)} style={{ padding: "6px 24px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400, background: active ? "#ef4444" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Adhérents",          value: "301", trend: "+12% ce mois",    bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
              { label: "Adhérents actifs",   value: "72",  trend: "+29% ce mois",    bg: "linear-gradient(135deg,#9F362A,#271D1F)" },
              { label: "Nouveaux adhérents", value: "42",  trend: "+3 cette semaine", bg: "linear-gradient(135deg,#2D3832,#242227)" },
              { label: "Total adhérents",    value: "356", trend: "1,4k cours",       bg: "linear-gradient(135deg,#4B4750,#201F21)" },
            ].map(({ label, value, trend, bg }) => (
              <div key={label} style={{ borderRadius: 12, padding: 16, background: bg }}>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>{label}</p>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: 0 }}>{value}</h2>
                <p style={{ color: "#4ade80", fontSize: 12, marginTop: 8 }}>{trend}</p>
              </div>
            ))}
          </div>

          {/* Graph + members */}
          <div style={{ display: "flex", gap: 24 }}>
            {/* Line chart */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Fréquentation hebdomadaire</h3>
              <div style={{ height: 256 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#888" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
                    <YAxis stroke="#888" axisLine={false} tickLine={false} domain={[0, 80]} tick={{ fill: "#888", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} labelStyle={{ color: "#fff" }} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* New members list */}
            <div style={{ width: 384, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ color: "#ef4444", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Nouveaux adhérents</h3>
              <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {newMembersData.map((member, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: i < newMembersData.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ width: 32, height: 32, background: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 12, flexShrink: 0 }}>
                        {member.initials}
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: 0 }}>{member.name}</p>
                        <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>{member.date}</p>
                      </div>
                    </div>
                    <button style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, color: "#fff", border: "none", cursor: "pointer", background: member.status === "En attente" ? "#ca8a04" : "#16a34a" }}>
                      {member.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}