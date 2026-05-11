import React, { useState } from "react";
import { IoFlash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import AddMemberModal from "./AddMemberModal";
import NouvelTypeAbonnementModal from "./NouvelTypeAbonnementModal";
import NouveauPaiementModal from "./NouveauPaiementModal";
import NouvelSeanceModal from "./NouvelSeanceModal";

export default function QuickActions({ typesAbonnement, handleSaveAdherent, handleSaveAbonnement, handleSavePaiement }) {
  const [showActions, setShowActions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const open = (modal) => {
    setActiveModal(modal);
    setShowActions(false);
  };

  const close = () => setActiveModal(null);

  return (
    <>
      {/* ✅ FIX : position: fixed au lieu de absolute
          → le bouton reste toujours en haut à droite, peu importe
            la page ou le parent dans lequel QuickActions est rendu */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 90,
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 1000,
        }}
      >
        {/* Cercle initiales */}
        <div
          onClick={() => setShowProfile(!showProfile)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          {((user?.nom?.[0] ?? "") + (user?.prenom?.[0] ?? "")).toUpperCase() || "?"}
        </div>

        {/* Dropdown profil */}
        {showProfile && (
          <div
            style={{
              position: "fixed",
              top: 68,
              right: 40,
              background: "#0b0b0b",
              borderRadius: 12,
              padding: 16,
              width: 156,
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 2000,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>Profil</span>
              <span onClick={() => setShowProfile(false)} style={{ cursor: "pointer", color: "#fff" }}>✕</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/connexion");
              }}
              style={{
                width: "100%",
                background: "#ef4444",
                border: "none",
                padding: "10px",
                borderRadius: 999,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Déconnexion
            </button>
          </div>
        )}

        {/* Bouton éclair */}
        <IoFlash
          size={26}
          color="#fff"
          style={{ cursor: "pointer" }}
          onClick={() => setShowActions(!showActions)}
        />
      </div>

      {/* Dropdown actions rapides */}
      {showActions && (
        <div
          style={{
            position: "fixed",
            top: 68,
            right: 40,
            background: "#0b0b0b",
            borderRadius: 12,
            padding: 16,
            width: 220,
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 2000,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>Actions rapides</span>
            <span onClick={() => setShowActions(false)} style={{ cursor: "pointer", color: "#fff" }}>✕</span>
          </div>
          {[
            { label: "+ Nouvel Adhérent",   modal: "adherent"   },
            { label: "+ Nouvel Abonnement", modal: "abonnement" },
            { label: "+ Paiement",          modal: "paiement"   },
            { label: "+ Planifier séance",  modal: "seance"     },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => open(btn.modal)}
              style={{
                width: "100%",
                background: "#ef4444",
                border: "none",
                padding: "10px",
                borderRadius: 999,
                color: "#fff",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeModal === "adherent" && (
        <AddMemberModal
          typesAbonnement={typesAbonnement}
          onSave={handleSaveAdherent}
          onClose={close}
        />
      )}
      {activeModal === "abonnement" && (
        <NouvelTypeAbonnementModal
          onClose={close}
          onSave={async () => { close(); }}
        />
      )}
      {activeModal === "paiement" && (
        <NouveauPaiementModal
          onClose={close}
          onSave={async (data) => {
            try {
              const res = await window.api.addPaiement(data);
              console.log("Paiement ajouté :", res);
              close();
            } catch (err) {
              console.error(err);
              alert("Erreur paiement");
            }
          }}
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