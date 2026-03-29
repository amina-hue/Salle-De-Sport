import React from "react";

export default function MemberCard({ member }) {
  return (
    <div className="member-card">
      
      {/* STATUS */}
      <div className={`status ${member.status.toLowerCase()}`}>
        {member.status}
      </div>

      {/* IMAGE */}
      <img src={member.image} alt={member.name} />

      {/* INFOS */}
      <h3>{member.name}</h3>
      <p className="role">{member.role}</p>

      <p className="info">📧 {member.email}</p>
      <p className="info">📞 {member.phone}</p>

    </div>
  );
}