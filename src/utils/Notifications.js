import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Cria uma notificação no Firestore
 * @param {string} destinatarioId - ID do dono do post que vai receber a notificação
 * @param {object} remetente - Dados de quem fez a ação { uid, nome, foto }
 * @param {string} tipo - 'like' | 'comentario'
 * @param {string} postId - ID do post relacionado
 * @param {string} textoAdicional - Opcional (ex: o texto do comentário)
 */
export const criarNotificacao = async ({
  destinatarioId,
  remetente,
  tipo,
  postId,
  textoAdicional = ""
}) => {
  // Não cria notificação se o utilizador reagir ao próprio post
  if (!destinatarioId || destinatarioId === remetente.uid) return;

  try {
    await addDoc(collection(db, "notificacoes"), {
      destinatarioId,
      remetenteId: remetente.uid,
      remetenteNome: remetente.nome || "Utilizador",
      remetenteFoto: remetente.foto || "",
      tipo, // 'like' ou 'comentario' 'partilha'
      postId,
      textoAdicional,
      lida: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
  }
};