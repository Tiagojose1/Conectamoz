import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaCopy,
  FaStop,
  FaCircle,
  FaTimes,
  FaPlay,
  FaPause,
  FaClock,
  FaBroadcastTower,
  FaFilm,
  FaSave,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import { Timestamp } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";

import {
  WEBRTC_CONFIG,
  createLive,
  startLive,
  endLive,
  saveOffer,
  subscribeToAnswer,
  subscribeToAnswerCandidates,
  addOfferCandidate,
  updateLive,
} from "../services/liveService";


/* ============================================================
   CLOUDINARY
============================================================ */

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


/* ============================================================
   CONSTANTES
============================================================ */

const LIVE_RECORDING_DAYS = 30;

const LIVE_RECORDING_MS =
  LIVE_RECORDING_DAYS *
  24 *
  60 *
  60 *
  1000;


/* ============================================================
   COMPONENTE
============================================================ */

export default function CreateLive() {
  const navigate = useNavigate();

  const { currentUser, loading: authLoading } = useAuth();


  /* ==========================================================
     REFS
  ========================================================== */

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const peerConnectionRef = useRef(null);

  const unsubscribeAnswerRef = useRef(null);

  const unsubscribeAnswerCandidatesRef = useRef(null);

  const liveIdRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);

  const answerAppliedRef = useRef(false);

  const liveStartedAtRef = useRef(null);

  const liveTimerRef = useRef(null);

  const livePausedAtRef = useRef(null);

  const totalPausedMsRef = useRef(0);

  const pausedSenderTracksRef = useRef({});


  /* ==========================================================
     MEDIA RECORDER
  ========================================================== */

  const mediaRecorderRef = useRef(null);

  const recordingChunksRef = useRef([]);

  const recordingMimeTypeRef = useRef(null);

  const recordingBlobRef = useRef(null);

  const recordingStartedAtRef = useRef(null);


  /* ==========================================================
     CAMERA / MICROFONE
  ========================================================== */

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [microphoneEnabled, setMicrophoneEnabled] =
    useState(true);

  const [cameraReady, setCameraReady] =
    useState(false);


  /* ==========================================================
     FORMULÁRIO
  ========================================================== */

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [audience, setAudience] =
    useState("Público");


  /* ==========================================================
     ESTADOS
  ========================================================== */

  const [loadingMedia, setLoadingMedia] =
    useState(true);

  const [permissionError, setPermissionError] =
    useState("");

  const [isLive, setIsLive] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [pausingLive, setPausingLive] =
    useState(false);

  const [startingLive, setStartingLive] =
    useState(false);

  const [endingLive, setEndingLive] =
    useState(false);

  const [savingRecording, setSavingRecording] =
    useState(false);

  const [liveId, setLiveId] =
    useState("");

  const [shareLink, setShareLink] =
    useState("");

  const [connectionStatus, setConnectionStatus] =
    useState("Preparando transmissão...");

  const [copySuccess, setCopySuccess] =
    useState(false);

  const [videoResolution, setVideoResolution] =
    useState("A verificar...");

  const [videoQuality, setVideoQuality] =
    useState("Automática");

  const [liveDuration, setLiveDuration] =
    useState("00:00:00");


  /* ==========================================================
     MODAL REEL
  ========================================================== */

  const [showReelModal, setShowReelModal] =
    useState(false);

  const [finishedLiveData, setFinishedLiveData] =
    useState(null);

  const [reelProcessing, setReelProcessing] =
    useState(false);

  const [recordingSaved, setRecordingSaved] =
    useState(false);

  const [recordingError, setRecordingError] =
    useState("");


  /* ==========================================================
     FORMATAR TEMPO
  ========================================================== */

  const formatLiveDuration = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(
      safeSeconds / 3600
    );

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const secs = Math.floor(
      safeSeconds % 60
    );

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };


  /* ==========================================================
     ATUALIZAR RESOLUÇÃO
  ========================================================== */

  const updateVideoResolution = (stream) => {
    if (!stream) {
      setVideoResolution("A verificar...");
      return;
    }

    const videoTrack =
      stream.getVideoTracks()[0];

    if (!videoTrack) {
      setVideoResolution("Sem vídeo");
      return;
    }

    const settings =
      videoTrack.getSettings();

    const width = settings.width || 0;

    const height = settings.height || 0;

    if (width >= 2560 && height >= 1440) {
      setVideoResolution("2K");
      return;
    }

    if (width >= 1920 && height >= 1080) {
      setVideoResolution("Full HD");
      return;
    }

    if (width >= 1280 && height >= 720) {
      setVideoResolution("HD");
      return;
    }

    if (width >= 854 && height >= 480) {
      setVideoResolution("480p");
      return;
    }

    if (width >= 640 && height >= 480) {
      setVideoResolution("SD");
      return;
    }

    setVideoResolution("Baixa");
  };


  /* ==========================================================
     OTIMIZAR VÍDEO
  ========================================================== */

  const optimizeVideoTrack = async (
    videoTrack
  ) => {
    if (!videoTrack) {
      return;
    }

    try {
      const capabilities =
        videoTrack.getCapabilities
          ? videoTrack.getCapabilities()
          : {};

      const maxWidth =
        capabilities.width?.max || 1920;

      const maxHeight =
        capabilities.height?.max || 1080;


      const resolutions = [
        {
          width: 2560,
          height: 1440,
          label: "2K",
        },
        {
          width: 1920,
          height: 1080,
          label: "Full HD",
        },
        {
          width: 1280,
          height: 720,
          label: "HD",
        },
        {
          width: 854,
          height: 480,
          label: "480p",
        },
        {
          width: 640,
          height: 480,
          label: "SD",
        },
      ];


      let selected =
        resolutions[
          resolutions.length - 1
        ];


      for (const resolution of resolutions) {
        if (
          maxWidth >= resolution.width &&
          maxHeight >= resolution.height
        ) {
          selected = resolution;
          break;
        }
      }


      await videoTrack.applyConstraints({
        width: {
          ideal: selected.width,
        },
        height: {
          ideal: selected.height,
        },
        frameRate: {
          ideal: 30,
          max: 30,
        },
      });


      setVideoQuality(selected.label);


      updateVideoResolution(
        streamRef.current
      );


      setTimeout(() => {
        updateVideoResolution(
          streamRef.current
        );
      }, 300);

    } catch (error) {
      console.warn(
        "Não foi possível otimizar a resolução:",
        error
      );

      updateVideoResolution(
        streamRef.current
      );
    }
  };


  /* ==========================================================
     CONFIGURAR VIDEO SENDER
  ========================================================== */

  const configureVideoSender = (
    connection
  ) => {
    if (!connection) {
      return;
    }

    const senders =
      connection.getSenders();

    const videoSender =
      senders.find(
        (sender) =>
          sender.track?.kind === "video"
      );

    if (!videoSender) {
      return;
    }

    try {
      const parameters =
        videoSender.getParameters();

      if (!parameters.encodings) {
        parameters.encodings = [{}];
      }

      parameters.encodings[0].maxBitrate =
        8000000;

      parameters.encodings[0].maxFramerate =
        30;

      parameters.encodings[0].scaleResolutionDownBy =
        1;

      videoSender.setParameters(
        parameters
      ).catch((error) => {
        console.warn(
          "Não foi possível configurar bitrate:",
          error
        );
      });

    } catch (error) {
      console.warn(
        "Erro ao configurar vídeo:",
        error
      );
    }
  };


  /* ==========================================================
     PREVIEW DO VÍDEO
  ========================================================== */

  useEffect(() => {
    const video = videoRef.current;

    const stream = streamRef.current;

    if (!video || !stream) {
      return;
    }

    video.srcObject = stream;

    video.muted = true;

    video.autoplay = true;

    video.playsInline = true;


    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log(
          "O navegador bloqueou o autoplay:",
          error
        );
      }
    };


    playVideo();

  }, [
    cameraReady,
    cameraEnabled,
    loadingMedia,
  ]);


  /* ==========================================================
     PARAR MEDIA
  ========================================================== */

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    streamRef.current = null;


    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }


    setCameraReady(false);

    setVideoQuality("Automática");

    setVideoResolution("A verificar...");
  };


  /* ==========================================================
     FECHAR PEER CONNECTION
  ========================================================== */

  const closePeerConnection = () => {
    if (
      unsubscribeAnswerRef.current
    ) {
      unsubscribeAnswerRef.current();

      unsubscribeAnswerRef.current =
        null;
    }


    if (
      unsubscribeAnswerCandidatesRef.current
    ) {
      unsubscribeAnswerCandidatesRef.current();

      unsubscribeAnswerCandidatesRef.current =
        null;
    }


    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (error) {
        console.warn(
          "Erro ao fechar PeerConnection:",
          error
        );
      }
    }


    peerConnectionRef.current = null;

    pendingIceCandidatesRef.current =
      [];

    answerAppliedRef.current = false;
  };


  /* ==========================================================
     INICIAR MEDIA
  ========================================================== */

  const startMedia = async () => {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setPermissionError(
        "O teu navegador não suporta acesso à câmera e ao microfone."
      );

      setLoadingMedia(false);

      return;
    }


    setLoadingMedia(true);

    setPermissionError("");


    try {
      stopMedia();


      let stream;


      try {
        stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 2560,
                  min: 640,
                },

                height: {
                  ideal: 1440,
                  min: 360,
                },

                frameRate: {
                  ideal: 30,
                  max: 30,
                },

                facingMode: "user",
              },

              audio: {
                echoCancellation: true,

                noiseSuppression: true,

                autoGainControl: true,

                channelCount: {
                  ideal: 2,
                },

                sampleRate: {
                  ideal: 48000,
                },
              },
            }
          );

      } catch (highQualityError) {
        console.warn(
          "Câmera em alta qualidade indisponível. Tentando HD...",
          highQualityError
        );


        stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                  min: 640,
                },

                height: {
                  ideal: 720,
                  min: 360,
                },

                frameRate: {
                  ideal: 30,
                  max: 30,
                },

                facingMode: "user",
              },

              audio: {
                echoCancellation: true,

                noiseSuppression: true,

                autoGainControl: true,
              },
            }
          );
      }


      streamRef.current = stream;


      const videoTrack =
        stream.getVideoTracks()[0];

      const audioTrack =
        stream.getAudioTracks()[0];


      if (videoTrack) {
        videoTrack.enabled =
          cameraEnabled;

        await optimizeVideoTrack(
          videoTrack
        );
      }


      if (audioTrack) {
        audioTrack.enabled =
          microphoneEnabled;
      }


      updateVideoResolution(stream);


      setCameraReady(true);


      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        videoRef.current.muted = true;

        videoRef.current.playsInline =
          true;

        videoRef.current.autoplay =
          true;

        try {
          await videoRef.current.play();
        } catch (error) {
          console.log(
            "Autoplay bloqueado:",
            error
          );
        }
      }

    } catch (error) {
      console.error(
        "Erro ao acessar câmera/microfone:",
        error
      );


      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setPermissionError(
          "Permissão para câmera ou microfone foi negada. Permita o acesso nas configurações do navegador."
        );

      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        setPermissionError(
          "Não foi encontrada nenhuma câmera ou microfone."
        );

      } else if (
        error?.name ===
        "NotReadableError"
      ) {
        setPermissionError(
          "A câmera ou o microfone já está sendo utilizado por outro programa."
        );

      } else if (
        error?.name ===
        "OverconstrainedError"
      ) {
        setPermissionError(
          "A câmera não suporta a configuração solicitada."
        );

      } else if (
        error?.name ===
        "SecurityError"
      ) {
        setPermissionError(
          "O navegador bloqueou o acesso à câmera por motivos de segurança."
        );

      } else {
        setPermissionError(
          "Não foi possível acessar a câmera e o microfone."
        );
      }

    } finally {
      setLoadingMedia(false);
    }
  };


  /* ==========================================================
     ESCOLHER MIME TYPE
  ========================================================== */

  const getSupportedRecordingMimeType =
    () => {
      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        return "";
      }


      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];


      for (const mimeType of mimeTypes) {
        try {
          if (
            MediaRecorder.isTypeSupported(
              mimeType
            )
          ) {
            return mimeType;
          }
        } catch (error) {
          console.warn(
            "Erro ao verificar MIME type:",
            error
          );
        }
      }


      return "";
    };


  /* ==========================================================
     INICIAR GRAVAÇÃO
  ========================================================== */

  const startRecording = (stream) => {
    if (!stream) {
      throw new Error(
        "Não existe stream para gravar."
      );
    }


    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      throw new Error(
        "O navegador não suporta gravação de vídeo."
      );
    }


    recordingChunksRef.current = [];

    recordingBlobRef.current = null;


    const mimeType =
      getSupportedRecordingMimeType();


    let recorder;


    try {
      if (mimeType) {
        recorder =
          new MediaRecorder(
            stream,
            {
              mimeType,
              videoBitsPerSecond:
                6000000,
              audioBitsPerSecond:
                128000,
            }
          );

      } else {
        recorder =
          new MediaRecorder(stream);
      }

    } catch (error) {
      console.error(
        "Erro ao criar MediaRecorder:",
        error
      );

      throw new Error(
        "Não foi possível iniciar a gravação da Live."
      );
    }


    recordingMimeTypeRef.current =
      recorder.mimeType ||
      mimeType ||
      "video/webm";


    recorder.ondataavailable = (
      event
    ) => {
      if (
        event.data &&
        event.data.size > 0
      ) {
        recordingChunksRef.current.push(
          event.data
        );
      }
    };


    recorder.onerror = (event) => {
      console.error(
        "Erro no MediaRecorder:",
        event
      );
    };


    recorder.onstart = () => {
      recordingStartedAtRef.current =
        Date.now();

      console.log(
        "Gravação da Live iniciada."
      );
    };


    recorder.start(1000);


    mediaRecorderRef.current =
      recorder;
  };


  /* ==========================================================
     PARAR GRAVAÇÃO
  ========================================================== */

  const stopRecording = () => {
    return new Promise((resolve) => {
      const recorder =
        mediaRecorderRef.current;


      if (!recorder) {
        resolve(null);
        return;
      }


      if (
        recorder.state ===
        "inactive"
      ) {
        mediaRecorderRef.current =
          null;

        resolve(
          recordingBlobRef.current
        );

        return;
      }


      const handleStop = () => {
        try {
          const mimeType =
            recordingMimeTypeRef.current ||
            "video/webm";


          const blob =
            new Blob(
              recordingChunksRef.current,
              {
                type: mimeType,
              }
            );


          recordingBlobRef.current =
            blob;


          recordingChunksRef.current =
            [];


          mediaRecorderRef.current =
            null;


          console.log(
            "Gravação finalizada:",
            blob.size,
            "bytes"
          );


          resolve(blob);

        } catch (error) {
          console.error(
            "Erro ao criar Blob:",
            error
          );

          mediaRecorderRef.current =
            null;

          resolve(null);
        }
      };


      recorder.addEventListener(
        "stop",
        handleStop,
        {
          once: true,
        }
      );


      try {
        recorder.stop();

      } catch (error) {
        console.error(
          "Erro ao parar gravação:",
          error
        );

        mediaRecorderRef.current =
          null;

        resolve(null);
      }
    });
  };


  /* ==========================================================
     UPLOAD CLOUDINARY
  ========================================================== */

  const uploadRecordingToCloudinary =
    async (blob, recordingLiveId) => {
      if (!blob) {
        throw new Error(
          "A gravação está vazia."
        );
      }


      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error(
          "VITE_CLOUDINARY_CLOUD_NAME não está configurado no .env."
        );
      }


      if (!CLOUDINARY_UPLOAD_PRESET) {
        throw new Error(
          "VITE_CLOUDINARY_UPLOAD_PRESET não está configurado no .env."
        );
      }


      const extension =
        blob.type.includes("mp4")
          ? "mp4"
          : "webm";


      const fileName =
        `konnexvib-live-${recordingLiveId}-${Date.now()}.${extension}`;


      const file =
        new File(
          [blob],
          fileName,
          {
            type:
              blob.type ||
              `video/${extension}`,
          }
        );


      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );


      formData.append(
        "folder",
        "konnexvib/live-recordings"
      );


      const endpoint =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;


      const response =
        await fetch(
          endpoint,
          {
            method: "POST",
            body: formData,
          }
        );


      let result = null;


      try {
        result =
          await response.json();

      } catch (error) {
        console.warn(
          "Resposta Cloudinary não é JSON:",
          error
        );
      }


      if (!response.ok) {
        console.error(
          "Erro Cloudinary:",
          result
        );


        throw new Error(
          result?.error?.message ||
          "Falha ao enviar a gravação para o Cloudinary."
        );
      }


      if (!result?.secure_url) {
        throw new Error(
          "O Cloudinary não devolveu a URL da gravação."
        );
      }


      return {
        url: result.secure_url,

        publicId:
          result.public_id || null,

        resourceType:
          result.resource_type ||
          "video",

        format:
          result.format ||
          extension,

        bytes:
          result.bytes ||
          blob.size,

        duration:
          result.duration ||
          null,

        width:
          result.width ||
          null,

        height:
          result.height ||
          null,
      };
    };


  /* ==========================================================
     GUARDAR METADADOS DA GRAVAÇÃO
  ========================================================== */

  const saveRecordingMetadata =
    async (
      recordingLiveId,
      cloudinaryData,
      blob
    ) => {
      const expiresAt =
        Timestamp.fromMillis(
          Date.now() +
            LIVE_RECORDING_MS
        );


      await updateLive(
        recordingLiveId,
        {
          recordingUrl:
            cloudinaryData.url,

          recordingPublicId:
            cloudinaryData.publicId,

          recordingResourceType:
            cloudinaryData.resourceType,

          recordingFormat:
            cloudinaryData.format,

          recordingSize:
            cloudinaryData.bytes ||
            blob?.size ||
            0,

          recordingDuration:
            cloudinaryData.duration ||
            null,

          recordingWidth:
            cloudinaryData.width ||
            null,

          recordingHeight:
            cloudinaryData.height ||
            null,

          recordingMimeType:
            blob?.type ||
            "video/webm",

          recordingStatus:
            "ready",

          recordedAt:
            Timestamp.now(),

          expiresAt,

          isReel: false,

          reelId: null,

          reelCreatedAt: null,
        }
      );
    };


  /* ==========================================================
     TRANSFORMAR LIVE EM REEL
  ========================================================== */

  const transformLiveIntoReel =
    async () => {
      if (
        !finishedLiveData?.liveId
      ) {
        return;
      }


      if (
        !finishedLiveData?.recordingUrl
      ) {
        setRecordingError(
          "A gravação não está disponível para transformar em Reel."
        );

        return;
      }


      setReelProcessing(true);

      setRecordingError("");


      try {
        /*
         * IMPORTANTE:
         *
         * A mesma gravação do Cloudinary passa
         * a ser marcada como Reel permanente.
         *
         * Dessa forma, o processo de limpeza
         * dos 30 dias não deverá apagar este vídeo.
         */

        await updateLive(
          finishedLiveData.liveId,
          {
            isReel: true,

            reelId:
              finishedLiveData.liveId,

            recordingStatus:
              "reel",

            reelCreatedAt:
              Timestamp.now(),

            /*
             * Reel não possui prazo de expiração.
             */
            expiresAt: null,
          }
        );


        setFinishedLiveData(
          (previous) => ({
            ...previous,

            isReel: true,
          })
        );


        setShowReelModal(false);


        /*
         * A Live terminou.
         * O Reel continua permanentemente.
         */
        setTimeout(() => {
          navigate("/");
        }, 500);

      } catch (error) {
        console.error(
          "Erro ao transformar Live em Reel:",
          error
        );


        setRecordingError(
          error?.message ||
          "Não foi possível transformar a Live em Reel."
        );

      } finally {
        setReelProcessing(false);
      }
    };


  /* ==========================================================
     GUARDAR LIVE POR 30 DIAS
  ========================================================== */

  const keepLiveRecording =
    async () => {
      if (
        !finishedLiveData?.liveId
      ) {
        return;
      }


      try {
        await updateLive(
          finishedLiveData.liveId,
          {
            isReel: false,

            recordingStatus:
              "ready",

            /*
             * Mantemos o prazo de 30 dias.
             */
            expiresAt:
              Timestamp.fromMillis(
                Date.now() +
                  LIVE_RECORDING_MS
              ),
          }
        );

        setShowReelModal(false);

        setTimeout(() => {
          navigate("/");
        }, 500);

      } catch (error) {
        console.error(
          "Erro ao guardar gravação:",
          error
        );

        setRecordingError(
          error?.message ||
          "Não foi possível guardar a gravação."
        );
      }
    };


  /* ==========================================================
     ELIMINAR GRAVAÇÃO
  ========================================================== */

  const discardRecording =
    async () => {
      if (
        !finishedLiveData?.liveId
      ) {
        return;
      }


      /*
       * O API Secret do Cloudinary não pode
       * ficar no frontend.
       *
       * Por isso, aqui marcamos a gravação
       * como eliminada.
       *
       * A eliminação física do ficheiro no
       * Cloudinary deverá ser feita pelo backend.
       */

      try {
        await updateLive(
          finishedLiveData.liveId,
          {
            recordingStatus:
              "delete_requested",

            recordingDeleteRequestedAt:
              Timestamp.now(),

            expiresAt:
              Timestamp.now(),
          }
        );


        setShowReelModal(false);


        setTimeout(() => {
          navigate("/");
        }, 500);

      } catch (error) {
        console.error(
          "Erro ao solicitar eliminação:",
          error
        );

        setRecordingError(
          error?.message ||
          "Não foi possível eliminar a gravação."
        );
      }
    };


  /* ==========================================================
     TIMER DA LIVE
  ========================================================== */

  const startLiveTimer = () => {
    liveStartedAtRef.current =
      Date.now();

    livePausedAtRef.current = null;
    totalPausedMsRef.current = 0;

    setLiveDuration("00:00:00");

    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
    }

    liveTimerRef.current =
      setInterval(() => {
        if (!liveStartedAtRef.current) {
          return;
        }

        // Enquanto pausada, o contador fica congelado.
        if (livePausedAtRef.current) {
          return;
        }

        const activeMs =
          Date.now() -
          liveStartedAtRef.current -
          totalPausedMsRef.current;

        const seconds = Math.max(
          0,
          Math.floor(activeMs / 1000)
        );

        setLiveDuration(
          formatLiveDuration(seconds)
        );
      }, 1000);
  };


  const stopLiveTimer = () => {
    if (liveTimerRef.current) {
      clearInterval(
        liveTimerRef.current
      );

      liveTimerRef.current =
        null;
    }
  };


  /* ==========================================================
     ICE CANDIDATE
  ========================================================== */

  const addPendingIceCandidates =
    async (connection) => {
      if (!connection) {
        return;
      }


      const candidates =
        pendingIceCandidatesRef.current;


      pendingIceCandidatesRef.current =
        [];


      for (const candidate of candidates) {
        try {
          await connection.addIceCandidate(
            candidate
          );

        } catch (error) {
          console.warn(
            "Erro ao adicionar ICE pendente:",
            error
          );
        }
      }
    };


  /* ==========================================================
     CRIAR CONEXÃO DO BROADCASTER
  ========================================================== */

  const createBroadcasterConnection =
    async (createdLiveId) => {
      const stream =
        streamRef.current;


      if (!stream) {
        throw new Error(
          "A câmera não está disponível."
        );
      }


      const connection =
        new RTCPeerConnection(
          WEBRTC_CONFIG
        );


      peerConnectionRef.current =
        connection;


      stream
        .getTracks()
        .forEach((track) => {
          connection.addTrack(
            track,
            stream
          );
        });


      configureVideoSender(
        connection
      );


      connection.onicecandidate =
        async (event) => {
          if (
            !event.candidate
          ) {
            return;
          }


          try {
            await addOfferCandidate(
              createdLiveId,
              event.candidate
            );

          } catch (error) {
            console.error(
              "Erro ao guardar ICE do host:",
              error
            );
          }
        };


      connection.onconnectionstatechange =
        () => {
          const state =
            connection.connectionState;


          if (
            state === "connected"
          ) {
            setConnectionStatus(
              "Transmissão conectada"
            );

          } else if (
            state === "connecting"
          ) {
            setConnectionStatus(
              "A conectar..."
            );

          } else if (
            state === "disconnected"
          ) {
            setConnectionStatus(
              "Espectador desconectado"
            );

          } else if (
            state === "failed"
          ) {
            setConnectionStatus(
              "Falha na conexão"
            );

          } else if (
            state === "closed"
          ) {
            setConnectionStatus(
              "Conexão encerrada"
            );
          }
        };


      connection.oniceconnectionstatechange =
        () => {
          const state =
            connection.iceConnectionState;


          if (
            state === "connected" ||
            state === "completed"
          ) {
            setConnectionStatus(
              "Transmissão conectada"
            );
          }
        };


      unsubscribeAnswerRef.current =
        subscribeToAnswer(
          createdLiveId,
          async (answer) => {
            if (
              !answer ||
              answerAppliedRef.current
            ) {
              return;
            }


            try {
              await connection.setRemoteDescription(
                new RTCSessionDescription(
                  answer
                )
              );


              answerAppliedRef.current =
                true;


              await addPendingIceCandidates(
                connection
              );

            } catch (error) {
              console.error(
                "Erro ao aplicar Answer:",
                error
              );
            }
          }
        );


      unsubscribeAnswerCandidatesRef.current =
        subscribeToAnswerCandidates(
          createdLiveId,
          async (candidate) => {
            if (!candidate) {
              return;
            }


            try {
              const rtcCandidate =
                new RTCIceCandidate(
                  candidate
                );


              if (
                connection.remoteDescription
              ) {
                await connection.addIceCandidate(
                  rtcCandidate
                );

              } else {
                pendingIceCandidatesRef.current.push(
                  rtcCandidate
                );
              }

            } catch (error) {
              console.warn(
                "Erro ao adicionar ICE do viewer:",
                error
              );
            }
          }
        );


      const offer =
        await connection.createOffer();


      await connection.setLocalDescription(
        offer
      );


      await saveOffer(
        createdLiveId,
        offer
      );


      setConnectionStatus(
        "Aguardando espectador..."
      );
  };


  /* ==========================================================
     INICIAR LIVE
  ========================================================== */

  const handleStartLive =
    async () => {
      if (startingLive) {
        return;
      }


      setPermissionError("");

      setRecordingError("");


      if (!currentUser?.uid) {
        setPermissionError(
          "É necessário estar autenticado para iniciar uma Live."
        );

        return;
      }


      if (!title.trim()) {
        setPermissionError(
          "Digite um título para a Live."
        );

        return;
      }


      if (
        !streamRef.current
      ) {
        try {
          await startMedia();

        } catch (error) {
          console.error(error);
          return;
        }
      }


      if (
        !streamRef.current
      ) {
        setPermissionError(
          "A câmera não está disponível."
        );

        return;
      }


      setStartingLive(true);


      let createdLiveId = null;


      try {
        createdLiveId =
          await createLive({
            hostId:
              currentUser.uid,

            hostName:
              currentUser.displayName ||
              currentUser.email ||
              "Utilizador",

            title:
              title.trim(),

            description:
              description.trim(),

            audience,
          });


        liveIdRef.current =
          createdLiveId;


        setLiveId(
          createdLiveId
        );


        const link =
          `${window.location.origin}/live/watch/${createdLiveId}`;


        setShareLink(link);


        setConnectionStatus(
          "A preparar transmissão..."
        );


        await createBroadcasterConnection(
          createdLiveId
        );


        /*
         * Só consideramos a Live iniciada
         * depois do Firestore aceitar status=live.
         */

        await startLive(
          createdLiveId
        );


        /*
         * AGORA começamos a gravação.
         *
         * Desta forma, o ficheiro corresponde
         * ao período real da Live.
         */

        try {
          startRecording(
            streamRef.current
          );

        } catch (recordingError) {
          console.error(
            "Erro ao iniciar gravação:",
            recordingError
          );

          /*
           * A Live ainda pode continuar,
           * mas mostramos o problema.
           */

          setRecordingError(
            recordingError?.message ||
            "A Live iniciou, mas não foi possível iniciar a gravação."
          );
        }


        startLiveTimer();

        setIsPaused(false);
        livePausedAtRef.current = null;
        totalPausedMsRef.current = 0;
        pausedSenderTracksRef.current = {};

        setIsLive(true);

        setConnectionStatus(
          "Transmissão ao vivo"
        );

      } catch (error) {
        console.error(
          "Erro ao iniciar Live:",
          error
        );


        setPermissionError(
          error?.message ||
          "Não foi possível iniciar a transmissão. Verifique o Firestore e as permissões do Firebase."
        );


        /*
         * Se a Live foi criada mas alguma etapa
         * seguinte falhou, encerramos o documento.
         */

        if (createdLiveId) {
          try {
            await endLive(
              createdLiveId
            );
          } catch (endError) {
            console.error(
              "Erro ao limpar Live:",
              endError
            );
          }
        }


        closePeerConnection();

      } finally {
        setStartingLive(false);
      }
    };


  /* ==========================================================
     PAUSAR / RETOMAR LIVE
  ========================================================== */

  const handlePauseResumeLive = async () => {
    const currentLiveId = liveIdRef.current;

    if (
      !currentLiveId ||
      pausingLive ||
      endingLive
    ) {
      return;
    }

    setPausingLive(true);
    setRecordingError("");

    try {
      const recorder =
        mediaRecorderRef.current;

      if (!isPaused) {
        /*
         * Pausa real da transmissão:
         * removemos temporariamente as tracks dos senders.
         * A PeerConnection permanece aberta, portanto não é
         * necessário criar uma nova oferta/answer ao retomar.
         */
        const connection =
          peerConnectionRef.current;

        if (connection) {
          const senders = connection.getSenders();
          const savedTracks = {};

          for (const sender of senders) {
            if (!sender.track) {
              continue;
            }

            savedTracks[sender.track.kind] = sender.track;

            try {
              await sender.replaceTrack(null);
            } catch (replaceError) {
              console.warn(
                "Não foi possível pausar a track WebRTC:",
                replaceError
              );
            }
          }

          pausedSenderTracksRef.current = savedTracks;
        }

        if (
          recorder &&
          recorder.state === "recording" &&
          typeof recorder.pause === "function"
        ) {
          recorder.pause();
        }

        livePausedAtRef.current = Date.now();

        await updateLive(
          currentLiveId,
          {
            isPaused: true,
            pausedAt: Timestamp.now(),
          }
        );

        setIsPaused(true);
        setConnectionStatus(
          "Live pausada — retoma quando quiseres"
        );
      } else {
        const connection =
          peerConnectionRef.current;

        if (connection) {
          const senders = connection.getSenders();
          const savedTracks =
            pausedSenderTracksRef.current;

          for (const sender of senders) {
            /*
             * Depois de replaceTrack(null), sender.track pode
             * ser null. Por isso procuramos também pelo
             * parâmetro de media kind abaixo.
             */
            if (!sender.track) {
              const matchingTrack =
                Object.values(savedTracks).find(
                  (savedTrack) =>
                    savedTrack?.readyState === "live" &&
                    !senders.some(
                      (otherSender) =>
                        otherSender !== sender &&
                        otherSender.track === savedTrack
                    )
                );

              if (matchingTrack) {
                try {
                  await sender.replaceTrack(
                    matchingTrack
                  );
                } catch (replaceError) {
                  console.warn(
                    "Não foi possível retomar a track WebRTC:",
                    replaceError
                  );
                }
              }
            }
          }

          pausedSenderTracksRef.current = {};
        }

        if (
          recorder &&
          recorder.state === "paused" &&
          typeof recorder.resume === "function"
        ) {
          recorder.resume();
        }

        if (livePausedAtRef.current) {
          totalPausedMsRef.current +=
            Date.now() - livePausedAtRef.current;
        }

        livePausedAtRef.current = null;

        await updateLive(
          currentLiveId,
          {
            isPaused: false,
            resumedAt: Timestamp.now(),
          }
        );

        setIsPaused(false);
        setConnectionStatus(
          "Transmissão ao vivo"
        );
      }
    } catch (error) {
      console.error(
        "Erro ao pausar/retomar Live:",
        error
      );

      setRecordingError(
        error?.message ||
        "Não foi possível alterar o estado da Live."
      );
    } finally {
      setPausingLive(false);
    }
  };


  /* ==========================================================
     TERMINAR LIVE
  ========================================================== */

  const handleEndLive =
    async () => {
      if (
        endingLive ||
        !liveIdRef.current
      ) {
        return;
      }


      const currentLiveId =
        liveIdRef.current;


      setEndingLive(true);

      setRecordingError("");


      let recordingBlob = null;

      let cloudinaryData = null;


      try {
        /*
         * PRIMEIRO paramos o MediaRecorder.
         *
         * É importante fazer isso antes de
         * stopMedia(), porque a gravação utiliza
         * o mesmo MediaStream.
         */

        if (isPaused) {
          const recorder = mediaRecorderRef.current;

          if (
            recorder &&
            recorder.state === "paused" &&
            typeof recorder.resume === "function"
          ) {
            try {
              recorder.resume();
            } catch (resumeError) {
              console.warn(
                "Não foi possível retomar a gravação antes de encerrar:",
                resumeError
              );
            }
          }

          livePausedAtRef.current = null;
          setIsPaused(false);
        }

        recordingBlob =
          await stopRecording();


        /*
         * Depois marcamos a Live como encerrada.
         */

        await endLive(
          currentLiveId
        );


        stopLiveTimer();


        closePeerConnection();


        /*
         * Agora podemos desligar câmera e microfone.
         */

        stopMedia();


        setIsLive(false);
        setIsPaused(false);
        livePausedAtRef.current = null;
        totalPausedMsRef.current = 0;
        pausedSenderTracksRef.current = {};


        /*
         * Se não houve gravação, encerramos.
         */

        if (
          !recordingBlob ||
          recordingBlob.size === 0
        ) {
          setRecordingError(
            "A Live terminou, mas não foi possível obter a gravação."
          );

          setEndingLive(false);

          return;
        }


        /*
         * Upload para Cloudinary.
         */

        setSavingRecording(true);


        setConnectionStatus(
          "A guardar a gravação..."
        );


        cloudinaryData =
          await uploadRecordingToCloudinary(
            recordingBlob,
            currentLiveId
          );


        /*
         * Guardar metadados no Firestore.
         */

        await saveRecordingMetadata(
          currentLiveId,
          cloudinaryData,
          recordingBlob
        );


        setRecordingSaved(true);


        /*
         * Guardamos os dados necessários para
         * a janela de escolha do Reel.
         */

        setFinishedLiveData({
          liveId:
            currentLiveId,

          recordingUrl:
            cloudinaryData.url,

          recordingPublicId:
            cloudinaryData.publicId,

          recordingSize:
            cloudinaryData.bytes ||
            recordingBlob.size,

          recordingDuration:
            cloudinaryData.duration,

          recordingMimeType:
            recordingBlob.type,

          isReel: false,
        });


        /*
         * Perguntar ao utilizador.
         */

        setShowReelModal(true);


      } catch (error) {
        console.error(
          "Erro ao terminar/guardar Live:",
          error
        );


        setRecordingError(
          error?.message ||
          "A Live terminou, mas ocorreu um erro ao guardar a gravação."
        );


        /*
         * Mesmo com erro, garantimos que a
         * transmissão é encerrada.
         */

        try {
          await endLive(
            currentLiveId
          );
        } catch (endError) {
          console.error(
            "Erro ao encerrar Live:",
            endError
          );
        }


        stopLiveTimer();

        closePeerConnection();

        stopMedia();

        setIsLive(false);

      } finally {
        setSavingRecording(false);

        setEndingLive(false);
      }
    };


  /* ==========================================================
     COPIAR LINK
  ========================================================== */

  const handleCopyLink =
    async () => {
      if (!shareLink) {
        return;
      }


      try {
        await navigator.clipboard.writeText(
          shareLink
        );

        setCopySuccess(true);


        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);

      } catch (error) {
        console.error(
          "Erro ao copiar link:",
          error
        );
      }
    };


  /* ==========================================================
     CAMERA
  ========================================================== */

  const toggleCamera = () => {
    const stream =
      streamRef.current;


    if (!stream) {
      return;
    }


    const videoTrack =
      stream.getVideoTracks()[0];


    if (!videoTrack) {
      return;
    }


    const newValue =
      !cameraEnabled;


    videoTrack.enabled =
      newValue;


    setCameraEnabled(
      newValue
    );
  };


  /* ==========================================================
     MICROFONE
  ========================================================== */

  const toggleMicrophone = () => {
    const stream =
      streamRef.current;


    if (!stream) {
      return;
    }


    const audioTrack =
      stream.getAudioTracks()[0];


    if (!audioTrack) {
      return;
    }


    const newValue =
      !microphoneEnabled;


    audioTrack.enabled =
      newValue;


    setMicrophoneEnabled(
      newValue
    );
  };


  /* ==========================================================
     INICIALIZAR CÂMERA
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }


    if (!currentUser?.uid) {
      setLoadingMedia(false);
      return;
    }


    startMedia();


    return () => {
      stopLiveTimer();
      livePausedAtRef.current = null;
      totalPausedMsRef.current = 0;
      pausedSenderTracksRef.current = {};

      closePeerConnection();

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !==
          "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.warn(
            "Erro ao parar MediaRecorder:",
            error
          );
        }
      }

      mediaRecorderRef.current =
        null;

      stopMedia();
    };

  }, [
    authLoading,
    currentUser?.uid,
  ]);


  /* ==========================================================
     RENDER
  ========================================================== */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-4">
            ⏳
          </div>

          <p>
            A verificar autenticação...
          </p>
        </div>
      </div>
    );
  }


  if (!currentUser?.uid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-3">
            Autenticação necessária
          </h2>

          <p className="text-gray-400 mb-5">
            Inicia sessão para poder fazer uma Live.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black text-white">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                navigate(-1)
              }
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
            >
              <FaTimes />
            </button>


            <div>
              <h1 className="font-bold text-lg">
                Criar Live
              </h1>

              <p className="text-xs text-gray-400">
                KonnexVib
              </p>
            </div>

          </div>


          {isLive && (
            <div className="flex items-center gap-2">

              <span className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                <FaCircle className="text-[8px]" />
                AO VIVO
              </span>

              <span className="text-xs text-gray-300">
                {liveDuration}
              </span>

            </div>
          )}

        </div>
      </header>


      {/* ======================================================
          CONTEÚDO
      ====================================================== */}

      <main className="pt-20 pb-10 px-4">

        <div className="max-w-5xl mx-auto">


          {/* ==================================================
              VÍDEO
          ================================================== */}

          <div className="relative bg-gray-950 rounded-2xl overflow-hidden border border-white/10 aspect-video">

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${
                cameraEnabled
                  ? ""
                  : "opacity-30"
              }`}
            />


            {!cameraReady &&
              !loadingMedia && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <FaVideoSlash className="text-4xl mx-auto mb-3" />

                    <p>
                      Câmera indisponível
                    </p>
                  </div>
                </div>
              )}


            {loadingMedia && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin text-3xl mb-3">
                    ⏳
                  </div>

                  <p>
                    A preparar câmera...
                  </p>
                </div>
              </div>
            )}


            {/* PAUSA */}

            {isPaused && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                <div className="rounded-2xl border border-yellow-400/30 bg-black/70 px-6 py-5 text-center shadow-2xl">
                  <FaPause className="mx-auto text-3xl text-yellow-400" />
                  <p className="mt-3 font-bold">Live pausada</p>
                  <p className="mt-1 text-xs text-gray-400">
                    A transmissão será retomada quando clicares em Retomar.
                  </p>
                </div>
              </div>
            )}

            {/* STATUS */}

            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">

              <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-xl text-xs">
                {isLive ? (
                  isPaused ? (
                    <span className="text-yellow-300 font-semibold">
                      ⏸️ Live pausada
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold">
                      🔴 Transmissão ao vivo
                    </span>
                  )
                ) : (
                  <span>
                    Pré-visualização
                  </span>
                )}
              </div>


              <div className="flex gap-2">

                <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-xl text-xs">
                  {videoQuality}
                </div>

                <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-xl text-xs">
                  {videoResolution}
                </div>

              </div>

            </div>


            {/* TIMER */}

            {isLive && (
              <div className="absolute bottom-3 left-3 bg-red-600 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold">
                <FaClock />

                {liveDuration}
              </div>
            )}

          </div>


          {/* ==================================================
              CONTROLOS
          ================================================== */}

          <div className="flex justify-center gap-4 mt-5">

            <button
              type="button"
              onClick={toggleCamera}
              disabled={false}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                cameraEnabled
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-60`}
              title="Câmera"
            >
              {cameraEnabled ? (
                <FaVideo />
              ) : (
                <FaVideoSlash />
              )}
            </button>


            <button
              type="button"
              onClick={
                toggleMicrophone
              }
              disabled={false}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                microphoneEnabled
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-60`}
              title="Microfone"
            >
              {microphoneEnabled ? (
                <FaMicrophone />
              ) : (
                <FaMicrophoneSlash />
              )}
            </button>

          </div>


          {/* ==================================================
              ERRO PERMISSÃO
          ================================================== */}

          {permissionError && (
            <div className="mt-5 p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200">

              <div className="flex items-start gap-3">

                <FaExclamationTriangle className="mt-1 shrink-0" />

                <p className="text-sm">
                  {permissionError}
                </p>

              </div>

            </div>
          )}


          {/* ==================================================
              ERRO GRAVAÇÃO
          ================================================== */}

          {recordingError && (
            <div className="mt-5 p-4 rounded-xl bg-orange-950/60 border border-orange-500/30 text-orange-200">

              <div className="flex items-start gap-3">

                <FaExclamationTriangle className="mt-1 shrink-0" />

                <div>

                  <p className="font-semibold">
                    Problema com a gravação
                  </p>

                  <p className="text-sm mt-1">
                    {recordingError}
                  </p>

                </div>

              </div>

            </div>
          )}


          {/* ==================================================
              FORMULÁRIO
          ================================================== */}

          {!isLive && (
            <div className="mt-8 space-y-5">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Título da Live
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Digite o título da Live"
                  maxLength={100}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Sobre o que será a Live?"
                  rows={4}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                />

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  Público
                </label>

                <select
                  value={audience}
                  onChange={(event) =>
                    setAudience(
                      event.target.value
                    )
                  }
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Público">
                    Público
                  </option>

                  <option value="Amigos">
                    Amigos
                  </option>

                  <option value="VIP">
                    VIP
                  </option>

                  <option value="Privado">
                    Privado
                  </option>
                </select>

              </div>


              {/* INFO GRAVAÇÃO */}

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">

                <div className="flex items-start gap-3">

                  <FaFilm className="text-red-500 mt-1" />

                  <div>

                    <p className="font-semibold">
                      Gravação automática
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      A Live será gravada automaticamente.
                      Quando terminares, poderás transformá-la
                      em Reel ou mantê-la como gravação da Live
                      durante 30 dias.
                    </p>

                  </div>

                </div>

              </div>


              {/* BOTÃO INICIAR */}

              <button
                type="button"
                onClick={
                  handleStartLive
                }
                disabled={
                  startingLive ||
                  loadingMedia
                }
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-3"
              >

                {startingLive ? (
                  <>
                    <span className="animate-spin">
                      ⏳
                    </span>

                    A iniciar Live...
                  </>
                ) : (
                  <>
                    <FaBroadcastTower />

                    Iniciar transmissão
                  </>
                )}

              </button>

            </div>
          )}


          {/* ==================================================
              LIVE ATIVA
          ================================================== */}

          {isLive && (
            <div className="mt-8 space-y-5">


              <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/20">

                <div className="flex items-center justify-between mb-4">

                  <div>

                    <p className="font-bold text-lg">
                      A tua Live está online
                    </p>

                    <p className="text-sm text-gray-400">
                      {connectionStatus}
                    </p>

                  </div>


                  <div className="flex items-center gap-2 text-red-500">
                    <FaCircle className="text-xs" />
                    LIVE
                  </div>

                </div>


                {/* LINK */}

                <div className="flex gap-2">

                  <input
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  />

                  <button
                    type="button"
                    onClick={
                      handleCopyLink
                    }
                    className="px-4 rounded-xl bg-white/10 hover:bg-white/20"
                  >

                    {copySuccess ? (
                      <FaCheckCircle className="text-green-400" />
                    ) : (
                      <FaCopy />
                    )}

                  </button>

                </div>


                {copySuccess && (
                  <p className="text-green-400 text-xs mt-2">
                    Link copiado!
                  </p>
                )}

              </div>


              {/* DADOS */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">
                    Qualidade
                  </p>

                  <p className="font-semibold mt-1">
                    {videoQuality}
                  </p>
                </div>


                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">
                    Resolução
                  </p>

                  <p className="font-semibold mt-1">
                    {videoResolution}
                  </p>
                </div>


                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">
                    Duração
                  </p>

                  <p className="font-semibold mt-1">
                    {liveDuration}
                  </p>
                </div>


                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">
                    Público
                  </p>

                  <p className="font-semibold mt-1">
                    {audience}
                  </p>
                </div>

              </div>


              {/* PAUSAR / RETOMAR */}

              <button
                type="button"
                onClick={handlePauseResumeLive}
                disabled={pausingLive || endingLive}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition ${
                  isPaused
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600 text-black"
                } disabled:opacity-50`}
              >
                {pausingLive ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    A atualizar...
                  </>
                ) : isPaused ? (
                  <>
                    <FaPlay />
                    Retomar transmissão
                  </>
                ) : (
                  <>
                    <FaPause />
                    Pausar transmissão
                  </>
                )}
              </button>

              {/* BOTÃO TERMINAR */}

              <button
                type="button"
                onClick={
                  handleEndLive
                }
                disabled={
                  endingLive
                }
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 font-bold flex items-center justify-center gap-3"
              >

                {endingLive ? (
                  <>
                    <span className="animate-spin">
                      ⏳
                    </span>

                    {savingRecording
                      ? "A guardar gravação..."
                      : "A terminar Live..."}
                  </>
                ) : (
                  <>
                    <FaStop />

                    Encerrar transmissão
                  </>
                )}

              </button>


              {/* ID */}

              {liveId && (
                <div className="p-4 rounded-xl bg-white/5">

                  <p className="text-xs text-gray-500">
                    ID da Live
                  </p>

                  <p className="text-sm font-mono mt-1 break-all">
                    {liveId}
                  </p>

                </div>
              )}

            </div>
          )}

        </div>

      </main>


      {/* ======================================================
          MODAL REEL
      ====================================================== */}

      {showReelModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-gray-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">


            {/* CABEÇALHO */}

            <div className="p-6 text-center border-b border-white/10">

              <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 flex items-center justify-center mb-4">

                <FaFilm className="text-red-500 text-2xl" />

              </div>


              <h2 className="text-xl font-bold">
                Live terminada!
              </h2>


              <p className="text-gray-400 text-sm mt-2">
                O que queres fazer com a gravação?
              </p>

            </div>


            {/* CONTEÚDO */}

            <div className="p-6">


              {recordingSaved && (
                <div className="flex items-center gap-2 text-green-400 text-sm mb-5">

                  <FaCheckCircle />

                  <span>
                    A gravação foi guardada com sucesso.
                  </span>

                </div>
              )}


              <div className="space-y-3">


                {/* REEL */}

                <button
                  type="button"
                  onClick={
                    transformLiveIntoReel
                  }
                  disabled={
                    reelProcessing
                  }
                  className="w-full p-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-left flex items-center gap-4"
                >

                  <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <FaFilm />
                  </div>


                  <div className="flex-1">

                    <p className="font-bold">
                      Transformar em Reel
                    </p>

                    <p className="text-xs text-red-100 mt-1">
                      O vídeo será permanente e não será eliminado após 30 dias.
                    </p>

                  </div>


                  {reelProcessing && (
                    <span className="animate-spin">
                      ⏳
                    </span>
                  )}

                </button>


                {/* GUARDAR */}

                <button
                  type="button"
                  onClick={
                    keepLiveRecording
                  }
                  disabled={
                    reelProcessing
                  }
                  className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 disabled:opacity-60 text-left flex items-center gap-4"
                >

                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <FaSave />
                  </div>


                  <div>

                    <p className="font-bold">
                      Guardar como Live
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      A gravação ficará disponível durante 30 dias.
                    </p>

                  </div>

                </button>


                {/* ELIMINAR */}

                <button
                  type="button"
                  onClick={
                    discardRecording
                  }
                  disabled={
                    reelProcessing
                  }
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-red-950/40 text-left flex items-center gap-4 text-gray-300"
                >

                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <FaTrash />
                  </div>


                  <div>

                    <p className="font-bold">
                      Eliminar gravação
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Não guardar esta gravação.
                    </p>

                  </div>

                </button>

              </div>


              {recordingError && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/20 text-red-300 text-sm">
                  {recordingError}
                </div>
              )}


              <p className="text-center text-xs text-gray-600 mt-5">
                Se escolheres Reel, o vídeo deixa de ter prazo de expiração.
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}