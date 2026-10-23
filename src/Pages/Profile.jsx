import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCog,
  FaCamera,
  FaImage,
  FaVideo,
  FaTh,
  FaUserFriends,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  /*
   * Se não existir ID na URL,
   * estamos a visualizar o próprio perfil.
   */
  const isOwnProfile = !id;

  const displayName =
    currentUser?.displayName || "Utilizador";

  const username =
    currentUser?.username ||
    displayName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_]/g, "");

  const userAvatar =
    currentUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=635BFF&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-20">

      {/* ==================================================
          TOPO
      ================================================== */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[64px] max-w-3xl items-center justify-between px-3 sm:px-4">

          {/* VOLTAR */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
            aria-label="Voltar"
            title="Voltar"
          >
            <FaArrowLeft size={18} />
          </button>

          {/* TÍTULO */}
          <h1 className="text-base font-bold text-gray-900">
            Perfil
          </h1>

          {/* DEFINIÇÕES */}
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
            aria-label="Definições"
            title="Definições"
          >
            <FaCog size={19} />
          </button>
        </div>
      </header>

      {/* ==================================================
          CONTEÚDO
      ================================================== */}
      <main className="mx-auto max-w-3xl px-3 pt-[80px] sm:px-4">

        {/* ==================================================
            CARTÃO PRINCIPAL DO PERFIL
        ================================================== */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

          {/* CAPA */}
          <div className="relative h-32 bg-gradient-to-r from-[#635BFF] via-[#7169ff] to-[#392FB8] sm:h-40">

            {/* Efeito decorativo */}
            <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          </div>

          {/* INFORMAÇÕES */}
          <div className="px-4 pb-5 sm:px-6">

            {/* FOTO */}
            <div className="-mt-14 flex items-end justify-between">

              <div className="relative">

                <img
                  src={userAvatar}
                  alt={`Foto de perfil de ${displayName}`}
                  className="h-28 w-28 rounded-full border-4 border-white bg-gray-100 object-cover shadow-md sm:h-32 sm:w-32"
                />

                {/* CÂMERA */}
                {isOwnProfile && (
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#635BFF] text-white shadow-md transition hover:bg-[#5148e5] active:scale-95"
                    aria-label="Alterar foto de perfil"
                    title="Alterar foto de perfil"
                  >
                    <FaCamera size={14} />
                  </button>
                )}
              </div>

              {/* BOTÃO */}
              <div className="mb-1">
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 active:scale-95"
                  >
                    Editar perfil
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-full bg-[#635BFF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5148e5] active:scale-95"
                  >
                    Seguir
                  </button>
                )}
              </div>
            </div>

            {/* NOME */}
            <div className="mt-4">
              <h2 className="text-xl font-black tracking-tight text-gray-900">
                {displayName}
              </h2>

              <p className="mt-0.5 text-sm text-gray-500">
                @{username || "utilizador"}
              </p>
            </div>

            {/* BIO */}
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-700">
              Bem-vindo ao meu perfil no KonnexVib. ✨
              <br />
              Conecta-te. Partilha. Vive a tua vibe.
            </p>

            {/* ==================================================
                ESTATÍSTICAS
            ================================================== */}
            <div className="mt-5 grid grid-cols-3 border-y border-gray-100 py-4">

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="text-center transition hover:opacity-70"
              >
                <strong className="block text-lg font-black text-gray-900">
                  0
                </strong>

                <span className="text-xs text-gray-500">
                  Publicações
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/followers")}
                className="border-x border-gray-100 text-center transition hover:opacity-70"
              >
                <strong className="block text-lg font-black text-gray-900">
                  0
                </strong>

                <span className="text-xs text-gray-500">
                  Seguidores
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/following")}
                className="text-center transition hover:opacity-70"
              >
                <strong className="block text-lg font-black text-gray-900">
                  0
                </strong>

                <span className="text-xs text-gray-500">
                  Seguindo
                </span>
              </button>

            </div>
          </div>
        </section>

        {/* ==================================================
            ABAS DO PERFIL
        ================================================== */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

          <div className="grid grid-cols-3 border-b border-gray-200">

            {/* PUBLICAÇÕES */}
            <button
              type="button"
              className="flex h-12 items-center justify-center gap-2 border-b-2 border-[#635BFF] text-[#635BFF]"
            >
              <FaTh size={15} />

              <span className="hidden text-xs font-bold sm:block">
                Publicações
              </span>
            </button>

            {/* FOTOS */}
            <button
              type="button"
              className="flex h-12 items-center justify-center gap-2 text-gray-500 transition hover:bg-gray-50 hover:text-[#635BFF]"
            >
              <FaImage size={16} />

              <span className="hidden text-xs font-bold sm:block">
                Fotos
              </span>
            </button>

            {/* VÍDEOS */}
            <button
              type="button"
              className="flex h-12 items-center justify-center gap-2 text-gray-500 transition hover:bg-gray-50 hover:text-[#635BFF]"
            >
              <FaVideo size={16} />

              <span className="hidden text-xs font-bold sm:block">
                Vídeos
              </span>
            </button>

          </div>

          {/* ==================================================
              ESTADO VAZIO
          ================================================== */}
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
              <FaTh size={24} />
            </div>

            <h3 className="mt-4 text-base font-bold text-gray-800">
              Ainda não há publicações
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              Quando este utilizador publicar alguma coisa,
              as publicações aparecerão aqui.
            </p>

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => navigate("/create-post")}
                className="mt-5 rounded-full bg-[#635BFF] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#5148e5] active:scale-95"
              >
                Criar publicação
              </button>
            )}

          </div>
        </section>

        {/* ==================================================
            AMIGOS
        ================================================== */}
        {isOwnProfile && (
          <section className="mt-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
                  <FaUserFriends size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Amigos
                  </h3>

                  <p className="text-xs text-gray-500">
                    0 amigos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/friends")}
                className="text-xs font-bold text-[#635BFF] hover:underline"
              >
                Ver todos
              </button>

            </div>
          </section>
        )}

      </main>
    </div>
  );
}