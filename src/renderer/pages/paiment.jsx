import React, { useState } from "react";
import { Search, Filter, Download, Plus } from "lucide-react";
import Sidebar from '..//components/Sidebar';
import StatCard from "../components/StatCard";
import Button from "../components/Button";

const Paiement = () => {
  const [search, setSearch] = useState("");

  const paiements = [
    {
      id: "#0001",
      nom: "Sophie Martin",
      abonnement: "Premium Mensuel",
      montant: 799,
      date: "25 Fév 2026",
      methode: "Carte bancaire",
      statut: "Payé",
    },
    {
      id: "#0002",
      nom: "Lucas Bernard",
      abonnement: "Standard Mensuel",
      montant: 499,
      date: "24 Fév 2026",
      methode: "Virement",
      statut: "Payé",
    },
    {
      id: "#0003",
      nom: "Emma Dubois",
      abonnement: "Premium Trimestriel",
      montant: 2199,
      date: "23 Fév 2026",
      methode: "Carte bancaire",
      statut: "En attente",
    },
    {
      id: "#0004",
      nom: "Thomas Petit",
      abonnement: "Standard Mensuel",
      montant: 499,
      date: "20 Fév 2026",
      methode: "Espèces",
      statut: "En retard",
    },
  ];

  const getStatusStyle = (statut) => {
    switch (statut) {
      case "Payé":
        return "bg-green-500/20 text-green-400";
      case "En attente":
        return "bg-yellow-500/20 text-yellow-400";
      case "En retard":
        return "bg-red-500/20 text-red-400";
      default:
        return "";
    }
  };

  return (
     <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1}}>
        <div className="p-6 text-white bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des paiements</h1>
          <p className="text-gray-400 text-sm">
            8 transactions ce mois-ci
          </p>
        </div>

        <Button variant="primary" icon={Plus}>
  Ajouter un paiement
</Button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
 <StatCard
  title="Revenus encaissés"
  value="1056 DA"
  color="text-green-400"
  bg="bg-green-500/10"
/>

<StatCard
  title="En attente"
  value="688 DA"
  color="text-yellow-400"
  bg="bg-yellow-500/10"
/>

<StatCard
  title="Retards"
  value="128 DA"
  color="text-red-400"
  bg="bg-red-500/10"
/>

</div>


      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center bg-[#1a1a22] px-3 py-2 rounded-lg w-full max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d’adhérent..."
            className="bg-transparent outline-none ml-2 w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-[#1a1a22] px-3 py-2 rounded-lg">
            <Filter size={16} />
            Filtres
          </button>

          <button className="flex items-center gap-2 bg-[#1a1a22] px-3 py-2 rounded-lg">
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a22] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#15151c] text-gray-400">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Adhérent</th>
              <th className="p-3 text-left">Abonnement</th>
              <th className="p-3 text-left">Montant</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Méthode</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paiements
              .filter((p) =>
                p.nom.toLowerCase().includes(search.toLowerCase())
              )
              .map((p, index) => (
                <tr
                  key={index}
                  className="border-t border-[#2a2a33] hover:bg-[#20202a]"
                >
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.nom}</td>
                  <td className="p-3">{p.abonnement}</td>
                  <td className="p-3 text-red-400">{p.montant} DA</td>
                  <td className="p-3">{p.date}</td>
                  <td className="p-3">{p.methode}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(
                        p.statut
                      )}`}
                    >
                      {p.statut}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 cursor-pointer hover:text-white">
                    Facture
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
      </div>
    </div>
    
  );
};

export default Paiement;
