import React from "react";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import gymBg from "../../images/Gymnastique.png";

const revenueData = [
  { month: "Jan", ventes: 4000, abonnements: 3500 },
  { month: "Fév", ventes: 7000, abonnements: 3800 },
  { month: "Mar", ventes: 6500, abonnements: 4200 },
  { month: "Avr", ventes: 11000, abonnements: 4800 },
  { month: "Mai", ventes: 12000, abonnements: 5200 },
  { month: "Juin", ventes: 13000, abonnements: 5800 },
];

export default function StatistiquesRevenue({ onPageChange }) {
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
                  className="px-6 py-1.5 rounded-full text-white/60 hover:text-white transition text-sm"
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
                  className="px-6 py-1.5 bg-red-500 rounded-full text-white font-medium text-sm"
                >
                  Revenue
                </button>
              </div>
            </div>

            {/* STATS CARDS - 4 cartes */}
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-4 gap-4 max-w-5xl">
                {/* Carte 1 - Revenu Mensuel */}
                <div 
                  className="rounded-xl p-4 min-w-[160px]"
                  style={{ background: "linear-gradient(135deg, #9F362A 0%, #9F362A 100%)" }}
                >
                  <p className="text-white/70 text-xs mb-1">Revenu Mensuel</p>
                  <h2 className="text-3xl font-bold text-white">301</h2>
                  <p className="text-green-400 text-xs mt-2">+12% ce mois</p>
                  <p className="text-gray-400 text-xs mt-1">en milliers DA</p>
                </div>

                {/* Carte 2 - Revenus Annuel */}
                <div 
                  className="rounded-xl p-4 min-w-[160px]"
                  style={{ background: "linear-gradient(135deg, #7C2F27 0%, #271D1F 100%)" }}
                >
                  <p className="text-white/70 text-xs mb-1">Revenus Annuel</p>
                  <h2 className="text-3xl font-bold text-white">72</h2>
                  <p className="text-green-400 text-xs mt-2">+19% ce mois</p>
                  <p className="text-gray-400 text-xs mt-1">en milliers DA</p>
                </div>

                {/* Carte 3 - Abonnement */}
                <div 
                  className="rounded-xl p-4 min-w-[160px]"
                  style={{ background: "linear-gradient(135deg, #2D3832 0%, #242227 100%)" }}
                >
                  <p className="text-white/70 text-xs mb-1">Abonnement</p>
                  <h2 className="text-3xl font-bold text-white">7 600 DA</h2>
                  <p className="text-green-400 text-xs mt-2">+3 cette semaine</p>
                </div>

                {/* Carte 4 - Ventes */}
                <div 
                  className="rounded-xl p-4 min-w-[160px]"
                  style={{ background: "linear-gradient(135deg, #4B4750 0%, #201F21 100%)" }}
                >
                  <p className="text-white/70 text-xs mb-1">Ventes</p>
                  <h2 className="text-3xl font-bold text-white">2 100 DA</h2>
                  <p className="text-green-400 text-xs mt-2">-14 en cours</p>
                </div>
              </div>
            </div>

            {/* GRAPH SECTION - Revenus mensuels */}
            <div className="flex gap-6 mb-8">
              <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 text-sm">
                  Revenus mensuels
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#888" 
                        tick={{ fill: "#888", fontSize: 12 }}
                        axisLine={{ stroke: "#888" }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#888" 
                        tick={{ fill: "#888", fontSize: 12 }}
                        domain={[0, 14000]}
                        tickCount={8}
                        axisLine={{ stroke: "#888" }}
                        tickLine={false}
                        ticks={[0, 2000, 4000, 6000, 8000, 10000, 12000, 14000]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1a1a1a", 
                          border: "1px solid #333", 
                          borderRadius: "8px" 
                        }}
                        formatter={(value) => [`${value} DA`, ""]}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend 
                        wrapperStyle={{ color: "#fff", paddingTop: "10px" }}
                        iconType="circle"
                        formatter={(value) => {
                          if (value === "ventes") return "Ventes";
                          if (value === "abonnements") return "Abonnement";
                          return value;
                        }}
                      />
                      <Bar
                        dataKey="abonnements"
                        fill="#649E56"
                        name="abonnements"
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                      />
                      <Bar
                        dataKey="ventes"
                        fill="#963B3B"
                        name="ventes"
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}