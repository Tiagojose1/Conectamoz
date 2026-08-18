import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy,
  limit 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { 
  FaBriefcase, 
  FaComments, 
  FaTrash, 
  FaPlus, 
  FaShieldAlt, 
  FaArrowUp, 
  FaChartLine, 
  FaCog, 
  FaQuestionCircle,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle
} from "react-icons/fa";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState("vagas");

  // Estados de dados
  const [vagas, setVagas] = useState([]);
  const [mensagens, setMensagens] = useState([]);

  // Estados de Pesquisa
  const [searchVagas, setSearchVagas] = useState("");
  const [searchMensagens, setSearchMensagens] = useState("");

  // Estado para Notificações (Toast)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Estado do formulário de vaga
  const [novaVaga, setNovaVaga] = useState({
    titulo: "",
    empresa: "",
    localizacao: "Maputo",
    descricao: "",
    tipo: "Tempo Inteiro"
  });
  const [loadingVaga, setLoadingVaga] = useState(false);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // 1. Verificação de permissões de Administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsAdmin(false);
        setLoadingAuth(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data()?.isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Erro ao verificar permissão admin:", err);
        setIsAdmin(false);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAdminStatus();
  }, []);

  // 2. Escuta Firestore com limite (20 itens)
  useEffect(() => {
    if (!isAdmin) return;

    const qVagas = query(collection(db, "vagas"), orderBy("criadoEm", "desc"), limit(20));
    const unsubVagas = onSnapshot(qVagas, (snapshot) => {
      setVagas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const qMensagens = query(collection(db, "mensagens_comunidade"), orderBy("criadoEm", "desc"), limit(20));
    const unsubMensagens = onSnapshot(qMensagens, (snapshot) => {
      setMensagens(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubVagas();
      unsubMensagens();
    };
  }, [isAdmin]);

  const handleCriarVaga = async (e) => {
    e.preventDefault();
    if (!novaVaga.titulo || !novaVaga.empresa || !novaVaga.descricao) {
      triggerToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    try {
      setLoadingVaga(true);
      await addDoc(collection(db, "vagas"), {
        ...novaVaga,
        criadoEm: serverTimestamp()
      });

      setNovaVaga({
        titulo: "",
        empresa: "",
        localizacao: "Maputo",
        descricao: "",
        tipo: "Tempo Inteiro"
      });
      triggerToast("Vaga publicada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao publicar vaga:", error);
      triggerToast("Erro ao publicar a vaga.", "error");
    } finally {
      setLoadingVaga(false);
    }
  };

  const handleEliminarVaga = async (id) => {
    if (window.confirm("Deseja eliminar esta vaga?")) {
      try {
        await deleteDoc(doc(db, "vagas", id));
        triggerToast("Vaga eliminada com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao eliminar vaga:", error);
        triggerToast("Erro ao eliminar a vaga.", "error");
      }
    }
  };

  const handleApagarMensagem = async (id) => {
    if (window.confirm("Deseja remover esta mensagem?")) {
      try {
        await deleteDoc(doc(doc(db, "mensagens_comunidade", id)));
        triggerToast("Mensagem removida com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao eliminar mensagem:", error);
        triggerToast("Erro ao eliminar a mensagem.", "error");
      }
    }
  };

  // Filtros aplicados em tempo de execução
  const vagasFiltradas = vagas.filter(
    (v) =>
      v.titulo?.toLowerCase().includes(searchVagas.toLowerCase()) ||
      v.empresa?.toLowerCase().includes(searchVagas.toLowerCase())
  );

  const mensagensFiltradas = mensagens.filter(
    (m) =>
      (m.texto || m.conteudo || m.mensagem || "").toLowerCase().includes(searchMensagens.toLowerCase()) ||
      (m.usuarioNome || m.autor || "").toLowerCase().includes(searchMensagens.toLowerCase())
  );

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-xs font-semibold text-gray-500">A verificar permissões...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center space-y-3">
        <FaExclamationTriangle className="text-red-500 text-3xl mx-auto" />
        <h2 className="text-base font-bold text-gray-800">Acesso Restrito</h2>
        <p className="text-xs text-gray-500">
          Não tem permissões de administrador para aceder a esta área.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-white text-xs font-bold transition ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <FaCheckCircle size={14} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. CABEÇALHO */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Painel Profissional</h1>
          <p className="text-xs text-gray-500">Modo Administrador Ativo</p>
        </div>
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <FaChartLine size={20} />
        </div>
      </div>

      {/* 2. MÉTRICAS DINÂMICAS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <h2 className="text-sm font-bold text-gray-800">Análise do Sistema</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500">Total Vagas (Lote)</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-gray-800">{vagas.length}</span>
              <FaBriefcase className="text-blue-500 text-xs" />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500">Mensagens Ativas</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-gray-800">{mensagens.length}</span>
              <FaComments className="text-green-500 text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SELEÇÃO DE ABAS */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl overflow-hidden p-1 shadow-sm">
        <button
          onClick={() => setActiveTab("vagas")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-bold text-xs rounded-xl transition ${
            activeTab === "vagas" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FaBriefcase size={14} /> Vagas
        </button>
        <button
          onClick={() => setActiveTab("moderacao")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-bold text-xs rounded-xl transition ${
            activeTab === "moderacao" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FaComments size={14} /> Moderação
        </button>
      </div>

      {/* 4. CONTEÚDO VAGAS */}
      {activeTab === "vagas" && (
        <div className="space-y-4">
          <form onSubmit={handleCriarVaga} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FaPlus size={12} className="text-blue-600" /> Publicar Nova Vaga
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Título do Cargo *"
                value={novaVaga.titulo}
                onChange={(e) => setNovaVaga({ ...novaVaga, titulo: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                required
                placeholder="Empresa *"
                value={novaVaga.empresa}
                onChange={(e) => setNovaVaga({ ...novaVaga, empresa: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Localização"
                value={novaVaga.localizacao}
                onChange={(e) => setNovaVaga({ ...novaVaga, localizacao: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <select
                value={novaVaga.tipo}
                onChange={(e) => setNovaVaga({ ...novaVaga, tipo: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="Tempo Inteiro">Tempo Inteiro</option>
                <option value="Part-time">Part-time</option>
                <option value="Estágio">Estágio</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <textarea
              rows={2}
              required
              placeholder="Descrição do Cargo *"
              value={novaVaga.descricao}
              onChange={(e) => setNovaVaga({ ...novaVaga, descricao: e.target.value })}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loadingVaga}
              className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loadingVaga ? "A guardar..." : "Publicar Vaga"}
            </button>
          </form>

          {/* LISTA + PESQUISA DE VAGAS */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-gray-800">Vagas Registadas</h2>
              <div className="relative flex-1 max-w-[180px]">
                <FaSearch size={10} className="absolute left-2.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchVagas}
                  onChange={(e) => setSearchVagas(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            {vagasFiltradas.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma vaga encontrada.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {vagasFiltradas.map((v) => (
                  <div key={v.id} className="py-2 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-gray-800">{v.titulo}</h3>
                      <p className="text-[11px] text-gray-500">{v.empresa} • {v.localizacao} • <span className="text-blue-600 font-semibold">{v.tipo}</span></p>
                    </div>
                    <button
                      onClick={() => handleEliminarVaga(v.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CONTEÚDO MODERAÇÃO */}
      {activeTab === "moderacao" && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-800">Moderação de Conteúdos</h2>
            <div className="relative flex-1 max-w-[180px]">
              <FaSearch size={10} className="absolute left-2.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchMensagens}
                onChange={(e) => setSearchMensagens(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          {mensagensFiltradas.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhuma mensagem encontrada.</p>
          ) : (
            <div className="space-y-2">
              {mensagensFiltradas.map((msg) => (
                <div key={msg.id} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block mb-0.5">{msg.usuarioNome || msg.autor || "Utilizador"}</span>
                    <p className="text-xs text-gray-600 leading-tight">{msg.texto || msg.conteudo || msg.mensagem}</p>
                  </div>
                  <button
                    onClick={() => handleApagarMensagem(msg.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition shrink-0"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. OUTRAS OPÇÕES */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
        <h2 className="text-sm font-bold text-gray-800">Outras Opções</h2>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition">
            <FaCog className="text-gray-500" /> Definições
          </button>
          <button className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition">
            <FaQuestionCircle className="text-gray-500" /> Apoio
          </button>
        </div>
      </div>
    </div>
  );
}