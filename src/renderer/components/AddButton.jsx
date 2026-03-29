import React from "react";
import { Plus } from "lucide-react";

const AddButton = ({
  children,
  onClick,
  icon: Icon = Plus,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#e53935",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "12px 22px",
        fontFamily: "'Barlow', sans-serif",
        fontSize: "0.9rem",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(229,57,53,0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 10px 28px rgba(229,57,53,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow =
          "0 6px 20px rgba(229,57,53,0.4)";
      }}
    >
      <Icon size={17} />
      {children}
    </button>
  );
};

export default AddButton;