import React, { useEffect, useState } from "react";
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
  FaStickyNote,
} from "react-icons/fa";

import { auth, db } from "../firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  // ============================================================
  // UTILIZADOR AUTENTICADO
  // ============================================================

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // ============================================================
  // PEDIDOS DE AMIZADE PENDENTES
  // ============================================================

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const requestsRef = collection(db, "friend_requests");

    const requestsQuery = query(
      requestsRef,
      where("destinatarioId", "==", user.uid),
      where("status", "==", "pendente")
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (error) => {
        console.error(
          "Erro ao carregar pedidos de amizade:",
          error
        );

        setUnreadCount(0);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ============================================================
  // FECHAR MENU AO MUDAR DE PÁGINA
  // ============================================================

  useEffect(() => {
    setShowCreateMenu(false);
  }, [location.pathname]);

  return (
    <>
      {/* ======================================================
          NAVBAR SUPERIOR
      ====================================================== */}

      <header className="fixed top-0 inset-x-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-40 shadow-sm">

        {/* LOGÓTIPO + CRIAR */}

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/home")}
            className="text-2xl font-extrabold tracking-tight cursor-pointer"
            aria-label="KonnexVib"
          >
            <span className="text-gray-900">
              Konnex
            </span>

            <span className="text-[#635BFF]">
              Vib
            </span>
          </button>

          {/* MENU CRIAR */}

          <div className="relative">

            <button
              onClick={() =>
                setShowCreateMenu((prev) => !prev)
              }
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 transition"
              title="Criar conteúdo"
              aria-label="Criar conteúdo"
            >
              <FaPlus size={14} />
            </button>

            {showCreateMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">

                {/* PUBLICAÇÃO */}

                <button
                  onClick={() => {
                    navigate("/create-post");
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaEdit size={16} />
                  Publicação
                </button>

                {/* STORY */}

                <button
                  onClick={() => {
                    navigate("/create-story");
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaHistory size={16} />
                  História
                </button>

                {/* REEL */}

                <button
                  onClick={() => {
                    navigate("/create-reel");
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaVideo size={16} />
                  Reel
                </button>

                {/* NOTA */}

                <button
                  onClick={() => {
                    navigate("/create-note");
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#635BFF] transition"
                >
                  <FaStickyNote size={16} />
                  Nota
                </button>

              </div>
            )}

          </div>
        </div>

        {/* ====================================================
            LADO DIREITO
        ==================================================== */}

        <div className="flex items-center gap-2">

          {/* PESQUISA */}

          <button
            onClick={() => navigate("/search")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition"
            aria-label="Pesquisar"
          >
            <FaSearch size={18} />
          </button>

          {/* MENSAGENS */}

          <button
            onClick={() => navigate("/chat")}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition"
            aria-label="Mensagens"
          >
            <FaRegComment size={20} />
          </button>

          {/* NOTIFICAÇÕES */}

          <button
            onClick={() => navigate("/notifications")}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition"
            aria-label="Notificações"
          >
            <FaRegBell size={20} />

            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

        </div>

      </header>

      {/* ======================================================
          NAVEGAÇÃO INFERIOR
      ====================================================== */}

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between z-50">

        {/* INÍCIO */}

        <button
          onClick={() => navigate("/home")}
          className={`flex flex-col items-center transition ${
            location.pathname === "/home" ||
            location.pathname === "/"
              ? "text-[#635BFF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <FaHome size={22} />

          <span className="text-[10px] font-bold mt-0.5">
            Início
          </span>
        </button>

        {/* DESCOBRIR */}

        <button
          onClick={() => navigate("/search")}
          className={`flex flex-col items-center transition ${
            location.pathname === "/search"
              ? "text-[#635BFF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <FaCompass size={22} />

          <span className="text-[10px] font-medium mt-0.5">
            Descobrir
          </span>
        </button>

        {/* CRIAR */}

        <button
          onClick={() => navigate("/create-post")}
          className="w-12 h-12 rounded-full bg-[#3B28CC] text-white flex items-center justify-center shadow-lg hover:scale-105 transition -mt-5 border-4 border-white"
          aria-label="Criar publicação"
        >
          <FaPlus size={18} />
        </button>

        {/* MENSAGENS */}

        <button
          onClick={() => navigate("/chat")}
          className={`relative flex flex-col items-center transition ${
            location.pathname === "/chat"
              ? "text-[#635BFF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <FaRegComment size={22} />

          <span className="text-[10px] font-medium mt-0.5">
            Mensagens
          </span>
        </button>

        {/* PERFIL */}

        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center transition ${
            location.pathname.startsWith("/profile")
              ? "text-[#635BFF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <FaRegUser size={22} />

          <span className="text-[10px] font-medium mt-0.5">
            Perfil
          </span>
        </button>

      </nav>
    </>
  );
}