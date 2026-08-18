import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaBriefcase, FaComments, FaUser } from "react-icons/fa";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Feed", path: "/", icon: <FaHome size={20} /> },
    { label: "Empregos", path: "/jobs", icon: <FaBriefcase size={20} /> },
    { label: "Mensagens", path: "/messages", icon: <FaComments size={20} /> },
    { label: "Perfil", path: "/profile", icon: <FaUser size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center flex-1 py-1 text-xs font-medium transition ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div className="mb-0.5">{item.icon}</div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}