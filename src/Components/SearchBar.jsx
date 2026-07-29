import React from 'react';

export default function SearchBar({ value, onChange, placeholder = "Pesquisar no ConectMoz..." }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
      <span className="absolute left-3 top-2.5 text-gray-400 text-base">
        🔍
      </span>
    </div>
  );
}