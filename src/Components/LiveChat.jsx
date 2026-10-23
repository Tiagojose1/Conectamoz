import React, { useState } from "react";
import {
  FaPaperPlane,
  FaSmile,
  FaUserCircle,
  FaHeart,
} from "react-icons/fa";

export default function LiveChat() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Carlos",
      text: "Excelente transmissão! 🔥",
      time: "agora",
    },
    {
      id: 2,
      user: "Maria",
      text: "Estou a acompanhar daqui. 👏",
      time: "agora",
    },
    {
      id: 3,
      user: "João",
      text: "Muito bom conteúdo!",
      time: "agora",
    },
    {
      id: 4,
      user: "Ana",
      text: "KonnexVib está cada vez melhor ❤️",
      time: "agora",
    },
  ]);

  const [likedMessage, setLikedMessage] = useState(null);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text) return;

    const newMessage = {
      id: Date.now(),
      user: "Tu",
      text,
      time: "agora",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setMessage("");
  };

  const handleLikeMessage = (id) => {
    setLikedMessage((current) =>
      current === id ? null : id
    );
  };

  return (
    <section className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER DO CHAT */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div>
          <h2 className="text-sm font-black text-gray-900">
            💬 Chat ao vivo
          </h2>

          <p className="mt-0.5 text-[10px] text-gray-500">
            Participa na conversa
          </p>
        </div>

        <div className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-[#635BFF]">
          {messages.length} mensagens
        </div>
      </div>

      {/* LISTA DE MENSAGENS */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((item) => {
          const isLiked = likedMessage === item.id;

          return (
            <div
              key={item.id}
              className="flex items-start gap-2.5"
            >
              {/* AVATAR */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <FaUserCircle size={20} />
              </div>

              {/* CONTEÚDO */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-black text-gray-900">
                    {item.user}
                  </p>

                  <span className="text-[9px] text-gray-400">
                    {item.time}
                  </span>
                </div>

                <div className="mt-1 flex items-end gap-2">
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-gray-100 px-3 py-2">
                    <p className="break-words text-xs leading-5 text-gray-700">
                      {item.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleLikeMessage(item.id)
                    }
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                      isLiked
                        ? "bg-red-50 text-red-500"
                        : "text-gray-300 hover:bg-gray-100 hover:text-red-400"
                    }`}
                    aria-label="Gostar do comentário"
                    title="Gostar"
                  >
                    <FaHeart
                      size={11}
                      className={
                        isLiked ? "fill-current" : ""
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CAMPO DE MENSAGEM */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 bg-white p-3"
      >
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
          {/* EMOJI */}
          <button
            type="button"
            onClick={() =>
              setMessage((current) => `${current} 😊`)
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-white hover:text-[#635BFF]"
            aria-label="Adicionar emoji"
            title="Emoji"
          >
            <FaSmile size={17} />
          </button>

          {/* INPUT */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreve um comentário..."
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs text-gray-800 outline-none placeholder:text-gray-400"
            maxLength={300}
          />

          {/* ENVIAR */}
          <button
            type="submit"
            disabled={!message.trim()}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
              message.trim()
                ? "bg-[#635BFF] text-white hover:bg-[#5148e5] active:scale-95"
                : "bg-gray-200 text-gray-400"
            }`}
            aria-label="Enviar comentário"
            title="Enviar comentário"
          >
            <FaPaperPlane size={13} />
          </button>
        </div>

        <p className="mt-2 text-center text-[9px] text-gray-400">
          Sê respeitoso com os outros participantes.
        </p>
      </form>
    </section>
  );
}