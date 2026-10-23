import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPlus,
  FaCrown,
} from "react-icons/fa";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      label: "Início",
      path: "/home",
      icon: FaHome,
    },
    {
      label: "",
      path: "/create-post",
      icon: FaPlus,
      isAction: true,
    },
    {
      label: "Sala VIP",
      path: "/sala-vip",
      icon: FaCrown,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md">

      <div className="mx-auto flex h-[64px] max-w-md items-center justify-around px-8">

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          {/* ==================================================
              BOTÃO CENTRAL CRIAR
          ================================================== */}

          if (item.isAction) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => navigate(item.path)}
                aria-label="Criar publicação"
                title="Criar publicação"
                className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[#635BFF] text-white shadow-lg transition hover:scale-105 active:scale-95"
              >
                <Icon size={20} />
              </button>
            );
          }

          {/* ==================================================
              OUTROS BOTÕES
          ================================================== */}

          return (
            <button
              key={index}
              type="button"
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              title={item.label}
              className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
                active
                  ? "font-bold text-[#635BFF]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >

              <Icon size={19} />

              <span className="text-[10px] tracking-tight">
                {item.label}
              </span>

            </button>
          );
        })}

      </div>

    </nav>
  );
}