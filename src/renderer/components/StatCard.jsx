import React from "react";

const StatCard = ({ title, value, color, bg }) => {
  return (
    <div className={`p-4 rounded-xl ${bg || "bg-[#1a1a22]"}`}>
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className={`text-xl font-bold ${color}`}>{value}</h2>
    </div>
  );
};

export default StatCard;
