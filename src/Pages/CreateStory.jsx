import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaImage,
  FaVideo,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaGlobe,
} from "react-icons/fa";

// ============================================================
// CLOUDINARY
// ============================================================

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ============================================================
// COMPONENTE
// ============================================================

export default function CreateStory({
  user: userProp,
  onStoryCreated,
}) {
  const navigate = useNavigate();

  // ==========================================================
  // UTILIZADOR
  // ==========================================================

  const user = userProp || auth.currentUser;

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [texto, setTexto] = useState("");

  const [mediaFile, setMediaFile] = useState(null);

  const [mediaType, setMediaType] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState("");

  // ==========================================================
  // REFERÊNCIAS
  // ==========================================================

  const imageInputRef = useRef(null);

  const videoInputRef = useRef(null);

  // ==========================================================
  // CRIAR PREVIEW
  // ==========================================================

  useEffect(() => {
    if (!mediaFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(mediaFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [mediaFile]);

  // ==========================================================
  // SELECIONAR IMAGEM
  // ==========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErro("");

    if (!file.type.startsWith("image/")) {
      setErro("Selecione uma imagem válida.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErro("A imagem não pode ultrapassar 15 MB.");
      return;
    }

    setMediaFile(file);
    setMediaType("image");
  };

  // ==========================================================
  // SELECIONAR VÍDEO
  // ==========================================================

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErro("");

    if (!file.type.startsWith("video/")) {
      setErro("Selecione um vídeo válido.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErro("O vídeo não pode ultrapassar 100 MB.");
      return;
    }

    setMediaFile(file);
    setMediaType("video");
  };

  // ==========================================================
  // REMOVER MEDIA
  // ==========================================================

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaType("");
    setPreviewUrl("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // ==========================================================
  // UPLOAD PARA CLOUDINARY
  // ==========================================================

  const uploadParaCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error(
        "Cloudinary Cloud Name não está configurado no arquivo .env."
      );
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary Upload Preset não está configurado no arquivo .env."
      );
    }

    const isImage = file.type.startsWith("image/");

    const resourceType = isImage ? "image" : "video";

    const endpoint =
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    formData.append("folder", "stories");

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          "Falha ao enviar o arquivo para o Cloudinary."
      );
    }

    if (!data.secure_url) {
      throw new Error(
        "O Cloudinary não devolveu a URL do arquivo."
      );
    }

    return {
      url: data.secure_url,
      publicId: data.public_id || "",
      resourceType: data.resource_type || resourceType,
      width: data.width || null,
      height: data.height || null,
      format: data.format || "",
      bytes: data.bytes || 0,
      duration: data.duration || null,
    };
  };

  // ==========================================================
  // PUBLICAR STORY
  // ==========================================================

  const handlePublish = async (event) => {
    event.preventDefault();

    setErro("");

    // --------------------------------------------------------
    // VERIFICAR LOGIN
    // --------------------------------------------------------

    if (!user) {
      setErro(
        "É necessário iniciar sessão para publicar um Story."
      );

      return;
    }

    // --------------------------------------------------------
    // VERIFICAR MEDIA
    // --------------------------------------------------------

    if (!mediaFile) {
      setErro(
        "Selecione uma foto ou vídeo para publicar."
      );

      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------------
      // UPLOAD
      // ------------------------------------------------------

      const cloudinaryData =
        await uploadParaCloudinary(mediaFile);

      // ------------------------------------------------------
      // DADOS DO UTILIZADOR
      // ------------------------------------------------------

      const nomeUtilizador =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Utilizador";

      const fotoUtilizador =
        user.photoURL || "";

      // ------------------------------------------------------
      // EXPIRAÇÃO DO STORY
      // ------------------------------------------------------

      const expiraEm = Timestamp.fromMillis(
        Date.now() + 24 * 60 * 60 * 1000
      );

      // ------------------------------------------------------
      // DADOS DO STORY
      // ------------------------------------------------------

      const storyData = {
        autorId: user.uid,

        autorNome: nomeUtilizador,

        autorFoto: fotoUtilizador,

        texto: texto.trim(),

        mediaUrl: cloudinaryData.url,

        mediaType: mediaType,

        cloudinaryPublicId:
          cloudinaryData.publicId,

        cloudinaryResourceType:
          cloudinaryData.resourceType,

        cloudinaryWidth:
          cloudinaryData.width,

        cloudinaryHeight:
          cloudinaryData.height,

        cloudinaryFormat:
          cloudinaryData.format,

        cloudinaryBytes:
          cloudinaryData.bytes,

        cloudinaryDuration:
          cloudinaryData.duration,

        privacidade: "publico",

        visualizacoes: [],

        totalVisualizacoes: 0,

        ativo: true,

        criadoEm: serverTimestamp(),

        expiraEm: expiraEm,
      };

      // ------------------------------------------------------
      // GUARDAR NO FIRESTORE
      // ------------------------------------------------------

      const docRef = await addDoc(
        collection(db, "stories"),
        storyData
      );

      console.log(
        "Story criado com sucesso:",
        docRef.id
      );

      // ------------------------------------------------------
      // CALLBACK
      // ------------------------------------------------------

      if (onStoryCreated) {
        onStoryCreated({
          id: docRef.id,
          ...storyData,
        });
      }

      // ------------------------------------------------------
      // LIMPAR
      // ------------------------------------------------------

      setTexto("");

      handleRemoveMedia();

      // ------------------------------------------------------
      // MENSAGEM
      // ------------------------------------------------------

      alert("🎉 Story publicado com sucesso!");

      // ------------------------------------------------------
      // VOLTAR PARA HOME
      // ------------------------------------------------------

      navigate("/");

    } catch (error) {
      console.error(
        "Erro ao publicar Story:",
        error
      );

      setErro(
        error?.message ||
          "Não foi possível publicar o Story."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INICIAL DO UTILIZADOR
  // ==========================================================

  const userInitial =
    user?.displayName
      ?.charAt(0)
      ?.toUpperCase() ||
    user?.email
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  // ==========================================================
  // NOME DO UTILIZADOR
  // ==========================================================

  const nomeUtilizador =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Utilizador";

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">

      {/* HEADER */}

      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">

        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition"
          >
            <FaArrowLeft />
          </button>

          <h1 className="flex-1 text-center font-bold text-gray-900">
            Criar Story
          </h1>

          <div className="w-9" />

        </div>

      </header>

      {/* CONTEÚDO */}

      <main className="max-w-2xl mx-auto px-4 py-5">

        <form
          onSubmit={handlePublish}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
        >

          {/* AUTOR */}

          <div className="flex items-center gap-3 mb-4">

            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Perfil"
                className="w-11 h-11 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center">
                {userInitial}
              </div>
            )}

            <div>

              <p className="font-semibold text-sm text-gray-900">
                {nomeUtilizador}
              </p>

              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FaGlobe />
                <span>Público</span>
              </div>

            </div>

          </div>

          {/* TEXTO */}

          <textarea
            value={texto}
            onChange={(event) =>
              setTexto(event.target.value)
            }
            disabled={loading}
            rows={3}
            maxLength={300}
            placeholder="Adicione uma legenda ao seu Story..."
            className="w-full resize-none border-0 outline-none bg-gray-50 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
          />

          <div className="text-right text-xs text-gray-400 mt-1">
            {texto.length}/300
          </div>

          {/* ERRO */}

          {erro && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-3 text-sm">

              <span className="flex-1">
                {erro}
              </span>

              <button
                type="button"
                onClick={() => setErro("")}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>

            </div>
          )}

          {/* PREVIEW */}

          {mediaFile && previewUrl && (
            <div className="mt-4">

              <div className="relative rounded-2xl overflow-hidden bg-black">

                {mediaType === "image" && (
                  <img
                    src={previewUrl}
                    alt="Pré-visualização"
                    className="w-full max-h-[600px] object-contain"
                  />
                )}

                {mediaType === "video" && (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="w-full max-h-[600px] object-contain"
                  />
                )}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  disabled={loading}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center"
                >
                  <FaTrash size={13} />
                </button>

              </div>

              <p className="text-xs text-gray-400 mt-2 truncate">
                {mediaFile.name}
              </p>

            </div>
          )}

          {/* BOTÕES */}

          <div className="border-t border-gray-100 mt-5 pt-4">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-1">

                {/* FOTO */}

                <label className="cursor-pointer">

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                    onChange={handleImageChange}
                  />

                  <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition">

                    <FaImage size={18} />

                    <span>
                      Foto
                    </span>

                  </span>

                </label>

                {/* VÍDEO */}

                <label className="cursor-pointer">

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={loading}
                    onChange={handleVideoChange}
                  />

                  <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 transition">

                    <FaVideo size={18} />

                    <span>
                      Vídeo
                    </span>

                  </span>

                </label>

              </div>

              {/* PUBLICAR */}

              <button
                type="submit"
                disabled={
                  loading || !mediaFile
                }
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
              >

                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />

                    <span>
                      A publicar...
                    </span>
                  </>
                ) : (
                  <span>
                    Publicar Story
                  </span>
                )}

              </button>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
}