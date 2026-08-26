import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { FaPlus } from "react-icons/fa";

export default function StoriesBar({ onOpenCreateStory, onSelectStory }) {
  const [stories, setStories] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("criadoEm", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStories(lista);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full bg-white p-3 rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      {/* Scroll Horizontal de Stories */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        
        {/* CARD 1: Criar Story (Estilo Facebook) */}
        <div
          onClick={onOpenCreateStory}
          className="relative min-w-[105px] w-[105px] h-[170px] rounded-xl overflow-hidden shadow cursor-pointer group bg-gray-100 flex-shrink-0 border border-gray-200 hover:opacity-90 transition"
        >
          {/* Foto de Perfil do Utilizador no Fundo */}
          <img
            src={user?.photoURL || "https://via.placeholder.com/150"}
            alt="Seu Perfil"
            className="w-full h-[115px] object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Botão com Ícone (+) */}
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md z-10">
            <FaPlus size={14} />
          </div>
          {/* Texto de fundo */}
          <div className="w-full h-[55px] bg-white pt-4 pb-1 text-center">
            <span className="text-[11px] font-semibold text-gray-800 block leading-tight">
              Criar história
            </span>
          </div>
        </div>

        {/* CARDS DOS OUTROS MEMBROS */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory && onSelectStory(story)}
            className="relative min-w-[105px] w-[105px] h-[170px] rounded-xl overflow-hidden shadow cursor-pointer group flex-shrink-0 border border-gray-200 hover:scale-[1.02] transition-transform duration-200"
          >
            {/* Imagem Principal da História */}
            {story.imagemUrl || story.midiaUrl ? (
              <img
                src={story.imagemUrl || story.midiaUrl}
                alt={story.autorNome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-2 text-white text-xs font-semibold text-center">
                {story.texto || "História"}
              </div>
            )}

            {/* Sombra de Gradiente para legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>

            {/* Foto de Avatar do Autor com Borda Azul */}
            <div className="absolute top-2 left-2 w-9 h-9 rounded-full border-2 border-blue-600 overflow-hidden shadow-md">
              <img
                src={story.autorFoto || "https://via.placeholder.com/100"}
                alt={story.autorNome}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nome do Autor na parte inferior */}
            <span className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-semibold truncate drop-shadow">
              {story.autorNome || "Membro"}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}