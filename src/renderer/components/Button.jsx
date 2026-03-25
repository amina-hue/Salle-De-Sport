import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  className = "",
}) => {
  const baseStyle =
    "flex items-center gap-2 px-4 py-2 rounded-lg transition";

  const variants = {
    primary: "bg-red-500 hover:bg-red-600 text-white",
    secondary: "bg-[#1a1a22] hover:bg-[#2a2a33] text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-black",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export default Button;
