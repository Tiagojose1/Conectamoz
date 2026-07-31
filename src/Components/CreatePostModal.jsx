import React, { useState, useRef } from "react";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaTimes, FaImage, FaSmile, FaVideo, FaTrash } from "react-icons/fa";

export default function CreatePostModal({ isOpen, onClose }) {
  const [conteudo, setConteudo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const fileInputRef = useRef(null);
  const currentUser = auth.currentUser;

  if (!isOpen) return null;

  // Selecionar imagem do computador/telemóvel
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  // Remover imagem selecionada
  const handleRemoveImage = () => {
    setImagem(null);
    setImagemPreview(null);
  };

  // Enviar Publicação para o Firebase
  const handlePublicar = async (e) => {
    e.preventDefault();
    if ((!conteudo.trim() && !imagem) || !currentUser) return;

    try {
      setCarregando(true);
      let imagemUrl = "";

      // Se houver uma imagem selecionada, faz o upload para o Firebase Storage
      if (imagem) {
        const imageRef = ref(storage, `posts/${Date.now()}_${imagem.name}`);
        const snapshot = await uploadBytes(imageRef, imagem);
        imagemUrl = await getDownloadURL(snapshot.ref);
      }

      // Grava o post na coleção "posts" no Firestore
      await addDoc(collection(db, "posts"), {
        conteudo: conteudo.trim(),
        imagemUrl: imagemUrl, // URL da foto do post
        autorId: currentUser.uid,
        autorNome: currentUser.displayName || currentUser.email.split("@")[0],
        autorFoto: currentUser.photoURL || "",
        criadoEm: serverTimestamp(),
        curtidas: []
      });

      // Limpar estados e fechar modal
      setConteudo("");
      setImagem(null);
      setImagemPreview(null);
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
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

        {/* Corpo do Modal com Scroll */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {/* Informações do Autor */}
          <div className="flex items-center gap-3">
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
          <textarea
            rows="3"
            className="w-full text-sm text-gray-800 placeholder-gray-400 border-none outline-none resize-none"
            placeholder={`Em que estás a pensar, ${currentUser?.displayName || "utilizador"}?`}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
          />

          {/* Pré-visualização da Imagem selecionada */}
          {imagemPreview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 max-h-60">
              <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Botões para anexar ficheiro oculto */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
          />

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <span className="text-xs font-semibold text-gray-600">Adicionar à tua publicação</span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-green-500 hover:bg-gray-100 p-2 rounded-full transition"
              >
                <FaImage size={20} />
              </button>
              <button type="button" className="text-red-500 hover:bg-gray-100 p-2 rounded-full">
                <FaVideo size={20} />
              </button>
              <button type="button" className="text-yellow-500 hover:bg-gray-100 p-2 rounded-full">
                <FaSmile size={20} />
              </button>
            </div>
          </div>

          {/* Botão Submeter */}
          <button
            type="button"
            onClick={handlePublicar}
            disabled={carregando || (!conteudo.trim() && !imagem)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {carregando ? "A publicar imagem..." : "Publicar"}
          </button>
        </div>

      </div>
    </div>
  );
}