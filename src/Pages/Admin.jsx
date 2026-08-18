import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { FaShieldAlt, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import BottomNavigation from "../Components/BottomNavigation";

export default function Admin() {
  const [denuncias, setDenuncias] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta denúncias efetuadas
    const qDenuncias = query(collection(db, "denuncias"), orderBy("criadoEm", "desc"));
    const unsubDenuncias = onSnapshot(qDenuncias, (snapshot) => {
      setDenuncias(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Escuta posts para gestão direta
    const qPosts = query(collection(db, "posts"), orderBy("criadoEm", "desc"));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map((p) => ({ id: p.id, ...p.data() })));
      setLoading(false);
    });

    return () => {
      unsubDenuncias();
      unsubPosts();
    };
  }, []);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Tens a certeza que desejas eliminar esta publicação?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Erro ao eliminar post:", error);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      await deleteDoc(doc(db, "denuncias", reportId));
    } catch (error) {
      console.error("Erro ao remover denúncia:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Topo Admin */}
      <div className="bg-slate-900 text-white border-b sticky top-0 z-10 px-4 py-3 max-w-xl mx-auto flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <FaShieldAlt className="text-blue-400" /> Painel de Moderação
        </h2>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
          Admin
        </span>
      </div>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        {/* Secção de Denúncias */}
        <section className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-500" /> Denúncias Pendentes ({denuncias.length})
          </h3>
          {denuncias.length === 0 ? (
            <p className="text-xs text-gray-500">Nenhuma denúncia registada no momento.</p>
          ) : (
            denuncias.map((item) => (
              <div key={item.id} className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs space-y-2">
                <p><strong>Motivo:</strong> {item.motivo}</p>
                <p className="text-gray-600"><strong>ID do Post:</strong> {item.targetId}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleDeletePost(item.targetId)}
                    className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 font-semibold"
                  >
                    <FaTrash size={10} /> Apagar Publicação
                  </button>
                  <button
                    onClick={() => handleDismissReport(item.id)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded font-semibold"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Secção de Gestão Geral de Publicações */}
        <section className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Publicações Recentes ({posts.length})</h3>
          {loading ? (
            <div className="text-xs text-gray-500 animate-pulse">A carregar registos...</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex justify-between items-center py-2 border-b last:border-0 text-xs">
                <div className="truncate max-w-[70%]">
                  <p className="font-bold text-gray-800 truncate">{post.autorNome || "Anónimo"}</p>
                  <p className="text-gray-500 truncate">{post.texto || "Sem texto"}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-500 hover:text-red-700 p-1.5 rounded"
                  title="Eliminar Publicação"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}