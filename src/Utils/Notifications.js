import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Cria uma notificação no Firestore
 * @param {string} destinatarioId - ID do utilizador que vai receber a notificação
 * @param {string} remetenteId - ID do utilizador que fez a ação
 * @param {string} remetenteNome - Nome do utilizador que fez a ação
 * @param {string} tipo - 'like' | 'comment' | 'message'
 * @param {string} texto - Mensagem descritiva da notificação
 * @param {string} link - Rota para onde o utilizador vai ao clicar (ex: '/chat' ou '/post/123')
 */
export const enviarNotificacao = async ({ destinatarioId, remetenteId, remetenteNome, tipo, texto, link = "" }) => {
  // Evitar notificar a si mesmo
  if (!destinatarioId || destinatarioId === remetenteId) return;

  try {
    await addDoc(collection(db, "notificacoes"), {
      destinatarioId,
      remetenteId,
      remetenteNome,
      tipo,
      texto,
      link,
      lida: false,
      criadoEm: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
};