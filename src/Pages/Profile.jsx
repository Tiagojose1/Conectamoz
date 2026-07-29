import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile, signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";
import PostCard from "../Components/PostCard";

export default function Profile() {
  const user = auth.currentUser;

  const [nome, setNome] = useState(user?.displayName || "");
  const [editando, setEditando] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [meusPosts, setMeusPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Carregar as publicações do próprio utilizador
  useEffect(() => {
    if (!user) return;

    const carregarMeusPosts = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          where("autorId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ordenar localmente pelo mais recente
        list.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
        setMeusPosts(list);
      } catch (error) {
        console.error("Erro ao carregar os seus posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    carregarMeusPosts();
  }, [user]);

  // Atualizar o nome do Perfil no Firebase Auth
  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      setLoadingSave(true);
      await updateProfile(auth.currentUser, {
        displayName: nome.trim(),
      });
      setEditando(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Não foi possível atualizar o perfil.");
    } finally {
      setLoadingSave(false);
    }
  };

  // Função de Logout (Terminar Sessão)
  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={user} />

      <main className="max-w-xl mx-auto pt-4 px-4 space-y-4">
        {/* Cartão de Perfil */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border text-center space-y-4 relative">
          {/* Foto de Perfil (Avatar com Inicial) */}
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
            {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
          </div>

          {!editando ? (
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {user?.displayName || "Utilizador ConectMoz"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>

              <button
                onClick={() => setEditando(true)}
                className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-1.5 rounded-lg transition"
              >
                ✏️ Editar Perfil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSalvarPerfil} className="space-y-3 max-w-xs mx-auto">
              <div>
                <label className="text-xs font-semibold text-gray-600 block text-left mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingSave}
                  className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loadingSave ? "A guardar..." : "Guardar"}
                </button>
              </div>
            </form>
          )}

          {/* Botão de Terminar Sessão (Logout) */}
          <div className="pt-2 border-t">
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
            >
              🚪 Terminar Sessão (Sair)
            </button>
          </div>
        </div>

        {/* Minhas Publicações */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-700 px-1">
            📝 As minhas publicações ({meusPosts.length})
          </h2>

          {loadingPosts ? (
            <div className="text-center py-6 text-gray-500 font-medium animate-pulse text-xs">
              A carregar as suas publicações...
            </div>
          ) : meusPosts.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border text-gray-500 shadow-sm">
              <p className="font-semibold text-xs text-gray-700">
                Ainda não publicou nada.
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Vá ao Feed para partilhar ideias ou oportunidades!
              </p>
            </div>
          ) : (
            meusPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.autorNome || user?.displayName || "Eu"}
                content={post.conteudo}
                likes={post.curtidas || []}
              />
            ))
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}