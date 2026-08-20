import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaReceipt 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HistoricoTransacoes() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Consulta corrigida para procurar pelo campo 'userId'
    const q = query(
      collection(db, "transacoes"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Ordenação local por data descendente (evita falhas por falta de índice composto no Firestore)
          .sort((a, b) => {
            const dataA = a.criadoEm?.seconds || 0;
            const dataB = b.criadoEm?.seconds || 0;
            return dataB - dataA;
          });

        setTransacoes(lista);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar histórico de transações:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Função para formatar a data do Firestore Timestamp
  const formatarData = (timestamp) => {
    if (!timestamp) return "Data recente";
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("pt-MZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  };

  // Renderiza o badge do estado da transação
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "concluido":
      case "sucesso":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <FaCheckCircle size={12} /> Concluído
          </span>
        );
      case "pendente":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <FaClock size={12} className="animate-spin" /> Pendente
          </span>
        );
      case "falhou":
      case "cancelado":
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <FaTimesCircle size={12} /> Falhou
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
            {status || "Processando"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Topo / Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <FaArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">Histórico de Transações</h1>
      </div>

      <main className="max-w-xl mx-auto px-3 sm:px-4 pt-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
            A carregar o histórico...
          </div>
        ) : transacoes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border p-6 text-gray-500 shadow-sm">
            <FaReceipt size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700 text-base">Nenhuma transação encontrada</p>
            <p className="text-xs text-gray-400 mt-1">
              Os teus pagamentos M-Pesa e e-Mola vão aparecer aqui.
            </p>
            <button
              onClick={() => navigate("/pagamento")}
              className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Realizar Pagamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transacoes.map((item) => {
              const isMpesa = item.metodo?.toLowerCase() === "mpesa";
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Ícone Método */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                          isMpesa ? "bg-red-600" : "bg-orange-500"
                        }`}
                      >
                        {isMpesa ? "M" : "e"}
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 text-sm capitalize">
                          {isMpesa ? "M-Pesa (Vodacom)" : "e-Mola (Movitel)"}
                        </h3>
                        <p className="text-xs text-gray-500">{item.telefone || "N/A"}</p>
                      </div>
                    </div>

                    {/* Valor em MZN */}
                    <div className="text-right">
                      <span className="font-extrabold text-gray-900 text-base block">
                        {item.valor ? `${Number(item.valor).toLocaleString()} MZN` : "0 MZN"}
                      </span>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatarData(item.criadoEm)}</span>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}