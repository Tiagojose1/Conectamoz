import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaBroadcastTower,
  FaVideo,
  FaUsers,
  FaPlay,
  FaEye,
  FaComment,
  FaShare,
  FaCrown,
  FaNewspaper,
  FaMicrophone,
  FaCalendarAlt,
  FaHistory,
  FaList,
} from "react-icons/fa";

import { db } from "../firebase";

export default function Live() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    {
      name: "Todos",
      icon: FaBroadcastTower,
    },
    {
      name: "Notícias",
      icon: FaNewspaper,
    },
    {
      name: "Programas",
      icon: FaMicrophone,
    },
    {
      name: "Reuniões",
      icon: FaUsers,
    },
    {
      name: "Eventos",
      icon: FaCalendarAlt,
    },
  ];

  // =========================================================
  // CARREGAR TRANSMISSÕES REAIS DO FIRESTORE
  // =========================================================

  useEffect(() => {
    const livesQuery = query(
      collection(db, "lives"),
      where("status", "==", "live")
    );

    const unsubscribe = onSnapshot(
      livesQuery,
      (snapshot) => {
        const lives = snapshot.docs.map((liveDoc) => ({
          id: liveDoc.id,
          ...liveDoc.data(),
        }));

        // Ordenação local pela data de criação.
        lives.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

        setLiveStreams(lives);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "Erro ao carregar transmissões:",
          snapshotError
        );

        setError(
          "Não foi possível carregar as transmissões."
        );

        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // =========================================================
  // FILTRAR POR CATEGORIA
  // =========================================================

  const filteredStreams = useMemo(() => {
    if (activeCategory === "Todos") {
      return liveStreams;
    }

    return liveStreams.filter(
      (stream) =>
        stream.category === activeCategory
    );
  }, [activeCategory, liveStreams]);

  // =========================================================
  // PARTILHAR LIVE
  // =========================================================

  const handleShare = async (stream) => {
    const url = `${window.location.origin}/live/watch/${stream.id}`;

    const shareData = {
      title: stream.title || "KonnexVib Live",
      text: stream.description || "",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        alert("Link da transmissão copiado.");
      }
    } catch (shareError) {
      console.error(
        "Erro ao partilhar transmissão:",
        shareError
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635BFF] text-white shadow-lg">
            <FaBroadcastTower size={22} />
          </div>

          <p className="mt-4 text-sm font-black text-gray-900">
            A carregar transmissões...
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Aguarde um momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-20">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-3 sm:px-4">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
            aria-label="Voltar"
            title="Voltar"
          >
            <FaArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF] text-white">
              <FaBroadcastTower size={18} />

              {liveStreams.length > 0 && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>

            <div>
              <h1 className="text-base font-black text-gray-900 sm:text-lg">
                Lives
              </h1>

              <p className="hidden text-[10px] text-gray-500 sm:block">
                Transmissões ao vivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/live/create")}
            className="flex h-10 items-center gap-2 rounded-full bg-[#635BFF] px-3 text-xs font-bold text-white transition hover:bg-[#5148e5] active:scale-95"
          >
            <FaBroadcastTower size={14} />

            <span className="hidden sm:block">
              Iniciar Live
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-5xl px-3 pt-[88px] sm:px-4">
        {/* ===================================================
            AVISO DE ERRO
        =================================================== */}

        {error && (
          <section className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold text-red-600">
              {error}
            </p>
          </section>
        )}

        {/* ===================================================
            CRIAR LIVE
        =================================================== */}

        <section className="rounded-2xl border border-[#635BFF]/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
                <FaBroadcastTower size={20} />
              </div>

              <div>
                <h2 className="text-sm font-black text-gray-900 sm:text-base">
                  Queres entrar ao vivo?
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Cria uma transmissão ao vivo no KonnexVib.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/live/create")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-5 py-3 text-xs font-black text-white transition hover:bg-[#5148e5] active:scale-95"
            >
              <FaBroadcastTower size={14} />
              Iniciar Live
            </button>
          </div>
        </section>

        {/* ===================================================
            CATEGORIAS
        =================================================== */}

        <section className="mt-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;

              const active =
                activeCategory === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category.name)
                  }
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#635BFF] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={13} />

                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            AO VIVO AGORA
        =================================================== */}

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">
                🔴 Ao vivo agora
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Transmissões acontecendo neste momento.
              </p>
            </div>

            {filteredStreams.length > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                {filteredStreams.length}
              </span>
            )}
          </div>

          {/* =================================================
              NENHUMA LIVE
          ================================================= */}

          {filteredStreams.length === 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <FaBroadcastTower size={22} />
              </div>

              <h3 className="mt-4 text-sm font-black text-gray-900">
                Nenhuma transmissão ao vivo
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500">
                Quando uma transmissão estiver ao vivo,
                ela aparecerá automaticamente nesta página.
              </p>

              <button
                type="button"
                onClick={() => navigate("/live/create")}
                className="mt-5 rounded-xl bg-[#635BFF] px-5 py-3 text-xs font-black text-white transition hover:bg-[#5148e5]"
              >
                Iniciar uma Live
              </button>
            </section>
          )}

          {/* =================================================
              LIVES REAIS
          ================================================= */}

          {filteredStreams.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStreams.map((stream) => (
                <article
                  key={stream.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* PLAYER / CAPA */}

                  <div className="relative aspect-video overflow-hidden bg-gray-950">
                    {stream.thumbnail ? (
                      <img
                        src={stream.thumbnail}
                        alt={stream.title || "Transmissão ao vivo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-950">
                        <FaBroadcastTower
                          size={38}
                          className="text-white/20"
                        />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      AO VIVO
                    </div>

                    {stream.audience === "VIP" && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#635BFF] px-2.5 py-1 text-[10px] font-black text-white">
                        <FaCrown size={9} />
                        VIP
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/live/watch/${stream.id}`
                        )
                      }
                      className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#635BFF] shadow-lg transition hover:scale-110 active:scale-95"
                      aria-label="Assistir transmissão"
                      title="Assistir"
                    >
                      <FaPlay
                        size={16}
                        className="ml-0.5"
                      />
                    </button>
                  </div>

                  {/* INFORMAÇÕES */}

                  <div className="p-3">
                    {stream.category && (
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#635BFF]">
                        {stream.category}
                      </p>
                    )}

                    <h3 className="mt-1 line-clamp-2 text-sm font-black text-gray-900">
                      {stream.title}
                    </h3>

                    {stream.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {stream.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/live/watch/${stream.id}`
                          )
                        }
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-600 transition hover:bg-gray-200"
                      >
                        <FaPlay size={9} />
                        Assistir
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleShare(stream)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                        aria-label="Partilhar"
                        title="Partilhar"
                      >
                        <FaShare size={11} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================
            SALA VIP
        =================================================== */}

        <section className="mt-7 overflow-hidden rounded-2xl bg-[#635BFF] p-5 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <FaCrown size={20} />
              </div>

              <div>
                <h2 className="text-base font-black">
                  Sala VIP
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-white/75">
                  Acesso a conteúdos e transmissões
                  disponíveis para membros VIP.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/sala-vip")}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#635BFF] transition hover:bg-gray-100 active:scale-95"
            >
              <FaCrown size={13} />
              Ver Sala VIP
            </button>
          </div>
        </section>

        {/* ===================================================
            HISTÓRICO
        =================================================== */}

        <section className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/live")}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
              <FaList size={17} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-black text-gray-900">
                Transmissões
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Veja as transmissões que estão disponíveis agora.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/live")}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <FaHistory size={17} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-black text-gray-900">
                Histórico
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                O histórico será disponibilizado quando houver gravações.
              </p>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}