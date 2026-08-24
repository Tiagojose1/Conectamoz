// src/pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  enviarPedidoAmizade, 
  cancelarPedidoAmizade, 
  aceitarPedidoAmizade, 
  recusarPedidoAmizade,
  removerAmigo
} from "../services/friendRequestsService";
import ListaAmigos from "../Components/ListaAmigos";
import { 
  FaUserPlus, 
  FaUserTimes, 
  FaUserCheck, 
  FaCheck, 
  FaTimes,
  FaUserMinus,
  FaUserFriends
} from "react-icons/fa";

export default function UserProfile() {
  const { id: perfilId } = useParams();
  const currentUser = auth.currentUser;

  const [pedidoInfo, setPedidoInfo] = useState({ id: null, status: null, remetenteId: null, destinatarioId: null });
  const [totalAmigos, setTotalAmigos] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [confirmarRemocao, setConfirmarRemocao] = useState(false);

  // 1. Escuta o estado da relação entre os dois utilizadores
  useEffect(() => {
    if (!currentUser || !perfilId) return;

    const q = query(
      collection(db, "friend_requests"),
      where("remetenteId", "in", [currentUser.uid, perfilId]),
      where("destinatarioId", "in", [currentUser.uid, perfilId])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setPedidoInfo({
          id: docSnap.id,
          status: data.status,
          remetenteId: data.remetenteId,
          destinatarioId: data.destinatarioId
        });
      } else {
        setPedidoInfo({ id: null, status: null, remetenteId: null, destinatarioId: null });
      }
    });

    return () => unsubscribe();
  }, [currentUser, perfilId]);

  // 2. Escuta o TOTAL DE AMIGOS deste perfil em Tempo Real
  useEffect(() => {
    if (!perfilId) return;

    const qEnviados = query(
      collection(db, "friend_requests"),
      where("remetenteId", "==", perfilId),
      where("status", "==", "aceito")
    );

    const qRecebidos = query(
      collection(db, "friend_requests"),
      where("destinatarioId", "==", perfilId),
      where("status", "==", "aceito")
    );

    let count1 = 0;
    let count2 = 0;

    const unsub1 = onSnapshot(qEnviados, (snap) => {
      count1 = snap.size;
      setTotalAmigos(count1 + count2);
    });

    const unsub2 = onSnapshot(qRecebidos, (snap) => {
      count2 = snap.size;
      setTotalAmigos(count1 + count2);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [perfilId]);

  const handleEnviarPedido = async () => {
    setCarregando(true);
    await enviarPedidoAmizade(currentUser.uid, perfilId);
    setCarregando(false);
  };

  const handleCancelarPedido = async () => {
    if (!pedidoInfo.id) return;
    setCarregando(true);
    await cancelarPedidoAmizade(pedidoInfo.id);
    setCarregando(false);
  };

  const handleAceitarPedido = async () => {
    if (!pedidoInfo.id) return;
    setCarregando(true);
    await aceitarPedidoAmizade(pedidoInfo.id);
    setCarregando(false);
  };

  const handleRecusarPedido = async () => {
    if (!pedidoInfo.id) return;
    setCarregando(true);
    await recusarPedidoAmizade(pedidoInfo.id);
    setCarregando(false);
  };

  const handleRemoverAmigo = async () => {
    if (!pedidoInfo.id) return;
    setCarregando(true);
    await removerAmigo(pedidoInfo.id);
    setCarregando(false);
    setConfirmarRemocao(false);
  };

  const eOProprioPerfil = currentUser?.uid === perfilId;
  const souORemetente = pedidoInfo.remetenteId === currentUser?.uid;
  const souODestinatario = pedidoInfo.destinatarioId === currentUser?.uid;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Cabeçalho do Perfil */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Utilizador Conectamoz</h2>
          <p className="text-sm text-gray-500 mb-2">@utilizador</p>

          {/* Contador de Amigos no Cabeçalho */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl w-fit border border-gray-100">
            <FaUserFriends className="text-blue-600" size={16} />
            <span className="font-semibold text-gray-800">{totalAmigos}</span>
            <span>{totalAmigos === 1 ? "amigo" : "amigos"}</span>
          </div>
        </div>

        {/* Ações de Amizade */}
        {!eOProprioPerfil && (
          <div>
            {pedidoInfo.status === "pendente" && souODestinatario && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAceitarPedido}
                  disabled={carregando}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                  <FaCheck size={14} /> Aceitar
                </button>
                <button
                  onClick={handleRecusarPedido}
                  disabled={carregando}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-semibold rounded-xl text-sm transition border border-gray-200 disabled:opacity-50"
                >
                  <FaTimes size={14} /> Recusar
                </button>
              </div>
            )}

            {pedidoInfo.status === "pendente" && souORemetente && (
              <button
                onClick={handleCancelarPedido}
                disabled={carregando}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-semibold rounded-xl text-sm transition border border-gray-200 disabled:opacity-50"
              >
                <FaUserTimes size={16} /> {carregando ? "A anular..." : "Cancelar Pedido"}
              </button>
            )}

            {pedidoInfo.status === "aceito" && (
              <div>
                {!confirmarRemocao ? (
                  <button
                    onClick={() => setConfirmarRemocao(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl text-sm border border-green-200 hover:border-red-200 transition"
                  >
                    <FaUserCheck size={16} /> Amigos
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRemoverAmigo}
                      disabled={carregando}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                    >
                      <FaUserMinus size={14} /> {carregando ? "A remover..." : "Confirmar"}
                    </button>
                    <button
                      onClick={() => setConfirmarRemocao(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}

            {!pedidoInfo.status && (
              <button
                onClick={handleEnviarPedido}
                disabled={carregando}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
              >
                <FaUserPlus size={16} /> {carregando ? "A enviar..." : "Adicionar Amigo"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista de Amigos */}
      <ListaAmigos userId={perfilId} />
    </div>
  );
}