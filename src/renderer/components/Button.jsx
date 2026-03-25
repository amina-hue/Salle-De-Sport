import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  className = "",
}) => {
  const baseStyle =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-none";

  const variants = {
    primary:
      "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-[0_4px_16px_rgba(230,57,70,0.35)] hover:shadow-[0_6px_20px_rgba(230,57,70,0.5)] hover:-translate-y-0.5",
    secondary:
      "bg-gradient-to-br from-[#2a2a3a] to-[#1a1a26] hover:from-[#3a3a4a] hover:to-[#2a2a36] text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5",
    success:
      "bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-[0_4px_16px_rgba(34,197,94,0.35)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] hover:-translate-y-0.5",
    warning:
      "bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:-translate-y-0.5",
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