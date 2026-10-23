import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPlus,
  FaCommentDots,
  FaUserCircle,
  FaVideo,
  FaFilm,
  FaUserFriends,
  FaBell,
  FaHome,
  FaCompass,
  FaCrown,
  FaCog,
  FaBookmark,
  FaHeart,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ==================================================
          BARRA PRINCIPAL
      ================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3 sm:px-4">

          {/* =========================
              ESQUERDA
          ========================== */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* MENU */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
              aria-label="Abrir menu"
              title="Menu"
            >
              <FaBars size={21} />
            </button>

            {/* LOGO */}
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex items-center gap-2"
              aria-label="Ir para Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF] text-white shadow-sm">
                <span className="text-xl font-black">K</span>
              </div>

              <span className="hidden text-xl font-black tracking-tight text-gray-900 sm:block">
                Konnex<span className="text-[#635BFF]">Vib</span>
              </span>
            </button>
          </div>

          {/* =========================
              DIREITA
          ========================== */}
          <div className="flex items-center gap-1">

            {/* CRIAR */}
            <button
              type="button"
              onClick={() => navigate("/create-post")}
              className="flex h-10 items-center gap-2 rounded-full px-3 text-gray-700 transition hover:bg-gray-100 active:scale-95"
              aria-label="Criar publicação"
              title="Criar publicação"
            >
              <FaPlus
                className="text-[#635BFF]"
                size={18}
              />

              <span className="hidden text-sm font-semibold sm:block">
                Criar
              </span>
            </button>

            {/* MENSAGENS */}
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className={
                "flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 " +
                (isActive("/messages")
                  ? "bg-purple-50 text-[#635BFF]"
                  : "text-gray-700 hover:bg-gray-100")
              }
              aria-label="Mensagens"
              title="Mensagens"
            >
              <FaCommentDots size={19} />
            </button>

            {/* PERFIL */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className={
                "flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 " +
                (isActive("/profile")
                  ? "bg-purple-50 text-[#635BFF]"
                  : "text-gray-700 hover:bg-gray-100")
              }
              aria-label="Perfil"
              title="Perfil"
            >
              <FaUserCircle size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          SEGUNDA BARRA
          LIVE / REELS / AMIGOS / NOTIFICAÇÕES
      ================================================== */}
      <div className="fixed left-0 right-0 top-[68px] z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-2xl items-center justify-center gap-2 px-3 sm:gap-6">

          {/* ==================================================
              🎬 LIVE / TRANSMISSÕES
          ================================================== */}
          <button
            type="button"
            onClick={() => navigate("/live")}
            className={
              "relative flex h-14 w-16 items-center justify-center rounded-xl transition active:scale-95 " +
              (isActive("/live")
                ? "bg-purple-50 text-[#635BFF]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#635BFF]")
            }
            aria-label="Lives e transmissões"
            title="Lives e transmissões"
          >
            <div className="relative">
              <FaFilm size={22} />

              {/* Indicador de transmissão ao vivo */}
              <span className="absolute -right-2 -top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </div>
          </button>

          {/* ==================================================
              🎥 REELS
          ================================================== */}
          <button
            type="button"
            onClick={() => navigate("/videos")}
            className={
              "relative flex h-14 w-16 items-center justify-center rounded-xl transition active:scale-95 " +
              (isActive("/videos")
                ? "bg-purple-50 text-[#635BFF]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#635BFF]")
            }
            aria-label="Reels"
            title="Reels"
          >
            <FaVideo size={21} />
          </button>

          {/* ==================================================
              👥 AMIGOS
          ================================================== */}
          <button
            type="button"
            onClick={() => navigate("/friends")}
            className={
              "relative flex h-14 w-16 items-center justify-center rounded-xl transition active:scale-95 " +
              (isActive("/friends")
                ? "bg-purple-50 text-[#635BFF]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#635BFF]")
            }
            aria-label="Amigos"
            title="Amigos"
          >
            <div className="relative">
              <FaUserFriends size={21} />

              <span className="absolute -right-3 -top-3 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                2
              </span>
            </div>
          </button>

          {/* ==================================================
              🔔 NOTIFICAÇÕES
          ================================================== */}
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className={
              "relative flex h-14 w-16 items-center justify-center rounded-xl transition active:scale-95 " +
              (isActive("/notifications")
                ? "bg-purple-50 text-[#635BFF]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#635BFF]")
            }
            aria-label="Notificações"
            title="Notificações"
          >
            <div className="relative">
              <FaBell size={21} />

              <span className="absolute -right-3 -top-3 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                3
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ==================================================
          FUNDO DO MENU
      ================================================== */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]"
        />
      )}

      {/* ==================================================
          MENU LATERAL
      ================================================== */}
      <aside
        className={
          "fixed bottom-0 left-0 top-0 z-[70] w-[290px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 " +
          (menuOpen ? "translate-x-0" : "-translate-x-full")
        }
      >

        {/* CABEÇALHO DO MENU */}
        <div className="flex h-[68px] items-center justify-between border-b border-gray-200 px-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF] text-white">
              <span className="text-xl font-black">K</span>
            </div>

            <div>
              <p className="font-black text-gray-900">
                Konnex<span className="text-[#635BFF]">Vib</span>
              </p>

              <p className="text-[11px] text-gray-500">
                Menu principal
              </p>
            </div>
          </div>

          {/* FECHAR */}
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 active:scale-95"
            aria-label="Fechar menu"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* OPÇÕES */}
        <div className="h-[calc(100%-68px)] overflow-y-auto p-3">

          {/* INÍCIO */}
          <button
            type="button"
            onClick={() => goTo("/home")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/home")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaHome size={18} />
            <span>Início</span>
          </button>

          {/* DESCOBRIR */}
          <button
            type="button"
            onClick={() => goTo("/explore")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/explore")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaCompass size={18} />
            <span>Descobrir</span>
          </button>

          {/* VÍDEOS / REELS */}
          <button
            type="button"
            onClick={() => goTo("/videos")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/videos")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaVideo size={18} />
            <span>Reels</span>
          </button>

          {/* TRANSMISSÕES AO VIVO */}
          <button
            type="button"
            onClick={() => goTo("/live")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/live")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaFilm size={18} />

            <span>Lives e transmissões</span>
          </button>

          {/* AMIGOS */}
          <button
            type="button"
            onClick={() => goTo("/friends")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/friends")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaUserFriends size={18} />

            <span className="flex-1 text-left">
              Amigos
            </span>

            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {/* NOTIFICAÇÕES */}
          <button
            type="button"
            onClick={() => goTo("/notifications")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/notifications")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaBell size={18} />

            <span className="flex-1 text-left">
              Notificações
            </span>

            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {/* MENSAGENS */}
          <button
            type="button"
            onClick={() => goTo("/messages")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/messages")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaCommentDots size={18} />
            <span>Mensagens</span>
          </button>

          {/* SALA VIP */}
          <button
            type="button"
            onClick={() => goTo("/sala-vip")}
            className={
              "mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition " +
              (isActive("/sala-vip")
                ? "bg-[#635BFF]/10 text-[#635BFF]"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            <FaCrown size={18} />
            <span>Sala VIP</span>
          </button>

          <div className="my-3 border-t border-gray-100" />

          {/* GUARDADAS */}
          <button
            type="button"
            onClick={() => goTo("/saved-posts")}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <FaBookmark size={17} />
            <span>Publicações guardadas</span>
          </button>

          {/* GOSTADAS */}
          <button
            type="button"
            onClick={() => goTo("/liked-posts")}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <FaHeart size={17} />
            <span>Publicações gostadas</span>
          </button>

          {/* PERFIL */}
          <button
            type="button"
            onClick={() => goTo("/profile")}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <FaUserCircle size={18} />
            <span>Perfil</span>
          </button>

          {/* DEFINIÇÕES */}
          <button
            type="button"
            onClick={() => goTo("/settings")}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <FaCog size={18} />
            <span>Definições</span>
          </button>

          {/* AJUDA */}
          <button
            type="button"
            onClick={() => goTo("/help")}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <FaQuestionCircle size={18} />
            <span>Ajuda</span>
          </button>

          {/* SAIR */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              navigate("/login");
            }}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <FaSignOutAlt size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}