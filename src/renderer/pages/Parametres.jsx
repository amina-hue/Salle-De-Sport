import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import gymBg from "../../images/Gymnastique.png";

const initialRoles = [
  { id: 1, name: "Admin", users: 2 },
  { id: 2, name: "Manager", users: 5 },
  { id: 3, name: "Receptionniste", users: 3 },
];

// Liste complète des permissions pour toutes les pages
const permissionsList = [
  { key: "statistiques", label: "Accès Statistiques" },
  { key: "adherents", label: "Gestion des adherents" },
  { key: "abonnements", label: "Gestion des abonnements" },
  { key: "paiements", label: "Gestion des paiements" },
  { key: "planning", label: "Gestion du planning" },
  { key: "recette", label: "Gestion de la recette" },
  { key: "magasin", label: "Gestion du magasin" },
  { key: "utilisateur", label: "Gestion des utilisateurs" },
];

export default function Parametres({ onPageChange, onPermissionsChange }) {
  const navigate = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Permissions pour TOUTES les pages
  const [permissions, setPermissions] = useState(() => {
    // Récupérer les permissions sauvegardées dans localStorage
    const saved = localStorage.getItem("appPermissions");
    if (saved) {
      return JSON.parse(saved);
    }
    // Permissions par défaut
    return {
      statistiques: "autorise",
      adherents: "autorise",
      abonnements: "autorise",
      paiements: "autorise",
      planning: "autorise",
      recette: "autorise",
      magasin: "autorise",
      utilisateur: "autorise",
    };
  });
  
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  // Sauvegarder les permissions dans localStorage et notifier le parent
  useEffect(() => {
    localStorage.setItem("appPermissions", JSON.stringify(permissions));
    if (onPermissionsChange) {
      onPermissionsChange(permissions);
    }
  }, [permissions, onPermissionsChange]);

  const handleEditRole = (role) => {
    setSelectedRole(role);
  };

  const handlePermissionChange = (permissionKey, value) => {
    setPermissions({
      ...permissions,
      [permissionKey]: value
    });
  };

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const newRole = {
        id: roles.length + 1,
        name: newRoleName,
        users: 0,
      };
      setRoles([...roles, newRole]);
      setNewRoleName("");
      setShowAddRole(false);
    }
  };

  const handleSavePermissions = () => {
    console.log("Permissions sauvegardées", permissions);
    alert(`Permissions sauvegardées pour ${selectedRole?.name}`);
    setSelectedRole(null);
  };

  const handleCancel = () => {
    setSelectedRole(null);
  };

  return (
    <div className="flex h-screen text-white">
      <Sidebar />

      <div
        className="flex-1 bg-cover bg-center overflow-y-auto"
        style={{ backgroundImage: `url(${gymBg})` }}
      >
        <div className="min-h-full w-full" style={{ backgroundColor: "rgba(0, 0, 0, 0.81)" }}>
          <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold">
                <span className="font-extrabold">Paramètres</span>
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl">⚡</span>
                <div className="w-10 h-10 bg-black rounded-full"></div>
              </div>
            </div>

            {/* Gestion des roles et permissions */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Gestion des roles et permissions</h2>
                <button 
                  onClick={() => setShowAddRole(true)}
                  className="px-4 py-2 rounded-lg text-sm transition"
                  style={{
                    background: "linear-gradient(135deg, #86A175, #49583F)",
                    color: "white"
                  }}
                >
                  + Ajouter un rôle
                </button>
              </div>

              {/* Modal Ajouter rôle */}
              {showAddRole && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div 
                    className="rounded-2xl p-6 w-96"
                    style={{
                      background: "linear-gradient(135deg, #141212, #2B1F21)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Ajouter un rôle</h3>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Nom du rôle"
                      className="w-full p-2 rounded-lg mb-4 text-white"
                      style={{
                        background: "linear-gradient(135deg, #2B1F21, #141212)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        outline: "none"
                      }}
                    />
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowAddRole(false)}
                        className="px-4 py-2 rounded-lg hover:opacity-80 transition"
                        style={{
                          background: "linear-gradient(135deg, #2B1F21, #141212)",
                          color: "white"
                        }}
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handleAddRole}
                        className="px-4 py-2 rounded-lg transition"
                        style={{
                          background: "linear-gradient(135deg, #86A175, #49583F)",
                          color: "white"
                        }}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tableau des rôles */}
              <div 
                className="rounded-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #2B1F21, #141212)"
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Rôle</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Utilisateur</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                      {roles.map((role, index) => (
                        <tr key={role.id} className="border-b border-gray-700/50">
                          <td className="py-3 px-4 font-medium">{role.name}</td>
                          <td className="py-3 px-4">{role.users}</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleEditRole(role)}
                              className="px-3 py-1 rounded-md text-sm transition"
                              style={{
                                border: `1px solid ${index === 1 ? "#CB412D" : "#45351E"}`,
                                background: index === 1 ? "#CB412D" : "#352C34",
                                color: "white"
                              }}
                            >
                              Modifier permissions
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modifie les permissions du role sélectionné */}
            {selectedRole && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-6">
                  Modifie les permissions du role : <span className="text-red-500">{selectedRole.name}</span>
                </h2>

                <div className="space-y-4">
                  {permissionsList.map((perm) => (
                    <div 
                      key={perm.key} 
                      className="rounded-xl p-4"
                      style={{
                        background: "linear-gradient(135deg, #2B1F21, #141212)"
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <span className="font-medium text-lg">{perm.label}</span>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handlePermissionChange(perm.key, "autorise")}
                            className={`px-6 py-2 rounded-lg transition ${
                              permissions[perm.key] === "autorise"
                                ? "shadow-lg"
                                : "opacity-70"
                            }`}
                            style={{
                              background: permissions[perm.key] === "autorise" ? "#4F5F46" : "linear-gradient(135deg, #2B1F21, #141212)",
                              color: "white",
                              border: permissions[perm.key] === "autorise" ? "none" : "1px solid #4F5F46"
                            }}
                          >
                            Autorisé
                          </button>
                          <button
                            onClick={() => handlePermissionChange(perm.key, "restreindre")}
                            className={`px-6 py-2 rounded-lg transition ${
                              permissions[perm.key] === "restreindre"
                                ? "shadow-lg"
                                : "opacity-70"
                            }`}
                            style={{
                              background: permissions[perm.key] === "restreindre" ? "#BC7E44" : "linear-gradient(135deg, #2B1F21, #141212)",
                              color: "white",
                              border: permissions[perm.key] === "restreindre" ? "none" : "1px solid #BC7E44"
                            }}
                          >
                            Restreindre
                          </button>
                          <button
                            onClick={() => handlePermissionChange(perm.key, "interdit")}
                            className={`px-6 py-2 rounded-lg transition ${
                              permissions[perm.key] === "interdit"
                                ? "shadow-lg"
                                : "opacity-70"
                            }`}
                            style={{
                              background: permissions[perm.key] === "interdit" ? "#BD2626" : "linear-gradient(135deg, #2B1F21, #141212)",
                              color: "white",
                              border: permissions[perm.key] === "interdit" ? "none" : "1px solid #BD2626"
                            }}
                          >
                            Interdit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Boutons Annuler / Enregistrer */}
                <div className="flex justify-end gap-4 mt-8">
                  <button 
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-lg transition hover:opacity-80"
                    style={{
                      background: "linear-gradient(135deg, #2B1F21, #141212)",
                      color: "white"
                    }}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSavePermissions}
                    className="px-6 py-2 rounded-lg transition"
                    style={{
                      background: "linear-gradient(135deg, #86A175, #49583F)",
                      color: "white"
                    }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}