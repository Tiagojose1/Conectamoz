import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Cria uma notificação no Firestore
 * @param {Object} params
 * @param {string} params.destinatarioId - ID do destinatário da notificação
 * @param {Object} params.remetente - Objeto com os dados do utilizador { uid, nome, foto }
 * @param {string} params.tipo - 'like' | 'comentario' | 'partilha'
 * @param {string} params.postId - ID da publicação
 * @param {string} [params.textoAdicional=""] - Texto opcional (ex: o conteúdo do comentário)
 */
export const criarNotificacao = async ({
  destinatarioId,
  remetente,
  tipo,
  postId,
  textoAdicional = ""
}) => {
  // Evita notificações inválidas ou auto-notificações
  if (!destinatarioId || !remetente?.uid || destinatarioId === remetente.uid) {
    return;
  }

  try {
    await addDoc(collection(db, "notificacoes"), {
      destinatarioId,
      remetenteId: remetente.uid,
      remetenteNome: remetente.nome || "Utilizador Conectamoz",
      remetenteFoto: remetente.foto || "",
      tipo,
      postId: postId || "",
      textoAdicional: textoAdicional.trim(),
      lida: false,
      createdAt: serverTimestamp(),
      criadoEm: serverTimestamp() // Duplicado estrategicamente para suportar ambas as nomenclaturas
    });
  } catch (error) {
    console.error("Erro ao criar notificação no Firestore:", error);
  }
};