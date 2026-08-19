import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaMobileAlt, FaCheckCircle, FaLock } from "react-icons/fa";

export default function PagamentoModal({ valorPadrao = 100, aoConcluir }) {
  const user = auth.currentUser;

  const [metodo, setMetodo] = useState("mpesa"); // 'mpesa' ou 'emola'
  const [numero, setNumero] = useState("");
  const [valor, setValor] = useState(valorPadrao);
  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleProcessarPagamento = async (e) => {
    e.preventDefault();

    // Validação simples de número de Moçambique (84/85 para M-Pesa, 86/87 para e-Mola)
    const numLimpo = numero.replace(/\s+/g, "");
    if (!/^(84|85|86|87)\d{7}$/.test(numLimpo)) {
      alert("Por favor, insere um número válido de Moçambique (ex: 841234567).");
      return;
    }

    setProcessando(true);

    try {
      // 1. Registar intenção/transação no Firestore
      await addDoc(collection(db, "transacoes"), {
        userId: user ? user.uid : "anonimo",
        userEmail: user ? user.email : "",
        metodo: metodo,
        numeroTelefone: numLimpo,
        valor: Number(valor),
        moeda: "MZN",
        status: "concluido", // Numa API real ficaria 'pendente' até ao webhook
        criadoEm: serverTimestamp()
      });

      // Simulação do tempo de resposta da API de Pagamento
      setTimeout(() => {
        setProcessando(false);
        setSucesso(true);
        if (aoConcluir) aoConcluir();
      }, 2000);
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      alert("Ocorreu um erro ao iniciar a transação.");
      setProcessando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-sm mx-auto">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
        <FaLock className="text-emerald-600" size={16} />
        <h3 className="font-bold text-gray-800 text-sm">Pagamento Móvel</h3>
      </div>

      {sucesso ? (
        <div className="text-center py-6 space-y-3">
          <FaCheckCircle className="text-emerald-500 mx-auto" size={48} />
          <h4 className="font-bold text-gray-800 text-base">Pagamento Concluído!</h4>
          <p className="text-xs text-gray-500">
            Confirma o PIN no teu telemóvel para autorizar a transação de {valor} MZN.
          </p>
          <button
            onClick={() => setSucesso(false)}
            className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Fazer Novo Pagamento
          </button>
        </div>
      ) : (
        <form onSubmit={handleProcessarPagamento} className="space-y-4">
          {/* Seleção da Carteira */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Escolhe a Carteira
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetodo("mpesa")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  metodo === "mpesa"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                M-Pesa
              </button>

              <button
                type="button"
                onClick={() => setMetodo("emola")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  metodo === "emola"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                e-Mola
              </button>
            </div>
          </div>

          {/* Número de Telefone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Número de Telemóvel
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                +258
              </span>
              <input
                type="tel"
                placeholder={metodo === "mpesa" ? "84 123 4567" : "86 123 4567"}
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                maxLength={9}
                required
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Valor (MZN)
            </label>
            <input
              type="number"
              min="1"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={processando || !numero.trim()}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            {processando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaMobileAlt size={14} /> Pagar {valor} MZN
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}