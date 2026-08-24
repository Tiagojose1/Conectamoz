// src/services/friendRequestsService.js
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

/**
 * Procura todos os perfis dos amigos confirmados de um determinado utilizador
 */
export const obterPerfisAmigos = async (userId) => {
  try {
    // 1. Procurar pedidos onde o utilizador foi o remetente
    const q1 = query(
      collection(db, "friend_requests"),
      where("remetenteId", "==", userId),
      where("status", "==", "aceito")
    );

    // 2. Procurar pedidos onde o utilizador foi o destinatário
    const q2 = query(
      collection(db, "friend_requests"),
      where("destinatarioId", "==", userId),
      where("status", "==", "aceito")
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Guardar os UIDs dos amigos
    const amigosIds = [
      ...snap1.docs.map((d) => d.data().destinatarioId),
      ...snap2.docs.map((d) => d.data().remetenteId),
    ];

    if (amigosIds.length === 0) return { sucesso: true, amigos: [] };

    // 3. Procurar os dados do perfil de cada amigo na coleção de utilizadores
    const perfisPromessas = amigosIds.map(async (amigoId) => {
      // Tenta na coleção 'users', se não existir tenta 'usuarios'
      let userDoc = await getDoc(doc(db, "users", amigoId));
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, "usuarios", amigoId));
      }

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    });

    const perfis = (await Promise.all(perfisPromessas)).filter((p) => p !== null);

    return { sucesso: true, amigos: perfis };
  } catch (error) {
    console.error("Erro ao obter lista de amigos:", error);
    return { sucesso: false, error, amigos: [] };
  }
};