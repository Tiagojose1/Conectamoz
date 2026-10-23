import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { db, auth } from "../firebase";
import { uploadToCloudinary } from "../services/cloudinary";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";

import {
  FaHeart,
  FaComment,
  FaShare,
  FaMusic,
  FaHome,
  FaCompass,
  FaPlus,
  FaEnvelope,
  FaUser,
  FaDownload,
  FaSearch,
  FaTimes,
  FaCheck,
  FaLock,
  FaMagic,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
  FaBookmark,
  FaSlidersH,
  FaTh,
  FaUndo,
  FaSyncAlt,
  FaExpand,
  FaStar,
  FaPalette,
  FaCamera,
  FaAdjust,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaFilm,
  FaImage,
  FaVideo,
  FaUpload,
  FaStop,
  FaCrown,
  FaShieldAlt,
  FaBolt,
  FaCircle,
  FaInfoCircle,
} from "react-icons/fa";

/* =========================================================
   KONNEXVIB - EFEITOS GRATUITOS
========================================================= */

const EFEITOS_GRATUITOS = [
  {
    id: "normal",
    nome: "Normal",
    categoria: "Básico",
    pro: false,
    filterCss: "none",
  },
  {
    id: "vibrante",
    nome: "Vibrante",
    categoria: "Cor",
    pro: false,
    filterCss:
      "saturate(1.65) contrast(1.08) brightness(1.04)",
  },
  {
    id: "glow",
    nome: "Suave Glow",
    categoria: "Luz",
    pro: false,
    filterCss:
      "brightness(1.12) contrast(0.95) saturate(1.12)",
  },
  {
    id: "vintage",
    nome: "Vintage",
    categoria: "Retro",
    pro: false,
    filterCss:
      "sepia(0.38) contrast(1.08) saturate(0.92) brightness(0.98)",
  },
  {
    id: "pb",
    nome: "Preto & Branco",
    categoria: "Artístico",
    pro: false,
    filterCss:
      "grayscale(1) contrast(1.18)",
  },
  {
    id: "cinema",
    nome: "Cinema",
    categoria: "Cinematic",
    pro: false,
    filterCss:
      "contrast(1.18) saturate(0.92) brightness(0.96)",
  },
];

/* =========================================================
   EFEITOS PRO
========================================================= */

const EFEITOS_PRO = [
  {
    id: "cinematic_pro",
    nome: "Cinematic Pro",
    categoria: "Cinematic",
    pro: true,
    filterCss:
      "contrast(1.32) saturate(0.88) brightness(0.96)",
  },
  {
    id: "hollywood",
    nome: "Hollywood",
    categoria: "Cinematic",
    pro: true,
    filterCss:
      "contrast(1.28) saturate(0.95) brightness(1.02) sepia(0.08)",
  },
  {
    id: "film_noir",
    nome: "Film Noir",
    categoria: "Cinematic",
    pro: true,
    filterCss:
      "grayscale(0.82) contrast(1.5) brightness(0.82)",
  },
  {
    id: "teal_orange",
    nome: "Teal Orange",
    categoria: "Cinematic",
    pro: true,
    filterCss:
      "contrast(1.25) saturate(1.35) hue-rotate(-8deg)",
  },
  {
    id: "blockbuster",
    nome: "Blockbuster",
    categoria: "Cinematic",
    pro: true,
    filterCss:
      "contrast(1.35) saturate(1.18) brightness(0.95)",
  },

  {
    id: "portrait_pro",
    nome: "Portrait Pro",
    categoria: "Retrato",
    pro: true,
    filterCss:
      "brightness(1.08) contrast(1.04) saturate(1.08)",
  },
  {
    id: "skin_glow",
    nome: "Skin Glow",
    categoria: "Retrato",
    pro: true,
    filterCss:
      "brightness(1.1) contrast(0.92) saturate(1.12) sepia(0.05)",
  },
  {
    id: "beauty",
    nome: "Beauty",
    categoria: "Retrato",
    pro: true,
    filterCss:
      "brightness(1.08) contrast(0.9) saturate(1.1)",
  },
  {
    id: "studio",
    nome: "Studio Light",
    categoria: "Retrato",
    pro: true,
    filterCss:
      "brightness(1.15) contrast(1.05) saturate(1.02)",
  },

  {
    id: "color_pop",
    nome: "Color Pop",
    categoria: "Cor",
    pro: true,
    filterCss:
      "saturate(2.1) contrast(1.12)",
  },
  {
    id: "ultra_color",
    nome: "Ultra Color",
    categoria: "Cor",
    pro: true,
    filterCss:
      "saturate(2.35) contrast(1.08)",
  },
  {
    id: "pastel",
    nome: "Pastel",
    categoria: "Cor",
    pro: true,
    filterCss:
      "brightness(1.08) saturate(0.72) contrast(0.9)",
  },
  {
    id: "matte",
    nome: "Matte",
    categoria: "Cor",
    pro: true,
    filterCss:
      "contrast(0.9) brightness(1.06) saturate(0.82)",
  },
  {
    id: "deep_color",
    nome: "Deep Color",
    categoria: "Cor",
    pro: true,
    filterCss:
      "contrast(1.3) saturate(1.5) brightness(0.94)",
  },

  {
    id: "golden_hour",
    nome: "Golden Hour",
    categoria: "Luz",
    pro: true,
    filterCss:
      "sepia(0.24) saturate(1.42) brightness(1.08) contrast(1.03)",
  },
  {
    id: "sunset",
    nome: "Sunset",
    categoria: "Luz",
    pro: true,
    filterCss:
      "sepia(0.18) saturate(1.55) contrast(1.05) hue-rotate(-8deg)",
  },
  {
    id: "bright",
    nome: "Bright",
    categoria: "Luz",
    pro: true,
    filterCss:
      "brightness(1.24) contrast(0.96) saturate(1.1)",
  },
  {
    id: "soft_light",
    nome: "Soft Light",
    categoria: "Luz",
    pro: true,
    filterCss:
      "brightness(1.16) contrast(0.9) saturate(1.05)",
  },

  {
    id: "night",
    nome: "Night",
    categoria: "Noite",
    pro: true,
    filterCss:
      "brightness(0.72) contrast(1.25) saturate(1.1)",
  },
  {
    id: "midnight",
    nome: "Midnight",
    categoria: "Noite",
    pro: true,
    filterCss:
      "brightness(0.6) contrast(1.38) saturate(0.9) hue-rotate(8deg)",
  },
  {
    id: "neon_night",
    nome: "Neon Night",
    categoria: "Noite",
    pro: true,
    filterCss:
      "brightness(0.76) contrast(1.4) saturate(1.9) hue-rotate(18deg)",
  },

  {
    id: "retro_80",
    nome: "Retro 80s",
    categoria: "Retro",
    pro: true,
    filterCss:
      "saturate(1.55) contrast(1.15) hue-rotate(325deg)",
  },
  {
    id: "retro_90",
    nome: "Retro 90s",
    categoria: "Retro",
    pro: true,
    filterCss:
      "sepia(0.28) contrast(1.18) saturate(0.95)",
  },
  {
    id: "polaroid",
    nome: "Polaroid",
    categoria: "Retro",
    pro: true,
    filterCss:
      "brightness(1.08) contrast(0.94) saturate(0.88) sepia(0.1)",
  },
  {
    id: "film",
    nome: "Film Grain Style",
    categoria: "Retro",
    pro: true,
    filterCss:
      "contrast(1.2) saturate(0.9) brightness(0.95)",
  },

  {
    id: "dream",
    nome: "Dream",
    categoria: "Fun",
    pro: true,
    filterCss:
      "brightness(1.12) contrast(0.82) saturate(1.18)",
  },
  {
    id: "fairy",
    nome: "Fairy Glow",
    categoria: "Fun",
    pro: true,
    filterCss:
      "brightness(1.18) saturate(1.25) contrast(0.84)",
  },
  {
    id: "icy",
    nome: "Icy",
    categoria: "Fun",
    pro: true,
    filterCss:
      "brightness(1.06) contrast(1.1) saturate(0.9) hue-rotate(165deg)",
  },
  {
    id: "fire",
    nome: "Fire",
    categoria: "Fun",
    pro: true,
    filterCss:
      "contrast(1.3) saturate(1.65) sepia(0.15) hue-rotate(-10deg)",
  },

  {
    id: "dramatic",
    nome: "Dramatic",
    categoria: "Artístico",
    pro: true,
    filterCss:
      "contrast(1.55) brightness(0.82) saturate(1.15)",
  },
  {
    id: "mono_high",
    nome: "Mono High",
    categoria: "Artístico",
    pro: true,
    filterCss:
      "grayscale(1) contrast(1.55) brightness(0.96)",
  },
  {
    id: "sepia_art",
    nome: "Sepia Art",
    categoria: "Artístico",
    pro: true,
    filterCss:
      "sepia(0.72) contrast(1.08) saturate(0.85)",
  },
  {
    id: "dream_art",
    nome: "Dream Art",
    categoria: "Artístico",
    pro: true,
    filterCss:
      "brightness(1.08) saturate(1.22) contrast(0.88) blur(0.2px)",
  },

  {
    id: "social_pop",
    nome: "Social Pop",
    categoria: "Trend",
    pro: true,
    filterCss:
      "brightness(1.06) contrast(1.1) saturate(1.55)",
  },
  {
    id: "trend",
    nome: "Trend",
    categoria: "Trend",
    pro: true,
    filterCss:
      "contrast(1.18) saturate(1.38) brightness(1.03)",
  },
  {
    id: "viral",
    nome: "Viral",
    categoria: "Trend",
    pro: true,
    filterCss:
      "brightness(1.07) contrast(1.22) saturate(1.7)",
  },

  {
    id: "canva_style",
    nome: "Design Clean",
    categoria: "Design",
    pro: true,
    filterCss:
      "brightness(1.08) contrast(1.04) saturate(1.12)",
  },
  {
    id: "editorial",
    nome: "Editorial",
    categoria: "Design",
    pro: true,
    filterCss:
      "contrast(1.18) saturate(0.8) brightness(1.02)",
  },
  {
    id: "fashion",
    nome: "Fashion",
    categoria: "Design",
    pro: true,
    filterCss:
      "contrast(1.25) saturate(0.95) brightness(1.02)",
  },
];

const TODOS_EFEITOS = [
  ...EFEITOS_GRATUITOS,
  ...EFEITOS_PRO,
];

/* =========================================================
   LAYOUTS
========================================================= */

const LAYOUTS_COLAGEM = [
  {
    id: "single",
    nome: "Original",
    className: "grid-cols-1 grid-rows-1",
  },
  {
    id: "two_vertical",
    nome: "2 Vertical",
    className: "grid-cols-2 grid-rows-1",
  },
  {
    id: "two_horizontal",
    nome: "2 Horizontal",
    className: "grid-cols-1 grid-rows-2",
  },
  {
    id: "three",
    nome: "3 Fotos",
    className: "grid-cols-2 grid-rows-2",
  },
  {
    id: "four",
    nome: "4 Fotos",
    className: "grid-cols-2 grid-rows-2",
  },
];

/* =========================================================
   QUALIDADE
========================================================= */

const QUALIDADE_PRESETS = {
  auto: {
    id: "auto",
    nome: "Automático",
    descricao:
      "Melhor qualidade compatível com o dispositivo.",
    width: 1920,
    height: 1080,
    fps: 60,
    bitrate: 12000000,
  },

  fullhd: {
    id: "fullhd",
    nome: "Full HD",
    descricao:
      "1080p com alta qualidade para Reels.",
    width: 1920,
    height: 1080,
    fps: 60,
    bitrate: 12000000,
  },

  hd: {
    id: "hd",
    nome: "HD",
    descricao:
      "720p para dispositivos com menor capacidade.",
    width: 1280,
    height: 720,
    fps: 30,
    bitrate: 8000000,
  },
};

/* =========================================================
   HELPERS
========================================================= */

function formatarNumero(numero) {
  const valor = Number(numero || 0);

  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(1)}M`;
  }

  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1)}K`;
  }

  return valor;
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  const units = ["B", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(
    bytes / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function obterNomeUtilizador(user) {
  if (!user) return "Utilizador";

  return (
    user.displayName ||
    user.email?.split("@")[0] ||
    "Utilizador"
  );
}

function obterMidiaDoReel(reel) {
  return reel?.mediaUrl || reel?.videoUrl || "";
}

function reelEhVideo(reel) {
  if (reel?.resourceType === "video") {
    return true;
  }

  if (reel?.tipoMidia === "video") {
    return true;
  }

  const url = obterMidiaDoReel(reel);

  return /\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/i.test(
    url
  );
}

function reelEhImagem(reel) {
  if (reel?.resourceType === "image") {
    return true;
  }

  if (reel?.tipoMidia === "foto") {
    return true;
  }

  return !reelEhVideo(reel);
}

function obterTransformacao(ajustes = {}) {
  const zoom =
    Number(ajustes.zoom ?? 100) / 100;

  const rotacao =
    Number(ajustes.rotacao ?? 0);

  const espelho =
    ajustes.espelho ? "scaleX(-1)" : "";

  return `
    scale(${zoom})
    rotate(${rotacao}deg)
    ${espelho}
  `;
}

function obterFiltroBase(ajustes = {}) {
  const brilho =
    Number(ajustes.brilho ?? 100) / 100;

  const contraste =
    Number(ajustes.contraste ?? 100) / 100;

  const saturacao =
    Number(ajustes.saturacao ?? 100) / 100;

  const exposicao =
    Number(ajustes.exposicao ?? 100) / 100;

  const desfoque =
    Number(ajustes.desfoque ?? 0);

  const temperatura =
    Number(ajustes.temperatura ?? 0);

  const filtros = [
    `brightness(${brilho * exposicao})`,
    `contrast(${contraste})`,
    `saturate(${saturacao})`,
  ];

  if (desfoque > 0) {
    filtros.push(`blur(${desfoque}px)`);
  }

  if (temperatura !== 0) {
    filtros.push(
      `hue-rotate(${temperatura}deg)`
    );
  }

  return filtros.join(" ");
}

function getSupportedVideoMimeType() {
  if (
    typeof MediaRecorder === "undefined" ||
    !MediaRecorder.isTypeSupported
  ) {
    return "";
  }

  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];

  return (
    types.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || ""
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Reels() {
  const user = auth.currentUser;

  /* =======================================================
     FEED
  ======================================================= */

  const [reels, setReels] = useState([]);

  const [abaAtiva, setAbaAtiva] =
    useState("paraVoce");

  const [videoAtivo, setVideoAtivo] =
    useState(null);

  const [somLigado, setSomLigado] =
    useState(false);

  const [isPlaying, setIsPlaying] =
    useState(true);

  const [curtidos, setCurtidos] =
    useState([]);

  const [salvos, setSalvos] =
    useState([]);

  /* =======================================================
     MODAIS
  ======================================================= */

  const [modalAberto, setModalAberto] =
    useState(false);

  const [modalPagamento, setModalPagamento] =
    useState(null);

  /* =======================================================
     PUBLICAÇÃO
  ======================================================= */

  const [descricao, setDescricao] =
    useState("");

  const [tipoMidia, setTipoMidia] =
    useState("video");

  const [formatoSelecionado, setFormatoSelecionado] =
    useState("9:16");

  /* =======================================================
     EFEITOS
  ======================================================= */

  const [efeitoSelecionado, setEfeitoSelecionado] =
    useState(EFEITOS_GRATUITOS[0]);

  const [efeitosComprados, setEfeitosComprados] =
    useState([]);

  const [categoriaFiltro, setCategoriaFiltro] =
    useState("Todos");

  /* =======================================================
     EDITOR
  ======================================================= */

  const [ajustes, setAjustes] = useState({
    brilho: 100,
    contraste: 100,
    saturacao: 100,
    temperatura: 0,
    exposicao: 100,
    desfoque: 0,
    vinheta: 0,
    zoom: 100,
    rotacao: 0,
    espelho: false,
  });

  const [modoColagem, setModoColagem] =
    useState("single");

  const [mostrarEditor, setMostrarEditor] =
    useState(true);

  /* =======================================================
     QUALIDADE
  ======================================================= */

  const [qualidadeSelecionada, setQualidadeSelecionada] =
    useState("fullhd");

  /* =======================================================
     ARQUIVO / CLOUDINARY
  ======================================================= */

  const [arquivoSelecionado, setArquivoSelecionado] =
    useState(null);

  const [previewLocalUrl, setPreviewLocalUrl] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [statusUpload, setStatusUpload] =
    useState("");

  const [erroUpload, setErroUpload] =
    useState("");

  /* =======================================================
     CÂMARA
  ======================================================= */

  const [modoCaptura, setModoCaptura] =
    useState(null);

  const [cameraLigada, setCameraLigada] =
    useState(false);

  const [gravando, setGravando] =
    useState(false);

  const [tempoGravacao, setTempoGravacao] =
    useState(0);

  const [erroCamera, setErroCamera] =
    useState("");

  /* =======================================================
     REFS
  ======================================================= */

  const containerRef = useRef(null);

  const cameraVideoRef = useRef(null);

  const cameraStreamRef = useRef(null);

  const mediaRecorderRef = useRef(null);

  const chunksRef = useRef([]);

  const gravacaoTimerRef = useRef(null);

  const fileInputRef = useRef(null);

  const photoInputRef = useRef(null);

  /* =======================================================
     FIRESTORE — CARREGAR REELS
  ======================================================= */

  useEffect(() => {
    const q = query(
      collection(db, "reels"),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );

        setReels(lista);
      },
      (error) => {
        console.error(
          "Erro ao carregar Reels:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /* =======================================================
     LIMPAR PREVIEW LOCAL
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        previewLocalUrl &&
        previewLocalUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewLocalUrl);
      }
    };
  }, [previewLocalUrl]);

  /* =======================================================
     INTERSECTION OBSERVER
  ======================================================= */

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) return;

    const items =
      container.querySelectorAll(
        ".reel-item"
      );

    if (!items.length) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video =
              entry.target.querySelector(
                "video"
              );

            if (!video) return;

            if (entry.isIntersecting) {
              setVideoAtivo(
                entry.target.dataset.id
              );

              document
                .querySelectorAll(
                  ".konnex-reel-video"
                )
                .forEach((outroVideo) => {
                  if (
                    outroVideo !== video
                  ) {
                    outroVideo.pause();
                    outroVideo.currentTime = 0;
                  }
                });

              video.muted =
                !somLigado;

              const promise =
                video.play();

              if (promise?.catch) {
                promise
                  .then(() => {
                    setIsPlaying(true);
                  })
                  .catch(() => {
                    setIsPlaying(false);
                  });
              }
            } else {
              video.pause();
            }
          });
        },
        {
          root: container,
          threshold: 0.7,
        }
      );

    items.forEach((item) =>
      observer.observe(item)
    );

    return () =>
      observer.disconnect();
  }, [reels, somLigado]);

  /* =======================================================
     CATEGORIAS
  ======================================================= */

  const categorias = useMemo(() => {
    return [
      "Todos",
      ...Array.from(
        new Set(
          TODOS_EFEITOS.map(
            (efeito) =>
              efeito.categoria
          )
        )
      ),
    ];
  }, []);

  const efeitosFiltrados = useMemo(() => {
    if (
      categoriaFiltro === "Todos"
    ) {
      return TODOS_EFEITOS;
    }

    return TODOS_EFEITOS.filter(
      (efeito) =>
        efeito.categoria ===
        categoriaFiltro
    );
  }, [categoriaFiltro]);

  /* =======================================================
     FILTRO FINAL
  ======================================================= */

  const filtroFinal = useMemo(() => {
    const efeito =
      efeitoSelecionado?.filterCss ||
      "none";

    const ajustesCss =
      obterFiltroBase(ajustes);

    return [
      efeito,
      ajustesCss,
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    efeitoSelecionado,
    ajustes,
  ]);

  const previewStyle = {
    filter: filtroFinal,
    transform:
      obterTransformacao(ajustes),
    transformOrigin:
      "center center",
  };

  /* =======================================================
     ABRIR SELETOR DE VÍDEO
  ======================================================= */

  const abrirSeletorVideo = () => {
    setTipoMidia("video");
    setErroUpload("");

    fileInputRef.current?.click();
  };

  /* =======================================================
     ABRIR SELETOR DE FOTO
  ======================================================= */

  const abrirSeletorFoto = () => {
    setTipoMidia("foto");
    setErroUpload("");

    photoInputRef.current?.click();
  };

  /* =======================================================
     PROCESSAR ARQUIVO
  ======================================================= */

  const processarArquivo = (
    file
  ) => {
    if (!file) return;

    const ehVideo =
      file.type.startsWith("video/");

    const ehImagem =
      file.type.startsWith("image/");

    if (!ehVideo && !ehImagem) {
      setErroUpload(
        "Escolha uma imagem ou vídeo válido."
      );

      return;
    }

    if (
      previewLocalUrl?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        previewLocalUrl
      );
    }

    const novoPreview =
      URL.createObjectURL(file);

    setArquivoSelecionado(file);

    setPreviewLocalUrl(
      novoPreview
    );

    setTipoMidia(
      ehVideo ? "video" : "foto"
    );

    setErroUpload("");

    setStatusUpload(
      "Mídia pronta. Será enviada para o Cloudinary quando publicar."
    );
  };

  /* =======================================================
     INPUT VÍDEO
  ======================================================= */

  const handleVideoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    processarArquivo(file);

    event.target.value = "";
  };

  /* =======================================================
     INPUT FOTO
  ======================================================= */

  const handleFotoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    processarArquivo(file);

    event.target.value = "";
  };

  /* =======================================================
     CÂMARA
  ======================================================= */

  const iniciarCamera = async () => {
    setErroCamera("");
    setModoCaptura("camera");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      setErroCamera(
        "O navegador não suporta acesso à câmara."
      );

      return;
    }

    try {
      const preset =
        QUALIDADE_PRESETS[
          qualidadeSelecionada
        ] ||
        QUALIDADE_PRESETS.fullhd;

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: {
                ideal: preset.width,
              },
              height: {
                ideal: preset.height,
              },
              frameRate: {
                ideal: preset.fps,
                max: preset.fps,
              },
              facingMode: "user",
            },

            audio: true,
          }
        );

      cameraStreamRef.current =
        stream;

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject =
          stream;

        await cameraVideoRef.current.play();
      }

      setCameraLigada(true);
    } catch (error) {
      console.error(
        "Erro ao iniciar câmara:",
        error
      );

      setErroCamera(
        "Não foi possível acessar a câmara. Verifique as permissões do navegador."
      );

      setCameraLigada(false);
    }
  };

  /* =======================================================
     PARAR CÂMARA
  ======================================================= */

  const pararCamera =
    useCallback(() => {
      if (
        cameraStreamRef.current
      ) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        cameraStreamRef.current =
          null;
      }

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject =
          null;
      }

      setCameraLigada(false);
    }, []);

  /* =======================================================
     FOTO HD DA CÂMARA
  ======================================================= */

  const capturarFoto = () => {
    const video =
      cameraVideoRef.current;

    if (!video) return;

    if (video.readyState < 2) {
      alert(
        "Aguarde a câmara carregar."
      );

      return;
    }

    const width =
      video.videoWidth || 1920;

    const height =
      video.videoHeight || 1080;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          `konnexvib-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
            lastModified:
              Date.now(),
          }
        );

        processarArquivo(file);

        pararCamera();

        setModoCaptura(null);

        setTipoMidia("foto");
      },
      "image/jpeg",
      0.95
    );
  };

  /* =======================================================
     INICIAR GRAVAÇÃO
  ======================================================= */

  const iniciarGravacao = () => {
    const stream =
      cameraStreamRef.current;

    if (!stream) {
      alert(
        "Primeiro ligue a câmara."
      );

      return;
    }

    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      alert(
        "Este navegador não suporta gravação de vídeo."
      );

      return;
    }

    const mimeType =
      getSupportedVideoMimeType();

    const preset =
      QUALIDADE_PRESETS[
        qualidadeSelecionada
      ] ||
      QUALIDADE_PRESETS.fullhd;

    const options = {};

    if (mimeType) {
      options.mimeType =
        mimeType;
    }

    /*
      Bitrate elevado para preservar
      a melhor qualidade possível.
    */
    options.videoBitsPerSecond =
      preset.bitrate;

    options.audioBitsPerSecond =
      128000;

    try {
      const recorder =
        new MediaRecorder(
          stream,
          options
        );

      chunksRef.current = [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop = () => {
        const finalType =
          recorder.mimeType ||
          mimeType ||
          "video/webm";

        const blob = new Blob(
          chunksRef.current,
          {
            type: finalType,
          }
        );

        const extension =
          finalType.includes("mp4")
            ? "mp4"
            : "webm";

        const file = new File(
          [blob],
          `konnexvib-reel-${Date.now()}.${extension}`,
          {
            type: finalType,
            lastModified:
              Date.now(),
          }
        );

        processarArquivo(file);

        setGravando(false);

        setTempoGravacao(0);

        if (
          gravacaoTimerRef.current
        ) {
          clearInterval(
            gravacaoTimerRef.current
          );

          gravacaoTimerRef.current =
            null;
        }
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start(1000);

      setGravando(true);

      setTempoGravacao(0);

      gravacaoTimerRef.current =
        setInterval(() => {
          setTempoGravacao(
            (prev) => prev + 1
          );
        }, 1000);
    } catch (error) {
      console.error(
        "Erro ao iniciar gravação:",
        error
      );

      alert(
        "Não foi possível iniciar a gravação."
      );
    }
  };

  /* =======================================================
     PARAR GRAVAÇÃO
  ======================================================= */

  const pararGravacao = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current
        .state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (
      gravacaoTimerRef.current
    ) {
      clearInterval(
        gravacaoTimerRef.current
      );

      gravacaoTimerRef.current =
        null;
    }
  };

  /* =======================================================
     LIMPAR CAPTURA
  ======================================================= */

  const limparCaptura = () => {
    if (gravando) {
      pararGravacao();
    }

    pararCamera();

    if (
      previewLocalUrl?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewLocalUrl
      );
    }

    setArquivoSelecionado(null);

    setPreviewLocalUrl("");

    setModoCaptura(null);

    setCameraLigada(false);

    setGravando(false);

    setTempoGravacao(0);

    setStatusUpload("");

    setErroUpload("");
  };

  /* =======================================================
     FECHAR MODAL
  ======================================================= */

  const fecharModal = () => {
    limparCaptura();

    setModalAberto(false);
  };

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current
          .state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (
        gravacaoTimerRef.current
      ) {
        clearInterval(
          gravacaoTimerRef.current
        );
      }

      if (
        cameraStreamRef.current
      ) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  /* =======================================================
     PUBLICAR — CLOUDINARY + FIRESTORE
  ======================================================= */

  const handlePublicarReel =
    async () => {
      if (!user) {
        alert(
          "Inicie sessão para publicar."
        );

        return;
      }

      if (!arquivoSelecionado) {
        setErroUpload(
          "Selecione ou capture primeiro uma foto ou vídeo."
        );

        return;
      }

      if (uploading) return;

      try {
        setUploading(true);

        setErroUpload("");

        setStatusUpload(
          "A preparar envio..."
        );

        /*
          Determinar o tipo correto
          para o Cloudinary.
        */
        const resourceType =
          arquivoSelecionado.type.startsWith(
            "video/"
          )
            ? "video"
            : "image";

        setStatusUpload(
          "A enviar mídia para o Cloudinary..."
        );

        /*
          Upload direto para Cloudinary.
        */
        const resultado =
          await uploadToCloudinary(
            arquivoSelecionado,
            resourceType
          );

        if (
          !resultado?.mediaUrl
        ) {
          throw new Error(
            "O Cloudinary não devolveu a URL da mídia."
          );
        }

        setStatusUpload(
          "Mídia enviada. A guardar publicação no Firestore..."
        );

        const preset =
          QUALIDADE_PRESETS[
            qualidadeSelecionada
          ] ||
          QUALIDADE_PRESETS.fullhd;

        /*
          Firestore guarda apenas
          metadados + URL da mídia.
          
          O arquivo NÃO vai para
          Firebase Storage.
        */
        await addDoc(
          collection(db, "reels"),
          {
            autorId: user.uid,

            autorNome:
              obterNomeUtilizador(
                user
              ),

            autorFoto:
              user.photoURL || "",

            tipo: "reel",

            tipoMidia:
              resourceType ===
              "video"
                ? "video"
                : "foto",

            mediaUrl:
              resultado.mediaUrl,

            publicId:
              resultado.publicId ||
              "",

            resourceType:
              resultado.resourceType ||
              resourceType,

            descricao:
              descricao.trim(),

            efeitoId:
              efeitoSelecionado.id,

            efeitoNome:
              efeitoSelecionado.nome,

            filterCss:
              filtroFinal,

            ajustes: {
              ...ajustes,
            },

            modoColagem,

            formato:
              formatoSelecionado,

            qualidade:
              qualidadeSelecionada,

            qualidadeNome:
              preset.nome,

            largura:
              preset.width,

            altura:
              preset.height,

            fps: preset.fps,

            bitrate:
              preset.bitrate,

            nomeArquivo:
              arquivoSelecionado.name ||
              "",

            mimeType:
              arquivoSelecionado.type ||
              "",

            tamanhoBytes:
              arquivoSelecionado.size ||
              0,

            likes: 0,

            comentariosCount: 0,

            partilhasCount: 0,

            criadoEm:
              serverTimestamp(),
          }
        );

        setStatusUpload(
          "Publicado com sucesso! 🎉"
        );

        /*
          Limpar formulário.
        */
        limparCaptura();

        setDescricao("");

        setEfeitoSelecionado(
          EFEITOS_GRATUITOS[0]
        );

        setAjustes({
          brilho: 100,
          contraste: 100,
          saturacao: 100,
          temperatura: 0,
          exposicao: 100,
          desfoque: 0,
          vinheta: 0,
          zoom: 100,
          rotacao: 0,
          espelho: false,
        });

        setModoColagem("single");

        setFormatoSelecionado(
          "9:16"
        );

        setQualidadeSelecionada(
          "fullhd"
        );

        setModalAberto(false);

        alert(
          "Reel publicado com sucesso! 🎉"
        );
      } catch (error) {
        console.error(
          "Erro ao publicar Reel:",
          error
        );

        setErroUpload(
          error?.message ||
            "Não foi possível publicar o Reel."
        );

        setStatusUpload("");
      } finally {
        setUploading(false);
      }
    };

  /* =======================================================
     LIKE
  ======================================================= */

  const handleLike = async (
    reel
  ) => {
    if (!user) {
      alert(
        "Inicie sessão para curtir."
      );

      return;
    }

    const jaCurtiu =
      curtidos.includes(reel.id);

    try {
      await updateDoc(
        doc(db, "reels", reel.id),
        {
          likes: increment(
            jaCurtiu ? -1 : 1
          ),
        }
      );

      setCurtidos((atual) => {
        if (jaCurtiu) {
          return atual.filter(
            (id) => id !== reel.id
          );
        }

        return [
          ...atual,
          reel.id,
        ];
      });
    } catch (error) {
      console.error(
        "Erro ao curtir:",
        error
      );
    }
  };

  /* =======================================================
     SALVAR
  ======================================================= */

  const handleSalvar = (
    reelId
  ) => {
    setSalvos((atual) => {
      if (
        atual.includes(reelId)
      ) {
        return atual.filter(
          (id) => id !== reelId
        );
      }

      return [
        ...atual,
        reelId,
      ];
    });
  };

  /* =======================================================
     PARTILHAR
  ======================================================= */

  const handlePartilhar =
    async (reel) => {
      const mediaUrl =
        obterMidiaDoReel(reel);

      try {
        let partilhou = false;

        if (
          navigator.share
        ) {
          await navigator.share({
            title:
              "Reel no KonnexVib",

            text:
              reel.descricao ||
              "Veja este Reel no KonnexVib",

            url: mediaUrl,
          });

          partilhou = true;
        } else if (
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            mediaUrl
          );

          alert(
            "Link copiado!"
          );

          partilhou = true;
        }

        if (
          partilhou &&
          reel.id
        ) {
          await updateDoc(
            doc(
              db,
              "reels",
              reel.id
            ),
            {
              partilhasCount:
                increment(1),
            }
          );
        }
      } catch (error) {
        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "Erro ao partilhar:",
            error
          );
        }
      }
    };

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const handleDownload = (
    reel
  ) => {
    const url =
      obterMidiaDoReel(reel);

    if (!url) return;

    const link =
      document.createElement("a");

    link.href = url;

    link.target = "_blank";

    link.rel =
      "noopener noreferrer";

    link.download =
      reel.nomeArquivo ||
      `konnexvib-reel-${reel.id}`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  };

  /* =======================================================
     PLAY / PAUSE
  ======================================================= */

  const togglePlay = (
    reelId
  ) => {
    const video =
      document.querySelector(
        `[data-video-id="${reelId}"]`
      );

    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() =>
          setIsPlaying(true)
        )
        .catch(() => {});
    } else {
      video.pause();

      setIsPlaying(false);
    }
  };

  /* =======================================================
     SOM
  ======================================================= */

  const toggleSom = () => {
    const novoEstado =
      !somLigado;

    document
      .querySelectorAll(
        ".konnex-reel-video"
      )
      .forEach((video) => {
        video.muted =
          !novoEstado;
      });

    setSomLigado(
      novoEstado
    );
  };

  /* =======================================================
     DUPLO CLIQUE
  ======================================================= */

  const handleDoubleClick = (
    reel
  ) => {
    if (
      !curtidos.includes(
        reel.id
      )
    ) {
      handleLike(reel);
    }
  };

  /* =======================================================
     EFEITOS
  ======================================================= */

  const handleSelecionarEfeito =
    (efeito) => {
      if (
        efeito.pro &&
        !efeitosComprados.includes(
          efeito.id
        )
      ) {
        setModalPagamento(
          efeito
        );

        return;
      }

      setEfeitoSelecionado(
        efeito
      );
    };

  /* =======================================================
     DESBLOQUEAR PRO — DEMONSTRAÇÃO
  ======================================================= */

  const handleConfirmarCompraEfeito =
    () => {
      if (!modalPagamento)
        return;

      setEfeitosComprados(
        (prev) => [
          ...prev,
          modalPagamento.id,
        ]
      );

      setEfeitoSelecionado(
        modalPagamento
      );

      setModalPagamento(null);

      alert(
        `"${modalPagamento.nome}" foi desbloqueado para demonstração.`
      );
    };

  /* =======================================================
     AJUSTES
  ======================================================= */

  const alterarAjuste = (
    campo,
    valor
  ) => {
    setAjustes((prev) => ({
      ...prev,
      [campo]: Number(valor),
    }));
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetarAjustes = () => {
    setAjustes({
      brilho: 100,
      contraste: 100,
      saturacao: 100,
      temperatura: 0,
      exposicao: 100,
      desfoque: 0,
      vinheta: 0,
      zoom: 100,
      rotacao: 0,
      espelho: false,
    });

    setEfeitoSelecionado(
      EFEITOS_GRATUITOS[0]
    );

    setModoColagem("single");
  };

  /* =======================================================
     ABRIR MODAL
  ======================================================= */

  const abrirModalCriar = () => {
    setErroUpload("");

    setStatusUpload("");

    setModalAberto(true);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">

      {/* ===================================================
          FEED
      =================================================== */}

      <div
        ref={containerRef}
        className="w-full max-w-md h-full mx-auto overflow-y-scroll snap-y snap-mandatory scrollbar-none bg-black"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="fixed md:absolute top-0 left-0 right-0 max-w-md mx-auto z-40">

          <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-gradient-to-b from-black/80 to-transparent">

            <div className="flex items-center gap-5 text-sm font-semibold">

              <button
                onClick={() =>
                  setAbaAtiva(
                    "live"
                  )
                }
                className={
                  abaAtiva ===
                  "live"
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-white/60"
                }
              >
                Live
              </button>

              <button
                onClick={() =>
                  setAbaAtiva(
                    "seguindo"
                  )
                }
                className={
                  abaAtiva ===
                  "seguindo"
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-white/60"
                }
              >
                Seguindo
              </button>

              <button
                onClick={() =>
                  setAbaAtiva(
                    "paraVoce"
                  )
                }
                className={
                  abaAtiva ===
                  "paraVoce"
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-white/60"
                }
              >
                Para você
              </button>

            </div>

            <button
              className="text-white text-xl"
              title="Pesquisar"
            >
              <FaSearch />
            </button>

          </div>
        </div>

        {/* =================================================
            REELS
        ================================================= */}

        {reels.length ===
        0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">

            <FaFilm className="text-5xl mb-4 opacity-40" />

            <p className="text-sm">
              Ainda não existem
              Reels.
            </p>

            <button
              onClick={
                abrirModalCriar
              }
              className="mt-4 bg-[#635BFF] px-5 py-2 rounded-full text-sm font-semibold"
            >
              Criar primeiro Reel
            </button>

          </div>
        ) : (
          reels.map((reel) => {
            const mediaUrl =
              obterMidiaDoReel(
                reel
              );

            const ehVideo =
              reelEhVideo(reel);

            const ehImagem =
              reelEhImagem(reel);

            const curtiu =
              curtidos.includes(
                reel.id
              );

            const salvo =
              salvos.includes(
                reel.id
              );

            const ajustesReel =
              reel.ajustes || {};

            const filtroReel =
              reel.filterCss ||
              "none";

            const transformReel =
              obterTransformacao(
                ajustesReel
              );

            const vinheta =
              Number(
                ajustesReel.vinheta ||
                  0
              );

            return (
              <div
                key={reel.id}
                data-id={reel.id}
                className="reel-item relative w-full h-full snap-start snap-always bg-black overflow-hidden"
                onDoubleClick={() =>
                  handleDoubleClick(
                    reel
                  )
                }
              >

                {/* MEDIA */}

                <div className="absolute inset-0 flex items-center justify-center bg-black">

                  {ehVideo ? (
                    <video
                      data-video-id={
                        reel.id
                      }
                      src={
                        mediaUrl
                      }
                      className="konnex-reel-video w-full h-full object-cover cursor-pointer"
                      loop
                      muted={
                        !somLigado
                      }
                      playsInline
                      preload="metadata"
                      onClick={() =>
                        togglePlay(
                          reel.id
                        )
                      }
                      style={{
                        filter:
                          filtroReel,
                        transform:
                          transformReel,
                        transformOrigin:
                          "center center",
                      }}
                    />
                  ) : ehImagem ? (
                    <img
                      src={
                        mediaUrl
                      }
                      alt={
                        reel.descricao ||
                        "Reel KonnexVib"
                      }
                      className="w-full h-full object-cover"
                      style={{
                        filter:
                          filtroReel,
                        transform:
                          transformReel,
                        transformOrigin:
                          "center center",
                      }}
                    />
                  ) : (
                    <div className="text-white/60 text-sm">
                      Mídia não
                      disponível
                    </div>
                  )}

                </div>

                {/* VINHETA */}

                {vinheta >
                  0 && (
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      boxShadow: `inset 0 0 ${
                        30 +
                        vinheta *
                          0.6
                      }px rgba(0,0,0,${
                        vinheta / 100
                      })`,
                    }}
                  />
                )}

                {/* PLAY */}

                {ehVideo &&
                  videoAtivo ===
                    reel.id &&
                  !isPlaying && (
                    <button
                      onClick={() =>
                        togglePlay(
                          reel.id
                        )
                      }
                      className="absolute inset-0 m-auto z-30 w-20 h-20 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
                    >
                      <FaPlay
                        size={30}
                      />
                    </button>
                  )}

                {/* SOM */}

                {ehVideo && (
                  <button
                    onClick={
                      toggleSom
                    }
                    className="absolute top-20 right-4 z-30 w-10 h-10 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center"
                  >
                    {somLigado ? (
                      <FaVolumeUp />
                    ) : (
                      <FaVolumeMute />
                    )}
                  </button>
                )}

                {/* AÇÕES */}

                <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4">

                  {/* PERFIL */}

                  <div className="relative mb-2">

                    <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white/10 flex items-center justify-center">

                      {reel.autorFoto ? (
                        <img
                          src={
                            reel.autorFoto
                          }
                          alt={
                            reel.autorNome ||
                            "Utilizador"
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser />
                      )}

                    </div>

                    <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#635BFF] rounded-full flex items-center justify-center text-[10px]">
                      <FaPlus />
                    </button>

                  </div>

                  {/* LIKE */}

                  <button
                    onClick={() =>
                      handleLike(
                        reel
                      )
                    }
                    className="flex flex-col items-center"
                  >

                    <div
                      className={`w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-xl transition ${
                        curtiu
                          ? "text-red-500 scale-110"
                          : "text-white"
                      }`}
                    >
                      <FaHeart />
                    </div>

                    <span className="text-xs font-semibold mt-1">
                      {formatarNumero(
                        reel.likes
                      )}
                    </span>

                  </button>

                  {/* COMENTÁRIOS */}

                  <button className="flex flex-col items-center">

                    <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-xl">
                      <FaComment />
                    </div>

                    <span className="text-xs font-semibold mt-1">
                      {formatarNumero(
                        reel.comentariosCount
                      )}
                    </span>

                  </button>

                  {/* PARTILHAR */}

                  <button
                    onClick={() =>
                      handlePartilhar(
                        reel
                      )
                    }
                    className="flex flex-col items-center"
                  >

                    <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-xl">
                      <FaShare />
                    </div>

                    <span className="text-xs font-semibold mt-1">
                      {formatarNumero(
                        reel.partilhasCount
                      )}
                    </span>

                  </button>

                  {/* GUARDAR */}

                  <button
                    onClick={() =>
                      handleSalvar(
                        reel.id
                      )
                    }
                    className="flex flex-col items-center"
                  >

                    <div
                      className={`w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-xl ${
                        salvo
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      <FaBookmark />
                    </div>

                  </button>

                  {/* DOWNLOAD */}

                  <button
                    onClick={() =>
                      handleDownload(
                        reel
                      )
                    }
                    className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-lg"
                  >
                    <FaDownload />
                  </button>

                  {/* DISCO */}

                  <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden animate-spin flex items-center justify-center bg-black/60">

                    {reel.autorFoto ? (
                      <img
                        src={
                          reel.autorFoto
                        }
                        alt="Áudio"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaMusic />
                    )}

                  </div>

                </div>

                {/* GRADIENTE */}

                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-20" />

                {/* INFORMAÇÕES */}

                <div className="absolute bottom-7 left-4 right-20 z-30">

                  <div className="flex items-center gap-2 mb-2">

                    <span className="font-bold text-base">
                      @
                      {reel.autorNome ||
                        "Utilizador"}
                    </span>

                    <button className="px-3 py-1 border border-white/70 rounded-full text-[10px] font-bold">
                      Seguir
                    </button>

                  </div>

                  {reel.descricao && (
                    <p className="text-sm text-white leading-5 mb-2 line-clamp-3">
                      {
                        reel.descricao
                      }
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-white/80">

                    <FaMusic />

                    <span className="truncate">
                      Som original -{" "}
                      {reel.autorNome ||
                        "Utilizador"}
                    </span>

                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* ===================================================
          NAVEGAÇÃO INFERIOR
      =================================================== */}

      <div className="fixed md:absolute bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-black/95 border-t border-white/10">

        <div className="flex items-center justify-around py-2">

          <button className="flex flex-col items-center gap-1 text-white text-[10px]">
            <FaHome className="text-lg" />
            Início
          </button>

          <button className="flex flex-col items-center gap-1 text-white/70 text-[10px]">
            <FaCompass className="text-lg" />
            Descobrir
          </button>

          <button
            onClick={
              abrirModalCriar
            }
            className="w-12 h-9 rounded-xl bg-gradient-to-r from-[#635BFF] to-purple-400 flex items-center justify-center text-white text-xl shadow-lg"
          >
            <FaPlus />
          </button>

          <button className="flex flex-col items-center gap-1 text-white/70 text-[10px] relative">
            <FaEnvelope className="text-lg" />
            Mensagens

            <span className="absolute -top-1 right-0 bg-red-500 rounded-full text-[8px] px-1">
              99+
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 text-white/70 text-[10px]">
            <FaUser className="text-lg" />
            Perfil
          </button>

        </div>

      </div>

      {/* ===================================================
          MODAL CRIAR
      =================================================== */}

      {modalAberto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3">

          <div className="w-full max-w-lg max-h-[95vh] overflow-y-auto bg-[#111116] border border-white/10 rounded-3xl shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-30 bg-[#111116]/95 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-lg flex items-center gap-2">

                  <FaMagic className="text-[#635BFF]" />

                  Criar Reel

                </h2>

                <p className="text-[10px] text-gray-500">
                  Editor KonnexVib V2
                </p>

              </div>

              <button
                onClick={
                  fecharModal
                }
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
              >
                <FaTimes />
              </button>

            </div>

            <div className="p-4 space-y-5">

              {/* =================================================
                  CAPTURA
              ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <p className="text-xs text-gray-400">
                    Criar conteúdo
                  </p>

                  <div className="flex items-center gap-1 text-[9px] text-green-400">

                    <FaShieldAlt />

                    Qualidade otimizada

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-2">

                  <button
                    onClick={
                      iniciarCamera
                    }
                    className="p-3 rounded-xl bg-[#635BFF]/15 border border-[#635BFF]/40 flex flex-col items-center gap-2 text-xs"
                  >

                    <FaCamera className="text-xl text-[#8b85ff]" />

                    Câmara

                  </button>

                  <button
                    onClick={
                      abrirSeletorVideo
                    }
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 text-xs"
                  >

                    <FaVideo className="text-xl" />

                    Vídeo

                  </button>

                  <button
                    onClick={
                      abrirSeletorFoto
                    }
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 text-xs"
                  >

                    <FaImage className="text-xl" />

                    Foto

                  </button>

                </div>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="video/*"
                  onChange={
                    handleVideoChange
                  }
                  className="hidden"
                />

                <input
                  ref={
                    photoInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFotoChange
                  }
                  className="hidden"
                />

              </div>

              {/* =================================================
                  QUALIDADE
              ================================================= */}

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">

                <div className="flex items-center gap-2 mb-3">

                  <FaCrown className="text-yellow-400" />

                  <div>

                    <p className="text-xs font-bold">
                      Qualidade de captura
                    </p>

                    <p className="text-[9px] text-gray-500">
                      Máxima qualidade compatível
                      com o dispositivo
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-2">

                  {Object.values(
                    QUALIDADE_PRESETS
                  ).map(
                    (preset) => (
                      <button
                        key={
                          preset.id
                        }
                        onClick={() =>
                          setQualidadeSelecionada(
                            preset.id
                          )
                        }
                        className={`p-2 rounded-xl border text-left ${
                          qualidadeSelecionada ===
                          preset.id
                            ? "border-[#635BFF] bg-[#635BFF]/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >

                        <div className="text-[10px] font-bold">
                          {
                            preset.nome
                          }
                        </div>

                        <div className="text-[8px] text-gray-500 mt-1">
                          {
                            preset.width
                          }
                          ×
                          {
                            preset.height
                          }
                        </div>

                        <div className="text-[8px] text-gray-500">
                          até{" "}
                          {
                            preset.fps
                          }{" "}
                          FPS
                        </div>

                      </button>
                    )
                  )}

                </div>

                <div className="mt-3 p-2 rounded-lg bg-[#635BFF]/10 text-[9px] text-gray-300 flex gap-2">

                  <FaInfoCircle className="text-[#8b85ff] shrink-0 mt-0.5" />

                  <span>
                    O KonnexVib tenta utilizar
                    1080p e até 60 FPS quando
                    o dispositivo e navegador
                    suportarem.
                  </span>

                </div>

              </div>

              {/* =================================================
                  CÂMARA
              ================================================= */}

              {modoCaptura ===
                "camera" && (
                <div className="space-y-3">

                  <div className="relative aspect-[9/16] max-h-[480px] mx-auto bg-black rounded-2xl overflow-hidden border border-white/10">

                    <video
                      ref={
                        cameraVideoRef
                      }
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {!cameraLigada && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">

                        <FaCamera className="text-4xl text-gray-600 mb-3" />

                        <button
                          onClick={
                            iniciarCamera
                          }
                          className="px-4 py-2 rounded-xl bg-[#635BFF] text-xs font-bold"
                        >
                          Ligar câmara
                        </button>

                      </div>
                    )}

                    {gravando && (
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">

                        <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">

                          <FaCircle className="text-red-500 text-[9px]" />

                          <span className="text-xs font-bold">
                            REC
                          </span>

                        </div>

                        <div className="bg-black/60 rounded-full px-3 py-1.5 text-xs font-bold">

                          {Math.floor(
                            tempoGravacao /
                              60
                          )
                            .toString()
                            .padStart(
                              2,
                              "0"
                            )}

                          :

                          {(
                            tempoGravacao %
                            60
                          )
                            .toString()
                            .padStart(
                              2,
                              "0"
                            )}

                        </div>

                      </div>
                    )}

                  </div>

                  {erroCamera && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                      {
                        erroCamera
                      }
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">

                    <button
                      onClick={
                        capturarFoto
                      }
                      disabled={
                        !cameraLigada ||
                        gravando
                      }
                      className="p-3 rounded-xl bg-white/5 disabled:opacity-30 flex flex-col items-center gap-1 text-xs"
                    >
                      <FaCamera />
                      Foto HD
                    </button>

                    {!gravando ? (
                      <button
                        onClick={
                          iniciarGravacao
                        }
                        disabled={
                          !cameraLigada
                        }
                        className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 disabled:opacity-30 flex flex-col items-center gap-1 text-xs"
                      >

                        <FaCircle className="text-red-500" />

                        Gravar

                      </button>
                    ) : (
                      <button
                        onClick={
                          pararGravacao
                        }
                        className="p-3 rounded-xl bg-red-600 flex flex-col items-center gap-1 text-xs font-bold"
                      >

                        <FaStop />

                        Parar

                      </button>
                    )}

                    <button
                      onClick={
                        pararCamera
                      }
                      className="p-3 rounded-xl bg-white/5 flex flex-col items-center gap-1 text-xs"
                    >

                      <FaTimes />

                      Fechar

                    </button>

                  </div>

                </div>
              )}

              {/* =================================================
                  ARQUIVO SELECIONADO
              ================================================= */}

              {arquivoSelecionado && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      {tipoMidia ===
                      "video" ? (
                        <FaVideo className="text-green-400" />
                      ) : (
                        <FaImage className="text-green-400" />
                      )}

                      <div>

                        <p className="text-xs font-semibold truncate max-w-[230px]">
                          {
                            arquivoSelecionado.name
                          }
                        </p>

                        <p className="text-[9px] text-gray-500">
                          {formatBytes(
                            arquivoSelecionado.size
                          )}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={
                        limparCaptura
                      }
                      className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center"
                    >
                      <FaTimes className="text-xs" />
                    </button>

                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[9px] text-green-400">

                    <FaCheck />

                    Arquivo pronto para
                    upload no Cloudinary

                  </div>

                </div>
              )}

              {/* =================================================
                  PREVIEW
              ================================================= */}

              {(previewLocalUrl ||
                arquivoSelecionado) && (
                <div className="relative">

                  <div className="relative aspect-[9/16] max-h-[420px] mx-auto bg-black rounded-2xl overflow-hidden">

                    {tipoMidia ===
                    "video" ? (
                      <video
                        src={
                          previewLocalUrl
                        }
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                        style={
                          previewStyle
                        }
                      />
                    ) : (
                      <img
                        src={
                          previewLocalUrl
                        }
                        alt="Pré-visualização"
                        className="w-full h-full object-cover"
                        style={
                          previewStyle
                        }
                      />
                    )}

                    {ajustes.vinheta >
                      0 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: `inset 0 0 ${
                            ajustes.vinheta *
                            2
                          }px rgba(0,0,0,.85)`,
                        }}
                      />
                    )}

                    <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2">

                      <div className="flex items-center justify-between">

                        <div>

                          <div className="text-[10px] font-bold">
                            {
                              efeitoSelecionado.nome
                            }
                          </div>

                          <div className="text-[9px] text-gray-400">
                            {
                              QUALIDADE_PRESETS[
                                qualidadeSelecionada
                              ]?.nome
                            }

                            {" • "}

                            {
                              QUALIDADE_PRESETS[
                                qualidadeSelecionada
                              ]?.fps
                            }

                            {" FPS"}
                          </div>

                        </div>

                        <FaCheck className="text-green-400 text-xs" />

                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  ERRO
              ================================================= */}

              {erroUpload && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 p-4 text-xs">
                  {erroUpload}
                </div>
              )}

              {/* =================================================
                  BOTÕES EDITOR
              ================================================= */}

              <div className="grid grid-cols-3 gap-2">

                <button
                  onClick={() =>
                    setMostrarEditor(
                      !mostrarEditor
                    )
                  }
                  className="p-3 bg-white/5 rounded-xl text-xs flex flex-col items-center gap-1"
                >

                  <FaMagic />

                  Efeitos

                </button>

                <button
                  onClick={() =>
                    setModoColagem(
                      modoColagem ===
                        "single"
                        ? "two_vertical"
                        : "single"
                    )
                  }
                  className="p-3 bg-white/5 rounded-xl text-xs flex flex-col items-center gap-1"
                >

                  <FaTh />

                  Colagem

                </button>

                <button
                  onClick={
                    resetarAjustes
                  }
                  className="p-3 bg-white/5 rounded-xl text-xs flex flex-col items-center gap-1"
                >

                  <FaUndo />

                  Reset

                </button>

              </div>

              {/* =================================================
                  EDITOR
              ================================================= */}

              {mostrarEditor && (
                <div className="space-y-5">

                  {/* EFEITOS */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <div className="flex items-center gap-2">

                        <FaPalette className="text-[#635BFF]" />

                        <span className="text-sm font-bold">
                          Filtros &
                          Efeitos
                        </span>

                      </div>

                      <span className="text-[10px] text-gray-500">
                        {
                          TODOS_EFEITOS.length
                        }{" "}
                        estilos
                      </span>

                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">

                      {categorias.map(
                        (categoria) => (
                          <button
                            key={
                              categoria
                            }
                            onClick={() =>
                              setCategoriaFiltro(
                                categoria
                              )
                            }
                            className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] ${
                              categoriaFiltro ===
                              categoria
                                ? "bg-[#635BFF] text-white"
                                : "bg-white/5 text-gray-400"
                            }`}
                          >
                            {
                              categoria
                            }
                          </button>
                        )
                      )}

                    </div>

                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">

                      {efeitosFiltrados.map(
                        (efeito) => {
                          const ativo =
                            efeitoSelecionado.id ===
                            efeito.id;

                          const comprado =
                            efeitosComprados.includes(
                              efeito.id
                            );

                          return (
                            <button
                              key={
                                efeito.id
                              }
                              onClick={() =>
                                handleSelecionarEfeito(
                                  efeito
                                )
                              }
                              className={`relative rounded-xl overflow-hidden border transition ${
                                ativo
                                  ? "border-[#635BFF] ring-1 ring-[#635BFF]"
                                  : "border-white/10"
                              }`}
                            >

                              <div className="h-16 bg-gradient-to-br from-gray-700 via-gray-500 to-gray-900">

                                {previewLocalUrl &&
                                  tipoMidia ===
                                    "video" && (
                                    <video
                                      src={
                                        previewLocalUrl
                                      }
                                      muted
                                      playsInline
                                      className="w-full h-full object-cover"
                                      style={{
                                        filter:
                                          efeito.filterCss,
                                      }}
                                    />
                                  )}

                                {previewLocalUrl &&
                                  tipoMidia ===
                                    "foto" && (
                                    <img
                                      src={
                                        previewLocalUrl
                                      }
                                      alt={
                                        efeito.nome
                                      }
                                      className="w-full h-full object-cover"
                                      style={{
                                        filter:
                                          efeito.filterCss,
                                      }}
                                    />
                                  )}

                              </div>

                              <div className="p-1.5 bg-black/70">

                                <div className="text-[9px] truncate">
                                  {
                                    efeito.nome
                                  }
                                </div>

                                {efeito.pro &&
                                !comprado ? (
                                  <div className="flex items-center gap-1 text-[8px] text-yellow-400">

                                    <FaLock />

                                    PRO

                                  </div>
                                ) : (
                                  <div className="text-[8px] text-green-400">

                                    {ativo
                                      ? "✓ Ativo"
                                      : "Grátis"}

                                  </div>
                                )}

                              </div>

                              {ativo && (
                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#635BFF] flex items-center justify-center">

                                  <FaCheck className="text-[9px]" />

                                </div>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* AJUSTES */}

                  <div>

                    <div className="flex items-center gap-2 mb-3">

                      <FaSlidersH className="text-[#635BFF]" />

                      <span className="text-sm font-bold">
                        Ajustes profissionais
                      </span>

                    </div>

                    <div className="space-y-3">

                      <EditorSlider
                        icon={
                          <FaSun />
                        }
                        label="Brilho"
                        value={
                          ajustes.brilho
                        }
                        min={50}
                        max={150}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "brilho",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaAdjust />
                        }
                        label="Contraste"
                        value={
                          ajustes.contraste
                        }
                        min={50}
                        max={160}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "contraste",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaPalette />
                        }
                        label="Saturação"
                        value={
                          ajustes.saturacao
                        }
                        min={0}
                        max={200}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "saturacao",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaCamera />
                        }
                        label="Exposição"
                        value={
                          ajustes.exposicao
                        }
                        min={60}
                        max={150}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "exposicao",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaCloudSun />
                        }
                        label="Temperatura"
                        value={
                          ajustes.temperatura
                        }
                        min={-30}
                        max={30}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "temperatura",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaExpand />
                        }
                        label="Desfoque"
                        value={
                          ajustes.desfoque
                        }
                        min={0}
                        max={5}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "desfoque",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaMoon />
                        }
                        label="Vinheta"
                        value={
                          ajustes.vinheta
                        }
                        min={0}
                        max={40}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "vinheta",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaExpand />
                        }
                        label="Zoom"
                        value={
                          ajustes.zoom
                        }
                        min={90}
                        max={130}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "zoom",
                            value
                          )
                        }
                      />

                      <EditorSlider
                        icon={
                          <FaSyncAlt />
                        }
                        label="Rotação"
                        value={
                          ajustes.rotacao
                        }
                        min={-10}
                        max={10}
                        onChange={(
                          value
                        ) =>
                          alterarAjuste(
                            "rotacao",
                            value
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          setAjustes(
                            (prev) => ({
                              ...prev,
                              espelho:
                                !prev.espelho,
                            })
                          )
                        }
                        className={`w-full py-2.5 rounded-xl text-xs ${
                          ajustes.espelho
                            ? "bg-[#635BFF]/20 text-white border border-[#635BFF]"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        Espelhar
                        horizontalmente
                      </button>

                    </div>

                  </div>

                  {/* FORMATO */}

                  <div>

                    <div className="flex items-center gap-2 mb-3">

                      <FaTh className="text-[#635BFF]" />

                      <span className="text-sm font-bold">
                        Formato
                      </span>

                    </div>

                    <div className="grid grid-cols-4 gap-2">

                      {[
                        "9:16",
                        "1:1",
                        "4:5",
                        "16:9",
                      ].map(
                        (formato) => (
                          <button
                            key={
                              formato
                            }
                            onClick={() =>
                              setFormatoSelecionado(
                                formato
                              )
                            }
                            className={`py-3 rounded-xl text-xs font-semibold border ${
                              formatoSelecionado ===
                              formato
                                ? "bg-[#635BFF] border-[#635BFF]"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            {
                              formato
                            }
                          </button>
                        )
                      )}

                    </div>

                  </div>

                  {/* COLAGEM */}

                  <div>

                    <div className="flex items-center gap-2 mb-3">

                      <FaTh className="text-[#635BFF]" />

                      <span className="text-sm font-bold">
                        Colagem
                      </span>

                    </div>

                    <div className="grid grid-cols-5 gap-2">

                      {LAYOUTS_COLAGEM.map(
                        (layout) => (
                          <button
                            key={
                              layout.id
                            }
                            onClick={() =>
                              setModoColagem(
                                layout.id
                              )
                            }
                            className={`p-2 rounded-xl border ${
                              modoColagem ===
                              layout.id
                                ? "border-[#635BFF] bg-[#635BFF]/10"
                                : "border-white/10"
                            }`}
                          >

                            <div
                              className={`grid ${layout.className} gap-0.5 h-10`}
                            >

                              {Array.from(
                                {
                                  length:
                                    layout.id ===
                                    "single"
                                      ? 1
                                      : layout.id ===
                                        "three"
                                      ? 3
                                      : layout.id ===
                                        "four"
                                      ? 4
                                      : 2,
                                }
                              ).map(
                                (
                                  _,
                                  index
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="bg-gray-600 rounded-sm"
                                  />
                                )
                              )}

                            </div>

                            <div className="text-[8px] mt-1 truncate">
                              {
                                layout.nome
                              }
                            </div>

                          </button>
                        )
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  DESCRIÇÃO
              ================================================= */}

              <div>

                <label className="text-xs text-gray-400">
                  Legenda, descrição e hashtags
                </label>

                <textarea
                  value={
                    descricao
                  }
                  onChange={(e) =>
                    setDescricao(
                      e.target.value
                    )
                  }
                  rows={3}
                  maxLength={2200}
                  placeholder="#KonnexVib #Reels #Mozambique"
                  className="mt-2 w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-xs outline-none resize-none focus:border-[#635BFF]"
                />

                <div className="text-right text-[9px] text-white/40 mt-1">
                  {
                    descricao.length
                  }
                  /2200
                </div>

              </div>

              {/* =================================================
                  CLOUDINARY
              ================================================= */}

              <div className="rounded-2xl border border-[#635BFF]/20 bg-[#635BFF]/10 p-4">

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-full bg-[#635BFF]/20 flex items-center justify-center shrink-0">
                    ☁️
                  </div>

                  <div>

                    <h4 className="font-semibold text-sm">
                      Armazenamento otimizado
                    </h4>

                    <p className="text-xs text-white/60 mt-1 leading-5">
                      A foto ou vídeo será
                      enviado diretamente
                      para o Cloudinary.
                      O Firestore guardará
                      os dados da publicação,
                      a URL e o identificador
                      da mídia.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  QUALIDADE
              ================================================= */}

              <div className="rounded-2xl border border-[#635BFF]/20 bg-[#635BFF]/5 p-3">

                <div className="flex gap-3">

                  <div className="w-9 h-9 rounded-xl bg-[#635BFF]/20 flex items-center justify-center shrink-0">

                    <FaBolt className="text-[#8b85ff]" />

                  </div>

                  <div>

                    <p className="text-xs font-bold">
                      KonnexVib Quality
                    </p>

                    <p className="text-[9px] text-gray-400 mt-1 leading-4">
                      Captura em alta definição,
                      exposição equilibrada,
                      bitrate elevado e até
                      60 FPS quando suportados
                      pelo dispositivo.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              {statusUpload && (
                <div className="text-[10px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  {statusUpload}
                </div>
              )}

              {/* =================================================
                  PUBLICAR
              ================================================= */}

              <div className="flex gap-2 pt-2">

                <button
                  onClick={
                    fecharModal
                  }
                  disabled={
                    uploading
                  }
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  onClick={
                    handlePublicarReel
                  }
                  disabled={
                    uploading ||
                    !arquivoSelecionado
                  }
                  className="flex-1 py-3 rounded-xl bg-[#635BFF] hover:bg-[#554de6] text-white text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2"
                >

                  {uploading ? (
                    <>
                      <FaSyncAlt className="animate-spin" />

                      A enviar...
                    </>
                  ) : (
                    <>
                      <FaUpload />

                      Publicar Reel
                    </>
                  )}

                </button>

              </div>

              <p className="text-[10px] text-center text-white/40 leading-5">

                A mídia é enviada para o
                Cloudinary sem ser armazenada
                no Firestore. O Firestore guarda
                apenas os metadados e o endereço
                da mídia.

              </p>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL PRO
      ===================================================== */}

      {modalPagamento && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">

          <div className="w-full max-w-sm bg-[#15151b] border border-white/10 rounded-3xl p-6 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center text-2xl mb-4">

              <FaStar />

            </div>

            <h3 className="text-lg font-bold">
              Efeito PRO
            </h3>

            <p className="text-xs text-gray-400 mt-2">

              O efeito{" "}

              <span className="text-white font-semibold">

                {
                  modalPagamento.nome
                }

              </span>{" "}

              pertence à coleção
              profissional KonnexVib.

            </p>

            <div className="mt-4 bg-white/5 rounded-xl p-4">

              <div className="text-[10px] text-gray-500">
                Categoria
              </div>

              <div className="text-sm font-semibold">
                {
                  modalPagamento.categoria
                }
              </div>

            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">

              <button
                onClick={() =>
                  setModalPagamento(
                    null
                  )
                }
                className="py-3 rounded-xl bg-white/5 text-xs"
              >
                Cancelar
              </button>

              <button
                onClick={
                  handleConfirmarCompraEfeito
                }
                className="py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-xs"
              >
                Desbloquear
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   SLIDER
========================================================= */

function EditorSlider({
  icon,
  label,
  value,
  min,
  max,
  onChange,
}) {
  return (
    <div className="bg-white/[0.03] rounded-xl px-3 py-2">

      <div className="flex items-center justify-between mb-1">

        <div className="flex items-center gap-2 text-xs">

          <span className="text-[#635BFF]">
            {icon}
          </span>

          {label}

        </div>

        <span className="text-[9px] text-gray-500">
          {value}
        </span>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full accent-[#635BFF] cursor-pointer"
      />

    </div>
  );
}