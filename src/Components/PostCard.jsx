import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { FaHeart, FaRegHeart, FaRegComment, FaPaperPlane } from "react-icons/fa";

export default function PostCard({ id, author, content, likes = [], imagemUrl, autorFoto }) {
  const currentUser = auth.currentUser;
  const isLiked = currentUser ? likes.includes(currentUser.uid) : false;

  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Escutar comentários do post em tempo real
  useEffect(() => {
    if (!mostrarComentarios) return;

    const q = query(
      collection(db, "posts", id, "comentarios"),
      orderBy("criadoEm", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaComentarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComentarios(listaComentarios);
    });

    return () => unsubscribe();
  }, [id, mostrarComentarios]);

  // Função para Curtir / Descurtir
  const handleLike = async () => {
    if (!currentUser) return;
    const postRef = doc(db, "posts", id);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          curtidas: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          curtidas: arrayUnion(currentUser.uid),
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar curtida:", error);
    }
  };

  // Função para Adicionar Comentário
  const handleAdicionarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !currentUser || enviandoComentario) return;

    try {
      setEnviandoComentario(true);
      await addDoc(collection(db, "posts", id, "comentarios"), {
        texto: novoComentario.trim(),
        autorId: currentUser.uid,
        autorNome: currentUser.displayName || currentUser.email.split("@")[0],
        autorFoto: currentUser.photoURL || "",
        criadoEm: serverTimestamp(),
      });
      setNovoComentario("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  const authorInitial = author ? author[0].toUpperCase() : "U";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      {/* Cabeçalho do Post */}
      <div className="p-4 flex items-center gap-3">
        {autorFoto ? (
          <img
            src={autorFoto}
            alt={author}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {authorInitial}
          </div>
        )}
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{author}</h3>
          <span className="text-xs text-gray-400">Publicado recentemente</span>
        </div>
      </div>

      {/* Conteúdo de Texto */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
          {content}
        </p>
      </div>

      {/* Imagem em Anexo */}
      {imagemUrl && (
        <div className="w-full max-h-[450px] overflow-hidden bg-black flex items-center justify-center">
          <img
            src={imagemUrl}
            alt="Anexo do Post"
            className="w-full object-cover max-h-[450px]"
          />
        </div>
      )}

      {/* Contadores e Ações */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>{likes.length} gostos</span>
        <button 
          onClick={() => setMostrarComentarios(!mostrarComentarios)} 
          className="hover:underline"
        >
          {comentarios.length > 0 ? `${comentarios.length} comentários` : "Comentar"}
        </button>
      </div>

      {/* Botões de Reação */}
      <div className="px-2 py-1 border-t border-gray-100 flex items-center justify-around">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition ${
            isLiked ? "text-red-500" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
          <span>Gosto</span>
        </button>

        <button
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          <FaRegComment size={18} />
          <span>Comentar</span>
        </button>
      </div>

      {/* Secção de Comentários */}
      {mostrarComentarios && (
        <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
          {/* Lista de Comentários */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {comentarios.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                Sê o primeiro a comentar!
              </p>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} className="flex gap-2 items-start text-xs">
                  {c.autorFoto ? (
                    <img
                      src={c.autorFoto}
                      alt={c.autorNome}
                      className="w-6 h-6 rounded-full object-cover border mt-1"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-[10px] mt-1">
                      {c.autorNome ? c.autorNome[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="bg-white p-2 rounded-xl border border-gray-200 flex-1">
                    <span className="font-bold text-gray-800 block">
                      {c.autorNome}
                    </span>
                    <p className="text-gray-700 mt-0.5">{c.texto}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Campo para Escrever Comentário */}
          <form onSubmit={handleAdicionarComentario} className="flex items-center gap-2 pt-2 border-t">
            <input
              type="text"
              placeholder="Escreve um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              className="flex-1 bg-white border border-gray-300 text-xs rounded-full px-3 py-2 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!novoComentario.trim() || enviandoComentario}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-40 transition"
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}