import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Upload,
  Download,
  RotateCw,
  FlipHorizontal,
  Scissors,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Type,
  Smile,
  Image as ImageIcon,
  Video,
  Sparkles,
  Crown,
  Lock,
  X,
  Plus,
  Trash2,
  Music,
  Wand2,
} from "lucide-react";

import {
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { db, auth } from "../../firebase";


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const PRECO_RECURSO_VIP = 50;

const GRATUITOS_POR_CATEGORIA = 5;


// ============================================================
// FILTROS
// ============================================================

const FILTROS = [
  {
    id: "normal",
    nome: "Normal",
    css: "none",
    gratis: true,
  },

  {
    id: "pb",
    nome: "P&B",
    css: "grayscale(100%)",
    gratis: true,
  },

  {
    id: "sepia",
    nome: "Sépia",
    css: "sepia(80%)",
    gratis: true,
  },

  {
    id: "brilho",
    nome: "Brilho",
    css: "brightness(115%)",
    gratis: true,
  },

  {
    id: "contraste",
    nome: "Contraste",
    css: "contrast(125%)",
    gratis: true,
  },

  {
    id: "cinema",
    nome: "Cinema",
    css:
      "contrast(125%) brightness(90%) saturate(90%)",
    gratis: false,
  },

  {
    id: "vibrante",
    nome: "Vibrante",
    css:
      "saturate(180%) contrast(110%)",
    gratis: false,
  },

  {
    id: "quente",
    nome: "Quente",
    css:
      "sepia(20%) saturate(160%) brightness(108%)",
    gratis: false,
  },

  {
    id: "frio",
    nome: "Frio",
    css:
      "hue-rotate(180deg) saturate(120%)",
    gratis: false,
  },

  {
    id: "vintage",
    nome: "Vintage",
    css:
      "sepia(45%) contrast(110%) saturate(85%)",
    gratis: false,
  },

  {
    id: "drama",
    nome: "Drama",
    css:
      "contrast(160%) brightness(90%) saturate(115%)",
    gratis: false,
  },

  {
    id: "noite",
    nome: "Noite",
    css:
      "brightness(65%) contrast(135%)",
    gratis: false,
  },

  {
    id: "dourado",
    nome: "Dourado",
    css:
      "sepia(30%) saturate(170%) brightness(110%)",
    gratis: false,
  },

  {
    id: "neon",
    nome: "Neon",
    css:
      "saturate(220%) contrast(140%) brightness(110%)",
    gratis: false,
  },

  {
    id: "cinza",
    nome: "Cinza",
    css:
      "grayscale(70%) contrast(120%)",
    gratis: false,
  },
];


// ============================================================
// EFEITOS
// ============================================================

const EFEITOS = [
  {
    id: "glow",
    nome: "Glow",
    css:
      "brightness(108%) saturate(115%)",
    gratis: true,
  },

  {
    id: "luz",
    nome: "Luz",
    css:
      "brightness(120%)",
    gratis: true,
  },

  {
    id: "cor",
    nome: "Cor",
    css:
      "saturate(130%)",
    gratis: true,
  },

  {
    id: "suave",
    nome: "Suave",
    css:
      "brightness(105%) contrast(92%)",
    gratis: true,
  },

  {
    id: "natural",
    nome: "Natural",
    css:
      "brightness(105%) saturate(108%)",
    gratis: true,
  },

  {
    id: "cyber",
    nome: "Cyberpunk",
    css:
      "hue-rotate(90deg) contrast(170%) saturate(150%)",
    gratis: false,
  },

  {
    id: "raiox",
    nome: "Raio-X",
    css:
      "invert(80%)",
    gratis: false,
  },

  {
    id: "soft",
    nome: "Soft Focus",
    css:
      "blur(3px) brightness(115%)",
    gratis: false,
  },

  {
    id: "hdr",
    nome: "HDR",
    css:
      "contrast(145%) saturate(135%) brightness(105%)",
    gratis: false,
  },

  {
    id: "glitch",
    nome: "Glitch",
    css:
      "contrast(180%) saturate(170%) hue-rotate(25deg)",
    gratis: false,
  },

  {
    id: "fantasia",
    nome: "Fantasia",
    css:
      "saturate(180%) hue-rotate(25deg) brightness(110%)",
    gratis: false,
  },

  {
    id: "dark",
    nome: "Dark Mood",
    css:
      "brightness(65%) contrast(145%)",
    gratis: false,
  },

  {
    id: "vhs",
    nome: "VHS",
    css:
      "contrast(130%) saturate(80%) sepia(20%)",
    gratis: false,
  },

  {
    id: "ice",
    nome: "Ice Blue",
    css:
      "hue-rotate(160deg) saturate(130%)",
    gratis: false,
  },

  {
    id: "ultracolor",
    nome: "Ultra Color",
    css:
      "saturate(250%) contrast(130%)",
    gratis: false,
  },
];


// ============================================================
// COMPONENTE
// ============================================================

export default function Editor() {

  // ----------------------------------------------------------
  // MEDIA
  // ----------------------------------------------------------

  const [media, setMedia] = useState(null);

  const [arquivoOriginal, setArquivoOriginal] =
    useState(null);

  const [tipoMedia, setTipoMedia] =
    useState("image");


  // ----------------------------------------------------------
  // EDIÇÃO
  // ----------------------------------------------------------

  const [filtro, setFiltro] =
    useState("none");

  const [brightness, setBrightness] =
    useState(100);

  const [contrast, setContrast] =
    useState(100);

  const [saturate, setSaturate] =
    useState(100);

  const [blur, setBlur] =
    useState(0);

  const [rotate, setRotate] =
    useState(0);

  const [flip, setFlip] =
    useState(false);

  const [speed, setSpeed] =
    useState(1);

  const [volume, setVolume] =
    useState(1);

  const [muted, setMuted] =
    useState(false);


  // ----------------------------------------------------------
  // TEXTO
  // ----------------------------------------------------------

  const [texto, setTexto] =
    useState("");

  const [textoX, setTextoX] =
    useState(50);

  const [textoY, setTextoY] =
    useState(85);

  const [textoTamanho, setTextoTamanho] =
    useState(32);


  // ----------------------------------------------------------
  // STICKERS
  // ----------------------------------------------------------

  const [stickers, setStickers] =
    useState([]);


  // ----------------------------------------------------------
  // ÁUDIO
  // ----------------------------------------------------------

  const [audio, setAudio] =
    useState(null);


  // ----------------------------------------------------------
  // CONTROLO
  // ----------------------------------------------------------

  const [playing, setPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [inicioCorte, setInicioCorte] =
    useState(0);

  const [fimCorte, setFimCorte] =
    useState(0);


  // ----------------------------------------------------------
  // VIP
  // ----------------------------------------------------------

  const [saldoVIP, setSaldoVIP] =
    useState(0);

  const [isPremium, setIsPremium] =
    useState(false);

  const [modalVIP, setModalVIP] =
    useState(false);

  const [recursoVIP, setRecursoVIP] =
    useState(null);


  // ----------------------------------------------------------
  // MENSAGEM
  // ----------------------------------------------------------

  const [mensagem, setMensagem] =
    useState("");


  // ----------------------------------------------------------
  // REFS
  // ----------------------------------------------------------

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const fileInputRef = useRef(null);

  const audioInputRef = useRef(null);

  const animationRef = useRef(null);


  // ==========================================================
  // FIREBASE — PERFIL
  // ==========================================================

  useEffect(() => {

    const carregarPerfil = async () => {

      const user = auth.currentUser;

      if (!user) return;

      try {

        const ref = doc(
          db,
          "users",
          user.uid
        );

        const snap = await getDoc(ref);

        if (snap.exists()) {

          const data = snap.data();

          setIsPremium(
            data.isPremium === true ||
            data.vipAtivo === true
          );
        }

      } catch (error) {

        console.error(
          "Erro ao carregar perfil:",
          error
        );
      }
    };

    carregarPerfil();

  }, []);


  // ==========================================================
  // FIREBASE — SALDO VIP
  // ==========================================================

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {

      setSaldoVIP(0);

      return;
    }

    const ref = doc(
      db,
      "saldos",
      user.uid
    );

    const unsubscribe =
      onSnapshot(
        ref,
        (snap) => {

          if (!snap.exists()) {

            setSaldoVIP(0);

            return;
          }

          const data =
            snap.data() || {};

          const saldo = Number(
            data.saldoVIP ??
            data.saldo ??
            data.moedas ??
            data.balance ??
            0
          );

          setSaldoVIP(
            Number.isFinite(saldo)
              ? Math.max(0, saldo)
              : 0
          );
        },
        (error) => {

          console.error(
            "Erro ao carregar saldo VIP:",
            error
          );
        }
      );

    return () => unsubscribe();

  }, []);


  // ==========================================================
  // UPLOAD FOTO/VÍDEO
  // ==========================================================

  const handleUpload = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    setArquivoOriginal(file);

    setMedia(url);

    setTipoMedia(
      file.type.startsWith("video/")
        ? "video"
        : "image"
    );

    setFiltro("none");

    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setBlur(0);

    setRotate(0);
    setFlip(false);

    setSpeed(1);
    setVolume(1);
    setMuted(false);

    setTexto("");
    setStickers([]);

    setCurrentTime(0);

    setMensagem(
      "Ficheiro carregado."
    );
  };


  // ==========================================================
  // ÁUDIO
  // ==========================================================

  const handleAudioUpload = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    setAudio({
      file,
      url,
      name: file.name,
    });

    setMensagem(
      "Áudio carregado."
    );
  };


  // ==========================================================
  // RESET
  // ==========================================================

  const resetarEdicao = () => {

    setFiltro("none");

    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setBlur(0);

    setRotate(0);
    setFlip(false);

    setSpeed(1);
    setVolume(1);
    setMuted(false);

    setTexto("");
    setStickers([]);

    setMensagem(
      "Edições restauradas."
    );
  };


  // ==========================================================
  // FILTER CSS
  // ==========================================================

  const obterFilterCSS = () => {

    return [
      filtro,
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturate}%)`,
      `blur(${blur}px)`,
    ]
      .filter(Boolean)
      .join(" ");
  };


  // ==========================================================
  // TRANSFORMAÇÃO
  // ==========================================================

  const obterTransformCSS = () => {

    return `
      rotate(${rotate}deg)
      scaleX(${flip ? -1 : 1})
    `;
  };


  // ==========================================================
  // VIDEO EVENTOS
  // ==========================================================

  const handleLoadedMetadata = () => {

    const video =
      videoRef.current;

    if (!video) return;

    const duracao =
      video.duration || 0;

    setDuration(duracao);

    setFimCorte(duracao);
  };


  const handleTimeUpdate = () => {

    const video =
      videoRef.current;

    if (!video) return;

    setCurrentTime(
      video.currentTime
    );
  };


  // ==========================================================
  // PLAY / PAUSE
  // ==========================================================

  const alternarPlay = async () => {

    const video =
      videoRef.current;

    if (!video) return;

    try {

      if (video.paused) {

        await video.play();

        setPlaying(true);

      } else {

        video.pause();

        setPlaying(false);
      }

    } catch (error) {

      console.error(
        "Erro no vídeo:",
        error
      );
    }
  };


  // ==========================================================
  // VELOCIDADE
  // ==========================================================

  useEffect(() => {

    if (!videoRef.current) return;

    videoRef.current.playbackRate =
      speed;

  }, [speed]);


  // ==========================================================
  // VOLUME
  // ==========================================================

  useEffect(() => {

    if (!videoRef.current) return;

    videoRef.current.volume =
      muted ? 0 : volume;

  }, [volume, muted]);


  // ==========================================================
  // ROTAÇÃO
  // ==========================================================

  const rodarDireita = () => {

    setRotate(
      (valor) =>
        (valor + 90) % 360
    );
  };


  // ==========================================================
  // STICKER
  // ==========================================================

  const adicionarSticker = (
    emoji
  ) => {

    setStickers((lista) => [

      ...lista,

      {
        id:
          Date.now() +
          Math.random(),

        emoji,

        x: 50,

        y: 50,

        size: 50,
      },

    ]);
  };


  const removerSticker = (id) => {

    setStickers(
      (lista) =>
        lista.filter(
          (item) =>
            item.id !== id
        )
    );
  };


  // ==========================================================
  // RECURSO VIP
  // ==========================================================

  const selecionarRecurso = (
    recurso,
    tipo
  ) => {

    if (recurso.gratis) {

      if (tipo === "filtro") {

        setFiltro(
          recurso.css
        );

      } else {

        setFiltro(
          recurso.css
        );
      }

      setMensagem(
        `${recurso.nome} aplicado.`
      );

      return;
    }


    if (isPremium) {

      setFiltro(
        recurso.css
      );

      setMensagem(
        `${recurso.nome} aplicado.`
      );

      return;
    }


    if (
      saldoVIP <
      PRECO_RECURSO_VIP
    ) {

      setRecursoVIP({
        nome: recurso.nome,
        preco: PRECO_RECURSO_VIP,
      });

      setModalVIP(true);

      return;
    }


    /*
      Não fazemos a cobrança diretamente
      no navegador.

      O backend deverá confirmar e descontar
      o saldo de forma segura.

      Enquanto isso o recurso pode ser
      visualizado.
    */

    setFiltro(
      recurso.css
    );

    setMensagem(
      `${recurso.nome} aplicado.`
    );
  };


  // ==========================================================
  // CANVAS — DESENHAR FOTO/VÍDEO
  // ==========================================================

  const desenharCanvas = (
    ctx,
    source,
    width,
    height
  ) => {

    ctx.save();

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    // --------------------------------------------------------
    // FUNDO
    // --------------------------------------------------------

    ctx.fillStyle = "#000";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    // --------------------------------------------------------
    // TRANSFORMAÇÃO
    // --------------------------------------------------------

    ctx.translate(
      width / 2,
      height / 2
    );

    ctx.rotate(
      (rotate * Math.PI) / 180
    );

    ctx.scale(
      flip ? -1 : 1,
      1
    );


    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    ctx.filter =
      obterFilterCSS();


    let drawWidth =
      width;

    let drawHeight =
      height;


    const ratio =
      Math.min(
        width / source.videoWidth ||
          width / source.width ||
          1,

        height / source.videoHeight ||
          height / source.height ||
          1
      );


    if (
      source.videoWidth
    ) {

      drawWidth =
        source.videoWidth *
        ratio;

      drawHeight =
        source.videoHeight *
        ratio;

    } else {

      drawWidth =
        source.width *
        ratio;

      drawHeight =
        source.height *
        ratio;
    }


    ctx.drawImage(
      source,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );


    ctx.restore();


    // --------------------------------------------------------
    // TEXTO
    // --------------------------------------------------------

    if (texto) {

      ctx.save();

      ctx.fillStyle =
        "white";

      ctx.strokeStyle =
        "black";

      ctx.lineWidth = 6;

      ctx.font =
        `bold ${textoTamanho}px Arial`;

      ctx.textAlign =
        "center";

      const x =
        width *
        (textoX / 100);

      const y =
        height *
        (textoY / 100);

      ctx.strokeText(
        texto,
        x,
        y
      );

      ctx.fillText(
        texto,
        x,
        y
      );

      ctx.restore();
    }


    // --------------------------------------------------------
    // STICKERS
    // --------------------------------------------------------

    stickers.forEach(
      (sticker) => {

        ctx.save();

        ctx.font =
          `${sticker.size}px Arial`;

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "middle";

        ctx.fillText(
          sticker.emoji,
          width *
            (sticker.x / 100),
          height *
            (sticker.y / 100)
        );

        ctx.restore();
      }
    );
  };


  // ==========================================================
  // EXPORTAR FOTO
  // ==========================================================

  const exportarFoto = () => {

    if (
      !media ||
      tipoMedia !== "image"
    ) {

      setMensagem(
        "Carregue uma foto primeiro."
      );

      return;
    }


    const imagem =
      new Image();

    imagem.onload = () => {

      const canvas =
        canvasRef.current;

      if (!canvas) return;


      canvas.width =
        imagem.naturalWidth;

      canvas.height =
        imagem.naturalHeight;


      const ctx =
        canvas.getContext(
          "2d"
        );


      desenharCanvas(
        ctx,
        imagem,
        canvas.width,
        canvas.height
      );


      canvas.toBlob(
        (blob) => {

          if (!blob) return;


          const url =
            URL.createObjectURL(
              blob
            );


          const link =
            document.createElement(
              "a"
            );

          link.href = url;

          link.download =
            "konnexvib-foto-editada.png";

          link.click();

          URL.revokeObjectURL(
            url
          );


          setMensagem(
            "Foto exportada com sucesso."
          );
        },
        "image/png"
      );

    };


    imagem.src = media;
  };


  // ==========================================================
  // EXPORTAR VÍDEO
  // ==========================================================

  const exportarVideo = async () => {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;


    if (
      !video ||
      !canvas ||
      tipoMedia !== "video"
    ) {

      setMensagem(
        "Carregue um vídeo primeiro."
      );

      return;
    }


    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {

      setMensagem(
        "Aguarde o vídeo carregar."
      );

      return;
    }


    setMensagem(
      "A preparar exportação do vídeo..."
    );


    const width =
      video.videoWidth;

    const height =
      video.videoHeight;


    canvas.width =
      width;

    canvas.height =
      height;


    const ctx =
      canvas.getContext(
        "2d"
      );


    const stream =
      canvas.captureStream(30);


    /*
      Captura o áudio do vídeo
      quando o navegador permitir.
    */

    let audioContext = null;

    let audioDestination = null;

    let audioSource = null;


    try {

      audioContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();


      audioSource =
        audioContext.createMediaElementSource(
          video
        );


      audioDestination =
        audioContext.createMediaStreamDestination();


      audioSource.connect(
        audioDestination
      );


      audioSource.connect(
        audioContext.destination
      );


      const audioTracks =
        audioDestination
          .stream
          .getAudioTracks();


      audioTracks.forEach(
        (track) => {
          stream.addTrack(
            track
          );
        }
      );

    } catch (error) {

      console.warn(
        "Áudio do vídeo não pôde ser capturado:",
        error
      );
    }


    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];


    const mimeType =
      mimeTypes.find(
        (tipo) =>
          MediaRecorder.isTypeSupported(
            tipo
          )
      );


    if (!mimeType) {

      setMensagem(
        "O navegador não suporta exportação de vídeo."
      );

      return;
    }


    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType,
          videoBitsPerSecond:
            5000000,
        }
      );


    const partes = [];


    recorder.ondataavailable =
      (event) => {

        if (
          event.data.size
        ) {

          partes.push(
            event.data
          );
        }
      };


    recorder.onerror =
      (event) => {

        console.error(
          "Erro MediaRecorder:",
          event
        );
      };


    const inicio =
      Math.max(
        0,
        inicioCorte
      );


    const fim =
      Math.min(
        duration || video.duration,
        fimCorte ||
          video.duration
      );


    video.currentTime =
      inicio;


    video.playbackRate =
      speed;


    video.volume =
      muted
        ? 0
        : volume;


    await new Promise(
      (resolve) => {

        const verificar =
          () => {

            if (
              video.readyState >=
              2
            ) {

              resolve();
            } else {

              requestAnimationFrame(
                verificar
              );
            }
          };

        verificar();
      }
    );


    const desenhar =
      () => {

        if (
          video.currentTime >=
          fim
        ) {

          video.pause();

          if (
            recorder.state ===
            "recording"
          ) {

            recorder.stop();
          }

          return;
        }


        desenharCanvas(
          ctx,
          video,
          width,
          height
        );


        animationRef.current =
          requestAnimationFrame(
            desenhar
          );
      };


    const terminou =
      new Promise(
        (resolve) => {

          recorder.onstop =
            () => resolve();
        }
      );


    recorder.start();


    await video.play();


    desenhar();


    await terminou;


    if (
      animationRef.current
    ) {

      cancelAnimationFrame(
        animationRef.current
      );
    }


    if (audioContext) {

      try {

        await audioContext.close();

      } catch {
        // ignora
      }
    }


    const blob =
      new Blob(
        partes,
        {
          type: mimeType,
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "konnexvib-video-editado.webm";

    link.click();


    URL.revokeObjectURL(
      url
    );


    setPlaying(false);

    setMensagem(
      "Vídeo exportado com sucesso."
    );
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">

      <div className="max-w-6xl mx-auto">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="text-3xl font-black">
              KonnexVib Studio
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Editor de fotos e vídeos
            </p>

          </div>


          <div className="flex items-center gap-2">

            <div className="px-4 py-2 rounded-full bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 font-bold text-sm">
              🪙 {saldoVIP} VIP
            </div>

            <div className="px-4 py-2 rounded-full bg-purple-950/60 border border-purple-700/50 text-purple-300 font-bold text-sm">
              {isPremium
                ? "👑 VIP"
                : "Conta normal"}
            </div>

          </div>

        </div>


        {/* ====================================================
            ÁREA PRINCIPAL
        ===================================================== */}

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">


          {/* ==================================================
              PREVIEW
          =================================================== */}

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-4">

            <div className="relative min-h-[520px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">

              {!media && (

                <div className="text-center">

                  <Upload
                    className="mx-auto mb-4 text-gray-600"
                    size={55}
                  />

                  <p className="text-gray-400">
                    Carregue uma foto ou vídeo
                  </p>

                </div>

              )}


              {media &&
                tipoMedia === "image" && (

                  <img
                    src={media}
                    alt="Preview"
                    className="max-h-[520px] max-w-full object-contain"
                    style={{
                      filter:
                        obterFilterCSS(),

                      transform:
                        obterTransformCSS(),
                    }}
                  />

                )}


              {media &&
                tipoMedia === "video" && (

                  <video
                    ref={videoRef}
                    src={media}
                    className="max-h-[520px] max-w-full object-contain"
                    style={{
                      filter:
                        obterFilterCSS(),

                      transform:
                        obterTransformCSS(),
                    }}
                    onLoadedMetadata={
                      handleLoadedMetadata
                    }
                    onTimeUpdate={
                      handleTimeUpdate
                    }
                    onPlay={() =>
                      setPlaying(true)
                    }
                    onPause={() =>
                      setPlaying(false)
                    }
                  />

                )}


              {/* TEXTO */}

              {texto && (

                <div
                  className="absolute pointer-events-none font-black text-white"
                  style={{
                    left:
                      `${textoX}%`,

                    top:
                      `${textoY}%`,

                    transform:
                      "translate(-50%, -50%)",

                    fontSize:
                      `${textoTamanho}px`,

                    textShadow:
                      "2px 2px 5px black",
                  }}
                >
                  {texto}
                </div>

              )}


              {/* STICKERS */}

              {stickers.map(
                (sticker) => (

                  <div
                    key={
                      sticker.id
                    }
                    className="absolute select-none"
                    style={{
                      left:
                        `${sticker.x}%`,

                      top:
                        `${sticker.y}%`,

                      transform:
                        "translate(-50%, -50%)",

                      fontSize:
                        `${sticker.size}px`,
                    }}
                  >
                    {sticker.emoji}
                  </div>

                )
              )}

            </div>


            {/* =================================================
                CONTROLOS DO VÍDEO
            ================================================== */}

            {tipoMedia ===
              "video" &&
              media && (

                <div className="mt-4">

                  <div className="flex items-center gap-3">

                    <button
                      onClick={
                        alternarPlay
                      }
                      className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500"
                    >
                      {playing ? (
                        <Pause
                          size={20}
                        />
                      ) : (
                        <Play
                          size={20}
                        />
                      )}
                    </button>


                    <div className="text-xs text-gray-400">

                      {currentTime.toFixed(
                        1
                      )}

                      {" / "}

                      {duration.toFixed(
                        1
                      )}

                      {" s"}

                    </div>

                  </div>


                  <input
                    type="range"
                    min="0"
                    max={
                      duration || 0
                    }
                    step="0.01"
                    value={
                      currentTime
                    }
                    onChange={(
                      e
                    ) => {

                      const valor =
                        Number(
                          e.target.value
                        );

                      setCurrentTime(
                        valor
                      );

                      if (
                        videoRef.current
                      ) {

                        videoRef.current.currentTime =
                          valor;
                      }

                    }}
                    className="w-full mt-3"
                  />

                </div>

              )}

          </div>


          {/* ==================================================
              FERRAMENTAS
          =================================================== */}

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-4 max-h-[800px] overflow-y-auto">

            {/* UPLOAD */}

            <div className="grid grid-cols-2 gap-2 mb-5">

              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Foto / Vídeo
              </button>


              <button
                onClick={() =>
                  audioInputRef.current?.click()
                }
                className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold flex items-center justify-center gap-2"
              >
                <Music size={18} />
                Música
              </button>

            </div>


            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={
                handleUpload
              }
              className="hidden"
            />


            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={
                handleAudioUpload
              }
              className="hidden"
            />


            {/* FILTROS */}

            <section className="mb-7">

              <div className="flex justify-between mb-3">

                <h2 className="font-bold flex items-center gap-2">
                  <Sparkles
                    size={17}
                  />
                  Filtros
                </h2>

                <span className="text-[10px] text-gray-500">
                  5 grátis
                </span>

              </div>


              <div className="flex flex-wrap gap-2">

                {FILTROS.map(
                  (item) => (

                    <button
                      key={
                        item.id
                      }
                      onClick={() =>
                        selecionarRecurso(
                          item,
                          "filtro"
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-xs border ${
                        item.gratis
                          ? "bg-gray-800 border-gray-700"
                          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                      }`}
                    >

                      {item.nome}

                      {!item.gratis &&
                        " 👑"}

                    </button>

                  )
                )}

              </div>

            </section>


            {/* EFEITOS */}

            <section className="mb-7">

              <div className="flex justify-between mb-3">

                <h2 className="font-bold flex items-center gap-2">

                  <Wand2
                    size={17}
                  />

                  Efeitos

                </h2>

                <span className="text-[10px] text-gray-500">
                  5 grátis
                </span>

              </div>


              <div className="flex flex-wrap gap-2">

                {EFEITOS.map(
                  (item) => (

                    <button
                      key={
                        item.id
                      }
                      onClick={() =>
                        selecionarRecurso(
                          item,
                          "efeito"
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-xs border ${
                        item.gratis
                          ? "bg-gray-800 border-gray-700"
                          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                      }`}
                    >

                      {item.nome}

                      {!item.gratis &&
                        " 👑"}

                    </button>

                  )
                )}

              </div>

            </section>


            {/* AJUSTES */}

            <section className="mb-7">

              <h2 className="font-bold mb-4">
                Ajustes
              </h2>


              <div className="space-y-4">

                <Controle
                  label="Brilho"
                  value={brightness}
                  min={50}
                  max={160}
                  onChange={
                    setBrightness
                  }
                />


                <Controle
                  label="Contraste"
                  value={contrast}
                  min={50}
                  max={180}
                  onChange={
                    setContrast
                  }
                />


                <Controle
                  label="Saturação"
                  value={saturate}
                  min={0}
                  max={220}
                  onChange={
                    setSaturate
                  }
                />


                <Controle
                  label="Desfoque"
                  value={blur}
                  min={0}
                  max={10}
                  step={0.1}
                  onChange={
                    setBlur
                  }
                />

              </div>

            </section>


            {/* TRANSFORMAÇÃO */}

            <section className="mb-7">

              <h2 className="font-bold mb-3">
                Transformar
              </h2>


              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={
                    rodarDireita
                  }
                  className="py-3 bg-gray-800 rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCw
                    size={17}
                  />
                  Rodar
                </button>


                <button
                  onClick={() =>
                    setFlip(
                      (valor) =>
                        !valor
                    )
                  }
                  className="py-3 bg-gray-800 rounded-xl flex items-center justify-center gap-2"
                >
                  <FlipHorizontal
                    size={17}
                  />
                  Espelhar
                </button>

              </div>

            </section>


            {/* VÍDEO */}

            {tipoMedia ===
              "video" && (

                <section className="mb-7">

                  <h2 className="font-bold mb-4 flex items-center gap-2">

                    <Video
                      size={17}
                    />

                    Vídeo

                  </h2>


                  <div className="space-y-4">

                    <Controle
                      label="Velocidade"
                      value={speed}
                      min={0.25}
                      max={2}
                      step={0.25}
                      onChange={
                        setSpeed
                      }
                    />


                    <Controle
                      label="Volume"
                      value={
                        Math.round(
                          volume *
                            100
                        )
                      }
                      min={0}
                      max={100}
                      onChange={(
                        value
                      ) =>
                        setVolume(
                          value /
                            100
                        )
                      }
                    />


                    <div>

                      <label className="text-xs text-gray-400">
                        Corte
                      </label>

                      <div className="grid grid-cols-2 gap-2 mt-2">

                        <input
                          type="number"
                          min="0"
                          max={
                            duration
                          }
                          step="0.1"
                          value={
                            inicioCorte
                          }
                          onChange={(
                            e
                          ) =>
                            setInicioCorte(
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="bg-gray-800 rounded-lg p-2 text-sm"
                        />

                        <input
                          type="number"
                          min="0"
                          max={
                            duration
                          }
                          step="0.1"
                          value={
                            fimCorte
                          }
                          onChange={(
                            e
                          ) =>
                            setFimCorte(
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="bg-gray-800 rounded-lg p-2 text-sm"
                        />

                      </div>

                    </div>


                    <button
                      onClick={() =>
                        setMuted(
                          (valor) =>
                            !valor
                        )
                      }
                      className="w-full py-3 bg-gray-800 rounded-xl flex items-center justify-center gap-2"
                    >

                      {muted ? (
                        <VolumeX
                          size={18}
                        />
                      ) : (
                        <Volume2
                          size={18}
                        />
                      )}

                      {muted
                        ? "Ativar áudio"
                        : "Silenciar"}

                    </button>

                  </div>

                </section>

              )}


            {/* TEXTO */}

            <section className="mb-7">

              <h2 className="font-bold mb-3 flex items-center gap-2">

                <Type
                  size={17}
                />

                Texto

              </h2>


              <input
                value={texto}
                onChange={(e) =>
                  setTexto(
                    e.target.value
                  )
                }
                placeholder="Escreva aqui..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm"
              />


              <div className="mt-3">

                <Controle
                  label="Tamanho"
                  value={
                    textoTamanho
                  }
                  min={12}
                  max={100}
                  onChange={
                    setTextoTamanho
                  }
                />

              </div>

            </section>


            {/* STICKERS */}

            <section className="mb-7">

              <h2 className="font-bold mb-3 flex items-center gap-2">

                <Smile
                  size={17}
                />

                Stickers

              </h2>


              <div className="flex flex-wrap gap-2">

                {[
                  "😀",
                  "😍",
                  "😂",
                  "🔥",
                  "❤️",
                  "💎",
                  "👑",
                  "⭐",
                  "🎉",
                  "💯",
                  "😎",
                  "🥰",
                  "🚀",
                  "💰",
                  "🎁",
                ].map(
                  (emoji) => (

                    <button
                      key={
                        emoji
                      }
                      onClick={() =>
                        adicionarSticker(
                          emoji
                        )
                      }
                      className="text-2xl bg-gray-800 rounded-xl p-2 hover:bg-gray-700"
                    >
                      {emoji}
                    </button>

                  )
                )}

              </div>


              {stickers.length >
                0 && (

                <button
                  onClick={() =>
                    setStickers(
                      []
                    )
                  }
                  className="mt-3 text-xs text-red-400"
                >
                  Limpar stickers
                </button>

              )}

            </section>


            {/* EXPORTAÇÃO */}

            <section>

              <h2 className="font-bold mb-3">
                Exportar
              </h2>


              <div className="grid grid-cols-2 gap-2">

                {tipoMedia ===
                  "image" ? (

                  <button
                    onClick={
                      exportarFoto
                    }
                    className="py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold flex items-center justify-center gap-2"
                  >

                    <Download
                      size={17}
                    />

                    Foto

                  </button>

                ) : (

                  <button
                    onClick={
                      exportarVideo
                    }
                    className="py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold flex items-center justify-center gap-2"
                  >

                    <Download
                      size={17}
                    />

                    Vídeo

                  </button>

                )}


                <button
                  onClick={
                    resetarEdicao
                  }
                  className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold"
                >
                  Restaurar
                </button>

              </div>

            </section>


            {/* MENSAGEM */}

            {mensagem && (

              <div className="mt-4 text-center text-sm text-blue-300">
                {mensagem}
              </div>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          MODAL VIP
      ====================================================== */}

      {modalVIP && (

        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-gray-900 border border-yellow-500/30 rounded-3xl p-7 max-w-md w-full">

            <button
              onClick={() => {
                setModalVIP(
                  false
                );

                setRecursoVIP(
                  null
                );
              }}
              className="float-right text-gray-400"
            >
              <X />
            </button>


            <div className="text-center">

              <div className="text-5xl mb-3">
                👑
              </div>


              <h2 className="text-2xl font-black text-yellow-400">
                Recurso VIP
              </h2>


              {recursoVIP && (

                <div className="mt-4">

                  <p className="text-white font-bold">
                    {recursoVIP.nome}
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    Este recurso custa
                  </p>

                  <p className="text-yellow-400 text-2xl font-black">
                    {recursoVIP.preco} VIP
                  </p>

                  <p className="text-gray-500 text-sm mt-2">
                    Saldo atual:
                    {" "}
                    {saldoVIP} VIP
                  </p>

                </div>

              )}


              <button
                onClick={() => {

                  setModalVIP(
                    false
                  );

                  /*
                    Aqui deverá ser ligado
                    ao teu sistema real de
                    adicionar saldo.
                  */

                  setMensagem(
                    "Adicione saldo VIP para desbloquear este recurso."
                  );

                }}
                className="w-full mt-6 py-3 rounded-xl bg-yellow-500 text-black font-black"
              >
                🪙 Adicionar saldo VIP
              </button>


              <button
                onClick={() =>
                  setModalVIP(
                    false
                  )
                }
                className="w-full mt-2 py-3 rounded-xl bg-gray-800 text-gray-300"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          CANVAS INVISÍVEL PARA EXPORTAÇÃO
      ====================================================== */}

      <canvas
        ref={canvasRef}
        className="hidden"
      />

    </div>
  );
}


// ============================================================
// COMPONENTE CONTROLE
// ============================================================

function Controle({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}) {

  return (

    <div>

      <div className="flex justify-between mb-1">

        <label className="text-xs text-gray-400">
          {label}
        </label>

        <span className="text-xs text-gray-500">
          {value}
        </span>

      </div>


      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(
            Number(
              e.target.value
            )
          )
        }
        className="w-full"
      />

    </div>
  );
}