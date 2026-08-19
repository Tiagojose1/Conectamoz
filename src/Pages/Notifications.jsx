import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { FaHeart, FaComment, FaUserCircle, FaCheckDouble, FaArrowLeft } from "react-icons/fa";

export default function Notifications() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setCarregando(false);
      return;
    }

    // Escuta notificações em tempo real destinadas ao utilizador logado
    const q = query(
      collection(db, "notificacoes"),
      where("destinatarioId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setNotificacoes(lista);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao escutar notificações:", error);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Marcar uma notificação específica como lida e ir para o post
  const handleNotificacaoClick = async (notificacao) => {
    try {
      if (!notificacao.lida) {
        const notifRef = doc(db, "notificacoes", notificacao.id);
        await updateDoc(notifRef, { lida: true });
      }
      navigate(`/post/${notificacao.postId}`);
    } catch (err) {
      console.error("Erro ao atualizar notificação:", err);
      navigate(`/post/${notificacao.postId}`);
    }
  };

  // Marcar todas as notificações como lidas
  const marcarTodasComoLidas = async () => {
    const naoLidas = notificacoes.filter((n) => !n.lida);
    if (naoLidas.length === 0) return;

    try {
      const batch = writeBatch(db);
      naoLidas.forEach((n) => {
        const notifRef = doc(db, "notificacoes", n.id);
        batch.update(notifRef, { lida: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const temNaoLidas = notificacoes.some((n) => !n.lida);

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft size={16} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
        </div>

        {temNaoLidas && (
          <button
            onClick={marcarTodasComoLidas}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl transition"
          >
            <FaCheckDouble size={12} /> Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Lista de Notificações */}
      {notificacoes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
          <p className="text-sm">Ainda não tens notificações.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificacoes.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificacaoClick(item)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                item.lida
                  ? "bg-white border-gray-100 hover:bg-gray-50"
                  : "bg-blue-50/60 border-blue-100 hover:bg-blue-50"
              }`}
            >
              {/* Foto do Remetente */}
              <div className="relative">
                {item.remetenteFoto ? (
                  <img
                    src={item.remetenteFoto}
                    alt={item.remetenteNome}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <FaUserCircle className="w-11 h-11 text-gray-300" />
                )}

                {/* Ícone do tipo de ação */}
                <span
                  className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white text-[10px] ${
                    item.tipo === "like" ? "bg-red-500" : "bg-blue-500"
                  }`}
                >
                  {item.tipo === "like" ? <FaHeart size={10} /> : <FaComment size={10} />}
                </span>
              </div>

              {/* Mensagem */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">
                  <span className="font-bold text-gray-900">{item.remetenteNome}</span>{" "}
                  {item.tipo === "like"
                    ? "gostou da tua publicação."
                    : "comentou na tua publicação."}
                </p>
                {item.textoAdicional && (
                  <p className="text-xs text-gray-500 truncate mt-0.5 italic">
                    "{item.textoAdicional}"
                  </p>
                )}
              </div>

              {/* Ponto indicador de não lida */}
              {!item.lida && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}