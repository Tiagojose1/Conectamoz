import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import BottomNavigation from "../Components/BottomNavigation";
import { FaPaperPlane, FaPlus, FaArrowLeft, FaUserCircle } from "react-icons/fa";

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

      // Ordena por mensagem mais recente no cliente com fallback seguro
      list.sort((a, b) => {
        const timeA = a.ultimaMensagemEm?.toMillis ? a.ultimaMensagemEm.toMillis() : 0;
        const timeB = b.ultimaMensagemEm?.toMillis ? b.ultimaMensagemEm.toMillis() : 0;
        return timeB - timeA;
      });

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
    if (!currentUser) return;
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const lista = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => (u.uid || u.id) !== currentUser.uid);

      setUsuariosDisponiveis(lista);
      setMostrandoListaUsuarios(true);
    } catch (error) {
      console.error("Erro ao buscar utilizadores:", error);
    }
  };

  // Iniciar ou abrir conversa com um utilizador específico
  const handleIniciarConversaCom = async (outroUsuario) => {
    if (!currentUser) return;
    setMostrandoListaUsuarios(false);
    const targetUid = outroUsuario.uid || outroUsuario.id;

    // Verificar se já existe conversa entre os dois
    const conversaExistente = conversas.find((c) =>
      c.participantes?.includes(targetUid)
    );

    if (conversaExistente) {
      setConversaAtiva(conversaExistente);
      return;
    }

    // Criar nova conversa no Firestore
    try {
      const meuNome = currentUser.displayName || currentUser.email?.split("@")[0] || "Utilizador";
      const outroNome = outroUsuario.nome || outroUsuario.displayName || outroUsuario.email?.split("@")[0] || "Contacto";
      const fotoOutro = outroUsuario.fotoPerfil || outroUsuario.photoURL || "";

      const docRef = await addDoc(collection(db, "chats"), {
        participantes: [currentUser.uid, targetUid],
        nomesParticipantes: {
          [currentUser.uid]: meuNome,
          [targetUid]: outroNome,
        },
        fotosParticipantes: {
          [targetUid]: fotoOutro,
        },
        criadoEm: serverTimestamp(),
        ultimaMensagem: "",
        ultimaMensagemEm: serverTimestamp(),
      });

      setConversaAtiva({
        id: docRef.id,
        participantes: [currentUser.uid, targetUid],
        nomesParticipantes: {
          [currentUser.uid]: meuNome,
          [targetUid]: outroNome,
        },
        fotosParticipantes: {
          [targetUid]: fotoOutro,
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

      // 1. Adiciona a mensagem à subcoleção
      await addDoc(collection(db, "chats", conversaAtiva.id, "mensagens"), {
        texto: msgTexto,
        enviadoPor: currentUser.uid,
        criadoEm: serverTimestamp(),
      });

      // 2. Atualiza o documento pai com a última mensagem
      const chatRef = doc(db, "chats", conversaAtiva.id);
      await updateDoc(chatRef, {
        ultimaMensagem: msgTexto,
        ultimaMensagemEm: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const formatarHora = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <main className="max-w-xl mx-auto pt-4 px-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden h-[78vh] flex flex-col">
          
          {/* Cabeçalho do Chat */}
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            {conversaAtiva ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConversaAtiva(null)}
                  className="text-gray-600 hover:text-black p-1 rounded-full"
                >
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span>💬</span>
                  {conversaAtiva.nomesParticipantes?.[
                    conversaAtiva.participantes?.find((id) => id !== currentUser?.uid)
                  ] || "Conversa"}
                </h1>
              </div>
            ) : (
              <>
                <h1 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <span>💬</span> Minhas Conversas
                </h1>
                {!mostrandoListaUsuarios && (
                  <button
                    onClick={handleAbrirNovaConversa}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <FaPlus size={10} /> Nova Conversa
                  </button>
                )}
              </>
            )}
          </div>

          {/* Modal / Lista de Utilizadores para Iniciar Conversa */}
          {mostrandoListaUsuarios ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Seleciona um contacto:
                </span>
                <button
                  onClick={() => setMostrandoListaUsuarios(false)}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Cancelar
                </button>
              </div>

              {usuariosDisponiveis.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  Nenhum utilizador disponível no momento.
                </p>
              ) : (
                usuariosDisponiveis.map((u) => (
                  <div
                    key={u.id || u.uid}
                    onClick={() => handleIniciarConversaCom(u)}
                    className="p-3 bg-gray-50 hover:bg-blue-50 border rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {u.fotoPerfil || u.photoURL ? (
                        <img
                          src={u.fotoPerfil || u.photoURL}
                          alt="Perfil"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-300" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">
                          {u.nome || u.displayName || u.email?.split("@")[0]}
                        </h4>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2.5 py-1 rounded-lg">
                      Conversar
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : !conversaAtiva ? (
            /* Área Principal: Lista de Conversas */
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversas.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-xs">
                  Ainda não tens nenhuma conversa iniciada.
                  <br />
                  Clica em <strong>+ Nova Conversa</strong> acima para começar!
                </div>
              ) : (
                conversas.map((chat) => {
                  const outroId = chat.participantes?.find((id) => id !== currentUser?.uid);
                  const nomeOutro = chat.nomesParticipantes?.[outroId] || "Contacto";
                  const fotoOutro = chat.fotosParticipantes?.[outroId];

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setConversaAtiva(chat)}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border rounded-xl cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {fotoOutro ? (
                          <img
                            src={fotoOutro}
                            alt={nomeOutro}
                            className="w-11 h-11 rounded-full object-cover border"
                          />
                        ) : (
                          <FaUserCircle className="w-11 h-11 text-gray-300" />
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-gray-800">{nomeOutro}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {chat.ultimaMensagem || "Clica para abrir a conversa"}
                          </p>
                        </div>
                      </div>

                      {chat.ultimaMensagemEm && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatarHora(chat.ultimaMensagemEm)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Janela de Mensagens */
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gray-50/50">
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mensagens.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 my-auto py-12">
                    Nenhuma mensagem ainda. Envia a primeira!
                  </p>
                ) : (
                  mensagens.map((msg) => {
                    const eMinha = currentUser && msg.enviadoPor === currentUser.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${eMinha ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] p-3 rounded-2xl text-xs shadow-sm ${
                            eMinha
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 border rounded-bl-none"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.texto}</p>
                          {msg.criadoEm && (
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                eMinha ? "text-blue-200" : "text-gray-400"
                              }`}
                            >
                              {formatarHora(msg.criadoEm)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Envio */}
              <form onSubmit={handleEnviar} className="p-3 border-t bg-white flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Escreve uma mensagem..."
                  className="flex-1 p-3 text-xs border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!novaMensagem.trim()}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                >
                  <FaPaperPlane size={12} />
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