// src/components/ListaAmigos.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obterPerfisAmigos } from "../services/friendRequestsService";
import { 
  FaUserFriends, 
  FaUserCircle, 
  FaSearch, 
  FaTimes, 
  FaCommentDots 
} from "react-icons/fa";

export default function ListaAmigos({ userId }) {
  const [amigos, setAmigos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarAmigos() {
      if (!userId) return;
      setCarregando(true);
      const res = await obterPerfisAmigos(userId);
      if (res.sucesso) {
        setAmigos(res.amigos);
      }
      setCarregando(false);
    }

    carregarAmigos();
  }, [userId]);

  const amigosFiltrados = amigos.filter((amigo) => {
    const nome = (amigo.displayName || amigo.nome || "").toLowerCase();
    const username = (amigo.username || "").toLowerCase();
    const termo = termoPesquisa.toLowerCase();

    return nome.includes(termo) || username.includes(termo);
  });

  if (carregando) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 text-sm">
        A carregar amigos...
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FaUserFriends className="text-blue-600" size={20} />
          <h3 className="font-bold text-gray-800 text-base">
            Amigos <span className="text-sm font-normal text-gray-500">({amigos.length})</span>
          </h3>
        </div>
      </div>

      {/* Campo de Pesquisa */}
      {amigos.length > 0 && (
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Pesquisar amigo por nome..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {termoPesquisa && (
            <button
              onClick={() => setTermoPesquisa("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      )}

      {/* Lista de Amigos */}
      {amigos.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Nenhum amigo encontrado.
        </p>
      ) : amigosFiltrados.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          Nenhum resultado para "{termoPesquisa}".
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {amigosFiltrados.map((amigo) => (
            <div
              key={amigo.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 group"
            >
              <Link
                to={`/perfil/${amigo.id}`}
                className="flex items-center gap-3 overflow-hidden flex-1"
              >
                {amigo.photoURL || amigo.fotoPerfil ? (
                  <img
                    src={amigo.photoURL || amigo.fotoPerfil}
                    alt={amigo.displayName || amigo.nome}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <FaUserCircle className="w-11 h-11 text-gray-400 flex-shrink-0" />
                )}

                <div className="overflow-hidden">
                  <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition">
                    {amigo.displayName || amigo.nome || "Utilizador"}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    @{amigo.username || "conectamoz"}
                  </p>
                </div>
              </Link>

              {/* Botão Direto para Abrir Conversa no Chat */}
              <button
                onClick={() => navigate(`/chat/${amigo.id}`)}
                className="p-2.5 ml-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition flex-shrink-0"
                title="Enviar Mensagem"
              >
                <FaCommentDots size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}