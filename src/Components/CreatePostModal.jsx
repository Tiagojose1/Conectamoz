import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaTimes, FaImage, FaSmile, FaVideo } from "react-icons/fa";

export default function CreatePostModal({ isOpen, onClose }) {
  const [conteudo, setConteudo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const currentUser = auth.currentUser;

  if (!isOpen) return null;

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!conteudo.trim() || !currentUser) return;

    try {
      setCarregando(true);
      await addDoc(collection(db, "posts"), {
        conteudo: conteudo.trim(),
        autorId: currentUser.uid,
        autorNome: currentUser.displayName || currentUser.email.split("@")[0],
        criadoEm: serverTimestamp(),
        curtidas: []
      });

      setConteudo("");
      onClose();
    } catch (error) {
      console.error("Erro ao criar publicação:", error);
    } finally {
      setCarregando(false);
    }
  };

  const userInitial = currentUser?.displayName 
    ? currentUser.displayName[0].toUpperCase() 
    : (currentUser?.email ? currentUser.email[0].toUpperCase() : "U");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 text-base text-center flex-1">Criar publicação</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Informações do Autor */}
        <div className="p-4 flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Perfil" 
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {userInitial}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {currentUser?.displayName || currentUser?.email?.split("@")[0]}
            </h4>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
              Público
            </span>
          </div>
        </div>

        {/* Campo de Texto */}
        <form onSubmit={handlePublicar} className="p-4 pt-0 flex-1 flex flex-col">
          <textarea
            rows="4"
            className="w-full text-sm text-gray-800 placeholder-gray-400 border-none outline-none resize-none"
            placeholder={`Em que estás a pensar, ${currentUser?.displayName || "utilizador"}?`}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
          />

          {/* Opções Anexos */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg my-3">
            <span className="text-xs font-semibold text-gray-600">Adicionar à tua publicação</span>
            <div className="flex gap-2">
              <button type="button" className="text-green-500 hover:bg-gray-100 p-2 rounded-full">
                <FaImage size={18} />
              </button>
              <button type="button" className="text-red-500 hover:bg-gray-100 p-2 rounded-full">
                <FaVideo size={18} />
              </button>
              <button type="button" className="text-yellow-500 hover:bg-gray-100 p-2 rounded-full">
                <FaSmile size={18} />
              </button>
            </div>
          </div>

          {/* Botão Submeter */}
          <button
            type="submit"
            disabled={carregando || !conteudo.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {carregando ? "A publicar..." : "Publicar"}
          </button>
        </form>

      </div>
    </div>
  );
}