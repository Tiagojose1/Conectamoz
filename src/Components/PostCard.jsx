import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaPaperPlane } from "react-icons/fa";

export default function PostCard({
  id,
  autorId,
  author,
  content,
  likes = [],
  imagemUrl,
  videoUrl,
  autorFoto
}) {
  const user = auth.currentUser;
  const isLiked = user ? likes.includes(user.uid) : false;

  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [aCarregarComentario, setACarregarComentario] = useState(false);

  // Função para dar/tirar Gosto e Enviar Notificação
  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, "posts", id);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          curtidas: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          curtidas: arrayUnion(user.uid)
        });

        // Criar Notificação se não for o próprio autor do post
        if (autorId && autorId !== user.uid) {
          await addDoc(collection(db, "notificacoes"), {
            destinatarioId: autorId,
            remetenteNome: user.displayName || user.email?.split("@")[0] || "Alguém",
            remetenteFoto: user.photoURL || "",
            tipo: "like",
            postId: id,
            lida: false,
            criadoEm: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar curtida:", error);
    }
  };

  // Função para Adicionar Comentário
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !user) return;

    setACarregarComentario(true);
    try {
      const comentarioObj = {
        texto: novoComentario,
        autorNome: user.displayName || user.email?.split("@")[0] || "Utilizador",
        autorFoto: user.photoURL || "",
        criadoEm: new Date().toISOString()
      };

      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        comentarios: arrayUnion(comentarioObj)
      });

      setComentarios([...comentarios, comentarioObj]);
      setNovoComentario("");

      // Enviar Notificação de Comentário
      if (autorId && autorId !== user.uid) {
        await addDoc(collection(db, "notificacoes"), {
          destinatarioId: autorId,
          remetenteNome: user.displayName || user.email?.split("@")[0] || "Alguém",
          remetenteFoto: user.photoURL || "",
          tipo: "comment",
          postId: id,
          lida: false,
          criadoEm: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setACarregarComentario(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      {/* Cabeçalho do Post */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-50">
        {autorFoto ? (
          <img src={autorFoto} alt={author} className="w-10 h-10 rounded-full object-cover border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
            {author ? author[0].toUpperCase() : "U"}
          </div>
        )}
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">{author}</h4>
          <span className="text-[10px] text-gray-400">Publicado no ConectMoz</span>
        </div>
      </div>

      {/* Conteúdo de Texto */}
      {content && (
        <p className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {content}
        </p>
      )}

      {/* Imagem em Anexo */}
      {imagemUrl && (
        <div className="w-full bg-black/5 max-h-96 flex justify-center items-center overflow-hidden">
          <img src={imagemUrl} alt="Publicação" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Vídeo / Reels em Anexo */}
      {videoUrl && (
        <div className="w-full bg-black max-h-96 flex justify-center items-center">
          <video src={videoUrl} controls className="w-full max-h-96" />
        </div>
      )}

      {/* Contador de Reações */}
      <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
        <span>{likes.length} gostos</span>
        <button onClick={() => setMostrarComentarios(!mostrarComentarios)} className="hover:underline">
          {comentarios.length} comentários
        </button>
      </div>

      {/* Botoes de Ação */}
      <div className="flex border-t border-b border-gray-100 text-gray-600 font-medium text-xs">
        <button
          onClick={handleLike}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition ${
            isLiked ? "text-blue-600 font-bold" : ""
          }`}
        >
          {isLiked ? <FaThumbsUp size={16} /> : <FaRegThumbsUp size={16} />}
          <span>Gosto</span>
        </button>

        <button
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <FaComment size={16} />
          <span>Comentar</span>
        </button>
      </div>

      {/* Caixa de Comentários */}
      {mostrarComentarios && (
        <div className="p-4 bg-gray-50 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Escreve um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-full px-3 py-1.5 text-xs outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={aCarregarComentario || !novoComentario.trim()}
              className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50"
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}