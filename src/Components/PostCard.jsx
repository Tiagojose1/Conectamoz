import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

import { criarNotificacao } from "../Utils/Notifications";

import {
  FaHeart,
  FaComment,
  FaPaperPlane,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaShareAlt,
  FaVolumeMute,
  FaVolumeUp
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
  const navigate = useNavigate();
  const user = auth.currentUser;
  const isMyPost = user && user.uid === autorId;

  // Estados do Post e Comentários
  const [curtidas, setCurtidas] = useState(likes);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [listaComentarios, setListaComentarios] = useState(comentarios);
  const [novoComentario, setNovoComentario] = useState("");
  const [aCarregarComentario, setACarregarComentario] = useState(false);

  // Novos Estados Visuais e de Interação (Fase 1 e 2)
  const [mostrarReacoes, setMostrarReacoes] = useState(false);
  const [coracaoAnimado, setCoracaoAnimado] = useState(false);
  const [semSom, setSemSom] = useState(true);

  // Lista de Reações Dinâmicas
  const listaReacoes = [
    { emoji: "❤️", nome: "Gosto" },
    { emoji: "😂", nome: "Riso" },
    { emoji: "😮", nome: "Uau" },
    { emoji: "😢", nome: "Triste" },
    { emoji: "😡", nome: "Zangado" },
    { emoji: "🔥", nome: "Fogo" },
  ];

  // Identificar a reação do utilizador atual
  const minhaReacaoObj = user
    ? curtidas.find((c) => (typeof c === "object" ? c.uid === user.uid : c === user.uid))
    : null;
  const minhaReacaoEmoji = minhaReacaoObj
    ? typeof minhaReacaoObj === "object"
      ? minhaReacaoObj.emoji
      : "❤️"
    : null;

  // Otimizador de Mídia Cloudinary para conexões mais lentas
  const otimizarUrl = (url, opts = "f_auto,q_auto") => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/${opts}/`);
  };

  useEffect(() => {
    setListaComentarios(comentarios);
  }, [comentarios]);

  useEffect(() => {
    setCurtidas(likes);
  }, [likes]);

  // Estados do Menu e Edição/Eliminação
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [textoEditado, setTextoEditado] = useState(content || "");
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIrParaPerfil = () => {
    if (autorId) navigate(`/perfil/${autorId}`);
  };

  const handlePartilhar = async () => {
    const linkPost = `${window.location.origin}/post/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Publicação de ${author} no Conectamoz`,
          text: content ? content.substring(0, 100) : "Vê esta publicação no Conectamoz!",
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

  const handleGuardarEdicao = async () => {
    if (!textoEditado.trim()) return;
    try {
      setCarregandoAcao(true);
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        content: textoEditado,
        conteudo: textoEditado,
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

  // Função Avançada de Reação (Gosto e Emojis)
  const handleReagir = async (emojiEscolhido = "❤️") => {
    if (!user) return alert("Precisas de iniciar sessão para interagir!");

    const postRef = doc(db, "posts", id);
    let novasCurtidas = [...curtidas];

    try {
      if (minhaReacaoEmoji) {
        // Remover Reação
        novasCurtidas = novasCurtidas.filter((c) =>
          typeof c === "object" ? c.uid !== user.uid : c !== user.uid
        );
        await updateDoc(postRef, {
          curtidas: novasCurtidas,
          likes: arrayRemove(user.uid)
        });
      } else {
        // Adicionar Reação
        const novoObjeto = { uid: user.uid, emoji: emojiEscolhido };
        novasCurtidas.push(novoObjeto);

        await updateDoc(postRef, {
          curtidas: arrayUnion(novoObjeto),
          likes: arrayUnion(user.uid)
        });

        if (autorId !== user.uid) {
          await criarNotificacao({
            destinatarioId: autorId,
            remetente: {
              uid: user.uid,
              nome: user.displayName || user.email?.split("@")[0] || "Utilizador",
              foto: user.photoURL || ""
            },
            tipo: "like",
            postId: id
          });
        }
      }

      setCurtidas(novasCurtidas);
      setMostrarReacoes(false);
    } catch (error) {
      console.error("Erro ao reagir ao post:", error);
    }
  };

  // Duplo Toque no Ecrã (Double-Tap)
  const handleDoubleTap = () => {
    setCoracaoAnimado(true);
    setTimeout(() => setCoracaoAnimado(false), 800);

    if (!minhaReacaoEmoji) {
      handleReagir("❤️");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !user) return;

    setACarregarComentario(true);
    const textoParaEnviar = novoComentario.trim();

    try {
      const comentarioObj = {
        userId: user.uid,
        texto: textoParaEnviar,
        autorNome: user.displayName || user.email?.split("@")[0] || "Utilizador",
        autorFoto: user.photoURL || "",
        criadoEm: new Date().toISOString()
      };

      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        comentarios: arrayUnion(comentarioObj)
      });

      setListaComentarios((prev) => [...prev, comentarioObj]);
      setNovoComentario("");

      if (autorId !== user.uid) {
        await criarNotificacao({
          destinatarioId: autorId,
          remetente: {
            uid: user.uid,
            nome: user.displayName || user.email?.split("@")[0] || "Utilizador",
            foto: user.photoURL || ""
          },
          tipo: "comentario",
          postId: id,
          textoAdicional: textoParaEnviar
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setACarregarComentario(false);
    }
  };

  const handleEliminarComentario = async (comentarioParaRemover) => {
    if (!window.confirm("Queres mesmo apagar este comentário?")) return;

    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        comentarios: arrayRemove(comentarioParaRemover)
      });

      setListaComentarios((prev) => prev.filter((c) => c !== comentarioParaRemover));
    } catch (error) {
      console.error("Erro ao apagar comentário:", error);
      alert("Erro ao apagar o comentário.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden relative">
      {copiado && (
        <div className="absolute top-2 right-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md z-20">
          Link copiado!
        </div>
      )}

      {/* Cabeçalho do Post */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <div onClick={handleIrParaPerfil} className="flex items-center gap-3 cursor-pointer group">
          {autorFoto ? (
            <img
              src={autorFoto}
              alt={author}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-blue-600 transition"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              {author ? author[0].toUpperCase() : "U"}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition">
              {author || "Utilizador Conectamoz"}
            </h4>
            <span className="text-[10px] text-gray-400 block">Publicado no Conectamoz</span>
          </div>
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={carregandoAcao}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <FaEllipsisV size={14} />
            </button>

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
                      <FaEdit className="text-blue-500" size={13} /> Editar
                    </button>
                    <button
                      onClick={handleEliminarPost}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FaTrash size={13} /> Eliminar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleDenunciarPost}
                    className="w-full text-left px-3.5 py-2 text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <FaExclamationTriangle size={13} /> Denunciar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo de Texto ou Modo de Edição */}
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

      {/* Mídia com Suporte a Double-Tap e Otimização Cloudinary */}
      <div className="relative bg-black flex justify-center items-center overflow-hidden" onDoubleClick={handleDoubleTap}>
        {imagemUrl && (
          <img
            src={otimizarUrl(imagemUrl)}
            alt="Publicação"
            className="w-full max-h-96 object-cover cursor-pointer select-none"
            loading="lazy"
          />
        )}

        {videoUrl && (
          <div className="relative w-full max-h-96 flex justify-center items-center">
            <video
              src={otimizarUrl(videoUrl)}
              controls
              muted={semSom}
              className="w-full max-h-96 object-cover"
              loop
              playsInline
            />
            <button
              onClick={() => setSemSom(!semSom)}
              className="absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black transition z-10"
            >
              {semSom ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
            </button>
          </div>
        )}

        {/* Animação de Coração em Duplo Toque */}
        {coracaoAnimado && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <FaHeart className="text-red-500 text-8xl drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Contador de Reações e Comentários */}
      <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="bg-red-500 text-white text-[10px] p-0.5 rounded-full">❤️</span>
            <span className="bg-amber-400 text-white text-[10px] p-0.5 rounded-full">😂</span>
          </span>
          <span className="ml-1 font-medium">{curtidas.length} reações</span>
        </div>

        <button onClick={() => setMostrarComentarios(!mostrarComentarios)} className="hover:underline">
          {listaComentarios.length} comentários
        </button>
      </div>

      {/* Botões de Ação com Bar de Emojis */}
      <div className="flex border-t border-b border-gray-100 text-gray-600 font-medium text-xs relative">
        {/* Pop-up de Emojis ao passar o cursor ou ao clicar no botão */}
        {mostrarReacoes && (
          <div
            onMouseLeave={() => setMostrarReacoes(false)}
            className="absolute -top-11 left-4 bg-white border border-gray-200 shadow-xl rounded-full px-3 py-1.5 flex items-center gap-2 animate-bounce z-20"
          >
            {listaReacoes.map((item) => (
              <button
                key={item.nome}
                onClick={() => handleReagir(item.emoji)}
                className="text-xl hover:scale-125 transition-transform"
                title={item.nome}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => handleReagir(minhaReacaoEmoji || "❤️")}
          onMouseEnter={() => setMostrarReacoes(true)}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition ${
            minhaReacaoEmoji ? "text-red-500 font-bold" : ""
          }`}
        >
          {minhaReacaoEmoji ? <span>{minhaReacaoEmoji}</span> : <FaHeart size={15} />}
          <span>{minhaReacaoEmoji ? "Reagiu" : "Gosto"}</span>
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
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {listaComentarios.map((c, index) => {
              const eMeuComentario = user && (c.userId === user.uid || isMyPost);

              return (
                <div key={index} className="flex items-start gap-2 text-xs group">
                  <div onClick={() => c.userId && navigate(`/perfil/${c.userId}`)} className="cursor-pointer shrink-0 mt-0.5">
                    {c.autorFoto ? (
                      <img src={c.autorFoto} alt={c.autorNome} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                        {c.autorNome ? c.autorNome[0].toUpperCase() : "U"}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex-1 relative">
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => c.userId && navigate(`/perfil/${c.userId}`)}
                        className="font-semibold text-gray-800 cursor-pointer hover:underline"
                      >
                        {c.autorNome}
                      </span>

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
              className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-700 transition"
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}