import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";

/**
 * Ativa automaticamente a subscrição VIP do utilizador após pagamento ou trial
 */
export const ativarSubscricaoVIP = async (userId, plano) => {
  if (!userId) return;

  const userRef = doc(db, "users", userId);
  const agora = new Date();
  let diasValidade = 1;

  // Determinar a duração com base no plano escolhido
  if (plano.temTrial) {
    diasValidade = plano.diasTrial || 3; // 3 Dias Grátis
  } else if (plano.id === "semanal") {
    diasValidade = 7;
  } else if (plano.id === "mensal") {
    diasValidade = 30;
  } else if (plano.id === "anual") {
    diasValidade = 365;
  }

  // Data em que o acesso VIP expira
  const dataExpiracao = new Date(agora.getTime() + diasValidade * 24 * 60 * 60 * 1000);

  try {
    await updateDoc(userRef, {
      isVip: true,
      planoAtivo: plano.id,
      vipDesde: serverTimestamp(),
      vipExpiracao: Timestamp.fromDate(dataExpiracao),
      emTrial: plano.temTrial || false,
    });
    console.log(`[Konnexvib] Acesso VIP desbloqueado para o utilizador ${userId}`);
  } catch (error) {
    console.error("Erro ao ativar subscrição VIP:", error);
  }
};

/**
 * Verifica se o utilizador tem acesso ativo aos recursos VIP
 */
export const verificarAcessoVip = (userData) => {
  if (!userData || !userData.isVip) return false;

  if (userData.vipExpiracao) {
    const dataExpiracao = userData.vipExpiracao.toDate();
    const agora = new Date();
    return agora < dataExpiracao; // Retorna true se ainda estiver dentro da validade
  }

  return false;
};