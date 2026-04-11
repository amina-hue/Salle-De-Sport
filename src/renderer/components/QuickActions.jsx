import React, { useState } from "react";
import { IoFlash } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const go = (path) => {
    navigate(`${path}?openModal=true`);
    setShowActions(false);
  };

  return (
    <>
      <div style={{ position: "absolute", top: 20, right: 90, display: "flex", alignItems: "center", gap: 8, zIndex: 1000 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#000" }} />
        <IoFlash size={26} color="#fff" style={{ cursor: "pointer", zIndex: 1000 }} onClick={() => setShowActions(!showActions)} />
      </div>

      {showActions && (
        <div style={{ position: "fixed", top: 80, right: 40, background: "#0b0b0b", borderRadius: 12, padding: 16, width: 220, border: "1px solid rgba(255,255,255,0.1)", zIndex: 2000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>Actions rapides</span>
            <span onClick={() => setShowActions(false)} style={{ cursor: "pointer", color: "#fff" }}>✕</span>
          </div>
          {[
            { label: "+ Nouvel Adhérent",   path: "/adherents"   },
            { label: "+ Nouvel Abonnement", path: "/abonnements" },
            { label: "+ Paiement",          path: "/paiements"   },
            { label: "+ Planifier séance",  path: "/planning"    },
          ].map((btn, i) => (
            <button key={i} onClick={() => go(btn.path)} style={{ width: "100%", background: "#ef4444", border: "none", padding: "10px", borderRadius: 999, color: "#fff", marginBottom: 8, cursor: "pointer" }}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}