import React, { useState } from "react";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";
import CreatePostModal from "./CreatePostModal";

export default function CreatePost({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userPhoto = user?.photoURL;
  const userInitial = user?.displayName ? user.displayName[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : "U");

  return (
    <>
      <div className="bg-white rounded-lg shadow p-3 mb-4">
        {/* Linha Superior */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt="Perfil" 
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
              <span>{userInitial}</span>
            </div>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left rounded-full px-4 py-2 text-sm transition cursor-pointer"
          >
            Em que estás a pensar?
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-green-500 hover:bg-gray-100 p-2 rounded-full"
          >
            <FaImage size={20} />
          </button>
        </div>

        {/* Linha Inferior */}
        <div className="flex justify-around pt-2 text-gray-600 text-xs font-semibold">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg flex-1 justify-center">
            <FaVideo className="text-red-500" size={16} />
            <span>Em direto</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg flex-1 justify-center">
            <FaImage className="text-green-500" size={16} />
            <span>Foto/vídeo</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 hover:bg-gray-100 p-2 rounded-lg flex-1 justify-center">
            <FaSmile className="text-yellow-500" size={16} />
            <span>Sentimento</span>
          </button>
        </div>
      </div>

      {/* Modal de Publicação */}
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}