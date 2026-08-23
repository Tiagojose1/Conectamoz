import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Componentes da Interface
import BottomNavigation from "../Components/BottomNavigation";
import CreatePostModal from "../Components/CreatePostModal"; // Importado o Modal correto
import StoriesBar from "../Components/StoriesBar";
import ReelsFeed from "../Components/ReelsFeed";
import PostCard from "../Components/PostCard";
import SugestoesAmigos from "../Components/SugestoesAmigos";

export default function Home() {
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o Modal

  const user = auth.currentUser;

  useEffect(() => {
    // Busca publicações do feed em tempo real
    const q = query(collection(db, "posts"), orderBy("criadoEm", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsList);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar o feed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const userInitial = user?.displayName
    ? user.displayName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Barra de Seleção de Aba Superior */}
      <div className="bg-white border-b sticky top-0 z-20 flex justify-center gap-8 py-3 font-semibold text-sm">
        <button
          onClick={() => setActiveTab("feed")}
          className={`pb-1 border-b-2 ${
            activeTab === "feed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Feed Principal
        </button>
        <button
          onClick={() => setActiveTab("reels")}
          className={`pb-1 border-b-2 ${
            activeTab === "reels"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Reels
        </button>
      </div>

      {activeTab === "feed" ? (
        <main className="max-w-xl mx-auto px-2 sm:px-4 mt-2">
          {/* 1. Botão/Caixa para abrir o Modal de Novo Post */}
          <div className="bg-white rounded-2xl shadow p-3 border mb-4">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Perfil"
                  className="w-10 h-10 rounded-full object-cover border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {userInitial}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-500 py-2.5 px-4 rounded-full text-sm font-medium transition"
              >
                Em que estás a pensar, {user?.displayName || "amigo"}?
              </button>
            </div>
          </div>

          {/* 2. Barra de Histórias */}
          <StoriesBar onOpenAddStory={() => alert("Abrir modal de novo Story")} />

          {/* 3. Sugestões de Novos Membros */}
          <SugestoesAmigos />

          {/* 4. Lista de Publicações do Feed */}
          {loading ? (
            <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
              A carregar publicações...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border text-gray-500 mt-4">
              <p className="font-semibold text-gray-700">Nenhuma publicação ainda.</p>
              <p className="text-xs text-gray-400 mt-1">
                Seja o primeiro a publicar algo no ConectMoz!
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  autorId={post.autorId || post.uid || post.userId}
                  author={post.autorNome || "Utilizador"}
                  content={post.conteudo || post.content}
                  likes={post.curtidas || post.likes || []}
                  comentarios={post.comentarios || []}
                  imagemUrl={post.imagemUrl}
                  videoUrl={post.videoUrl}
                  autorFoto={post.autorFoto}
                />
              ))}
            </div>
          )}

          {/* Modal de Criar Post */}
          <CreatePostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </main>
      ) : (
        /* Renderiza o Feed de Reels em ecrã/aba própria */
        <main className="pt-2">
          <ReelsFeed />
        </main>
      )}

      <BottomNavigation />
    </div>
  );
}