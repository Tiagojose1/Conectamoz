import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";
import { FaHeart, FaComment, FaEnvelope, FaBell, FaCheck } from "react-icons/fa";

export default function Notifications() {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notificacoes"),
      where("destinatarioId", "==", currentUser.uid),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotificacoes(lista);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao carregar notificações:", error);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Marcar notificação como lida ao clicar
  const handleClicarNotificacao = async (notificacao) => {
    try {
      if (!notificacao.lida) {
        const notifRef = doc(db, "notificacoes", notificacao.id);
        await updateDoc(notifRef, { lida: true });
      }

      if (notificacao.link) {
        navigate(notificacao.link);
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Renderiza o ícone de acordo com o tipo
  const renderIcone = (tipo) => {
    switch (tipo) {
      case "like":
        return <FaHeart className="text-red-500" size={16} />;
      case "comment":
        return <FaComment className="text-blue-500" size={16} />;
      case "message":
        return <FaEnvelope className="text-green-500" size={16} />;
      default:
        return <FaBell className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={currentUser} />

      <main className="max-w-xl mx-auto pt-4 px-4 space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
          <h1 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <FaBell className="text-blue-600" /> Notificações
          </h1>
          <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2.5 py-1 rounded-full">
            {notificacoes.filter((n) => !n.lida).length} não lidas
          </span>
        </div>

        {carregando ? (
          <div className="text-center py-10 text-xs text-gray-400 animate-pulse">
            A carregar notificações...
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border text-gray-400 text-xs">
            Ainda não tens nenhuma notificação.
          </div>
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClicarNotificacao(n)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  n.lida ? "bg-white border-gray-200" : "bg-blue-50/70 border-blue-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-white border shadow-sm">
                    {renderIcone(n.tipo)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-800">
                      <strong className="font-bold">{n.remetenteNome}</strong> {n.texto}
                    </p>
                  </div>
                </div>

                {!n.lida && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}