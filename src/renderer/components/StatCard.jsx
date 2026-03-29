import React from "react";

const StatCard = ({ title, value, color, bg }) => {
  return (
    <div
  className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4"
>
  {/* ICONE */}
  <div className={`w-12 h-12 flex items-center justify-center rounded-full`} style={{ backgroundColor: accent }}>
    <Icon size={24} />
  </div>

  {/* CONTENU */}
  <div className="flex flex-col">
    <p className="text-sm opacity-90">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
    {trend && <span className="text-green-300 text-xs">{trend}</span>}
    <p className="text-xs text-gray-400">{sub}</p>
  </div>
</div>
  );
};

export default StatCard;
