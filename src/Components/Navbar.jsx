import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  FaSearch, 
  FaHome, 
  FaTv, 
  FaUserFriends, 
  FaBriefcase, 
  FaBell, 
  FaFacebookMessenger, 
  FaBars 
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = auth.currentUser;

  const [notifNaoLidas, setNotifNaoLidas] = useState(0);
  const [termoPesquisa, setTermoPesquisa] = useState("");

  // Escutar notificações não lidas no Firestore
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notificacoes"),
      where("destinatarioId", "==", currentUser.uid),
      where("lida", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifNaoLidas(snapshot.docs.length);
    }, (error) => {
      console.error("Erro ao escutar contagem de notificações:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Função para processar a pesquisa
  const handlePesquisa = (e) => {
    if (e.key === "Enter" && termoPesquisa.trim()) {
      navigate(`/search?q=${encodeURIComponent(termoPesquisa.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
      {/* Linha Superior: Logo, Pesquisa e Atalhos */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Lado Esquerdo: Logo + Barra de Pesquisa */}
        <div className="flex items-center gap-2">
          <h1 
            onClick={() => navigate("/home")} 
            className="text-blue-600 text-2xl font-bold tracking-tight cursor-pointer select-none"
          >
            conectamoz
          </h1>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 text-gray-500 text-sm">
            <FaSearch 
              className="mr-2 text-gray-400 cursor-pointer" 
              onClick={() => navigate("/search")}
            />
            <input 
              type="text" 
              placeholder="Pesquisar no Conectamoz" 
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              onKeyDown={handlePesquisa}
              className="bg-transparent outline-none w-32 sm:w-48 placeholder-gray-500 text-xs sm:text-sm text-gray-800"
            />
          </div>
        </div>

        {/* Lado Direito: Ícones Rápidos */}
        <div className="flex items-center gap-2">
          {/* Mensagens / Chat */}
          <button 
            onClick={() => navigate("/chat")}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 relative transition"
            title="Mensagens"
          >
            <FaFacebookMessenger size={18} />
          </button>

          {/* Notificações */}
          <button 
            onClick={() => navigate("/notifications")}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 relative transition"
            title="Notificações"
          >
            <FaBell size={18} />
            {notifNaoLidas > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {notifNaoLidas > 9 ? "9+" : notifNaoLidas}
              </span>
            )}
          </button>

          {/* Menu / Perfil */}
          <button 
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition"
            title="Perfil"
          >
            <FaBars size={18} />
          </button>
        </div>
      </div>

      {/* Linha Inferior: Abas Principais (Tabs) */}
      <nav className="flex justify-around items-center border-t border-gray-100 text-gray-500">
        {/* Feed / Home */}
        <button 
          onClick={() => navigate("/home")}
          className={`flex-1 flex justify-center py-2.5 transition ${
            isActive("/home") 
              ? "text-blue-600 border-b-4 border-blue-600" 
              : "hover:bg-gray-50 text-gray-500"
          }`}
        >
          <FaHome size={20} />
        </button>

        {/* Vídeos / Reels */}
        <button 
          onClick={() => navigate("/home")}
          className={`flex-1 flex justify-center py-2.5 hover:bg-gray-50 transition text-gray-500`}
        >
          <FaTv size={20} />
        </button>

        {/* Amigos / Pesquisa */}
        <button 
          onClick={() => navigate("/search")}
          className={`flex-1 flex justify-center py-2.5 transition ${
            isActive("/search") 
              ? "text-blue-600 border-b-4 border-blue-600" 
              : "hover:bg-gray-50 text-gray-500"
          }`}
        >
          <FaUserFriends size={20} />
        </button>

        {/* Empregos / Vagas */}
        <button 
          onClick={() => navigate("/jobs")}
          className={`flex-1 flex justify-center py-2.5 transition ${
            isActive("/jobs") 
              ? "text-blue-600 border-b-4 border-blue-600" 
              : "hover:bg-gray-50 text-gray-500"
          }`}
        >
          <FaBriefcase size={20} />
        </button>

        {/* Notificações Aba */}
        <button 
          onClick={() => navigate("/notifications")}
          className={`flex-1 flex justify-center py-2.5 relative transition ${
            isActive("/notifications") 
              ? "text-blue-600 border-b-4 border-blue-600" 
              : "hover:bg-gray-50 text-gray-500"
          }`}
        >
          <FaBell size={20} />
          {notifNaoLidas > 0 && (
            <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full">
              {notifNaoLidas > 9 ? "9+" : notifNaoLidas}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}