import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";
import { FaSearch, FaUserPlus, FaComments } from "react-icons/fa";

export default function Search() {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar todos os utilizadores (exceto o próprio)
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const lista = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.uid !== currentUser?.uid);

        setTodosUsuarios(lista);
        setUsuariosFiltrados(lista);
      } catch (error) {
        console.error("Erro ao carregar utilizadores para pesquisa:", error);
      } font-medium {
        setCarregando(false);
      }
    };

    carregarUsuarios();
  }, [currentUser]);

  // Filtrar utilizadores conforme o texto digitado
  useEffect(() => {
    if (!busca.trim()) {
      setUsuariosFiltrados(todosUsuarios);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = todosUsuarios.filter(
        (u) =>
          (u.nome && u.nome.toLowerCase().includes(termo)) ||
          (u.email && u.email.toLowerCase().includes(termo))
      );
      setUsuariosFiltrados(filtrados);
    }
  }, [busca, todosUsuarios]);

  // Abrir ou criar conversa direta no Chat
  const handleIniciarConversa = async (outroUsuario) => {
    if (!currentUser) return;

    try {
      const meuNome = currentUser.displayName || currentUser.email.split("@")[0];
      const outroNome = outroUsuario.nome || outroUsuario.email.split("@")[0];

      // Verificar se já existe conversa ou criar uma nova
      await addDoc(collection(db, "chats"), {
        participantes: [currentUser.uid, outroUsuario.uid],
        nomesParticipantes: {
          [currentUser.uid]: meuNome,
          [outroUsuario.uid]: outroNome,
        },
        criadoEm: serverTimestamp(),
      });

      navigate("/chat");
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      navigate("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={currentUser} />

      <main className="max-w-xl mx-auto pt-4 px-4 space-y-4">
        {/* Campo de Pesquisa */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border flex items-center gap-3">
          <FaSearch className="text-gray-400 ml-2" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-gray-800"
          />
        </div>

        {/* Resultados da Pesquisa */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase px-1">
            {busca ? `Resultados (${usuariosFiltrados.length})` : "Utilizadores Sugeridos"}
          </h2>

          {carregando ? (
            <div className="text-center py-8 text-gray-400 text-xs animate-pulse">
              A procurar utilizadores...
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border text-gray-400 text-xs">
              Nenhum utilizador encontrado com "{busca}".
            </div>
          ) : (
            usuariosFiltrados.map((u) => (
              <div
                key={u.id || u.uid}
                className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between gap-3 hover:border-blue-300 transition"
              >
                <div className="flex items-center gap-3">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.nome}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {u.nome ? u.nome[0].toUpperCase() : "U"}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-sm text-gray-800">
                      {u.nome || u.email.split("@")[0]}
                    </h3>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleIniciarConversa(u)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FaComments size={14} /> Mensagem
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}