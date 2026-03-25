import React from "react";
import Sidebar from "../components/Sidebar"; // 👈 IMPORT
import MemberCard from "../components/MemberCard";
import AddButton from "../components/AddButton";
import "../../styles/adherents.css";

const members = [
  {
    name: "Hamani Salima",
    role: "Premium Member",
    email: "hamani@email.com",
    phone: "06 12 34 56 78",
    status: "Actif",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Ferkhoul Salah",
    role: "Standard Member",
    email: "salah@email.com",
    phone: "06 98 23 67 89",
    status: "Expire",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
];

export default function AdherentsPage() {
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <div className="content">
        {/* HEADER */}
        <div className="header">
          <div>
            <h1>Gestion des adhérents</h1>
            <p>36 adhérents au total</p>
          </div>

          <AddButton />
        </div>

        {/* SEARCH */}
        <div className="search-bar">
          <input placeholder="🔍 Rechercher par nom ou email..." />
        </div>

        {/* GRID */}
        <div className="grid">
          {members.map((m, index) => (
            <MemberCard key={index} member={m} />
          ))}
        </div>
      </div>
    </div>
  );
}