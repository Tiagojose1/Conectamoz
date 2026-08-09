import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Importação padronizada

export default function StoriesBar({ onOpenAddStory, onSelectStory }) {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Calcula o limite de 24 horas atrás
    const twentyFourHoursAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const q = query(collection(db, 'stories'), where('createdAt', '>=', twentyFourHoursAgo));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Agrupa histórias por autor para evitar duplicar círculos na barra
        const groupedStories = docs.reduce((acc, current) => {
          const key = current.authorId || current.authorName;
          if (!acc[key]) {
            acc[key] = current;
          }
          return acc;
        }, {});

        setStories(Object.values(groupedStories));
      },
      (error) => {
        console.error("Erro ao carregar histórias:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto p-4 bg-white border-b border-gray-200 scrollbar-none select-none">
      {/* Botão de Adicionar História */}
      <div 
        onClick={onOpenAddStory}
        className="flex flex-col items-center cursor-pointer min-w-[70px] group"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500 flex items-center justify-center text-blue-500 text-2xl font-bold group-hover:bg-blue-50 transition-colors">
          +
        </div>
        <span className="text-xs mt-1 text-gray-600 font-medium">Seu Story</span>
      </div>

      {/* Lista de Histórias de Amigos */}
      {stories.map((story) => (
        <div 
          key={story.id} 
          onClick={() => onSelectStory && onSelectStory(story)}
          className="flex flex-col items-center cursor-pointer min-w-[70px] group"
        >
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 group-hover:scale-105 transition-transform">
            <img
              src={story.authorAvatar || "https://via.placeholder.com/150"}
              alt={story.authorName || "Utilizador"}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
          <span className="text-xs mt-1 text-gray-700 truncate w-16 text-center font-medium">
            {story.authorName || "Utilizador"}
          </span>
        </div>
      ))}
    </div>
  );
}