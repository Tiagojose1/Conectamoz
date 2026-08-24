import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaTv, 
  FaUsers, 
  FaBriefcase, 
  FaPlus, 
  FaSearch, 
  FaComments, 
  FaBell,
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
  FaStickyNote,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaExclamationCircle,
  FaFileContract,
  FaLock,
  FaClock,
  FaMobileAlt,
  FaCreditCard,
  FaMoon,
  FaGlobe,
  FaThLarge,
  FaRobot
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import NotificacoesPedidos from "./NotificacoesPedidos";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para abrir/fechar menus
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Contador em tempo real para o Badge do Sino
  const [unreadCount, setUnreadCount] = useState(0);

  // Acordeões do Menu Lateral
  const [openHelp, setOpenHelp] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const user = auth.currentUser;

  // Escuta no Firestore para contar os pedidos pendentes
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "friend_requests"),
      where("destinatarioId", "==", user.uid),
      where("status", "==", "pendente")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    }, (err) => console.error("Erro ao carregar contagem:", err));

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      {/* LINHA SUPERIOR */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo + Botão Criar (+) */}
        <div className="flex items-center gap-3">
          <h1 
            onClick={() => navigate("/home")} 
            className="text-2xl font-bold text-blue-600 tracking-tight cursor-pointer"
          >
            conectamoz
          </h1>

          {/* Botão de Adicionar (+) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCreateMenu(!showCreateMenu);
                setShowSidebarMenu(false);
                setShowNotifMenu(false);
              }}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
              title="Criar"
            >
              <FaPlus size={16} />
            </button>

            {/* Menu Suspenso de Criação */}
            {showCreateMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <button onClick={() => setShowCreateMenu(false)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                  <FaEdit size={18} /> Publicação
                </button>
                <button onClick={() => setShowCreateMenu(false)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                  <FaHistory size={18} /> História
                </button>
                <button onClick={() => setShowCreateMenu(false)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                  <FaVideo size={18} /> Reel
                </button>
                <button onClick={() => setShowCreateMenu(false)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                  <FaVideo size={18} /> Direto
                </button>
                <button onClick={() => setShowCreateMenu(false)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                  <FaStickyNote size={18} /> Nota
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Pesquisa, Mensagens, Notificações, Menu 3 Traços */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/search")} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition">
            <FaSearch size={16} />
          </button>

          <button onClick={() => navigate("/chat")} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition">
            <FaComments size={16} />
          </button>

          {/* Botão de Notificações com Contador */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowCreateMenu(false);
                setShowSidebarMenu(false);
              }} 
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition relative"
              title="Notificações"
            >
              <FaBell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown com Ficheiro NotificacoesPedidos.jsx */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <NotificacoesPedidos />
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setShowSidebarMenu(!showSidebarMenu);
              setShowCreateMenu(false);
              setShowNotifMenu(false);
            }}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
          >
            {showSidebarMenu ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* LINHA INFERIOR: SEPARADORES */}
      <div className="flex justify-around items-center border-t border-gray-100 max-w-2xl mx-auto">
        <button onClick={() => navigate("/home")} className={`flex-1 py-2.5 flex justify-center items-center border-b-2 transition ${location.pathname === "/home" || location.pathname === "/" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <FaHome size={22} />
        </button>
        <button onClick={() => navigate("/home")} className="flex-1 py-2.5 flex justify-center items-center border-b-2 border-transparent text-gray-500 hover:text-gray-700">
          <FaTv size={20} />
        </button>
        <button onClick={() => navigate("/search")} className="flex-1 py-2.5 flex justify-center items-center border-b-2 border-transparent text-gray-500 hover:text-gray-700">
          <FaUsers size={22} />
        </button>
        <button onClick={() => navigate("/jobs")} className={`flex-1 py-2.5 flex justify-center items-center border-b-2 transition ${location.pathname === "/jobs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <FaBriefcase size={20} />
        </button>
        <button onClick={() => navigate("/profile")} className={`flex-1 py-2.5 flex justify-center items-center border-b-2 transition ${location.pathname === "/profile" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <FaUser size={20} />
        </button>
      </div>

      {/* MENU LATERAL (TRÊS TRAÇOS) */}
      {showSidebarMenu && (
        <div className="fixed inset-x-0 top-24 bottom-0 bg-gray-100 z-40 overflow-y-auto p-4 shadow-inner">
          <div className="max-w-md mx-auto space-y-3 pb-12">
            
            {/* Perfil */}
            <div 
              onClick={() => { navigate("/profile"); setShowSidebarMenu(false); }}
              className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {user?.displayName ? user.displayName.charAt(0) : "U"}
                </div>
                <span className="font-bold text-gray-800 text-sm">
                  {user?.displayName || "Utilizador Conectamoz"}
                </span>
              </div>
            </div>

            {/* Atalhos */}
            <div className="bg-white rounded-xl p-2 shadow-sm space-y-1">
              <p className="px-3 py-1 text-xs font-bold text-gray-500">Os teus atalhos</p>
              
              <button onClick={() => { navigate("/search"); setShowSidebarMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <FaUsers className="text-blue-500" size={18} /> Amigos
              </button>

              <button onClick={() => { navigate("/admin"); setShowSidebarMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <FaBriefcase className="text-blue-600" size={18} /> Painel Profissional
              </button>

              <button onClick={() => setShowSidebarMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <FaBookmark className="text-purple-500" size={18} /> Guardados
              </button>

              <button onClick={() => setShowSidebarMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <FaHistory className="text-blue-400" size={18} /> Memórias
              </button>
            </div>

            {/* SEÇÇÃO: AJUDA E APOIO TÉCNICO */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button 
                onClick={() => setOpenHelp(!openHelp)}
                className="w-full flex items-center justify-between p-3 font-bold text-gray-800 text-sm hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <FaQuestionCircle className="text-gray-600" size={18} />
                  <span>Ajuda e apoio técnico</span>
                </div>
                {openHelp ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </button>

              {openHelp && (
                <div className="border-t border-gray-100 bg-gray-50 px-2 py-1 space-y-1 text-xs">
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaRobot size={16} /> Assistente de apoio da Conectamoz AI
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaShieldAlt size={16} /> Centro de Proteção contra Fraudes
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaQuestionCircle size={16} /> Assistência
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaExclamationCircle size={16} /> Comunicar um problema
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaFileContract size={16} /> Termos e Políticas
                  </button>
                </div>
              )}
            </div>

            {/* SECÇÃO: DEFINIÇÕES E PRIVACIDADE */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button 
                onClick={() => setOpenSettings(!openSettings)}
                className="w-full flex items-center justify-between p-3 font-bold text-gray-800 text-sm hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <FaCog className="text-gray-600" size={18} />
                  <span>Definições e privacidade</span>
                </div>
                {openSettings ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </button>

              {openSettings && (
                <div className="border-t border-gray-100 bg-gray-50 px-2 py-1 space-y-1 text-xs">
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaCog size={16} /> Definições
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaLock size={16} /> Centro de Privacidade
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaClock size={16} /> Gestão de tempo
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaMobileAlt size={16} /> Pedidos de dispositivos
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaCreditCard size={16} /> Encomendas e pagamentos
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaMoon size={16} /> Modo escuro
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaGlobe size={16} /> Idioma
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 font-medium text-gray-700 hover:bg-white rounded-lg transition">
                    <FaThLarge size={16} /> Ícone da app
                  </button>
                </div>
              )}
            </div>

            {/* Terminar Sessão */}
            <div className="bg-white rounded-xl p-2 shadow-sm">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 font-bold text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
              >
                <FaSignOutAlt size={16} /> Terminar sessão
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}