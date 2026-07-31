import React from "react";
import { 
  FaSearch, 
  FaHome, 
  FaTv, 
  FaUserFriends, 
  FaStore, 
  FaBell, 
  FaFacebookMessenger, 
  FaBars 
} from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
      {/* Linha Superior: Logo, Pesquisa e Atalhos de Conta */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Lado Esquerdo: Logo + Barra de Pesquisa */}
        <div className="flex items-center gap-2">
          <h1 className="text-blue-600 text-2xl font-bold tracking-tight cursor-pointer">
            conectamoz
          </h1>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 text-gray-500 text-sm">
            <FaSearch className="mr-2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar no Conectamoz" 
              className="bg-transparent outline-none w-32 sm:w-48 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Lado Direito: Ícones Rápidos (Mensagens, Notificações, Menu) */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 relative">
            <FaFacebookMessenger size={18} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              9+
            </span>
          </button>
          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
            <FaBell size={18} />
          </button>
          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
            <FaBars size={18} />
          </button>
        </div>
      </div>

      {/* Linha Inferior: Abas Principais (Tabs) */}
      <nav className="flex justify-around items-center border-t border-gray-100 text-gray-500 pt-1">
        <button className="flex-1 flex justify-center py-2 text-blue-600 border-b-4 border-blue-600">
          <FaHome size={22} />
        </button>
        <button className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded-lg">
          <FaTv size={22} />
        </button>
        <button className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded-lg relative">
          <FaUserFriends size={22} />
          <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">
            1
          </span>
        </button>
        <button className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded-lg">
          <FaStore size={22} />
        </button>
        <button className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded-lg relative">
          <FaBell size={22} />
          <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">
            9+
          </span>
        </button>
      </nav>
    </header>
  );
}