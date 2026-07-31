import React from "react";
import { FaPlus } from "react-icons/fa";

export default function Stories() {
  // Dados de exemplo para renderizar as histórias
  const storiesData = [
    { id: 1, name: "Alcidio Dolane", image: "https://via.placeholder.com/150", avatar: "https://via.placeholder.com/40" },
    { id: 2, name: "Abudo Grajuti", image: "https://via.placeholder.com/150", avatar: "https://via.placeholder.com/40" },
    { id: 3, name: "Anélia José", image: "https://via.placeholder.com/150", avatar: "https://via.placeholder.com/40" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide my-2">
      {/* Cartão de Criar História */}
      <div className="relative min-w-[105px] h-40 rounded-xl overflow-hidden shadow bg-white flex flex-col justify-between cursor-pointer flex-shrink-0 group">
        <div className="h-3/4 bg-gray-200 overflow-hidden">
          <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            TJ
          </div>
        </div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center text-white">
          <FaPlus size={12} />
        </div>
        <div className="h-1/4 bg-white flex items-end justify-center pb-1">
          <span className="text-[11px] font-semibold text-gray-800">Criar história</span>
        </div>
      </div>

      {/* Cartões de Histórias dos Amigos */}
      {storiesData.map((story) => (
        <div 
          key={story.id} 
          className="relative min-w-[105px] h-40 rounded-xl overflow-hidden shadow cursor-pointer flex-shrink-0 bg-gray-800 group"
        >
          {/* Fundo da História */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10" />
          
          {/* Foto de Perfil no Topo Esquerdo */}
          <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full border-2 border-blue-600 overflow-hidden bg-gray-300">
            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">
              {story.name[0]}
            </div>
          </div>

          {/* Nome no Rodapé */}
          <span className="absolute bottom-2 left-2 right-2 z-20 text-white text-[11px] font-semibold leading-tight drop-shadow">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}