import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaArrowLeft, FaMobileAlt, FaLock, FaCheckCircle, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Pagamento() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const [metodo, setMetodo] = useState("mpesa"); // "mpesa" ou "emola"
  const [telefone, setTelefone] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  // Validação dos prefixos das operadoras em Moçambique
  const validarTelefone = (num, m) => {
    const limpo = num.replace(/\D/g, "");
    if (limpo.length !== 9) return false;

    if (m === "mpesa") {
      return limpo.startsWith("84") || limpo.startsWith("85");
    } else if (m === "emola") {
      return limpo.startsWith("86") || limpo.startsWith("87");
    }
    return false;
  };

  const handlePagamento = async (e) => {
    e.preventDefault();
    setErro("");

    if (!validarTelefone(telefone, metodo)) {
      setErro(
        metodo === "mpesa"
          ? "O número M-Pesa deve começar com 84 ou 85 e ter 9 dígitos."
          : "O número e-Mola deve começar com 86 ou 87 e ter 9 dígitos."
      );
      return;
    }

    if (!valor || Number(valor) <= 0) {
      setErro("Por favor, insira um valor válido em MZN.");
      return;
    }

    try {
      setLoading(true);

      // Registo do pedido de transação no Firestore
      await addDoc(collection(db, "transacoes"), {
        userId: currentUser?.uid || "anonimo",
        userEmail: currentUser?.email || "",
        metodo,
        telefone,
        valor: Number(valor),
        moeda: "MZN",
        status: "pendente", // 'pendente' -> 'sucesso' via webhook/API backend
        criadoEm: serverTimestamp(),
      });

      // Simulação da chamada de API da Gateway (C2B M-Pesa / e-Mola)
      setTimeout(() => {
        setLoading(false);
        setSucesso(true);
      }, 2000);

    } catch (err) {
      console.error("Erro no pagamento:", err);
      setErro("Falha ao processar pagamento. Tenta novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border overflow-hidden">
        
        {/* Topo / Header */}
        <div className="bg-white border-b px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-black p-1 rounded-full hover:bg-gray-100 transition"
              title="Voltar"
            >
              <FaArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-gray-800 text-lg">Carteira & Pagamentos</h1>
          </div>

          {/* Botão de Atalho para o Histórico no Header */}
          <button
            onClick={() => navigate("/historico-transacoes")}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
            title="Ver Histórico de Transações"
          >
            <FaHistory size={13} />
            <span>Histórico</span>
          </button>
        </div>

        <div className="p-6">
          {sucesso ? (
            <div className="text-center py-8 space-y-4">
              <FaCheckCircle size={56} className="text-emerald-500 mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-gray-800">Pedido Recibo enviado!</h2>
              <p className="text-sm text-gray-600">
                Confirma o PIN no teu telemóvel (<strong>{telefone}</strong>) para concluir a transferência de{" "}
                <strong>{valor} MZN</strong> via {metodo === "mpesa" ? "M-Pesa" : "e-Mola"}.
              </p>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setSucesso(false);
                    setValor("");
                    setTelefone("");
                  }}
                  className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition"
                >
                  Fazer outro pagamento
                </button>
                
                <button
                  onClick={() => navigate("/historico-transacoes")}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl border transition flex items-center justify-center gap-2"
                >
                  <FaHistory /> Ir para o Histórico
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePagamento} className="space-y-5">
              
              {/* Seleção do Método */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Escolhe a Carteira Móvel
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMetodo("mpesa");
                      setErro("");
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                      metodo === "mpesa"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-600"></span>
                    M-Pesa (Vodacom)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMetodo("emola");
                      setErro("");
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                      metodo === "emola"
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    e-Mola (Movitel)
                  </button>
                </div>
              </div>

              {/* Input Valor */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Valor (MZN)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400">
                    MZN
                  </span>
                </div>
              </div>

              {/* Input Telemóvel */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Número de Telemóvel
                </label>
                <div className="relative">
                  <FaMobileAlt className="absolute left-4 top-3.5 text-gray-400" size={16} />
                  <input
                    type="tel"
                    maxLength={9}
                    placeholder={metodo === "mpesa" ? "841234567 ou 85..." : "861234567 ou 87..."}
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Mensagem de Erro */}
              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl">
                  <p className="text-xs text-red-600 font-medium">{erro}</p>
                </div>
              )}

              {/* Botão Pagar */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition ${
                  metodo === "mpesa"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-500 hover:bg-orange-600"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <span className="animate-pulse">A enviar pedido...</span>
                ) : (
                  <>
                    <FaLock size={14} />
                    Pagar {valor ? `${valor} MZN` : ""} via {metodo === "mpesa" ? "M-Pesa" : "e-Mola"}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="bg-gray-50 border-t p-3 text-center text-xs text-gray-400">
          Pagamento seguro via API Moçambique Mobile Money
        </div>
      </div>
    </div>
  );
}