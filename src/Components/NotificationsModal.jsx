import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { FaHeart, FaComment, FaUserPlus, FaTimes, FaBell } from "react-icons/fa";

export default function NotificationsModal({ isOpen, onClose }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, "notificacoes"),
      where("destinatarioId", "==", user.uid),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setNotificacoes(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleAbrirNotificacao = async (notif) => {
    try {
      if (!notif.lida) {
        await updateDoc(doc(db, "notificacoes", notif.id), { lida: true });
      }

      onClose();

      if (notif.postId) {
        navigate(`/post/${notif.postId}`);
      } else if (notif.remetente?.uid) {
        navigate(`/perfil/${notif.remetente.uid}`);
      }
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-start pt-12 px-2">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        {/* Cabecalho */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FaBell className="text-blue-600" />
            <h3 className="font-bold text-gray-800 text-base">Notificações</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Lista */}
        <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
              A carregar notificações...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Ainda não tens notificações.
            </div>
          ) : (
            notificacoes.map((n) => (
              <div
                key={n.id}
                onClick={() => handleAbrirNotificacao(n)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${
                  !n.lida ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="relative shrink-0">
                  {n.remetente?.foto ? (
                    <img
                      src={n.remetente.foto}
                      alt="Autor"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {n.remetente?.nome ? n.remetente.nome[0].toUpperCase() : "U"}
                    </div>
                  )}

                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full text-white text-[9px] bg-white shadow">
                    {n.tipo === "like" && (
                      <span className="bg-red-500 block p-1 rounded-full">
                        <FaHeart size={8} />
                      </span>
                    )}
                    {n.tipo === "comentario" && (
                      <span className="bg-blue-500 block p-1 rounded-full">
                        <FaComment size={8} />
                      </span>
                    )}
                    {n.tipo === "seguir" && (
                      <span className="bg-green-500 block p-1 rounded-full">
                        <FaUserPlus size={8} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-xs">
                  <p className="text-gray-800">
                    <strong className="font-semibold">{n.remetente?.nome}</strong>{" "}
                    {n.tipo === "like" && "reagiu à tua publicação."}
                    {n.tipo === "comentario" && "comentou na tua publicação."}
                    {n.tipo === "seguir" && "começou a seguir-te."}
                  </p>
                  {n.textoAdicional && (
                    <span className="text-gray-500 block truncate mt-0.5 italic">
                      "{n.textoAdicional}"
                    </span>
                  )}
                </div>

                {!n.lida && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}