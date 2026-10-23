import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  FaImage,
  FaVideo,
  FaSpinner,
  FaTrash,
  FaMagic,
  FaCrop,
  FaCrown,
  FaLock,
  FaGlobe,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";

// ============================================================
// CLOUDINARY
// ============================================================

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ============================================================
// FILTROS
// ============================================================

const LISTA_FILTROS = [
  {
    id: "normal",
    nome: "Normal",
    premium: false,
  },
  {
    id: "pb",
    nome: "P&B",
    premium: false,
  },
  {
    id: "sepia",
    nome: "Sépia",
    premium: false,
  },
  {
    id: "vintage",
    nome: "Vintage",
    premium: true,
  },
  {
    id: "cyberpunk",
    nome: "Cyberpunk",
    premium: true,
  },
  {
    id: "cartoon",
    nome: "Desenho",
    premium: true,
  },
];

// ============================================================
// FORMATOS
// ============================================================

const LISTA_FORMATOS = [
  {
    id: "auto",
    nome: "Original",
    premium: false,
  },
  {
    id: "1:1",
    nome: "1:1",
    premium: false,
  },
  {
    id: "16:9",
    nome: "16:9",
    premium: false,
  },
  {
    id: "9:16",
    nome: "9:16",
    premium: true,
  },
];

// ============================================================
// COMPONENTE
// ============================================================

export default function CreatePost({
  user: userProp,
  onPostCreated,
}) {
  const navigate = useNavigate();

  // ==========================================================
  // UTILIZADOR
  // ==========================================================

  const user = userProp || auth.currentUser;

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [conteudo, setConteudo] = useState("");

  const [mediaFile, setMediaFile] = useState(null);

  const [mediaType, setMediaType] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");

  const [filtro, setFiltro] = useState("normal");

  const [aspectRatio, setAspectRatio] =
    useState("auto");

  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState("");

  // Temporariamente falso.
  // Depois ligaremos ao sistema Premium do Firebase.
  const isUserPremium = false;

  const fileInputRef = useRef(null);

  // ==========================================================
  // PREVIEW
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
  // SELECIONAR FICHEIRO
  // ==========================================================

  const handleFileChange = (event, type) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErro("");

    // --------------------------------------------------------
    // IMAGEM
    // --------------------------------------------------------

    if (type === "image") {
      if (!file.type.startsWith("image/")) {
        setErro(
          "Por favor, selecione uma imagem válida."
        );
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setErro(
          "A imagem não pode ultrapassar 15 MB."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // VÍDEO
    // --------------------------------------------------------

    if (type === "video") {
      if (!file.type.startsWith("video/")) {
        setErro(
          "Por favor, selecione um vídeo válido."
        );
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setErro(
          "O vídeo não pode ultrapassar 100 MB."
        );
        return;
      }
    }

    setMediaFile(file);
    setMediaType(type);

    setFiltro("normal");
    setAspectRatio("auto");
  };

  // ==========================================================
  // REMOVER MEDIA
  // ==========================================================

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaType("");
    setPreviewUrl("");
    setFiltro("normal");
    setAspectRatio("auto");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================================
  // SELECIONAR FILTRO
  // ==========================================================

  const selecionarFiltro = (item) => {
    if (item.premium && !isUserPremium) {
      alert(
        `⭐ O filtro "${item.nome}" é exclusivo para membros Premium do KonnexVib.`
      );

      return;
    }

    setFiltro(item.id);
  };

  // ==========================================================
  // SELECIONAR FORMATO
  // ==========================================================

  const selecionarFormato = (item) => {
    if (item.premium && !isUserPremium) {
      alert(
        `⭐ O formato "${item.nome}" é exclusivo do KonnexVib Premium.`
      );

      return;
    }

    setAspectRatio(item.id);
  };

  // ==========================================================
  // FILTRO VISUAL DO PREVIEW
  // ==========================================================

  const getPreviewFilter = () => {
    switch (filtro) {
      case "pb":
        return {
          filter: "grayscale(100%)",
        };

      case "sepia":
        return {
          filter: "sepia(100%)",
        };

      case "vintage":
        return {
          filter:
            "contrast(120%) brightness(90%) saturate(120%) sepia(20%)",
        };

      case "cyberpunk":
        return {
          filter:
            "saturate(200%) contrast(120%) hue-rotate(40deg)",
        };

      case "cartoon":
        return {
          filter:
            "contrast(140%) saturate(130%) brightness(110%)",
        };

      default:
        return {};
    }
  };

  // ==========================================================
  // CLASSE DE FORMATO
  // ==========================================================

  const getAspectClasses = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square object-cover";

      case "16:9":
        return "aspect-video object-cover";

      case "9:16":
        return "aspect-[9/16] object-cover max-h-[520px]";

      default:
        return "max-h-[520px] object-contain w-full";
    }
  };

  // ==========================================================
  // TRANSFORMAÇÕES CLOUDINARY
  // ==========================================================

  const obterTransformacoesCloudinary = () => {
    const transforms = [
      "f_auto",
      "q_auto",
    ];

    // --------------------------------------------------------
    // FILTROS
    // --------------------------------------------------------

    if (filtro === "pb") {
      transforms.push("e_grayscale");
    }

    if (filtro === "sepia") {
      transforms.push("e_sepia");
    }

    if (filtro === "vintage") {
      transforms.push("e_sepia:30");
      transforms.push("e_saturation:20");
    }

    if (filtro === "cyberpunk") {
      transforms.push("e_saturation:50");
      transforms.push("e_hue:40");
    }

    if (filtro === "cartoon") {
      transforms.push("e_cartoonify");
    }

    // --------------------------------------------------------
    // FORMATO
    // --------------------------------------------------------

    if (aspectRatio === "1:1") {
      transforms.push("c_fill");
      transforms.push("ar_1:1");
    }

    if (aspectRatio === "16:9") {
      transforms.push("c_fill");
      transforms.push("ar_16:9");
    }

    if (aspectRatio === "9:16") {
      transforms.push("c_fill");
      transforms.push("ar_9:16");
    }

    return transforms.join(",");
  };

  // ==========================================================
  // UPLOAD PARA CLOUDINARY
  // ==========================================================

  const uploadParaCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error(
        "VITE_CLOUDINARY_CLOUD_NAME não está configurado."
      );
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        "VITE_CLOUDINARY_UPLOAD_PRESET não está configurado."
      );
    }

    const isImage = file.type.startsWith("image/");

    const resourceType = isImage
      ? "image"
      : "video";

    const folder = isImage
      ? "posts"
      : "videos";

    const endpoint =
      `https://api.cloudinary.com/v1_1/` +
      `${CLOUDINARY_CLOUD_NAME}/` +
      `${resourceType}/upload`;

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    formData.append(
      "folder",
      folder
    );

    const response = await fetch(
      endpoint,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData =
        await response
          .json()
          .catch(() => null);

      throw new Error(
        errorData?.error?.message ||
          "Falha no upload para o Cloudinary."
      );
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error(
        "O Cloudinary não devolveu o endereço do ficheiro."
      );
    }

    return {
      url: data.secure_url,
      publicId: data.public_id || "",
      resourceType:
        data.resource_type || resourceType,
      width: data.width || null,
      height: data.height || null,
      format: data.format || "",
      bytes: data.bytes || 0,
    };
  };

  // ==========================================================
  // APLICAR TRANSFORMAÇÕES
  // ==========================================================

  const aplicarTransformacoes = (url) => {
    if (!url) {
      return "";
    }

    const transformacoes =
      obterTransformacoesCloudinary();

    if (!transformacoes) {
      return url;
    }

    return url.replace(
      "/upload/",
      `/upload/${transformacoes}/`
    );
  };

  // ==========================================================
  // PUBLICAR
  // ==========================================================

  const handlePublish = async (event) => {
    event.preventDefault();

    setErro("");

    // --------------------------------------------------------
    // VALIDAR UTILIZADOR
    // --------------------------------------------------------

    if (!user) {
      setErro(
        "É necessário iniciar sessão para publicar."
      );

      return;
    }

    // --------------------------------------------------------
    // VALIDAR CONTEÚDO
    // --------------------------------------------------------

    if (!conteudo.trim() && !mediaFile) {
      setErro(
        "Escreva alguma coisa ou escolha uma foto/vídeo."
      );

      return;
    }

    setLoading(true);

    try {
      let imagemUrl = "";
      let videoUrl = "";

      let cloudinaryData = null;

      // ------------------------------------------------------
      // UPLOAD MEDIA
      // ------------------------------------------------------

      if (mediaFile) {
        cloudinaryData =
          await uploadParaCloudinary(
            mediaFile
          );

        if (mediaType === "image") {
          imagemUrl =
            aplicarTransformacoes(
              cloudinaryData.url
            );
        }

        if (mediaType === "video") {
          videoUrl =
            cloudinaryData.url;
        }
      }

      // ------------------------------------------------------
      // NOME DO UTILIZADOR
      // ------------------------------------------------------

      const nomeUtilizador =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Utilizador";

      // ------------------------------------------------------
      // FOTO DO UTILIZADOR
      // ------------------------------------------------------

      const fotoUtilizador =
        user.photoURL || "";

      // ------------------------------------------------------
      // DADOS DO POST
      // ------------------------------------------------------

      const postData = {
        autorId: user.uid,

        autorNome: nomeUtilizador,

        autorFoto: fotoUtilizador,

        conteudo: conteudo.trim(),

        imagemUrl,

        videoUrl,

        mediaType: mediaType || "",

        cloudinaryPublicId:
          cloudinaryData?.publicId || "",

        cloudinaryResourceType:
          cloudinaryData?.resourceType || "",

        cloudinaryWidth:
          cloudinaryData?.width || null,

        cloudinaryHeight:
          cloudinaryData?.height || null,

        cloudinaryFormat:
          cloudinaryData?.format || "",

        cloudinaryBytes:
          cloudinaryData?.bytes || 0,

        filtro,

        aspectRatio,

        curtidas: [],

        comentarios: [],

        partilhas: 0,

        privacidade: "publico",

        criadoEm: serverTimestamp(),
      };

      // ------------------------------------------------------
      // FIRESTORE
      // ------------------------------------------------------

      const docRef = await addDoc(
        collection(db, "posts"),
        postData
      );

      console.log(
        "Publicação criada:",
        docRef.id
      );

      // ------------------------------------------------------
      // CALLBACK
      // ------------------------------------------------------

      if (onPostCreated) {
        onPostCreated({
          id: docRef.id,
          ...postData,
        });
      }

      // ------------------------------------------------------
      // LIMPAR
      // ------------------------------------------------------

      setConteudo("");

      handleRemoveMedia();

      // ------------------------------------------------------
      // SUCESSO
      // ------------------------------------------------------

      alert(
        "🎉 Publicação criada com sucesso no KonnexVib!"
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Erro ao publicar:",
        error
      );

      setErro(
        error?.message ||
          "Não foi possível criar a publicação."
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
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">

        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition"
            aria-label="Voltar"
          >
            <FaArrowLeft />
          </button>

          <h1 className="flex-1 text-center font-bold text-gray-900">
            Criar publicação
          </h1>

          <div className="w-9" />

        </div>

      </header>

      {/* ======================================================
          CONTEÚDO
      ====================================================== */}

      <main className="max-w-3xl mx-auto px-4 py-5">

        <form
          onSubmit={handlePublish}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
        >

          {/* ==================================================
              AUTOR + TEXTO
          ================================================== */}

          <div className="flex items-start gap-3">

            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Perfil"
                className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                {userInitial}
              </div>
            )}

            <textarea
              value={conteudo}
              onChange={(event) =>
                setConteudo(
                  event.target.value
                )
              }
              disabled={loading}
              rows={4}
              placeholder={
                user?.displayName
                  ? `Em que estás a pensar, ${user.displayName}?`
                  : "O que está a acontecer?"
              }
              className="flex-1 resize-none border-0 outline-none bg-gray-50 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />

          </div>

          {/* ==================================================
              ERRO
          ================================================== */}

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

          {/* ==================================================
              PREVIEW
          ================================================== */}

          {mediaFile && previewUrl && (
            <div className="mt-4">

              <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">

                {/* IMAGEM */}

                {mediaType === "image" && (
                  <img
                    src={previewUrl}
                    alt="Pré-visualização"
                    style={getPreviewFilter()}
                    className={`w-full transition-all duration-300 ${getAspectClasses()}`}
                  />
                )}

                {/* VÍDEO */}

                {mediaType === "video" && (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    style={getPreviewFilter()}
                    className={`w-full transition-all duration-300 ${getAspectClasses()}`}
                  />
                )}

                {/* REMOVER */}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  disabled={loading}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition disabled:opacity-50"
                  title="Remover"
                >
                  <FaTrash size={13} />
                </button>

              </div>

              {/* NOME DO FICHEIRO */}

              <p className="text-xs text-gray-400 mt-2 truncate">
                {mediaFile.name}
              </p>

              {/* ==================================================
                  FILTROS
              ================================================== */}

              {mediaType === "image" && (
                <div className="mt-4 border-t border-gray-100 pt-4">

                  <div className="flex items-center gap-2 mb-3">

                    <FaMagic className="text-purple-600" />

                    <span className="text-sm font-semibold text-gray-700">
                      Filtros e efeitos
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {LISTA_FILTROS.map(
                      (item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            selecionarFiltro(
                              item
                            )
                          }
                          disabled={loading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                            filtro === item.id
                              ? "bg-purple-600 text-white"
                              : item.premium
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >

                          {item.premium && (
                            <FaCrown className="text-amber-500" />
                          )}

                          <span>
                            {item.nome}
                          </span>

                          {item.premium &&
                            !isUserPremium && (
                              <FaLock className="text-gray-400 text-[9px]" />
                            )}

                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* ==================================================
                  FORMATOS
              ================================================== */}

              <div className="mt-4 border-t border-gray-100 pt-4">

                <div className="flex items-center gap-2 mb-3">

                  <FaCrop className="text-blue-600" />

                  <span className="text-sm font-semibold text-gray-700">
                    Formato
                  </span>

                </div>

                <div className="flex flex-wrap gap-2">

                  {LISTA_FORMATOS.map(
                    (item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          selecionarFormato(
                            item
                          )
                        }
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                          aspectRatio === item.id
                            ? "bg-purple-600 text-white"
                            : item.premium
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >

                        {item.premium && (
                          <FaCrown className="text-amber-500" />
                        )}

                        {item.nome}

                        {item.premium &&
                          !isUserPremium && (
                            <FaLock className="text-gray-400 text-[9px]" />
                          )}

                      </button>
                    )
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              RODAPÉ
          ================================================== */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 mt-5 pt-4">

            {/* MEDIA */}

            <div className="flex items-center gap-1">

              {/* FOTO */}

              <label className="cursor-pointer">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      "image"
                    )
                  }
                />

                <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition">

                  <FaImage size={18} />

                  <span className="hidden sm:inline">
                    Foto
                  </span>

                </span>

              </label>

              {/* VÍDEO */}

              <label className="cursor-pointer">

                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      "video"
                    )
                  }
                />

                <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 transition">

                  <FaVideo size={18} />

                  <span className="hidden sm:inline">
                    Vídeo
                  </span>

                </span>

              </label>

            </div>

            {/* PRIVACIDADE */}

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">

              <FaGlobe />

              <span>
                Público
              </span>

            </div>

            {/* PUBLICAR */}

            <button
              type="submit"
              disabled={
                loading ||
                (!conteudo.trim() &&
                  !mediaFile)
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
                  Publicar
                </span>
              )}

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}