import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limitToLast,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FaPaperPlane, FaComments } from "react-icons/fa";
import BottomNavigation from "../Components/BottomNavigation";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;

  // Função para fazer scroll suave até a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Limita o carregamento às últimas 30 mensagens da comunidade
    const q = query(
      collection(db, "mensagens_comunidade"),
      orderBy("criadoEm", "asc"),
      limitToLast(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(lista);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const textToSend = newMessage;
      setNewMessage(""); // Limpa o input imediatamente para melhor UX

      await addDoc(collection(db, "mensagens_comunidade"), {
        texto: textToSend,
        autorId: currentUser.uid,
        autorNome:
          currentUser.displayName || currentUser.email?.split("@")[0] || "Membro",
        autorFoto: currentUser.photoURL || "",
        criadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 max-w-xl w-full mx-auto flex items-center gap-2 shadow-sm">
        <FaComments className="text-blue-600" size={20} />
        <h2 className="font-bold text-gray-800 text-lg">Chat da Comunidade</h2>
      </div>

      {/* Lista de Mensagens */}
      <main className="max-w-xl w-full mx-auto p-4 flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.autorId === currentUser?.uid;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-gray-400 mb-0.5 px-1">
                {msg.autorNome}
              </span>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border rounded-bl-none shadow-sm"
                }`}
              >
                {msg.texto}
              </div>
            </div>
          );
        })}
        {/* Div invisível para ancorar o auto-scroll */}
        <div ref={messagesEndRef} />
      </main>

      {/* Campo de Envio */}
      <form
        onSubmit={handleSendMessage}
        className="max-w-xl w-full mx-auto p-3 bg-white border-t flex gap-2 items-center sticky bottom-14 z-20"
      >
        <input
          type="text"
          placeholder="Escreve uma mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-600"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition flex items-center justify-center"
        >
          <FaPaperPlane size={14} />
        </button>
      </form>

      <BottomNavigation />
    </div>
  );
}