import { db, auth } from "../firebase";
import { doc, updateDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";

/**
 * Ativa o acesso VIP no Firestore imediatamente após o pagamento/trial
 */
export const liberarAcessoVipReal = async (userId, plano) => {
  if (!userId) return;

  const userRef = doc(db, "users", userId);
  const agora = new Date();
  let diasValidade = 1;

  if (plano.temTrial) {
    diasValidade = plano.diasTrial || 3;
  } else if (plano.id === "semanal") {
    diasValidade = 7;
  } else if (plano.id === "mensal") {
    diasValidade = 30;
  } else if (plano.id === "anual") {
    diasValidade = 365;
  }

  const dataExpiracao = new Date(agora.getTime() + diasValidade * 24 * 60 * 60 * 1000);

  await updateDoc(userRef, {
    isVip: true,
    planoAtivo: plano.id,
    vipDesde: serverTimestamp(),
    vipExpiracao: Timestamp.fromDate(dataExpiracao),
    emTrial: plano.temTrial || false,
  });
};

/**
 * Processamento Real por API
 */
export const executarPagamentoReal = async ({ userId, plano, metodo, dados }) => {
  const transactionId = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // --- 1. M-PESA MOÇAMBIQUE (API C2B STK PUSH REAL) ---
  if (metodo === "mpesa") {
    const response = await fetch("https://api.konnexvib.com/api/payments/mpesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: `258${dados.telefone}`,
        amount: plano.precoMZN,
        reference: transactionId,
        isTrial: plano.temTrial
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Falha no pagamento M-Pesa. Verifique o saldo ou o número.");
    }
  }

  // --- 2. e-MOLA MOÇAMBIQUE (API REAL) ---
  else if (metodo === "emola") {
    const response = await fetch("https://api.konnexvib.com/api/payments/emola", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: `258${dados.telefone}`,
        amount: plano.precoMZN,
        reference: transactionId
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Falha na transação e-Mola.");
    }
  }

  // --- 3. CARTÃO DE CRÉDITO (STRIPE CHECKOUT REAL) ---
  else if (metodo === "card") {
    const response = await fetch("https://api.konnexvib.com/api/payments/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        planId: plano.id,
        priceUSD: plano.precoUSD
      })
    });
    const data = await response.json();
    if (data.sessionUrl) {
      window.location.href = data.sessionUrl; // Redireciona para o Stripe Checkout seguro
      return;
    }
  }

  // --- 4. PIX BRASIL (GERAÇÃO DE QR CODE / PIX COPIA E COLA REAL) ---
  else if (metodo === "pix") {
    const response = await fetch("https://api.konnexvib.com/api/payments/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amountBRL: plano.precoBRL
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error("Erro ao gerar chave Pix.");
  }

  // --- 5. CRIPTOMOEDA (VALIDAÇÃO DE TXID NA BLOCKCHAIN) ---
  else if (metodo === "crypto") {
    const response = await fetch("https://api.konnexvib.com/api/payments/verify-crypto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: dados.txHash,
        currency: dados.moeda,
        expectedUSD: plano.precoUSD
      })
    });
    const data = await response.json();
    if (!data.verified) {
      throw new Error("Transação não encontrada ou ainda não confirmada na Blockchain.");
    }
  }

  // Registar no banco de dados e liberar acesso ilimitado no app
  await setDoc(doc(db, "transactions", transactionId), {
    transactionId,
    userId,
    planoId: plano.id,
    valorUSD: plano.precoUSD,
    valorMZN: plano.precoMZN,
    metodo,
    status: "APPROVED",
    criadoEm: serverTimestamp()
  });

  await liberarAcessoVipReal(userId, plano);
  return { sucesso: true, transactionId };
};