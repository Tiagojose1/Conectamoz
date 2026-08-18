import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";
import { FaBriefcase, FaComments, FaTrash, FaPlus, FaShieldAlt } from "react-icons/fa";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("vagas");

  // Estados de dados
  const [vagas, setVagas] = useState([]);
  const [mensagens, setMensagens] = useState([]);

  // Estado do formulário de nova vaga
  const [novaVaga, setNovaVaga] = useState({
    titulo: "",
    empresa: "",
    localizacao: "Maputo",
    descricao: "",
    tipo: "Tempo Inteiro"
  });
  const [loadingVaga, setLoadingVaga] = useState(false);

  // 1. Escuta em tempo real a coleção de vagas
  useEffect(() => {
    const qVagas = query(collection(db, "vagas"), orderBy("criadoEm", "desc"));
    const unsubVagas = onSnapshot(qVagas, (snapshot) => {
      setVagas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Escuta em tempo real as mensagens para moderação
    const qMensagens = query(collection(db, "mensagens_comunidade"), orderBy("criadoEm", "desc"));
    const unsubMensagens = onSnapshot(qMensagens, (snapshot) => {
      setMensagens(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubVagas();
      unsubMensagens();
    };
  }, []);

  // Handler para criar nova vaga
  const handleCriarVaga = async (e) => {
    e.preventDefault();
    if (!novaVaga.titulo || !novaVaga.empresa || !novaVaga.descricao) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoadingVaga(true);
      await addDoc(collection(db, "vagas"), {
        ...novaVaga,
        criadoEm: serverTimestamp()
      });

      // Limpar formulário
      setNovaVaga({
        titulo: "",
        empresa: "",
        localizacao: "Maputo",
        descricao: "",
        tipo: "Tempo Inteiro"
      });
      alert("Vaga publicada com sucesso!");
    } catch (error) {
      console.error("Erro ao publicar vaga: ", error);
      alert("Erro ao publicar a vaga. Tente novamente.");
    } finally {
      setLoadingVaga(false);
    }
  };

  // Handler para eliminar vaga
  const handleEliminarVaga = async (id) => {
    if (window.confirm("Tem a certeza que deseja eliminar esta vaga?")) {
      try {
        await deleteDoc(doc(db, "vagas", id));
      } catch (error) {
        console.error("Erro ao eliminar vaga: ", error);
      }
    }
  };

  // Handler para apagar mensagem (Moderação)
  const handleApagarMensagem = async (id) => {
    if (window.confirm("Tem a certeza que deseja remover esta mensagem da comunidade?")) {
      try {
        await deleteDoc(doc(db, "mensagens_comunidade", id));
      } catch (error) {
        console.error("Erro ao eliminar mensagem: ", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Cabeçalho do Painel */}
      <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <FaShieldAlt size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Painel de Administração</h1>
          <p className="text-xs text-gray-500">Gestão de vagas e moderação de conteúdos do Conectamoz</p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total de Vagas</p>
            <p className="text-2xl font-bold text-gray-800">{vagas.length}</p>
          </div>
          <FaBriefcase className="text-blue-500 text-xl" />
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Mensagens Ativas</p>
            <p className="text-2xl font-bold text-gray-800">{mensagens.length}</p>
          </div>
          <FaComments className="text-green-500 text-xl" />
        </div>
      </div>

      {/* Tabs de Navegação Interna */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl overflow-hidden px-2 pt-2">
        <button
          onClick={() => setActiveTab("vagas")}
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-all border-b-2 ${
            activeTab === "vagas"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaBriefcase size={14} /> Gestão de Vagas
        </button>
        <button
          onClick={() => setActiveTab("moderacao")}
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-all border-b-2 ${
            activeTab === "moderacao"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaComments size={14} /> Moderação da Comunidade
        </button>
      </div>

      {/* CONTEÚDO 1: GESTÃO DE VAGAS */}
      {activeTab === "vagas" && (
        <div className="space-y-6">
          {/* Formulário de Publicação */}
          <form onSubmit={handleCriarVaga} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaPlus size={12} className="text-blue-600" /> Publicar Nova Vaga
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Título do Cargo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Programador React"
                  value={novaVaga.titulo}
                  onChange={(e) => setNovaVaga({ ...novaVaga, titulo: e.target.value })}
                  className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vodacom / Startup"
                  value={novaVaga.empresa}
                  onChange={(e) => setNovaVaga({ ...novaVaga, empresa: e.target.value })}
                  className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Localização</label>
                <input
                  type="text"
                  placeholder="Ex: Maputo / Remoto"
                  value={novaVaga.localizacao}
                  onChange={(e) => setNovaVaga({ ...novaVaga, localizacao: e.target.value })}
                  className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Contrato</label>
                <select
                  value={novaVaga.tipo}
                  onChange={(e) => setNovaVaga({ ...novaVaga, tipo: e.target.value })}
                  className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Tempo Inteiro">Tempo Inteiro</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Estágio">Estágio</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição do Cargo *</label>
              <textarea
                rows={3}
                required
                placeholder="Requisitos e responsabilidades da vaga..."
                value={novaVaga.descricao}
                onChange={(e) => setNovaVaga({ ...novaVaga, descricao: e.target.value })}
                className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingVaga}
              className="mt-4 bg-blue-600 text-white text-xs font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loadingVaga ? "A guardar..." : "Publicar Vaga"}
            </button>
          </form>

          {/* Lista de Vagas Existentes */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-md font-bold text-gray-800 mb-4">Vagas Ativas ({vagas.length})</h2>
            {vagas.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma vaga registada no momento.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {vagas.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{v.titulo}</h3>
                      <p className="text-xs text-gray-500">{v.empresa} • {v.localizacao} • <span className="text-blue-600 font-medium">{v.tipo}</span></p>
                    </div>
                    <button
                      onClick={() => handleEliminarVaga(v.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Apagar vaga"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO 2: MODERAÇÃO DE MENSAGENS */}
      {activeTab === "moderacao" && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-md font-bold text-gray-800 mb-4">Mensagens da Comunidade ({mensagens.length})</h2>
          {mensagens.length === 0 ? (
            <p className="text-sm text-gray-400">Sem mensagens enviadas para moderar.</p>
          ) : (
            <div className="space-y-3">
              {mensagens.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-700">{msg.usuarioNome || msg.autor || "Utilizador"}</span>
                      {msg.criadoEm?.toDate && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.criadoEm.toDate()).toLocaleString("pt-PT")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{msg.texto || msg.conteudo || msg.mensagem}</p>
                  </div>
                  <button
                    onClick={() => handleApagarMensagem(msg.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition shrink-0"
                    title="Remover mensagem inapropriada"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}