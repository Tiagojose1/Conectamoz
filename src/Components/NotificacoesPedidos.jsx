import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

export default function NotificacoesPedidos() {
  const currentUser = auth.currentUser;
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Escuta em tempo real apenas os pedidos pendentes recebidos pelo utilizador
    const q = query(
      collection(db, "friend_requests"),
      where("destinatarioId", "==", currentUser.uid),
      where("status", "==", "pendente")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Para cada pedido, busca os dados do utilizador que enviou (remetente)
      const promessas = snapshot.docs.map(async (documento) => {
        const dadosPedido = { id: documento.id, ...documento.data() };

        // Tenta buscar no /users e, se não encontrar, tenta no /usuarios
        let userSnap = await getDoc(doc(db, "users", dadosPedido.remetenteId));
        if (!userSnap.exists()) {
          userSnap = await getDoc(doc(db, "usuarios", dadosPedido.remetenteId));
        }

        const dadosRemetente = userSnap.exists() ? userSnap.data() : {};

        return {
          ...dadosPedido,
          remetente: {
            nome: dadosRemetente.displayName || dadosRemetente.nome || "Utilizador",
            foto: dadosRemetente.photoURL || dadosRemetente.foto || "/default-avatar.png",
            email: dadosRemetente.email || ""
          }
        };
      });

      const listaCompletada = await Promise.all(promessas);
      setPedidosPendentes(listaCompletada);
      setCarregando(false);
    }, (error) => {
      console.error("Erro ao escutar pedidos:", error);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Aceitar Pedido
  const handleAceitar = async (pedidoId) => {
    try {
      await updateDoc(doc(db, "friend_requests", pedidoId), {
        status: "aceito"
      });
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
    }
  };

  // Recusar/Eliminar Pedido
  const handleRecusar = async (pedidoId) => {
    try {
      await deleteDoc(doc(db, "friend_requests", pedidoId));
    } catch (error) {
      console.error("Erro ao recusar pedido:", error);
    }
  };

  if (carregando) {
    return <div className="p-4 text-xs text-gray-500">A carregar notificações...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 max-w-md w-full">
      {/* Cabeçalho com o Contador de Notificações */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800 text-base">Pedidos de Amizade</h3>
          {pedidosPendentes.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {pedidosPendentes.length}
            </span>
          )}
        </div>
      </div>

      {/* Lista de Pedidos */}
      {pedidosPendentes.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          Não tem pedidos de amizade pendentes.
        </p>
      ) : (
        <div className="space-y-3">
          {pedidosPendentes.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.remetente.foto}
                  alt={item.remetente.nome}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {item.remetente.nome}
                  </h4>
                  <p className="text-xs text-gray-400">Enviou-lhe um pedido</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAceitar(item.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => handleRecusar(item.id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}