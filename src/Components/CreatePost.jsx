import React, { useState } from "react";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaImage, FaVideo, FaSpinner, FaTrash } from "react-icons/fa";

export default function CreatePost({ onPostCreated }) {
  const [conteudo, setConteudo] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" ou "video"
  const [loading, setLoading] = useState(false);

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
      let mediaUrl = "";

      // Upload da Imagem ou Vídeo no Firebase Storage
      if (mediaFile && user) {
        const folder = mediaType === "video" ? "videos" : "images";
        const fileRef = ref(
          storage,
          `posts/${folder}/${user.uid}_${Date.now()}_${mediaFile.name}`
        );
        await uploadBytes(fileRef, mediaFile);
        mediaUrl = await getDownloadURL(fileRef);
      }

      // Guardar a publicação no Firestore com imagemUrl e videoUrl
      await addDoc(collection(db, "posts"), {
        autorId: user?.uid || "",
        autorNome: user?.displayName || user?.email?.split("@")[0] || "Utilizador",
        autorFoto: user?.photoURL || "",
        conteudo: conteudo.trim(),
        imagemUrl: mediaType === "image" ? mediaUrl : "",
        videoUrl: mediaType === "video" ? mediaUrl : "",
        curtidas: [],
        comentarios: [],
        criadoEm: serverTimestamp(),
      });

      // Limpar campos
      setConteudo("");
      setMediaFile(null);
      setMediaType(null);
      setLoading(false);

      if (onPostCreated) onPostCreated();
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
      {/* Cabeçalho / Perfil */}
      <div className="flex items-start gap-3 mb-3">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Perfil"
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
            {userInitial}
          </div>
        )}

        <textarea
          rows="2"
          disabled={loading}
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 border-none outline-none resize-none pt-2"
          placeholder={`Em que estás a pensar, ${user?.displayName || "amigo"}?`}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
      </div>

      {/* Pré-visualização da Mídia selecionada */}
      {mediaFile && (
        <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-200 bg-black/5 max-h-60 flex justify-center items-center">
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
            <FaTrash size={12} />
          </button>
        </div>
      )}

      {/* Opções e Botão de Envio */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Botão para carregar Imagem */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">
            <FaImage size={18} className="text-green-500" />
            <span>Foto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "image")}
              disabled={loading}
            />
          </label>

          {/* Botão para carregar Vídeo */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">
            <FaVideo size={18} className="text-purple-500" />
            <span>Vídeo</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "video")}
              disabled={loading}
            />
          </label>
        </div>

        {/* Botão Publicar */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={loading || (!conteudo.trim() && !mediaFile)}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
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
      </div>
    </div>
  );
}