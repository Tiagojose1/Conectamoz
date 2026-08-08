import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function StoriesBar({ onOpenAddStory }) {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Filtra histórias criadas nas últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const q = query(collection(db, 'stories'), where('createdAt', '>=', twentyFourHoursAgo));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto p-4 bg-white border-b border-gray-200 scrollbar-none">
      {/* Botão de Adicionar História */}
      <div 
        onClick={onOpenAddStory}
        className="flex flex-col items-center cursor-pointer min-w-[70px]"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500 flex items-center justify-center text-blue-500 text-2xl font-bold">
          +
        </div>
        <span className="text-xs mt-1 text-gray-600">Seu Story</span>
      </div>

      {/* Lista de Histórias */}
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center cursor-pointer min-w-[70px]">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
            <img
              src={story.authorAvatar || "https://via.placeholder.com/150"}
              alt={story.authorName}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
          <span className="text-xs mt-1 text-gray-700 truncate w-16 text-center">
            {story.authorName}
          </span>
        </div>
      ))}
    </div>
  );
}