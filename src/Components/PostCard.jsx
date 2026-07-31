import React, { useState, useEffect } from "react";
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
import { db, auth } from "../firebase";
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaPaperPlane } from "react-icons/fa";

export default function PostCard({ id, author, content, likes = [] }) {
  const currentUser = auth.currentUser;
  const [jaCurtiu, setJaCurtiu] = useState(false);
  const [qtdCurtidas, setQtdCurtidas] = useState(likes.length);

  // Estados dos Comentários
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setJaCurtiu(likes.includes(currentUser.uid));
    }
    setQtdCurtidas(likes.length);
  }, [likes, currentUser]);

  // Carregar comentários do post em tempo real
  useEffect(() => {
    if (!id || !mostrarComentarios) return;

    const comentariosRef = collection(db, "posts", id, "comentarios");
    const q = query(comentariosRef, orderBy("criadoEm", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaComentarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setComentarios(listaComentarios);
    });

    return () => unsubscribe();
  }, [id, mostrarComentarios]);

  // Alternar Curtida (Like)
  const handleToggleLike = async () => {
    if (!currentUser || !id) return;
    const postRef = doc(db, "posts", id);

    try {
      if (jaCurtiu) {
        setJaCurtiu(false);
        setQtdCurtidas((prev) => prev - 1);
        await updateDoc(postRef, {
          curtidas: arrayRemove(currentUser.uid)
        });
      } else {
        setJaCurtiu(true);
        setQtdCurtidas((prev) => prev + 1);
        await updateDoc(postRef, {
          curtidas: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar curtida:", error);
    }
  };

  // Enviar Novo Comentário
  const handleAdicionarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !currentUser || !id) return;

    try {
      setEnviandoComentario(true);
      const comentariosRef = collection(db, "posts", id, "comentarios");

      await addDoc(comentariosRef, {
        texto: novoComentario.trim(),
        autorId: currentUser.uid,
        autorNome: currentUser.displayName || currentUser.email.split("@")[0],
        criadoEm: serverTimestamp()
      });

      setNovoComentario("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-4">
      {/* Cabeçalho do Post */}
      <div className="flex items-center space-x-3 p-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
          {author ? author.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{author}</h3>
          <p className="text-xs text-gray-400">Publicado recentemente</p>
        </div>
      </div>

      {/* Conteúdo do Post */}
      <div className="px-3 py-2 text-gray-800 text-sm leading-relaxed">
        <p>{content}</p>
      </div>

      {/* Contadores de Interação */}
      <div className="flex justify-between items-center px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
        <span className="flex items-center gap-1">
          <span className="bg-blue-600 text-white p-1 rounded-full text-[9px]">
            <FaThumbsUp />
          </span>
          {qtdCurtidas} {qtdCurtidas === 1 ? "gosto" : "gostos"}
        </span>
        <button 
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className="hover:underline"
        >
          {comentarios.length} {comentarios.length === 1 ? "comentário" : "comentários"}
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-around p-1 text-gray-600 font-semibold text-xs">
        <button 
          onClick={handleToggleLike}
          className={`flex items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg flex-1 transition ${
            jaCurtiu ? "text-blue-600" : ""
          }`}
        >
          {jaCurtiu ? <FaThumbsUp size={16} /> : <FaRegThumbsUp size={16} />}
          <span>Gosto</span>
        </button>

        <button 
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className="flex items-center justify-center gap-2 hover:bg-gray-100 py-2 rounded-lg flex-1 transition"
        >
          <FaComment size={16} />
          <span>Comentar</span>
        </button>
      </div>

      {/* Secção de Comentários */}
      {mostrarComentarios && (
        <div className="p-3 border-t bg-gray-50 rounded-b-xl space-y-3">
          {/* Lista de Comentários */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {comentarios.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} className="bg-white p-2.5 rounded-xl border border-gray-200 text-xs shadow-sm">
                  <span className="font-bold text-gray-900 block mb-0.5">
                    {c.autorNome}
                  </span>
                  <p className="text-gray-700">{c.texto}</p>
                </div>
              ))
            )}
          </div>

          {/* Form para Comentar */}
          <form onSubmit={handleAdicionarComentario} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Escreva um comentário..."
              className="flex-1 px-3 py-2 text-xs border rounded-full bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button
              type="submit"
              disabled={enviandoComentario || !novoComentario.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}