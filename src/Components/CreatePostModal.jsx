import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadParaCloudinary } from "../Utils/Cloudinary";
import { FaTimes, FaImage, FaVideo, FaSpinner, FaTrash } from "react-icons/fa";

export default function CreatePostModal({ isOpen, onClose }) {
  const [conteudo, setConteudo] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" ou "video"
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const user = auth.currentUser;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaType(null);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!conteudo.trim() && !mediaFile) return;

    setLoading(true);

    try {
      let uploadedUrl = "";

      // 1. Upload do ficheiro para o Cloudinary (em vez do Firebase Storage)
      if (mediaFile) {
        uploadedUrl = await uploadParaCloudinary(mediaFile);
      }

      // 2. Salvar a publicação no Firestore com a URL gerada
      await addDoc(collection(db, "posts"), {
        autorId: user?.uid || "",
        autorNome: user?.displayName || user?.email?.split("@")[0] || "Utilizador",
        autorFoto: user?.photoURL || "",
        conteudo: conteudo.trim(),
        content: conteudo.trim(), // Garante compatibilidade caso o teu Feed leia "content"
        imagemUrl: mediaType === "image" ? uploadedUrl : "",
        videoUrl: mediaType === "video" ? uploadedUrl : "",
        curtidas: [],
        comentarios: [],
        criadoEm: serverTimestamp(),
      });

      // 3. Limpar campos e fechar o modal
      setConteudo("");
      setMediaFile(null);
      setMediaType(null);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Erro ao criar publicação. Tenta novamente!");
      setLoading(false);
    }
  };

  const userInitial = user?.displayName
    ? user.displayName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 text-base text-center flex-1">Criar publicação</h3>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {/* Informações do Autor */}
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
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
                {user?.displayName || user?.email?.split("@")[0] || "Utilizador"}
              </h4>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                Público
              </span>
            </div>
          </div>

          {/* Campo de Texto */}
          <textarea
            rows="3"
            disabled={loading}
            className="w-full text-sm text-gray-800 placeholder-gray-400 border-none outline-none resize-none"
            placeholder={`Em que estás a pensar, ${user?.displayName || "amigo"}?`}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
          />

          {/* Pré-visualização de Imagem / Vídeo */}
          {mediaFile && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 max-h-60 flex justify-center items-center">
              {mediaType === "image" ? (
                <img 
                  src={URL.createObjectURL(mediaFile)} 
                  alt="Pré-visualização" 
                  className="max-h-60 object-contain w-full"
                />
              ) : (
                <video 
                  src={URL.createObjectURL(mediaFile)} 
                  controls 
                  className="max-h-60 w-full"
                />
              )}
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
            <span className="text-xs font-semibold text-gray-600">Adicionar à tua publicação</span>
            <div className="flex items-center gap-2">
              {/* Botão de Foto */}
              <label className="cursor-pointer text-green-600 hover:bg-green-100 p-2 rounded-full transition">
                <FaImage size={20} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, "image")}
                  disabled={loading}
                />
              </label>

              {/* Botão de Vídeo */}
              <label className="cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition">
                <FaVideo size={20} />
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, "video")}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading || (!conteudo.trim() && !mediaFile)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>A publicar {mediaType === "video" ? "vídeo..." : "publicação..."}</span>
              </>
            ) : (
              "Publicar"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}