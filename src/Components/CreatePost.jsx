import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadParaCloudinary } from "../Utils/Cloudinary";
import {
  FaImage,
  FaVideo,
  FaSpinner,
  FaTrash,
  FaMagic,
  FaCrop,
  FaCrown,
  FaLock,
} from "react-icons/fa";

export default function CreatePost({ onPostCreated }) {
  const [conteudo, setConteudo] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado da conta (Pode vir do perfil Firestore futuramente: e.g., userProfile.isPremium)
  const [isUserPremium, setIsUserPremium] = useState(false);

  // Estados de Edição
  const [filtro, setFiltro] = useState("normal");
  const [aspectRatio, setAspectRatio] = useState("auto");

  const user = auth.currentUser;

  // Lista de Filtros (Gratuitos e Premium)
  const listaFiltros = [
    { id: "normal", nome: "Normal", premium: false },
    { id: "pb", nome: "P&B", premium: false },
    { id: "sepia", nome: "Sépia", premium: false },
    { id: "vintage", nome: "Vintage", premium: true },
    { id: "cyberpunk", nome: "Cyberpunk", premium: true },
    { id: "cartoon", nome: "Desenho 3D", premium: true },
  ];

  // Lista de Formatos de Corte
  const listaFormatos = [
    { id: "auto", nome: "Original", premium: false },
    { id: "1:1", nome: "1:1", premium: false },
    { id: "16:9", nome: "16:9", premium: false },
    { id: "9:16", nome: "Reels 9:16", premium: true },
  ];

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      setFiltro("normal");
      setAspectRatio("auto");
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    setFiltro("normal");
    setAspectRatio("auto");
  };

  const selecionarFiltro = (item) => {
    if (item.premium && !isUserPremium) {
      alert("⭐ O filtro '" + item.nome + "' é exclusivo para membros Premium do ConectMoz! Subscreva para desbloquear.");
      return;
    }
    setFiltro(item.id);
  };

  const selecionarFormato = (item) => {
    if (item.premium && !isUserPremium) {
      alert("⭐ O formato '" + item.nome + "' é exclusivo do plano Premium!");
      return;
    }
    setAspectRatio(item.id);
  };

  // Gerador de Transformações Cloudinary
  const obterTransformacoesCloudinary = () => {
    let params = ["f_auto", "q_auto"];

    // Filtros
    if (filtro === "pb") params.push("e_grayscale");
    if (filtro === "sepia") params.push("e_sepia");
    if (filtro === "vintage") params.push("e_tint:100:blue:0p:red:50p");
    if (filtro === "cyberpunk") params.push("e_art:incognito");
    if (filtro === "cartoon") params.push("e_cartoonify");

    // Formatos
    if (aspectRatio === "1:1") params.push("c_fill,ar_1:1");
    if (aspectRatio === "16:9") params.push("c_fill,ar_16:9");
    if (aspectRatio === "9:16") params.push("c_fill,ar_9:16");

    return params.join(",");
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!conteudo.trim() && !mediaFile) return;

    if (!user) {
      alert("Precisas de ter a sessão iniciada para publicar!");
      return;
    }

    setLoading(true);

    try {
      let rawUrl = "";

      if (mediaFile) {
        const uploadedData = await uploadParaCloudinary(mediaFile);
        rawUrl = typeof uploadedData === "object" ? uploadedData?.url : uploadedData;
      }

      let finalUrl = rawUrl;
      const transformacoes = obterTransformacoesCloudinary();

      if (rawUrl && transformacoes) {
        finalUrl = rawUrl.replace("/upload/", `/upload/${transformacoes}/`);
      }

      await addDoc(collection(db, "posts"), {
        autorId: user.uid,
        autorNome: user.displayName || user.email?.split("@")[0] || "Utilizador",
        autorFoto: user.photoURL || "",
        conteudo: conteudo.trim(),
        imagemUrl: mediaType === "image" ? finalUrl : "",
        videoUrl: mediaType === "video" ? finalUrl : "",
        curtidas: [],
        comentarios: [],
        criadoEm: serverTimestamp(),
      });

      setConteudo("");
      handleRemoveMedia();

      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert(`Falha ao publicar: ${error.message || "Erro no envio."}`);
    } finally {
      setLoading(false);
    }
  };

  const userInitial = user?.displayName
    ? user.displayName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";

  const getPreviewCSS = () => {
    let style = {};
    if (filtro === "pb") style.filter = "grayscale(100%)";
    if (filtro === "sepia") style.filter = "sepia(100%)";
    if (filtro === "vintage") style.filter = "contrast(120%) brightness(90%) hue-rotate(-20deg)";
    if (filtro === "cyberpunk") style.filter = "saturate(200%) hue-rotate(90deg)";
    if (filtro === "cartoon") style.filter = "contrast(150%) brightness(110%)";
    return style;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
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

      {/* ÁREA DE PRÉ-VISUALIZAÇÃO E PAINEL DE RECURSOS */}
      {mediaFile && (
        <div className="mb-4 border border-gray-200 rounded-xl p-3 bg-gray-50">
          <div className="relative rounded-lg overflow-hidden bg-black flex justify-center items-center max-h-64">
            {mediaType === "image" ? (
              <img
                src={URL.createObjectURL(mediaFile)}
                alt="Pré-visualização"
                style={getPreviewCSS()}
                className={`max-h-64 object-contain transition-all ${
                  aspectRatio === "1:1"
                    ? "aspect-square object-cover"
                    : aspectRatio === "16:9"
                    ? "aspect-video object-cover"
                    : aspectRatio === "9:16"
                    ? "aspect-[9/16] object-cover"
                    : "w-full"
                }`}
              />
            ) : (
              <video
                src={URL.createObjectURL(mediaFile)}
                controls
                style={getPreviewCSS()}
                className={`max-h-64 transition-all ${
                  aspectRatio === "1:1"
                    ? "aspect-square object-cover"
                    : aspectRatio === "16:9"
                    ? "aspect-video object-cover"
                    : aspectRatio === "9:16"
                    ? "aspect-[9/16] object-cover"
                    : "w-full"
                }`}
              />
            )}

            <button
              type="button"
              onClick={handleRemoveMedia}
              disabled={loading}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
            >
              <FaTrash size={12} />
            </button>
          </div>

          {/* PAINEL DE FILTROS (GRÁTIS & PREMIUM) */}
          <div className="mt-3 pt-2 border-t border-gray-200 space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                <FaMagic className="text-amber-500" /> Filtros e Efeitos Visuais:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {listaFiltros.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selecionarFiltro(item)}
                    className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                      filtro === item.id
                        ? "bg-blue-600 text-white font-bold"
                        : item.premium
                        ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {item.premium && <FaCrown className="text-amber-600 text-[10px]" />}
                    <span>{item.nome}</span>
                    {item.premium && !isUserPremium && <FaLock className="text-gray-400 text-[9px] ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* PAINEL DE CORTES E PROPORÇÕES */}
            <div>
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                <FaCrop className="text-blue-500" /> Formato de Tela / Corte:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {listaFormatos.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selecionarFormato(item)}
                    className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                      aspectRatio === item.id
                        ? "bg-blue-600 text-white font-bold"
                        : item.premium
                        ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {item.premium && <FaCrown className="text-amber-600 text-[10px]" />}
                    <span>{item.nome}</span>
                    {item.premium && !isUserPremium && <FaLock className="text-gray-400 text-[9px] ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ E BOTÃO PUBLICAR */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
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