import React from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 relative shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-bold text-base text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}