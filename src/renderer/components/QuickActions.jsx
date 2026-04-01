import React, { useState } from "react";
import { IoFlash } from "react-icons/io5";

export default function QuickActions({ navigate }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      {/* Conteneur cercle + thunder */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 90,
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 1000,
        }}
      >
        {/* Cercle noir */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#000",
          }}
        />

        {/* Thunder blanc */}
        <IoFlash
          size={26}
          color="#fff"
          style={{ cursor: "pointer", zIndex: 1000 }}
          onClick={() => setShowActions(!showActions)}
        />
      </div>

      {/* Popup */}
      {showActions && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 40,
            background: "#0b0b0b",
            borderRadius: 12,
            padding: 16,
            width: 220,
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
              Actions rapides
            </span>
            <span
              onClick={() => setShowActions(false)}
              style={{ cursor: "pointer", color: "#fff" }}
            >
              ✕
            </span>
          </div>

          {[
            { label: "+ Nouvel Adhérent", action: () => navigate("adherent") },
            { label: "+ Nouvel Abonnement", action: () => navigate("abonnement") },
            { label: "+ Paiement", action: () => navigate("revenue") },
            { label: "+ Planifier séance", action: () => navigate("planning") },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
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
    </>
  );
}