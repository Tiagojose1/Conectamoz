import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import PostCard from "../Components/PostCard"; // Alterado 'components' para 'Components'
import { FaArrowLeft } from "react-icons/fa";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const obterPost = async () => {
      try {
        setCarregando(true);
        const postRef = doc(db, "posts", id);
        const docSnap = await getDoc(postRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setErro(true);
        }
      } catch (err) {
        console.error("Erro ao carregar a publicação:", err);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    };

    obterPost();
  }, [id]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (erro || !post) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800">Publicação não encontrada</h3>
        <p className="text-sm text-gray-500 mt-1">Este post pode ter sido removido pelo autor.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Voltar ao Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium py-1"
      >
        <FaArrowLeft size={14} /> Voltar
      </button>

      <PostCard
        id={post.id}
        autorId={post.autorId}
        author={post.author || post.autorNome}
        content={post.content || post.conteudo}
        likes={post.curtidas || post.likes || []}
        comentarios={post.comentarios || []}
        imagemUrl={post.imagemUrl}
        videoUrl={post.videoUrl}
        autorFoto={post.autorFoto}
      />
    </div>
  );
}