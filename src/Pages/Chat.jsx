import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";

export default function Chat() {
  const currentUser = auth.currentUser;
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [mostrandoListaUsuarios, setMostrandoListaUsuarios] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Carregar lista de conversas do utilizador em tempo real
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participantes", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversas(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 2. Carregar mensagens da conversa selecionada em tempo real
  useEffect(() => {
    if (!conversaAtiva) return;

    const q = query(
      collection(db, "chats", conversaAtiva.id, "mensagens"),
      orderBy("criadoEm", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensagens(list);
    });

    return () => unsubscribe();
  }, [conversaAtiva]);

  // Scroll automático para a mensagem mais recente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // Buscar todos os utilizadores para iniciar nova conversa
  const handleAbrirNovaConversa = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const lista = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== currentUser.uid);

      setUsuariosDisponiveis(lista);
      setMostrandoListaUsuarios(true);
    } catch (error) {
      console.error("Erro ao buscar utilizadores:", error);
    }
  };

  // Iniciar ou abrir conversa com um utilizador específico
  const handleIniciarConversaCom = async (outroUsuario) => {
    setMostrandoListaUsuarios(false);

    // Verificar se já existe conversa entre os dois
    const conversaExistente = conversas.find((c) =>
      c.participantes.includes(outroUsuario.uid)
    );

    if (conversaExistente) {
      setConversaAtiva(conversaExistente);
      return;
    }

    // Criar nova conversa no Firestore
    try {
      const meuNome = currentUser.displayName || currentUser.email.split("@")[0];
      const outroNome = outroUsuario.nome || outroUsuario.email.split("@")[0];

      const docRef = await addDoc(collection(db, "chats"), {
        participantes: [currentUser.uid, outroUsuario.uid],
        nomesParticipantes: {
          [currentUser.uid]: meuNome,
          [outroUsuario.uid]: outroNome,
        },
        criadoEm: serverTimestamp(),
      });

      setConversaAtiva({
        id: docRef.id,
        participantes: [currentUser.uid, outroUsuario.uid],
        nomesParticipantes: {
          [currentUser.uid]: meuNome,
          [outroUsuario.uid]: outroNome,
        },
      });
    } catch (error) {
      console.error("Erro ao criar nova conversa:", error);
    }
  };

  // Enviar mensagem
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !conversaAtiva || !currentUser) return;

    try {
      const msgTexto = novaMensagem.trim();
      setNovaMensagem("");

      await addDoc(collection(db, "chats", conversaAtiva.id, "mensagens"), {
        texto: msgTexto,
        enviadoPor: currentUser.uid,
        criadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={currentUser} />

      <main className="max-w-xl mx-auto pt-4 px-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden h-[75vh] flex flex-col">
          {/* Cabeçalho do Chat */}
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h1 className="font-bold text-gray-800 text-base">
              💬{" "}
              {conversaAtiva
                ? conversaAtiva.nomesParticipantes?.[
                    conversaAtiva.participantes.find((id) => id !== currentUser.uid)
                  ] || "Mensagens"
                : "Minhas Conversas"}
            </h1>

            {conversaAtiva ? (
              <button
                onClick={() => setConversaAtiva(null)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Voltar às conversas
              </button>
            ) : (
              <button
                onClick={handleAbrirNovaConversa}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Nova Conversa
              </button>
            )}
          </div>

          {/* Modal / Lista de Utilizadores para Iniciar Conversa */}
          {mostrandoListaUsuarios ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-600">
                  Seleciona alguém para conversar:
                </span>
                <button
                  onClick={() => setMostrandoListaUsuarios(false)}
                  className="text-xs text-red-500 font-semibold"
                >
                  Cancelar
                </button>
              </div>

              {usuariosDisponiveis.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  Nenhum utilizador encontrado.
                </p>
              ) : (
                usuariosDisponiveis.map((u) => (
                  <div
                    key={u.id || u.uid}
                    onClick={() => handleIniciarConversaCom(u)}
                    className="p-3 bg-gray-50 hover:bg-blue-50 border rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">
                        {u.nome || u.email.split("@")[0]}
                      </h4>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-bold">Conversar</span>
                  </div>
                ))
              )}
            </div>
          ) : !conversaAtiva ? (
            /* Área Principal: Lista de Conversas */
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversas.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Ainda não tem nenhuma conversa iniciada.
                  <br />
                  Clica em <strong>+ Nova Conversa</strong> acima!
                </div>
              ) : (
                conversas.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setConversaAtiva(chat)}
                    className="p-3 bg-gray-50 hover:bg-blue-50 border rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">
                        {chat.nomesParticipantes?.[
                          chat.participantes.find((id) => id !== currentUser.uid)
                        ] || "Conversa"}
                      </h3>
                      <p className="text-xs text-gray-500">Clique para abrir a conversa</p>
                    </div>
                    <span className="text-xs text-blue-600 font-bold">➡️</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Janela de Mensagens */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mensagens.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 my-auto">
                    Nenhuma mensagem ainda. Envia a primeira!
                  </p>
                ) : (
                  mensagens.map((msg) => {
                    const eMinha = msg.enviadoPor === currentUser.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${eMinha ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                            eMinha
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          {msg.texto}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Envio */}
              <form onSubmit={handleEnviar} className="p-3 border-t bg-gray-50 flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 p-2.5 text-xs border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!novaMensagem.trim()}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Enviar
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}