import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import CreatePost from "../Components/CreatePost";
import PostCard from "../Components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta as publicações em tempo real ordenadas pela data de criação
    const q = query(collection(db, "posts"), orderBy("criadoEm", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(list);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar o feed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
        A carregar publicações...
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto w-full">
      {/* Caixa para criar novas publicações */}
      <CreatePost />

      {/* Lista de publicações */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border text-gray-500 shadow-sm">
          <p className="font-semibold text-gray-700">Nenhuma publicação ainda.</p>
          <p className="text-xs text-gray-400 mt-1">
            Seja o primeiro a publicar algo no ConectMoz!
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            author={post.autorNome || "Utilizador"}
            content={post.conteudo}
            likes={post.curtidas || []}
          />
        ))
      )}
    </div>
  );
}