import React from "react";
import { Search } from "lucide-react";
import "../../styles/Searchinput.css";

const SearchInput = ({ value, onChange, placeholder = "Rechercher..." }) => (
  <div className="search-wrapper">
    <span className="search-icon">
      <Search size={14} />
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="search-input"
    />
  </div>
);

export default SearchInput;