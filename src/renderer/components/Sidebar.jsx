import React, { useState } from "react";
import {
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Package,
  User,
  BarChart2
} from "lucide-react";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("Utilisateur");

  const menu = [
    { name: "Statistiques", icon: <BarChart2 /> },
    { name: "Adhérents", icon: <Users /> },
    { name: "Abonnements", icon: <CreditCard /> },
    { name: "Paiements", icon: <DollarSign /> },
    { name: "Planning", icon: <Calendar /> },
    { name: "Recette", icon: <DollarSign /> },
    { name: "Magasin", icon: <Package /> },
    { name: "Utilisateur", icon: <User /> },
    { name: "Paramètres", icon: <Settings /> }
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">💪</div>
        <div>
          <h2>FitManager</h2>
          <span>Pro Gym System</span>
        </div>
      </div>

      <ul className="menu">
        {menu.map((item, index) => (
          <li
            key={index}
            className={activeItem === item.name ? "active" : ""}
            onClick={() => setActiveItem(item.name)}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>

      <div className="logout">
        <LogOut />
        <span>Déconnexion</span>
      </div>
    </div>
  );
};

export default Sidebar;