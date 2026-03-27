import React from "react";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import gymBg from "../../images/Gymnastique.png";

const lineData = [
  { day: "Lun", value: 45 },
  { day: "Mar", value: 52 },
  { day: "Mer", value: 48 },
  { day: "Jeu", value: 58 },
  { day: "Ven", value: 63 },
  { day: "Sam", value: 71 },
  { day: "Dim", value: 42 },
];

// AJOUT : 8 membres comme sur le prototype
const newMembersData = [
  { initials: "SM", name: "Sophie Martin", date: "22 Fév 2026", status: "Actif" },
  { initials: "LB", name: "Lucas Bernard", date: "20 Fév 2026", status: "Actif" },
  { initials: "ED", name: "Emma Dubois", date: "18 Fév 2026", status: "En attente" },
  { initials: "TP", name: "Thomas Petit", date: "15 Fév 2026", status: "Actif" },
  { initials: "SM", name: "Sophie Martin", date: "22 Fév 2026", status: "Actif" },
  { initials: "LB", name: "Lucas Bernard", date: "20 Fév 2026", status: "Actif" },
  { initials: "ED", name: "Emma Dubois", date: "18 Fév 2026", status: "En attente" },
  { initials: "TP", name: "Thomas Petit", date: "15 Fév 2026", status: "Actif" },
];

export default function StatistiquesAdherent() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div
        className="flex-1 bg-cover bg-center overflow-y-auto"
        style={{ backgroundImage: `url(${gymBg})` }}
      >
        <div className="min-h-full w-full" style={{ backgroundColor: "rgba(0, 0, 0, 0.81)" }}>
          <div className="p-6">
            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">
                Bienvenue dans <span className="font-extrabold">FitManager</span>
              </h1>
            </div>

            {/* TABS - CENTRE */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800/50 rounded-full p-1 inline-flex gap-1">
                <button className="px-6 py-1.5 rounded-full text-white/60 hover:text-white transition text-sm">
                  Abonnement
                </button>
                <button className="px-6 py-1.5 bg-red-500 rounded-full text-white font-medium text-sm">
                  Adhérent
                </button>
                <button className="px-6 py-1.5 rounded-full text-white/60 hover:text-white transition text-sm">
                  Revenue
                </button>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div 
                className="rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #9F362A 0%, #271D1F 100%)" }}
              >
                <p className="text-white/70 text-xs mb-1">Adhérents</p>
                <h2 className="text-3xl font-bold text-white">301</h2>
                <p className="text-green-400 text-xs mt-2">+12% ce mois</p>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #9F362A 0%, #271D1F 100%)" }}
              >
                <p className="text-white/70 text-xs mb-1">Adhérents actifs</p>
                <h2 className="text-3xl font-bold text-white">72</h2>
                <p className="text-green-400 text-xs mt-2">+29% ce mois</p>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #2D3832 0%, #242227 100%)" }}
              >
                <p className="text-white/70 text-xs mb-1">Nouveaux adhérents</p>
                <h2 className="text-3xl font-bold text-white">42</h2>
                <p className="text-green-400 text-xs mt-2">+3 cette semaine</p>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #4B4750 0%, #201F21 100%)" }}
              >
                <p className="text-white/70 text-xs mb-1">Total adhérents</p>
                <h2 className="text-3xl font-bold text-white">356</h2>
                <p className="text-green-400 text-xs mt-2">1,4k cours</p>
              </div>
            </div>

            {/* GRAPH + NEW MEMBERS */}
            <div className="flex gap-6">
              {/* Graphique Fréquentation */}
              <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 text-sm">
                  Fréquentation hebdomadaire
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                        domain={[0, 80]}
                        tick={{ fill: "#888", fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Liste Nouveaux adhérents - Version prototype avec 8 membres */}
              <div className="w-96 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-red-500 font-semibold mb-3 text-sm">
                  Nouveaux adhérents
                </h3>
                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {newMembersData.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold text-white text-xs">
                          {member.initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{member.name}</p>
                          <p className="text-gray-400 text-xs">{member.date}</p>
                        </div>
                      </div>
                      <button 
                        className={`px-2 py-1 rounded text-xs text-white transition ${
                          member.status === "En attente" 
                            ? "bg-yellow-600 hover:bg-yellow-700" 
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {member.status === "En attente" ? "En attente" : "Actif"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}