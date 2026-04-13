import React, { useState } from "react";
import { IoFlash } from "react-icons/io5";
import AddMemberModal from "./AddMemberModal";
import NouveauPaiementModal from "./NouveauPaiementModal";
import NouvelSeanceModal from "./NouvelSeanceModal";
import NouvelAbonnementModal from "./NouvelAbonnementModal";

export default function QuickActions({ typesAbonnement = [] }) {
  const [showActions, setShowActions] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'adherent' | 'paiement' | 'seance' | null

  const open = (modal) => {
    setActiveModal(modal);
    setShowActions(false);
  };

  const close = () => setActiveModal(null);

  const handleSaveAdherent = async (data) => {
    try {
      const result = await window.api.addAdherent({
        nom: data.nom, prenom: data.prenom,
        dateNaissance: data.dateNaissance || null,
        numTelephone: data.numTelephone,
        email: data.email || null,
        sexe: data.sexe,
      });
      const newId = result.insertId;
      if (data.photo && newId)
        await window.api.updateAdherentPhoto({ idAdherent: newId, photo: data.photo });
      if (data.type_id && data.dateDebut && newId) {
        const aboResult = await window.api.addAbonnement({
          adherent_id: newId, type_id: parseInt(data.type_id),
          dateDebut: data.dateDebut, dateFin: data.dateFin || null, statut: 'actif',
        });
        if (aboResult?.insertId && data.montant && data.montant > 0) {
          await window.api.addPaiement({
            abonnement_id: aboResult.insertId, montant: data.montant,
            datePaiement: data.dateDebut, modePaiement: data.modePaiement || 'cash',
          });
        }
      }
      close();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de l'adhérent");
    }
  };
const handleSaveAbonnement = async (data) => {
  try {
    const result = await window.api.addAbonnement({
      adherent_id: data.adherent_id,
      type_id: parseInt(data.type_id),
      dateDebut: data.dateDebut,
      dateFin: data.dateFin || null,
      statut: "actif",
    });

    if (result?.insertId && data.montant && data.montant > 0) {
      await window.api.addPaiement({
        abonnement_id: result.insertId,
        montant: data.montant,
        datePaiement: data.dateDebut,
        modePaiement: data.modePaiement || "cash",
      });
    }

    close();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'ajout de l'abonnement");
  }
};
  const handleSavePaiement = async (formData) => {
    try {
      const response = await window.api.addPaiement(formData);
      if (response?.success) {
        close();
      } else {
        alert("Erreur : " + (response?.error || "inconnue"));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de communication avec la base de données.");
    }
  };

  return (
    <>
      <div style={{ position: "absolute", top: 20, right: 90, display: "flex", alignItems: "center", gap: 8, zIndex: 1000 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#000" }} />
        <IoFlash
          size={26} color="#fff" style={{ cursor: "pointer", zIndex: 1000 }}
          onClick={() => setShowActions(!showActions)}
        />
      </div>

      {showActions && (
        <div style={{ position: "fixed", top: 80, right: 40, background: "#0b0b0b", borderRadius: 12, padding: 16, width: 220, border: "1px solid rgba(255,255,255,0.1)", zIndex: 2000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>Actions rapides</span>
            <span onClick={() => setShowActions(false)} style={{ cursor: "pointer", color: "#fff" }}>✕</span>
          </div>
          {[
            { label: "+ Nouvel Adhérent",  modal: "adherent" },
            { label: "+ Nouvel Abonnement", modal: "abonnement" },
            { label: "+ Paiement",         modal: "paiement" },
            { label: "+ Planifier séance", modal: "seance"   },
          ].map((btn, i) => (
            <button key={i} onClick={() => open(btn.modal)}
              style={{ width: "100%", background: "#ef4444", border: "none", padding: "10px", borderRadius: 999, color: "#fff", marginBottom: 8, cursor: "pointer" }}>
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Modals directement ici, sans navigation */}
      {activeModal === "adherent" && (
        <AddMemberModal
          typesAbonnement={typesAbonnement}
          onSave={handleSaveAdherent}
          onClose={close}
        />
      )}
      {activeModal === "abonnement" && (
  <NouvelAbonnementModal
    onClose={close}
    onSave={handleSaveAbonnement}
    typesAbonnement={typesAbonnement}
  />
)}

      {activeModal === "paiement" && (
        <NouveauPaiementModal
          onClose={close}
          onSave={handleSavePaiement}
        />
      )}

      {activeModal === "seance" && (
        <NouvelSeanceModal
          onClose={close}
          onSave={(data) => { console.log("Nouvelle séance :", data); close(); }}
        />
      )}
    </>
  );
}