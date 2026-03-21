import React from "react";
import {
  Home,
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
  const menu = [
    { name: "Statistiques", icon: <BarChart2 /> },
    { name: "Adhérents", icon: <Users /> },
    { name: "Abonnements", icon: <CreditCard /> },
    { name: "Paiements", icon: <DollarSign /> },
    { name: "Planning", icon: <Calendar /> },
    { name: "Recette", icon: <DollarSign /> },
    { name: "Magasin", icon: <Package /> },
    { name: "Utilisateur", icon: <User />, active: true },
    { name: "Paramètres", icon: <Settings /> }
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">💪</div>
        <div>
          <h2>FitManager</h2>
          <span>Pro Gym System</span>
        </div>
      </div>

      {/* Menu */}
      <ul className="menu">
        {menu.map((item, index) => (
          <li
            key={index}
            className={item.active ? "active" : ""}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="logout">
        <LogOut />
        <span>Déconnexion</span>
      </div>
    </div>
  );
};

export default Sidebar;