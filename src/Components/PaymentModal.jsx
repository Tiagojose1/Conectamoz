import React, { useState } from "react";
import {
  Crown,
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Copy,
  CheckCircle2,
  Bitcoin,
  Wallet,
  QrCode,
  ChevronDown,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function PaymentModal({
  efeito,
  onClose,
  onSuccess,
}) {
  // =========================================================
  // ESTADOS
  // =========================================================

  const [metodo, setMetodo] = useState("mpesa");

  const [telefone, setTelefone] = useState("");

  const [cartaoInfo, setCartaoInfo] = useState({
    numero: "",
    validade: "",
    cvv: "",
  });

  const [rede, setRede] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");

  const [copiado, setCopiado] = useState("");

  // =========================================================
  // CONFIGURAÇÃO KONNEXVIB
  // =========================================================

  const NOME_PLATAFORMA = "KonnexVib";

  /*
   * ==========================================================
   * ATENÇÃO
   * ==========================================================
   *
   * SUBSTITUA OS VALORES "COLOCAR_ENDERECO_REAL_AQUI"
   * PELOS ENDEREÇOS REAIS DAS CARTEIRAS DA KONNEXVIB.
   *
   * NÃO use endereços inventados para receber dinheiro.
   */

  const CARTEIRAS = {
    bitcoin: {
      Bitcoin:
        "COLOCAR_ENDERECO_BITCOIN_REAL_AQUI",
    },

    usdt: {
      "Ethereum (ERC-20)":
        "COLOCAR_ENDERECO_USDT_ERC20_AQUI",

      "Tron (TRC-20)":
        "COLOCAR_ENDERECO_USDT_TRC20_AQUI",

      "BNB Smart Chain (BEP-20)":
        "COLOCAR_ENDERECO_USDT_BEP20_AQUI",

      Polygon:
        "COLOCAR_ENDERECO_USDT_POLYGON_AQUI",

      Arbitrum:
        "COLOCAR_ENDERECO_USDT_ARBITRUM_AQUI",

      Optimism:
        "COLOCAR_ENDERECO_USDT_OPTIMISM_AQUI",

      Avalanche:
        "COLOCAR_ENDERECO_USDT_AVALANCHE_AQUI",
    },

    usdc: {
      "Ethereum (ERC-20)":
        "COLOCAR_ENDERECO_USDC_ERC20_AQUI",

      Tron:
        "COLOCAR_ENDERECO_USDC_TRON_AQUI",

      "BNB Smart Chain (BEP-20)":
        "COLOCAR_ENDERECO_USDC_BEP20_AQUI",

      Polygon:
        "COLOCAR_ENDERECO_USDC_POLYGON_AQUI",

      Arbitrum:
        "COLOCAR_ENDERECO_USDC_ARBITRUM_AQUI",

      Optimism:
        "COLOCAR_ENDERECO_USDC_OPTIMISM_AQUI",

      Avalanche:
        "COLOCAR_ENDERECO_USDC_AVALANCHE_AQUI",

      Base:
        "COLOCAR_ENDERECO_USDC_BASE_AQUI",
    },

    ethereum: {
      "Ethereum (ERC-20)":
        "COLOCAR_ENDERECO_ETHEREUM_REAL_AQUI",
    },
  };

  // =========================================================
  // REDES
  // =========================================================

  const REDES = {
    bitcoin: [
      "Bitcoin",
    ],

    usdt: [
      "Ethereum (ERC-20)",
      "Tron (TRC-20)",
      "BNB Smart Chain (BEP-20)",
      "Polygon",
      "Arbitrum",
      "Optimism",
      "Avalanche",
    ],

    usdc: [
      "Ethereum (ERC-20)",
      "Tron",
      "BNB Smart Chain (BEP-20)",
      "Polygon",
      "Arbitrum",
      "Optimism",
      "Avalanche",
      "Base",
    ],

    ethereum: [
      "Ethereum (ERC-20)",
    ],
  };

  // =========================================================
  // PIX
  // =========================================================

  const PIX_CHAVE =
    "COLOCAR_CHAVE_PIX_REAL_AQUI";

  // =========================================================
  // PREÇO
  // =========================================================

  const preco = efeito?.preco || "0.00 MT";

  // =========================================================
  // MÉTODOS
  // =========================================================

  const metodos = [
    {
      id: "mpesa",
      nome: "M-Pesa",
      icon: Smartphone,
      descricao: "Pagamento móvel",
      classeAtiva:
        "border-red-500 bg-red-50 text-red-600",
      iconClass: "text-red-500",
    },

    {
      id: "emola",
      nome: "e-Mola",
      icon: Smartphone,
      descricao: "Pagamento móvel",
      classeAtiva:
        "border-orange-500 bg-orange-50 text-orange-600",
      iconClass: "text-orange-500",
    },

    {
      id: "card",
      nome: "Cartão",
      icon: CreditCard,
      descricao: "Visa / Mastercard",
      classeAtiva:
        "border-blue-500 bg-blue-50 text-blue-600",
      iconClass: "text-blue-500",
    },

    {
      id: "pix",
      nome: "PIX",
      icon: QrCode,
      descricao: "Pagamento instantâneo",
      classeAtiva:
        "border-green-500 bg-green-50 text-green-600",
      iconClass: "text-green-600",
    },

    {
      id: "bitcoin",
      nome: "Bitcoin",
      icon: Bitcoin,
      descricao: "BTC",
      classeAtiva:
        "border-yellow-500 bg-yellow-50 text-yellow-700",
      iconClass: "text-yellow-500",
    },

    {
      id: "usdt",
      nome: "USDT",
      icon: Wallet,
      descricao: "Tether",
      classeAtiva:
        "border-emerald-500 bg-emerald-50 text-emerald-700",
      iconClass: "text-emerald-600",
    },

    {
      id: "usdc",
      nome: "USDC",
      icon: Wallet,
      descricao: "USD Coin",
      classeAtiva:
        "border-blue-500 bg-blue-50 text-blue-700",
      iconClass: "text-blue-600",
    },

    {
      id: "ethereum",
      nome: "Ethereum",
      icon: Wallet,
      descricao: "ETH",
      classeAtiva:
        "border-purple-500 bg-purple-50 text-purple-700",
      iconClass: "text-purple-600",
    },
  ];

  // =========================================================
  // ALTERAR MÉTODO
  // =========================================================

  const selecionarMetodo = (novoMetodo) => {
    setMetodo(novoMetodo);
    setErro("");
    setRede("");
  };

  // =========================================================
  // COPIAR TEXTO
  // =========================================================

  const copiar = async (texto, identificador) => {
    try {
      await navigator.clipboard.writeText(texto);

      setCopiado(identificador);

      setTimeout(() => {
        setCopiado("");
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);

      setErro(
        "Não foi possível copiar. Copie o endereço manualmente."
      );
    }
  };

  // =========================================================
  // TELEFONE
  // =========================================================

  const handleTelefoneChange = (e) => {
    const valor = e.target.value
      .replace(/\D/g, "")
      .slice(0, 9);

    setTelefone(valor);
    setErro("");
  };

  // =========================================================
  // CARTÃO
  // =========================================================

  const handleNumeroCartao = (e) => {
    let numero = e.target.value
      .replace(/\D/g, "")
      .slice(0, 16);

    numero = numero
      .replace(/(.{4})/g, "$1 ")
      .trim();

    setCartaoInfo((anterior) => ({
      ...anterior,
      numero,
    }));

    setErro("");
  };

  const handleValidade = (e) => {
    let validade = e.target.value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (validade.length >= 3) {
      validade =
        validade.substring(0, 2) +
        "/" +
        validade.substring(2);
    }

    setCartaoInfo((anterior) => ({
      ...anterior,
      validade,
    }));

    setErro("");
  };

  const handleCVV = (e) => {
    const cvv = e.target.value
      .replace(/\D/g, "")
      .slice(0, 4);

    setCartaoInfo((anterior) => ({
      ...anterior,
      cvv,
    }));

    setErro("");
  };

  // =========================================================
  // VALIDAR PAGAMENTO
  // =========================================================

  const validarPagamento = () => {
    // -------------------------------------------------------
    // M-PESA
    // -------------------------------------------------------

    if (metodo === "mpesa") {
      if (!/^(84|85)\d{7}$/.test(telefone)) {
        setErro(
          "Digite um número M-Pesa válido. Exemplo: 841234567."
        );

        return false;
      }
    }

    // -------------------------------------------------------
    // E-MOLA
    // -------------------------------------------------------

    if (metodo === "emola") {
      if (!/^(86|87)\d{7}$/.test(telefone)) {
        setErro(
          "Digite um número e-Mola válido. Exemplo: 861234567."
        );

        return false;
      }
    }

    // -------------------------------------------------------
    // CARTÃO
    // -------------------------------------------------------

    if (metodo === "card") {
      const numeroLimpo =
        cartaoInfo.numero.replace(/\s/g, "");

      if (numeroLimpo.length < 16) {
        setErro(
          "Digite o número completo do cartão."
        );

        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(
        cartaoInfo.validade
      )) {
        setErro(
          "Digite a validade no formato MM/AA."
        );

        return false;
      }

      if (cartaoInfo.cvv.length < 3) {
        setErro(
          "Digite um CVV válido."
        );

        return false;
      }
    }

    // -------------------------------------------------------
    // PIX
    // -------------------------------------------------------

    if (metodo === "pix") {
      if (
        !PIX_CHAVE ||
        PIX_CHAVE ===
          "COLOCAR_CHAVE_PIX_REAL_AQUI"
      ) {
        setErro(
          "A chave PIX da KonnexVib ainda não foi configurada."
        );

        return false;
      }
    }

    // -------------------------------------------------------
    // CRIPTOMOEDAS
    // -------------------------------------------------------

    if (
      metodo === "bitcoin" ||
      metodo === "usdt" ||
      metodo === "usdc" ||
      metodo === "ethereum"
    ) {
      if (!rede) {
        setErro(
          "Selecione uma rede para continuar."
        );

        return false;
      }

      const carteira =
        CARTEIRAS[metodo]?.[rede];

      if (
        !carteira ||
        carteira.includes("COLOCAR_")
      ) {
        setErro(
          "A carteira para esta moeda/rede ainda não foi configurada."
        );

        return false;
      }
    }

    return true;
  };

  // =========================================================
  // PAGAMENTO
  // =========================================================

  const handleProcessarPagamento = async (e) => {
    e.preventDefault();

    setErro("");

    if (!validarPagamento()) {
      return;
    }

    setCarregando(true);

    try {
      // -----------------------------------------------------
      // M-PESA / E-MOLA
      // -----------------------------------------------------

      if (
        metodo === "mpesa" ||
        metodo === "emola"
      ) {
        console.log(
          `[${NOME_PLATAFORMA}] Método: ${metodo}`
        );

        console.log(
          `[${NOME_PLATAFORMA}] Número: +258${telefone}`
        );

        console.log(
          `[${NOME_PLATAFORMA}] Valor: ${preco}`
        );

        /*
         * FUTURO:
         * Integrar API oficial/gateway.
         */
      }

      // -----------------------------------------------------
      // CARTÃO
      // -----------------------------------------------------

      if (metodo === "card") {
        console.log(
          `[${NOME_PLATAFORMA}] Pagamento por cartão`
        );

        console.log(
          `[${NOME_PLATAFORMA}] Valor: ${preco}`
        );

        /*
         * FUTURO:
         * Integrar gateway de cartão.
         *
         * NÃO guardar cartão no Firestore.
         */
      }

      // -----------------------------------------------------
      // PIX
      // -----------------------------------------------------

      if (metodo === "pix") {
        console.log(
          `[${NOME_PLATAFORMA}] Pagamento PIX`
        );

        console.log(
          `[${NOME_PLATAFORMA}] Chave PIX: ${PIX_CHAVE}`
        );
      }

      // -----------------------------------------------------
      // CRIPTO
      // -----------------------------------------------------

      if (
        metodo === "bitcoin" ||
        metodo === "usdt" ||
        metodo === "usdc" ||
        metodo === "ethereum"
      ) {
        const carteira =
          CARTEIRAS[metodo]?.[rede];

        console.log(
          `[${NOME_PLATAFORMA}] Cripto: ${metodo}`
        );

        console.log(
          `[${NOME_PLATAFORMA}] Rede: ${rede}`
        );

        console.log(
          `[${NOME_PLATAFORMA}] Carteira: ${carteira}`
        );
      }

      // -----------------------------------------------------
      // SIMULAÇÃO TEMPORÁRIA
      // -----------------------------------------------------

      await new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );

      // -----------------------------------------------------
      // SUCESSO
      // -----------------------------------------------------

      if (onSuccess) {
        onSuccess(efeito);
      }

      setCarregando(false);

      onClose();

      alert(
        `Pagamento confirmado!\n\nBenefício ativado pela ${NOME_PLATAFORMA}.`
      );
    } catch (error) {
      console.error(
        "Erro ao processar pagamento:",
        error
      );

      setCarregando(false);

      setErro(
        "Não foi possível processar o pagamento. Tente novamente."
      );
    }
  };

  // =========================================================
  // CRIPTO SELECIONADA
  // =========================================================

  const isCripto =
    metodo === "bitcoin" ||
    metodo === "usdt" ||
    metodo === "usdc" ||
    metodo === "ethereum";

  const carteiraSelecionada =
    isCripto && rede
      ? CARTEIRAS[metodo]?.[rede]
      : "";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">

      {/* =====================================================
          MODAL
      ===================================================== */}

      <div className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* ===================================================
            BOTÃO FECHAR
        =================================================== */}

        <button
          type="button"
          onClick={onClose}
          disabled={carregando}
          className="absolute right-4 top-4 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* ===================================================
            CABEÇALHO
        =================================================== */}

        <div className="bg-gradient-to-br from-[#635BFF] via-[#7c3aed] to-[#9333ea] px-6 pb-7 pt-8 text-center text-white">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">

            <Crown
              size={32}
              fill="currentColor"
            />

          </div>

          <h2 className="mt-4 text-2xl font-bold">
            Torne-se VIP 👑
          </h2>

          <p className="mt-2 text-sm leading-5 text-white/85">
            Desbloqueie todo o conteúdo exclusivo
            do KonnexVib.
          </p>

        </div>

        {/* ===================================================
            CONTEÚDO
        =================================================== */}

        <div className="space-y-5 p-6">

          {/* =================================================
              PLANO
          ================================================= */}

          <div className="rounded-2xl border border-[#635BFF]/20 bg-purple-50 p-4">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Sparkles
                    size={18}
                    className="text-[#635BFF]"
                  />

                  <h3 className="font-bold text-gray-900">
                    Plano VIP
                  </h3>

                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Acesso exclusivo KonnexVib
                </p>

              </div>

              <div className="text-right">

                <p className="text-xl font-bold text-[#635BFF]">
                  {preco}
                </p>

                <p className="text-[10px] text-gray-500">
                  Subscrição
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              BENEFÍCIOS
          ================================================= */}

          <div>

            <h3 className="mb-3 text-sm font-bold text-gray-900">
              Benefícios incluídos
            </h3>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

              {[
                "Acesso às salas VIP",
                "Conteúdo exclusivo",
                "Conversas exclusivas",
                "Vídeos e eventos VIP",
              ].map((beneficio) => (
                <div
                  key={beneficio}
                  className="flex items-center gap-2"
                >

                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={14} />
                  </div>

                  <span className="text-xs text-gray-700">
                    {beneficio}
                  </span>

                </div>
              ))}

            </div>

          </div>

          {/* =================================================
              MÉTODOS
          ================================================= */}

          <div>

            <h3 className="mb-3 text-sm font-bold text-gray-900">
              Escolha o método de pagamento
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

              {metodos.map((item) => {

                const Icon = item.icon;

                const ativo =
                  metodo === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      selecionarMetodo(item.id)
                    }
                    disabled={carregando}
                    className={`flex min-h-[86px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition ${
                      ativo
                        ? item.classeAtiva +
                          " shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >

                    <Icon
                      size={22}
                      className={
                        ativo
                          ? item.iconClass
                          : "text-gray-400"
                      }
                    />

                    <span className="text-xs font-bold">
                      {item.nome}
                    </span>

                    <span className="text-[9px] opacity-70">
                      {item.descricao}
                    </span>

                  </button>
                );
              })}

            </div>

          </div>

          {/* =================================================
              M-PESA / E-MOLA
          ================================================= */}

          {(metodo === "mpesa" ||
            metodo === "emola") && (
            <div className="space-y-3">

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex gap-3">

                  <Smartphone
                    size={21}
                    className={
                      metodo === "mpesa"
                        ? "mt-0.5 shrink-0 text-red-500"
                        : "mt-0.5 shrink-0 text-orange-500"
                    }
                  />

                  <div>

                    <p className="text-xs font-bold text-gray-800">
                      Pagamento por{" "}
                      {metodo === "mpesa"
                        ? "M-Pesa"
                        : "e-Mola"}
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                      Introduza o seu número.
                      Poderá receber uma solicitação
                      de pagamento no seu telemóvel.
                    </p>

                  </div>

                </div>

              </div>

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Número do telemóvel
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 focus-within:border-[#635BFF]">

                  <span className="mr-2 text-sm font-semibold text-gray-500">
                    +258
                  </span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder={
                      metodo === "mpesa"
                        ? "84 / 85 XXX XXXX"
                        : "86 / 87 XXX XXXX"
                    }
                    value={telefone}
                    onChange={handleTelefoneChange}
                    disabled={carregando}
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    required
                  />

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              CARTÃO
          ================================================= */}

          {metodo === "card" && (
            <div className="space-y-3">

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Número do cartão
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">

                  <CreditCard
                    size={18}
                    className="text-gray-400"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cartaoInfo.numero}
                    onChange={handleNumeroCartao}
                    disabled={carregando}
                    className="w-full bg-transparent text-sm font-mono text-gray-900 outline-none"
                    required
                  />

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Validade
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cartaoInfo.validade}
                    onChange={handleValidade}
                    disabled={carregando}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm font-mono outline-none"
                    required
                  />

                </div>

                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    CVV
                  </label>

                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={cartaoInfo.cvv}
                    onChange={handleCVV}
                    disabled={carregando}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm font-mono outline-none"
                    required
                  />

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              PIX
          ================================================= */}

          {metodo === "pix" && (
            <div className="space-y-4">

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">

                <div className="flex gap-3">

                  <QrCode
                    size={22}
                    className="mt-0.5 shrink-0 text-green-600"
                  />

                  <div>

                    <p className="text-xs font-bold text-green-800">
                      Pagamento por PIX
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-green-700">
                      Copie a chave PIX abaixo e
                      efetue o pagamento através
                      do seu banco.
                    </p>

                  </div>

                </div>

              </div>

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Chave PIX
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">

                  <div className="min-w-0 flex-1 px-2">

                    <p className="truncate text-xs font-mono text-gray-700">
                      {PIX_CHAVE}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copiar(
                        PIX_CHAVE,
                        "pix"
                      )
                    }
                    disabled={carregando}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#635BFF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#5148e6]"
                  >

                    {copiado === "pix" ? (
                      <>
                        <CheckCircle2 size={14} />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar
                      </>
                    )}

                  </button>

                </div>

              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-[11px] leading-5 text-yellow-800">

                ⚠️ Depois de efetuar o PIX, o
                pagamento deverá ser confirmado
                pelo sistema antes de ativar o VIP.

              </div>

            </div>
          )}

          {/* =================================================
              BITCOIN / USDT / USDC / ETHEREUM
          ================================================= */}

          {isCripto && (
            <div className="space-y-4">

              {/* CABEÇALHO CRIPTO */}

              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">

                <div className="flex gap-3">

                  {metodo === "bitcoin" ? (
                    <Bitcoin
                      size={23}
                      className="mt-0.5 shrink-0 text-yellow-500"
                    />
                  ) : (
                    <Wallet
                      size={23}
                      className="mt-0.5 shrink-0 text-purple-600"
                    />
                  )}

                  <div>

                    <p className="text-xs font-bold text-gray-800">

                      {metodo === "bitcoin"
                        ? "Bitcoin (BTC)"
                        : metodo === "usdt"
                        ? "Tether (USDT)"
                        : metodo === "usdc"
                        ? "USD Coin (USDC)"
                        : "Ethereum (ETH)"}

                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-gray-500">

                      Escolha cuidadosamente a
                      rede antes de enviar o pagamento.

                    </p>

                  </div>

                </div>

              </div>

              {/* SELEÇÃO DA REDE */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Escolha a rede
                </label>

                <div className="relative">

                  <select
                    value={rede}
                    onChange={(e) => {
                      setRede(e.target.value);
                      setErro("");
                    }}
                    disabled={carregando}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium text-gray-800 outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/10"
                  >

                    <option value="">
                      Selecionar rede...
                    </option>

                    {REDES[metodo].map(
                      (nomeRede) => (
                        <option
                          key={nomeRede}
                          value={nomeRede}
                        >
                          {nomeRede}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                </div>

              </div>

              {/* ENDEREÇO */}

              {rede && (
                <div className="space-y-3">

                  <div>

                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Endereço de pagamento
                    </label>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">

                      <p className="break-all font-mono text-[11px] leading-5 text-gray-600">
                        {carteiraSelecionada}
                      </p>

                    </div>

                  </div>

                  {/* COPIAR */}

                  <button
                    type="button"
                    onClick={() =>
                      copiar(
                        carteiraSelecionada,
                        `${metodo}-${rede}`
                      )
                    }
                    disabled={
                      carregando ||
                      carteiraSelecionada.includes(
                        "COLOCAR_"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#5148e6] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {copiado ===
                    `${metodo}-${rede}` ? (
                      <>
                        <CheckCircle2 size={16} />
                        Endereço copiado
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copiar endereço
                      </>
                    )}

                  </button>

                </div>
              )}

              {/* AVISO */}

              <div className="rounded-xl border border-red-200 bg-red-50 p-3">

                <p className="text-[11px] font-bold text-red-700">
                  ⚠️ Atenção à rede
                </p>

                <p className="mt-1 text-[11px] leading-5 text-red-600">

                  Envie somente{" "}

                  {metodo === "bitcoin"
                    ? "BTC"
                    : metodo === "usdt"
                    ? "USDT"
                    : metodo === "usdc"
                    ? "USDC"
                    : "ETH"}{" "}

                  através da rede selecionada.
                  Usar uma rede incompatível pode
                  resultar na perda dos fundos.

                </p>

              </div>

            </div>
          )}

          {/* =================================================
              ERRO
          ================================================= */}

          {erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
              {erro}
            </div>
          )}

          {/* =================================================
              SEGURANÇA
          ================================================= */}

          <div className="flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">

            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#635BFF]"
            />

            <div>

              <p className="text-xs font-bold text-gray-700">
                Pagamento seguro
              </p>

              <p className="mt-1 text-[11px] leading-5 text-gray-500">

                O pagamento será verificado antes
                da ativação do acesso VIP.

              </p>

            </div>

          </div>

          {/* =================================================
              BOTÃO PAGAR / CONTINUAR
          ================================================= */}

          <form onSubmit={handleProcessarPagamento}>

            <button
              type="submit"
              disabled={carregando}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5148e6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {carregando ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Processando...
                </>
              ) : isCripto ? (
                <>
                  <Wallet size={18} />

                  Confirmar pagamento
                </>
              ) : metodo === "pix" ? (
                <>
                  <QrCode size={18} />

                  Confirmar PIX
                </>
              ) : (
                <>
                  <Crown
                    size={18}
                    fill="currentColor"
                  />

                  Pagar {preco}
                </>
              )}

            </button>

          </form>

          {/* =================================================
              CANCELAR
          ================================================= */}

          <button
            type="button"
            onClick={onClose}
            disabled={carregando}
            className="w-full cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Talvez mais tarde
          </button>

          {/* =================================================
              RODAPÉ
          ================================================= */}

          <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-gray-400">

            <ShieldCheck size={13} />

            <span>
              KonnexVib • Pagamento protegido
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}