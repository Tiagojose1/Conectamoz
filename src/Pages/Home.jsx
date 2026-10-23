import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BottomNavigation from "../components/BottomNavigation";
import StoriesRow from "../components/StoriesRow";
import PostCard from "../components/PostCard";
import { FaImage } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const userAvatar =
    currentUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      currentUser?.displayName || "User"
    )}&background=635BFF&color=fff`;

  return (
    <div className="min-h-screen bg-[#f7f7f8] pt-[144px] pb-20">
      {/* =========================
          NAVBAR
      ========================== */}
      <Navbar />

      <main className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4">
        <div className="space-y-4">

          {/* =========================
              CRIAR PUBLICAÇÃO
          ========================== */}
          <section className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">

              {/* Avatar */}
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="shrink-0"
                aria-label="Abrir perfil"
              >
                <img
                  src={userAvatar}
                  alt="Avatar do utilizador"
                  className="h-10 w-10 rounded-full border border-gray-100 object-cover"
                />
              </button>

              {/* Caixa */}
              <button
                type="button"
                onClick={() => navigate("/create-post")}
                className="flex min-h-[42px] flex-1 items-center justify-between rounded-full bg-gray-100 px-4 text-left transition hover:bg-gray-200 active:scale-[0.99]"
              >
                <span className="text-sm text-gray-500">
                  O que está a acontecer?
                </span>

                <FaImage
                  size={18}
                  className="shrink-0 text-[#635BFF]"
                />
              </button>
            </div>
          </section>

          {/* =========================
              STORIES
          ========================== */}
          <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm">
            <StoriesRow />
          </section>

          {/* =========================
              FEED
          ========================== */}
          <section className="space-y-4">

            {/* Exemplo de publicação
                O PostCard poderá receber os dados
                vindos do Firestore posteriormente.
            */}

            {/* 
            <PostCard
              post={post}
            />
            */}

            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-600">
                Ainda não há publicações para mostrar.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                As publicações dos teus amigos aparecerão aqui.
              </p>

              <button
                type="button"
                onClick={() => navigate("/create-post")}
                className="mt-4 rounded-full bg-[#635BFF] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5148e5] active:scale-95"
              >
                Criar publicação
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* =========================
          NAVEGAÇÃO INFERIOR
      ========================== */}
      <BottomNavigation />
    </div>
  );
}