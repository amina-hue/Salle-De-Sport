import React from "react";

export default function MemberCard({ member }) {
  return (
    <div className="card">
      {/* STATUS */}
      <span
        className={`badge ${
          member.status === "Actif" ? "active" : "expired"
        }`}
      >
        {member.status}
      </span>

      {/* IMAGE */}
      <img src={member.image} alt="avatar" className="avatar" />

      {/* INFOS */}
      <h3>{member.name}</h3>
      <p className="role">{member.role}</p>

      <div className="info">
        <p>{member.email}</p>
        <p>{member.phone}</p>
      </div>

      {/* BUTTON */}
      <button className="edit-btn">Modifier</button>
    </div>
  );
}