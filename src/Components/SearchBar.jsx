import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ value, onChange, placeholder = "Pesquisar..." }) {
  return (
    <div className="relative w-full">
      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-100 text-sm text-gray-800 pl-10 pr-4 py-2.5 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30"
      />
    </div>
  );
}