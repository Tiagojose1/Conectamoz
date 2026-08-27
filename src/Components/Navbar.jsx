import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaSearch, 
  FaRegComment, 
  FaRegBell, 
  FaPlus, 
  FaHome, 
  FaCompass, 
  FaRegUser,
  FaEdit,
  FaHistory,
  FaVideo,
  FaStickyNote
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = auth.currentUser;

  // Escuta no Firestore para notificações/pedidos pendentes em tempo real
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "friend_requests"),
      where("destinatarioId", "==", user.uid),
      where("status", "==", "pendente")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUnreadCount(snapshot.docs.length);
      },
      (err) => console.error("Erro ao carregar notificações:", err)
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      {/* 1. NAVBAR SUPERIOR */}
      <header className="fixed top-0 inset-x-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-40 shadow-sm">
        
        {/* Lado Esquerdo: Logótipo + Criar Conteúdo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/home")} 
            className="text-2xl font-extrabold tracking-tight cursor-pointer"
          >
            <span className="text-gray-900">Konnex</span>
            <span className="text-[#635BFF]">Vib</span>
          </button>

          {/* Menu Suspenso de Criação Rápida */}
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
              title="Criar Conteúdo"
            >
              <FaPlus size={14} />
            </button>

            {showCreateMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <button 
                  onClick={() => { navigate("/create-post"); setShowCreateMenu(false); }} 
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaEdit size={16} /> Publicação
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)} 
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaHistory size={16} /> História
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)} 
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaVideo size={16} /> Reel
                </button>
                <button 
                  onClick={() => setShowCreateMenu(false)} 
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaStickyNote size={16} /> Nota
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Pesquisa, Mensagens e Notificações */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/search")} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition"
          >
            <FaSearch size={18} />
          </button>

          <button 
            onClick={() => navigate("/chat")} 
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition"
          >
            <FaRegComment size={20} />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <button 
            onClick={() => navigate("/notifications")} 
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition"
          >
            <FaRegBell size={20} />
            {unreadCount > 0 ? (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                12
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. BARRA DE NAVEGAÇÃO INFERIOR (Bottom Bar) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between z-50">
        
        {/* Início */}
        <button 
          onClick={() => navigate("/home")} 
          className={`flex flex-col items-center transition ${location.pathname === "/home" || location.pathname === "/" ? "text-[#635BFF]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <FaHome size={22} />
          <span className="text-[10px] font-bold mt-0.5">Início</span>
        </button>

        {/* Descobrir / Pesquisa */}
        <button 
          onClick={() => navigate("/search")} 
          className={`flex flex-col items-center transition ${location.pathname === "/search" ? "text-[#635BFF]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <FaCompass size={22} />
          <span className="text-[10px] font-medium mt-0.5">Descobrir</span>
        </button>

        {/* Botão Flutuante Central (+) */}
        <button 
          onClick={() => navigate("/create-post")}
          className="w-12 h-12 rounded-full bg-[#3B28CC] text-white flex items-center justify-center shadow-lg hover:scale-105 transition -mt-5 border-4 border-white"
        >
          <FaPlus size={18} />
        </button>

        {/* Mensagens */}
        <button 
          onClick={() => navigate("/chat")} 
          className={`relative flex flex-col items-center transition ${location.pathname === "/chat" ? "text-[#635BFF]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <FaRegComment size={22} />
          <span className="absolute -top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            2
          </span>
          <span className="text-[10px] font-medium mt-0.5">Mensagens</span>
        </button>

        {/* Perfil */}
        <button 
          onClick={() => navigate("/profile")} 
          className={`flex flex-col items-center transition ${location.pathname === "/profile" ? "text-[#635BFF]" : "text-gray-400 hover:text-gray-600"}`}
        >
          <FaRegUser size={22} />
          <span className="text-[10px] font-medium mt-0.5">Perfil</span>
        </button>

      </nav>
    </>
  );
}