import React, { useState, useEffect } from "react";
import gymBg from "../../images/Gymnastique.png";


const initialRoles = [
  { id: 1, name: "Admin",          users: 2 },
  { id: 2, name: "Manager",        users: 5 },
  { id: 3, name: "Receptionniste", users: 3 },
];

const permissionsList = [
  { key: "statistiques", label: "Accès Statistiques" },
  { key: "adherents",    label: "Gestion des adherents" },
  { key: "abonnements",  label: "Gestion des abonnements" },
  { key: "paiements",    label: "Gestion des paiements" },
  { key: "planning",     label: "Gestion du planning" },
  { key: "recette",      label: "Gestion de la recette" },
  { key: "magasin",      label: "Gestion du magasin" },
  { key: "utilisateur",  label: "Gestion des utilisateurs" },
];

export default function Parametres({ onPageChange, onPermissionsChange }) {
  const [roles, setRoles]           = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions]   = useState(() => {
    const saved = localStorage.getItem("appPermissions");
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(permissionsList.map(p => [p.key, "autorise"]));
  });
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  useEffect(() => {
    localStorage.setItem("appPermissions", JSON.stringify(permissions));
    if (onPermissionsChange) onPermissionsChange(permissions);
  }, [permissions, onPermissionsChange]);

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      setRoles([...roles, { id: roles.length + 1, name: newRoleName, users: 0 }]);
      setNewRoleName(""); setShowAddRole(false);
    }
  };

  const handleSave = () => { alert(`Permissions sauvegardées pour ${selectedRole?.name}`); setSelectedRole(null); };

  return (
    <div style={{
      flex: 1,
      height: "100%",
      overflowY: "auto",
      backgroundImage: `url(${gymBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "#fff",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{ minHeight: "100%", backgroundColor: "rgba(0,0,0,0.81)", padding: 24 }}>

      

        {/* Roles */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Gestion des roles et permissions</h2>
            <button onClick={() => setShowAddRole(true)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, background: "linear-gradient(135deg,#86A175,#49583F)", color: "#fff", border: "none", cursor: "pointer" }}>
              + Ajouter un rôle
            </button>
          </div>

          {/* Add role modal */}
          {showAddRole && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
              <div style={{ background: "linear-gradient(135deg,#141212,#2B1F21)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, width: 384 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Ajouter un rôle</h3>
                <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Nom du rôle"
                  style={{ width: "100%", padding: 8, borderRadius: 8, marginBottom: 16, color: "#fff", background: "linear-gradient(135deg,#2B1F21,#141212)", border: "1px solid rgba(255,255,255,0.1)", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button onClick={() => setShowAddRole(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg,#2B1F21,#141212)", color: "#fff", border: "none", cursor: "pointer" }}>Annuler</button>
                  <button onClick={handleAddRole} style={{ padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg,#86A175,#49583F)", color: "#fff", border: "none", cursor: "pointer" }}>Ajouter</button>
                </div>
              </div>
            </div>
          )}

          {/* Roles table */}
          <div style={{ background: "linear-gradient(135deg,#2B1F21,#141212)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                  {["Rôle", "Utilisateur", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr key={role.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{role.name}</td>
                    <td style={{ padding: "12px 16px" }}>{role.users}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setSelectedRole(role)} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, border: `1px solid ${idx === 1 ? "#CB412D" : "#45351E"}`, background: idx === 1 ? "#CB412D" : "#352C34", color: "#fff", cursor: "pointer" }}>
                        Modifier permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions editor */}
        {selectedRole && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
              Modifie les permissions du role : <span style={{ color: "#ef4444" }}>{selectedRole.name}</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {permissionsList.map(perm => (
                <div key={perm.key} style={{ background: "linear-gradient(135deg,#2B1F21,#141212)", borderRadius: 12, padding: 16 }}>
                  <span style={{ fontWeight: 500, fontSize: 18, display: "block", marginBottom: 12 }}>{perm.label}</span>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[
                      { val: "autorise",    label: "Autorisé",    activeColor: "#4F5F46", borderColor: "#4F5F46" },
                      { val: "restreindre", label: "Restreindre", activeColor: "#BC7E44", borderColor: "#BC7E44" },
                      { val: "interdit",    label: "Interdit",    activeColor: "#BD2626", borderColor: "#BD2626" },
                    ].map(({ val, label, activeColor, borderColor }) => {
                      const isActive = permissions[perm.key] === val;
                      return (
                        <button key={val} onClick={() => setPermissions(p => ({ ...p, [perm.key]: val }))}
                          style={{ padding: "8px 24px", borderRadius: 8, border: `1px solid ${isActive ? "transparent" : borderColor}`, background: isActive ? activeColor : "linear-gradient(135deg,#2B1F21,#141212)", color: "#fff", cursor: "pointer", opacity: isActive ? 1 : 0.7, fontFamily: "inherit" }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 32 }}>
              <button onClick={() => setSelectedRole(null)} style={{ padding: "8px 24px", borderRadius: 8, background: "linear-gradient(135deg,#2B1F21,#141212)", color: "#fff", border: "none", cursor: "pointer" }}>Annuler</button>
              <button onClick={handleSave} style={{ padding: "8px 24px", borderRadius: 8, background: "linear-gradient(135deg,#86A175,#49583F)", color: "#fff", border: "none", cursor: "pointer" }}>Enregistrer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}