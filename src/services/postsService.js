import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from "firebase/firestore";

/**
 * Procura posts com base no filtro de mídia e no tipo de ordenação.
 * @param {string} aba - 'todos' | 'texto' | 'fotos' | 'videos'
 * @param {string} ordenacao - 'recentes' | 'populares'
 */
export const obterPostsFiltrados = async (aba = "todos", ordenacao = "recentes") => {
  try {
    const postsRef = collection(db, "posts");
    let condicoes = [];

    // 1. Filtragem por tipo de conteúdo
    if (aba === "texto") {
      condicoes.push(where("imagemUrl", "==", null));
      condicoes.push(where("videoUrl", "==", null));
    } else if (aba === "fotos") {
      condicoes.push(where("imagemUrl", "!=", null));
    } else if (aba === "videos") {
      condicoes.push(where("videoUrl", "!=", null));
    }

    // 2. Ordenação
    if (ordenacao === "recentes") {
      condicoes.push(orderBy("criadoEm", "desc"));
    } else if (ordenacao === "populares") {
      // Requer um campo numérico no documento (ex: likesCount)
      condicoes.push(orderBy("likesCount", "desc"));
    }

    const q = query(postsRef, ...condicoes);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erro ao carregar posts filtrados:", error);
    return [];
  }
};