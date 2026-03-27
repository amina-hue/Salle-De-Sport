import React from "react";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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

const pieData = [
  { name: "Mensuel", value: 145 },
  { name: "Trimestre", value: 89 },
  { name: "Annuel", value: 67 },
];

const renewalData = [
  { name: "Renouvelemet", value: 73 },
  { name: "Resiliations", value: 27 },
];

const COLORS_PIE = ["#ef4444", "#f97316", "#22c55e"];
const COLORS_RENEWAL = ["#22c55e", "#ef4444"];

const expiringData = [
  { name: "Aziz Melissa", date: "22 Fév 2026" },
  { name: "Sonia Benazzouz", date: "Expire dans 5 jours" },
  { name: "Albane Amina", date: "Expire dans 6 jours" },
];

export default function StatistiquesAbonnement({ onPageChange }) {
  const navigate = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

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
                <button 
                  onClick={() => navigate('abonnement')}
                  className="px-6 py-1.5 bg-red-500 rounded-full text-white font-medium text-sm"
                >
                  Abonnement
                </button>
                <button 
                  onClick={() => navigate('adherent')}
                  className="px-6 py-1.5 rounded-full text-white/60 hover:text-white transition text-sm"
                >
                  Adherent
                </button>
                <button 
                  onClick={() => navigate('revenue')}
                  className="px-6 py-1.5 rounded-full text-white/60 hover:text-white transition text-sm"
                >
                  Revenue
                </button>
              </div>
            </div>

            {/* STATS CARDS - 3 cartes avec flex */}
            <div className="flex gap-4 mb-8">
              <div 
                className="flex-1 rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #9F362A 0%, #271D1F 100%)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs">Total abonnements</p>
                 
                </div>
                <h2 className="text-3xl font-bold text-white">301</h2>
                <p className="text-green-400 text-xs mt-2">+12% ce mois</p>
              </div>

              <div 
                className="flex-1 rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #9F362A 0%, #271D1F 100%)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs">Abonnements actifs</p>
                  
                </div>
                <h2 className="text-3xl font-bold text-white">220</h2>
                <p className="text-green-400 text-xs mt-2">+13% ce mois</p>
              </div>

              <div 
                className="flex-1 rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #2D3832 0%, #242227 100%)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs">Abonnements expirés</p>
                
                </div>
                <h2 className="text-3xl font-bold text-white">8</h2>
                <p className="text-green-400 text-xs mt-2">+2 cette semaine</p>
              </div>
            </div>

            {/* GRAPHS - Fréquentation + Répartition avec flex comme Adherent */}
            <div className="flex gap-6 mb-8">
              {/* Graphique fréquentation */}
              <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 text-sm">
                  Fréquentation hebdomadaire
                </h3>
                <div className="h-80 w-full">
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
                        dot={{ fill: "#ef4444", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Répartition des abonnements */}
              <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 text-sm text-center">
                  Répartition des abonnements
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={11}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_PIE[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_PIE[index] }}></span>
                      <span className="text-gray-300 text-xs">{item.name}</span>
                      <span className="text-white text-xs font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION - Renouvellement + Expirations avec flex */}
            <div className="flex gap-6">
              {/* Renouvellement */}
              <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={renewalData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={12}
                      >
                        {renewalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_RENEWAL[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Abonnement à Expiration */}
              <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-red-500 font-semibold mb-3 text-sm">
                  Abonnement à Expiration
                </h3>
                <div className="space-y-3">
                  {expiringData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-white/10 last:border-0"
                    >
                      <span className="text-white text-sm">{item.name}</span>
                      <span className="text-gray-400 text-xs">{item.date}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded text-xs text-white transition float-right">
                  Voir Tout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}