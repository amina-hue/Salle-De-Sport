import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import gymBg from "../../images/Gymnastique.png";

const initialRoles = [
  { id: 1, name: "Admin", users: 2 },
  { id: 2, name: "Manager", users: 5 },
  { id: 3, name: "Receptionniste", users: 3 },
];

const permissionsList = [
  { key: "stats", label: "Accès statistiques" },
  { key: "adherents", label: "Gestion des adherents" },
  { key: "planning", label: "Gestion du planning" },
];

export default function Parametres({ onPageChange }) {
  const navigate = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({
    stats: "autorise",
    adherents: "autorise",
    planning: "autorise",
  });
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const handleEditRole = (role) => {
    setSelectedRole(role);
    // Reset permissions par défaut pour le rôle sélectionné
    setPermissions({
      stats: "autorise",
      adherents: "autorise",
      planning: "autorise",
    });
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
    // Ici tu peux sauvegarder les permissions dans ta base de données
    console.log("Permissions sauvegardées pour", selectedRole?.name, permissions);
    alert(`Permissions sauvegardées pour ${selectedRole?.name}`);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setPermissions({
      stats: "autorise",
      adherents: "autorise",
      planning: "autorise",
    });
  };

  return (
    <div className="flex h-screen text-white">
      <Sidebar />

      <div
        className="flex-1 bg-cover bg-center overflow-y-auto"
        style={{ backgroundImage: `url(${gymBg})` }}
      >
        <div className="bg-black/80 min-h-full p-6">

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

          {/* MAIN CONTAINER */}
          <div className="bg-black/95 rounded-2xl p-6 border border-red-500">

            {/* Gestion des roles et permissions */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gestion des roles et permissions</h2>
                <button 
                  onClick={() => setShowAddRole(true)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm transition"
                >
                  + Ajouter un rôle
                </button>
              </div>

              {/* Modal Ajouter rôle */}
              {showAddRole && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-gray-900 rounded-2xl p-6 w-96 border border-red-500">
                    <h3 className="text-lg font-semibold mb-4">Ajouter un rôle</h3>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Nom du rôle"
                      className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 mb-4"
                    />
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowAddRole(false)}
                        className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handleAddRole}
                        className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tableau des rôles */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Rôle</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Utilisateur</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 font-medium">{role.name}</td>
                        <td className="py-3 px-4">{role.users}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleEditRole(role)}
                            className="text-red-400 hover:text-red-300 text-sm transition"
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

            {/* Modifie les permissions du role sélectionné */}
            {selectedRole && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-xl font-semibold mb-6">
                  Modifie les permissions du role : <span className="text-red-500">{selectedRole.name}</span>
                </h2>

                <div className="space-y-6">
                  {permissionsList.map((perm) => (
                    <div key={perm.key} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <span className="font-medium text-lg">{perm.label}</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePermissionChange(perm.key, "autorise")}
                            className={`px-4 py-2 rounded-lg transition ${
                              permissions[perm.key] === "autorise"
                                ? "bg-green-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            Autorisé
                          </button>
                          <button
                            onClick={() => handlePermissionChange(perm.key, "restreindre")}
                            className={`px-4 py-2 rounded-lg transition ${
                              permissions[perm.key] === "restreindre"
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            Restreindre
                          </button>
                          <button
                            onClick={() => handlePermissionChange(perm.key, "interdit")}
                            className={`px-4 py-2 rounded-lg transition ${
                              permissions[perm.key] === "interdit"
                                ? "bg-red-500 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
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
                    className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSavePermissions}
                    className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
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