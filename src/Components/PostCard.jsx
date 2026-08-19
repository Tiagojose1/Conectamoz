import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import {
  FaThumbsUp,
  FaRegThumbsUp,
  FaComment,
  FaPaperPlane,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaShareAlt
} from "react-icons/fa";

export default function PostCard({
  id,
  autorId,
  author,
  content,
  likes = [],
  comentarios = [],
  imagemUrl,
  videoUrl,
  autorFoto
}) {
  const user = auth.currentUser;
  const isLiked = user ? likes.includes(user.uid) : false;
  const isMyPost = user && user.uid === autorId;

  // Estados do Post e Comentários
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [listaComentarios, setListaComentarios] = useState(comentarios);
  const [novoComentario, setNovoComentario] = useState("");
  const [aCarregarComentario, setACarregarComentario] = useState(false);

  // Estados do Menu e Edição/Eliminação
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [textoEditado, setTextoEditado] = useState(content || "");
  const [carregandoAcao, setCarregandoAcao] = useState(false);

  // Estado de aviso ao copiar link
  const [copiado, setCopiado] = useState(false);

  const menuRef = useRef(null);

  // Fechar o menu dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Copiar link do post
  const handlePartilhar = async () => {
    const linkPost = `${window.location.origin}/post/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Publicação de ${author} no ConectMoz`,
          text: content ? content.substring(0, 100) : "Vê esta publicação no ConectMoz!",
          url: linkPost,
        });
      } else {
        await navigator.clipboard.writeText(linkPost);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
    } catch (error) {
      console.error("Erro ao partilhar:", error);
    }
  };

  // Guardar edição do post
  const handleGuardarEdicao = async () => {
    if (!textoEditado.trim()) return;

    try {
      setCarregandoAcao(true);
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        content: textoEditado,
        atualizadoEm: serverTimestamp()
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar publicação:", error);
      alert("Erro ao atualizar a publicação.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  // Eliminar post
  const handleEliminarPost = async () => {
    setShowMenu(false);
    if (!window.confirm("Tens a certeza que queres eliminar este post?")) return;

    try {
      setCarregandoAcao(true);
      await deleteDoc(doc(db, "posts", id));
    } catch (error) {
      console.error("Erro ao eliminar publicação:", error);
      alert("Erro ao eliminar a publicação.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  // Denunciar post
  const handleDenunciarPost = async () => {
    setShowMenu(false);

    const motivo = window.prompt("Descreve o motivo da denúncia (ex: spam, conteúdo impróprio):");
    if (!motivo || !motivo.trim()) return;

    try {
      setCarregandoAcao(true);
      await addDoc(collection(db, "denuncias"), {
        postId: id,
        autorPostId: autorId || "",
        denuncianteId: user ? user.uid : "anonimo",
        denuncianteNome: user ? (user.displayName || user.email?.split("@")[0]) : "Anónimo",
        motivo: motivo.trim(),
        status: "pendente",
        criadoEm: serverTimestamp()
      });

      alert("Denúncia enviada para análise. Obrigado!");
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      alert("Erro ao enviar a denúncia.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  // Função para dar/tirar Gosto
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

  // Adicionar Comentário (com userId incluído)
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !user) return;

    setACarregarComentario(true);
    try {
      const comentarioObj = {
        userId: user.uid,
        texto: novoComentario,
        autorNome: user.displayName || user.email?.split("@")[0] || "Utilizador",
        autorFoto: user.photoURL || "",
        criadoEm: new Date().toISOString()
      };

      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        comentarios: arrayUnion(comentarioObj)
      });

      setListaComentarios([...listaComentarios, comentarioObj]);
      setNovoComentario("");

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

  // Eliminar Comentário Individual
  const handleEliminarComentario = async (comentarioParaRemover) => {
    if (!window.confirm("Queres mesmo apagar este comentário?")) return;

    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        comentarios: arrayRemove(comentarioParaRemover)
      });

      // Atualiza o estado local filtrando o comentário removido
      setListaComentarios(listaComentarios.filter(c => c !== comentarioParaRemover));
    } catch (error) {
      console.error("Erro ao apagar comentário:", error);
      alert("Erro ao apagar o comentário.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden relative">
      {/* Alerta de Link Copiado */}
      {copiado && (
        <div className="absolute top-2 right-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md z-20 animate-fade-in">
          Link copiado!
        </div>
      )}

      {/* Cabeçalho do Post */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
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

        {/* Menu de Três Pontos */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={carregandoAcao}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              title="Opções"
            >
              <FaEllipsisV size={14} />
            </button>

            {/* Dropdown Options */}
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10">
                {isMyPost ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FaEdit className="text-blue-500" size={13} />
                      Editar
                    </button>
                    <button
                      onClick={handleEliminarPost}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FaTrash size={13} />
                      Eliminar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleDenunciarPost}
                    className="w-full text-left px-3.5 py-2 text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <FaExclamationTriangle size={13} />
                    Denunciar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo do Post / Edição */}
      {isEditing ? (
        <div className="p-4 space-y-2 bg-gray-50 border-b">
          <textarea
            value={textoEditado}
            onChange={(e) => setTextoEditado(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              disabled={carregandoAcao}
              className="px-3 py-1.5 text-xs text-gray-600 border rounded-lg hover:bg-gray-200 flex items-center gap-1"
            >
              <FaTimes /> Cancelar
            </button>
            <button
              onClick={handleGuardarEdicao}
              disabled={carregandoAcao || !textoEditado.trim()}
              className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1 font-semibold"
            >
              <FaCheck /> Guardar
            </button>
          </div>
        </div>
      ) : (
        content && (
          <p className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {content}
          </p>
        )
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
          {listaComentarios.length} comentários
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="flex border-t border-b border-gray-100 text-gray-600 font-medium text-xs">
        <button
          onClick={handleLike}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition ${
            isLiked ? "text-blue-600 font-bold" : ""
          }`}
        >
          {isLiked ? <FaThumbsUp size={15} /> : <FaRegThumbsUp size={15} />}
          <span>Gosto</span>
        </button>

        <button
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition border-l border-r border-gray-100"
        >
          <FaComment size={15} />
          <span>Comentar</span>
        </button>

        <button
          onClick={handlePartilhar}
          className="flex-1 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition text-gray-600 hover:text-blue-600"
        >
          <FaShareAlt size={15} />
          <span>Partilhar</span>
        </button>
      </div>

      {/* Caixa de Comentários */}
      {mostrarComentarios && (
        <div className="p-4 bg-gray-50 space-y-3">
          {/* Lista de Comentários */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {listaComentarios.map((c, index) => {
              const eMeuComentario = user && (c.userId === user.uid || isMyPost);

              return (
                <div key={index} className="flex items-start gap-2 text-xs group">
                  <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {c.autorNome ? c.autorNome[0].toUpperCase() : "U"}
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border flex-1 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{c.autorNome}</span>
                      
                      {/* Botão para apagar comentário (autor do comentário ou autor do post) */}
                      {eMeuComentario && (
                        <button
                          onClick={() => handleEliminarComentario(c)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition opacity-0 group-hover:opacity-100"
                          title="Apagar comentário"
                        >
                          <FaTrash size={11} />
                        </button>
                      )}
                    </div>
                    <span className="text-gray-600 block mt-0.5">{c.texto}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form para novo comentário */}
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