import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../Firebase';

export default function PostCard({ id, author, content, likes = [] }) {
  const currentUser = auth.currentUser;
  const [jaCurtiu, setJaCurtiu] = useState(false);
  const [qtdCurtidas, setQtdCurtidas] = useState(likes.length);

  useEffect(() => {
    if (currentUser) {
      setJaCurtiu(likes.includes(currentUser.uid));
    }
    setQtdCurtidas(likes.length);
  }, [likes, currentUser]);

  const handleToggleLike = async () => {
    if (!currentUser || !id) return;
    const postRef = doc(db, 'posts', id);

    try {
      if (jaCurtiu) {
        // Remove o ID do usuário da array de curtidas
        setJaCurtiu(false);
        setQtdCurtidas((prev) => prev - 1);
        await updateDoc(postRef, {
          curtidas: arrayRemove(currentUser.uid)
        });
      } else {
        // Adiciona o ID do usuário na array de curtidas
        setJaCurtiu(true);
        setQtdCurtidas((prev) => prev + 1);
        await updateDoc(postRef, {
          curtidas: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar curtida:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
      {/* Cabeçalho do Post */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {author ? author.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{author}</h3>
          <p className="text-xs text-gray-400">Publicado recentemente</p>
        </div>
      </div>

      {/* Conteúdo do Post */}
      <p className="text-gray-700 text-sm leading-relaxed">{content}</p>

      {/* Linha Divisória */}
      <hr className="border-gray-100" />

      {/* Botões de Interação */}
      <div className="flex items-center justify-between text-gray-500 text-sm pt-1">
        <button 
          onClick={handleToggleLike}
          className={`flex items-center space-x-1 font-medium transition ${
            jaCurtiu ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
          }`}
        >
          <span>{jaCurtiu ? '👍 Curtido' : '👍 Curtir'}</span>
          <span>({qtdCurtidas})</span>
        </button>

        <button className="hover:text-blue-600 font-medium">
          💬 Comentar
        </button>
      </div>
    </div>
  );
}
