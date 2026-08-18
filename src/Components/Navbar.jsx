import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaTv, 
  FaUsers, 
  FaBriefcase, 
  FaPlus, 
  FaSearch, 
  FaComments, 
  FaBars, 
  FaTimes,
  FaEdit,
  FaHistory,
  FaVideo,
  FaBookmark,
  FaCog,
  FaQuestionCircle,
  FaUser,
  FaSignOutAlt,
  FaStickyNote
} from "react-icons/fa";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para abrir/fechar menus
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);

  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      {/* LINHA SUPERIOR */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo + Ícone Criar (+) */}
        <div className="flex items-center gap-3">
          <h1 
            onClick={() => navigate("/home")} 
            className="text-2xl font-bold text-blue-600 tracking-tight cursor-pointer"
          >
            conectamoz
          </h1>

          {/* Botão de Adicionar (+) - Foto 2 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCreateMenu(!showCreateMenu);
                setShowSidebarMenu(false);
              }}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
              title="Criar"
            >
              <FaPlus size={16} />
            </button>

            {/* Menu Suspenso de Criação (Foto 2) */}
            {showCreateMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <button 
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaEdit size={18} className="text-gray-700" /> Publicação
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaHistory size={18} className="text-gray-700" /> História
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaVideo size={18} className="text-gray-700" /> Reel
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaVideo size={18} className="text-gray-700" /> Direto
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaStickyNote size={18} className="text-gray-700" /> Nota
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Pesquisa, Mensagens, Menu 3 Traços */}
        <div className="flex items-center gap-2">
          {/* Lupa / Pesquisar */}
          <button 
            onClick={() => navigate("/search")}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
          >
            <FaSearch size={16} />
          </button>

          {/* Mensagens / Chat */}
          <button 
            onClick={() => navigate("/chat")}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition relative"
          >
            <FaComments size={16} />
          </button>

          {/* Menu Três Traços (Foto 3) */}
          <button 
            onClick={() => {
              setShowSidebarMenu(!showSidebarMenu);
              setShowCreateMenu(false);
            }}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
          >
            {showSidebarMenu ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* LINHA INFERIOR: NAVEGAÇÃO POR SEPARADORES (ESTILO FACEBOOK) */}
      <div className="flex justify-around items-center border-t border-gray-100 max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/home")}
          className={`flex-1 py-2.5 flex justify-center items-center border-b-2 transition ${
            location.pathname === "/home" || location.pathname === "/" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaHome size={22} />
        </button>

        <button
          onClick={() => navigate("/home")}
          className="flex-1 py-2.5 flex justify-center items-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          <FaTv size={20} />
        </button>

        <button
          onClick={() => navigate("/search")}
          className="flex-1 py-2.5 flex justify-center items-center border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          <FaUsers size={22} />
        </button>

        <button
          onClick={() => navigate("/jobs")}
          className={`flex-1 py-2.5 flex justify-center items-center border-b-2 transition ${
            location.pathname === "/jobs" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaBriefcase size={20} />
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={`flex-1 py-2.5 flex justify-center items-center border-b-2 transition ${
            location.pathname === "/profile" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaUser size={20} />
        </button>
      </div>

      {/* MENU LATERAL / OVERLAY DO MENU DE TRÊS TRAÇOS (Foto 3) */}
      {showSidebarMenu && (
        <div className="fixed inset-x-0 top-24 bottom-0 bg-gray-100 z-40 overflow-y-auto p-4 shadow-inner">
          <div className="max-w-md mx-auto space-y-4">
            
            {/* Card do Perfil */}
            <div 
              onClick={() => {
                navigate("/profile");
                setShowSidebarMenu(false);
              }}
              className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg">
                  {user?.displayName ? user.displayName.charAt(0) : "U"}
                </div>
                <span className="font-bold text-gray-800 text-base">
                  {user?.displayName || "Utilizador Conectamoz"}
                </span>
              </div>
            </div>

            {/* Atalhos e Funcionalidades (Foto 3) */}
            <div className="bg-white rounded-xl p-2 shadow-sm space-y-1">
              <p className="px-3 py-1.5 text-xs font-bold text-gray-500">Os teus atalhos</p>
              
              <button 
                onClick={() => { navigate("/search"); setShowSidebarMenu(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FaUsers className="text-blue-500" size={18} /> Amigos
              </button>

              <button 
                onClick={() => { navigate("/admin"); setShowSidebarMenu(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FaBriefcase className="text-blue-600" size={18} /> Painel Administrativo
              </button>

              <button 
                onClick={() => setShowSidebarMenu(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FaBookmark className="text-purple-500" size={18} /> Guardados
              </button>

              <button 
                onClick={() => setShowSidebarMenu(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FaHistory className="text-blue-400" size={18} /> Memórias
              </button>
            </div>

            {/* Ajuda e Definições */}
            <div className="bg-white rounded-xl p-2 shadow-sm space-y-1">
              <button 
                onClick={() => setShowSidebarMenu(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FaQuestionCircle className="text-gray-500" size={18} /> Ajuda e apoio técnico
              </button>

              <button 
                onClick={() => setShowSidebarMenu(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FaCog className="text-gray-500" size={18} /> Definições e privacidade
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FaSignOutAlt size={18} /> Sair da conta
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}