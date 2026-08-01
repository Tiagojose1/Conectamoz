import React, { useState } from "react";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaTimes, FaImage, FaVideo, FaSpinner } from "react-icons/fa";

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

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!conteudo.trim() && !mediaFile) return;

    setLoading(true);

    try {
      let mediaUrl = "";

      // Upload do ficheiro (Foto ou Vídeo) para o Firebase Storage se existir
      if (mediaFile && user) {
        const fileRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}_${mediaFile.name}`
        );
        await uploadBytes(fileRef, mediaFile);
        mediaUrl = await getDownloadURL(fileRef);
      }

      // Salvar a publicação no Firestore
      await addDoc(collection(db, "posts"), {
        autorId: user?.uid || "",
        autorNome: user?.displayName || user?.email?.split("@")[0] || "Utilizador",
        autorFoto: user?.photoURL || "",
        conteudo: conteudo,
        imagemUrl: mediaType === "image" ? mediaUrl : "",
        videoUrl: mediaType === "video" ? mediaUrl : "",
        curtidas: [],
        comentarios: [],
        criadoEm: serverTimestamp(),
      });

      // Limpar campos e fechar o modal
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-bold text-gray-800 text-base">Criar Publicação</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handlePublish} className="p-4 space-y-4">
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder={`Em que estás a pensar, ${user?.displayName || "amigo"}?`}
            className="w-full min-h-[120px] p-2 outline-none text-gray-800 text-sm resize-none"
            disabled={loading}
          />

          {/* Pré-visualização de Mídia anexada */}
          {mediaFile && (
            <div className="relative rounded-xl overflow-hidden border bg-gray-50 max-h-48 flex justify-center items-center">
              {mediaType === "image" ? (
                <img 
                  src={URL.createObjectURL(mediaFile)} 
                  alt="Pré-visualização" 
                  className="max-h-48 object-contain"
                />
              ) : (
                <video 
                  src={URL.createObjectURL(mediaFile)} 
                  controls 
                  className="max-h-48"
                />
              )}
              <button
                type="button"
                onClick={() => { setMediaFile(null); setMediaType(null); }}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          {/* Opções de Anexo */}
          <div className="flex items-center justify-between border rounded-xl p-3 bg-gray-50">
            <span className="text-xs font-semibold text-gray-600">Adicionar à publicação:</span>
            
            <div className="flex items-center gap-2">
              {/* Carregar Foto */}
              <label className="cursor-pointer text-green-600 hover:bg-green-50 p-2 rounded-full transition">
                <FaImage size={20} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, "image")}
                  disabled={loading}
                />
              </label>

              {/* Carregar Vídeo / Reels */}
              <label className="cursor-pointer text-purple-600 hover:bg-purple-50 p-2 rounded-full transition">
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

          {/* Botão de Submeter */}
          <button
            type="submit"
            disabled={loading || (!conteudo.trim() && !mediaFile)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>A publicar...</span>
              </>
            ) : (
              "Publicar"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}