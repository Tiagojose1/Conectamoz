import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";

// Componentes da Interface
import BottomNavigation from "../Components/BottomNavigation";
import CreatePost from "../Components/CreatePost";
import Stories from "../Components/Stories";
import PostCard from "../Components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Utilizador obtido de forma reativa do AuthContext
  const { usuario } = useAuth();

  useEffect(() => {
    // Busca todas as publicações do Firestore em tempo real ordenadas pela data
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

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <main className="max-w-xl mx-auto px-2 sm:px-4 py-4 space-y-4">
        
        {/* 1. Caixa de Criar Novo Post */}
        <CreatePost user={usuario} />

        {/* 2. Carrossel de Histórias (Stories) */}
        <Stories />

        {/* 3. Lista de Publicações do Feed */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
            A carregar publicações...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            <p className="font-semibold text-gray-700">Nenhuma publicação ainda.</p>
            <p className="text-xs text-gray-400 mt-1">
              Seja o primeiro a publicar algo no ConectMoz!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                autorId={post.autorId || post.uid || post.userId}
                author={post.autorNome || "Utilizador"}
                autorFoto={post.autorFoto}
                content={post.conteudo}
                imagemUrl={post.imagemUrl}
                likes={post.curtidas || []}
                comentarios={post.comentarios || []}
                criadoEm={post.criadoEm}
              />
            ))}
          </div>
        )}
      </main>

      {/* Navegação Inferior para Telemóvel */}
      <BottomNavigation />
    </div>
  );
}