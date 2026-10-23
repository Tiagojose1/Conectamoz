import React, { useState } from "react";
import {
  FaMobileAlt,
  FaCreditCard,
  FaTimes,
  FaLock,
  FaQrcode,
  FaCheck,
  FaCopy,
} from "react-icons/fa";

export default function PaymentModal({ efeito, onClose, onSuccess }) {
  const [metodo, setMetodo] = useState("mpesa");
  const [telefone, setTelefone] = useState("");
  const [cartaoInfo, setCartaoInfo] = useState({ numero: "", validade: "", cvv: "" });
  const [carregando, setCarregando] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  const NOME_PLATAFORMA = "Konnexvib";
  const ENDERECO_PIX = "cd3cda04-be07-48f3-945e-501e2bc3e686";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(ENDERECO_PIX);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2000);
  };

  const handleProcessarPagamento = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (metodo === "mpesa" || metodo === "emola") {
        console.log(`[${NOME_PLATAFORMA}] enviando cobrança Push para +258${telefone}`);
      }

      // Simulação da chamada da API
      setTimeout(() => {
        setCarregando(false);
        onSuccess(efeito);
        onClose();
        alert(`Pagamento confirmado! Benefício ativado pela ${NOME_PLATAFORMA}.`);
      }, 2500);
    } catch (error) {
      console.error("Erro na transação:", error);
      setCarregando(false);
      alert("Erro ao processar pagamento.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-5 text-white relative space-y-4">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          aria-label="Fechar modal"
        >
          <FaTimes />
        </button>

        <div className="text-center space-y-1">
          <FaLock className="text-yellow-500 mx-auto text-xl" />
          <h3 className="font-bold text-sm">Comprar {efeito?.nome || "Item"}</h3>
          <p className="text-xs text-yellow-400 font-bold">{efeito?.preco || "0.00 MT"}</p>
        </div>

        {/* Seleção de Métodos */}
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMetodo("mpesa")}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition ${
              metodo === "mpesa" ? "border-red-500 bg-red-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-700"
            }`}
          >
            <FaMobileAlt className="text-red-500" /> M-Pesa
          </button>

          <button
            type="button"
            onClick={() => setMetodo("emola")}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition ${
              metodo === "emola" ? "border-orange-500 bg-orange-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-700"
            }`}
          >
            <FaMobileAlt className="text-orange-400" /> e-Mola
          </button>

          <button
            type="button"
            onClick={() => setMetodo("card")}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition ${
              metodo === "card" ? "border-blue-500 bg-blue-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-700"
            }`}
          >
            <FaCreditCard className="text-blue-400" /> Cartão
          </button>
        </div>

        {/* Formulário Dinâmico */}
        <form onSubmit={handleProcessarPagamento} className="space-y-3 pt-2">
          {(metodo === "mpesa" || metodo === "emola") && (
            <div className="space-y-2">
              <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700 text-[11px] text-gray-300">
                <p>📲 <strong>Cobrança {NOME_PLATAFORMA}:</strong> Insira o seu número. Receberá a notificação para digitar o PIN.</p>
                <p className="text-[10px] text-yellow-400 mt-1 font-semibold">Destino: {NOME_PLATAFORMA}</p>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">
                  Número do Telemóvel ({metodo === "mpesa" ? "84 / 85" : "86 / 87"})
                </label>
                <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-400 mr-2">+258</span>
                  <input
                    type="tel"
                    maxLength={9}
                    placeholder="8X XXX XXXX"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
                    className="bg-transparent w-full outline-none text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {metodo === "card" && (
            <div className="space-y-2 text-[11px]">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cartaoInfo.numero}
                  onChange={(e) => setCartaoInfo({ ...cartaoInfo, numero: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Validade</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cartaoInfo.validade}
                    onChange={(e) => setCartaoInfo({ ...cartaoInfo, validade: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    value={cartaoInfo.cvv}
                    onChange={(e) => setCartaoInfo({ ...cartaoInfo, cvv: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono text-center"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition mt-2 cursor-pointer"
          >
            {carregando
              ? "Processando transação..."
              : `Pagar à ${NOME_PLATAFORMA}`}
          </button>
        </form>
      </div>
    </div>
  );
}