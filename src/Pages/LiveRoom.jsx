// src/pages/LiveRoom.jsx

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBroadcastTower,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaUsers,
  FaShare,
  FaCopy,
  FaLink,
  FaStop,
  FaPause,
  FaPlay,
  FaExpand,
  FaComment,
  FaHeart,
  FaSignal,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo,
  FaCrown,
  FaEllipsisH,
} from "react-icons/fa";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

import { useAuth } from "../context/AuthContext";

import {
  WEBRTC_CONFIG,
  getLive,
  subscribeToLive,
  startLive,
  endLive,
  saveOffer,
  subscribeToAnswer,
  subscribeToAnswerCandidates,
  addOfferCandidate,
  subscribeToViewers,
  updateLive,
} from "../services/liveService";

export default function LiveRoom() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { currentUser, loading: authLoading } =
    useAuth();

  // =========================================================
  // REFS
  // =========================================================

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const peerConnectionRef =
    useRef(null);

  const liveIdRef = useRef(null);

  const unsubscribeLiveRef =
    useRef(null);

  const unsubscribeAnswerRef =
    useRef(null);

  const unsubscribeAnswerCandidatesRef =
    useRef(null);

  const unsubscribeViewersRef =
    useRef(null);

  const pendingIceCandidatesRef =
    useRef([]);

  const answerAppliedRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const liveStartedAtRef =
    useRef(null);

  const pausedStartedAtRef =
    useRef(null);

  const pausedTotalRef =
    useRef(0);

  const liveTimerRef =
    useRef(null);

  const reconnectTimerRef =
    useRef(null);

  const offerCreatedRef =
    useRef(false);

  // =========================================================
  // ESTADOS
  // =========================================================

  const [live, setLive] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [ending, setEnding] =
    useState(false);

  const [isLive, setIsLive] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [microphoneEnabled, setMicrophoneEnabled] =
    useState(true);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [microphoneReady, setMicrophoneReady] =
    useState(false);

  const [connectionStatus, setConnectionStatus] =
    useState("offline");

  const [error, setError] =
    useState("");

  const [infoMessage, setInfoMessage] =
    useState("");

  const [liveDuration, setLiveDuration] =
    useState(0);

  const [pausedDuration, setPausedDuration] =
    useState(0);

  const [viewers, setViewers] =
    useState([]);

  const [showChat, setShowChat] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const [likes, setLikes] =
    useState(0);

  const [liked, setLiked] =
    useState(false);

  const [copySuccess, setCopySuccess] =
    useState(false);

  const [fullscreen, setFullscreen] =
    useState(false);

  const [videoResolution, setVideoResolution] =
    useState("");

  const [videoQuality, setVideoQuality] =
    useState("Automática");

  // =========================================================
  // ID DA LIVE
  // =========================================================

  useEffect(() => {
    liveIdRef.current = id || null;
  }, [id]);

  // =========================================================
  // FORMATAR TEMPO
  // =========================================================

  const formatDuration = useCallback(
    (seconds) => {
      const safe =
        Math.max(
          0,
          Number(seconds) || 0
        );

      const hours =
        Math.floor(
          safe / 3600
        );

      const minutes =
        Math.floor(
          (safe % 3600) / 60
        );

      const secs =
        safe % 60;

      return [
        hours,
        minutes,
        secs,
      ]
        .map((value) =>
          String(value).padStart(
            2,
            "0"
          )
        )
        .join(":");
    },
    []
  );

  // =========================================================
  // RESOLUÇÃO
  // =========================================================

  const updateVideoResolution =
    useCallback((stream) => {
      if (!stream) {
        setVideoResolution("");
        setVideoQuality("Automática");
        return;
      }

      const videoTrack =
        stream.getVideoTracks()[0];

      if (!videoTrack) {
        setVideoResolution("");
        setVideoQuality("Sem vídeo");
        return;
      }

      try {
        const settings =
          videoTrack.getSettings();

        const width =
          settings.width || 0;

        const height =
          settings.height || 0;

        if (!width || !height) {
          setVideoResolution(
            "Automática"
          );

          setVideoQuality(
            "Automática"
          );

          return;
        }

        setVideoResolution(
          `${width}×${height}`
        );

        if (
          width >= 2560 &&
          height >= 1440
        ) {
          setVideoQuality("2K");
        } else if (
          width >= 1920 &&
          height >= 1080
        ) {
          setVideoQuality(
            "Full HD"
          );
        } else if (
          width >= 1280 &&
          height >= 720
        ) {
          setVideoQuality("HD");
        } else if (
          width >= 854 &&
          height >= 480
        ) {
          setVideoQuality("480p");
        } else if (
          width >= 640 &&
          height >= 480
        ) {
          setVideoQuality("SD");
        } else {
          setVideoQuality("Baixa");
        }
      } catch (resolutionError) {
        console.error(
          "Erro ao obter resolução:",
          resolutionError
        );
      }
    }, []);

  // =========================================================
  // PARAR MEDIA
  // =========================================================

  const stopMedia =
    useCallback(() => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch {}
          });

        streamRef.current =
          null;
      }

      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}

        videoRef.current.srcObject =
          null;
      }

      setCameraReady(false);

      setMicrophoneReady(false);

      setVideoResolution("");

      setVideoQuality(
        "Automática"
      );
    }, []);

  // =========================================================
  // FECHAR WEBRTC
  // =========================================================

  const closePeerConnection =
    useCallback(() => {
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

      pendingIceCandidatesRef.current =
        [];

      answerAppliedRef.current =
        false;

      offerCreatedRef.current =
        false;

      if (
        peerConnectionRef.current
      ) {
        try {
          peerConnectionRef.current.onicecandidate =
            null;

          peerConnectionRef.current.onconnectionstatechange =
            null;

          peerConnectionRef.current.oniceconnectionstatechange =
            null;

          peerConnectionRef.current.close();
        } catch (connectionError) {
          console.error(
            "Erro ao fechar WebRTC:",
            connectionError
          );
        }

        peerConnectionRef.current =
          null;
      }
    }, []);

  // =========================================================
  // INICIAR MEDIA
  // =========================================================

  const startMedia =
    useCallback(async () => {
      setError("");

      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          throw new Error(
            "O navegador não suporta câmera e microfone."
          );
        }

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => {
              try {
                track.stop();
              } catch {}
            });

          streamRef.current =
            null;
        }

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

                  facingMode:
                    "user",
                },

                audio: {
                  echoCancellation:
                    true,

                  noiseSuppression:
                    true,

                  autoGainControl:
                    true,

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
            "Fallback de câmera:",
            highQualityError
          );

          stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  width: {
                    ideal: 1280,
                  },

                  height: {
                    ideal: 720,
                  },

                  frameRate: {
                    ideal: 30,
                    max: 30,
                  },

                  facingMode:
                    "user",
                },

                audio: {
                  echoCancellation:
                    true,

                  noiseSuppression:
                    true,

                  autoGainControl:
                    true,
                },
              }
            );
        }

        streamRef.current =
          stream;

        const videoTrack =
          stream.getVideoTracks()[0];

        const audioTrack =
          stream.getAudioTracks()[0];

        if (videoTrack) {
          videoTrack.enabled =
            cameraEnabled;

          setCameraReady(true);

          updateVideoResolution(
            stream
          );
        } else {
          setCameraReady(false);
        }

        if (audioTrack) {
          audioTrack.enabled =
            microphoneEnabled;

          setMicrophoneReady(
            true
          );
        } else {
          setMicrophoneReady(
            false
          );
        }

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          videoRef.current.muted =
            true;

          videoRef.current.autoplay =
            true;

          videoRef.current.playsInline =
            true;

          try {
            await videoRef.current.play();
          } catch (playError) {
            console.log(
              "Autoplay aguardando interação:",
              playError
            );
          }
        }

        return stream;
      } catch (mediaError) {
        console.error(
          "Erro ao acessar mídia:",
          mediaError
        );

        setCameraReady(false);

        setMicrophoneReady(false);

        let message =
          "Não foi possível acessar a câmera e o microfone.";

        if (
          mediaError?.name ===
          "NotAllowedError"
        ) {
          message =
            "A permissão da câmera ou microfone foi bloqueada. Permita o acesso no navegador.";
        } else if (
          mediaError?.name ===
          "NotFoundError"
        ) {
          message =
            "Nenhuma câmera ou microfone foi encontrado.";
        } else if (
          mediaError?.name ===
          "NotReadableError"
        ) {
          message =
            "A câmera ou microfone está sendo usado por outro aplicativo.";
        } else if (
          mediaError?.message
        ) {
          message =
            mediaError.message;
        }

        setError(message);

        throw mediaError;
      }
    }, [
      cameraEnabled,
      microphoneEnabled,
      updateVideoResolution,
    ]);

  // =========================================================
  // TOGGLE CÂMERA
  // =========================================================

  const toggleCamera =
    useCallback(() => {
      const track =
        streamRef.current?.getVideoTracks()[0];

      if (!track) {
        startMedia().catch(() => {});
        return;
      }

      const next =
        !cameraEnabled;

      track.enabled =
        next;

      setCameraEnabled(next);

      setInfoMessage(
        next
          ? "Câmera ativada."
          : "Câmera desligada."
      );

      setTimeout(() => {
        setInfoMessage("");
      }, 2000);
    }, [
      cameraEnabled,
      startMedia,
    ]);

  // =========================================================
  // TOGGLE MICROFONE
  // =========================================================

  const toggleMicrophone =
    useCallback(() => {
      const track =
        streamRef.current?.getAudioTracks()[0];

      if (!track) {
        startMedia().catch(() => {});
        return;
      }

      const next =
        !microphoneEnabled;

      track.enabled =
        next;

      setMicrophoneEnabled(
        next
      );

      setInfoMessage(
        next
          ? "Microfone ativado."
          : "Microfone desligado."
      );

      setTimeout(() => {
        setInfoMessage("");
      }, 2000);
    }, [
      microphoneEnabled,
      startMedia,
    ]);

  // =========================================================
  // ICE PENDENTE
  // =========================================================

  const flushPendingIceCandidates =
    useCallback(async (connection) => {
      if (
        !connection ||
        !connection.remoteDescription
      ) {
        return;
      }

      const pending =
        [
          ...pendingIceCandidatesRef.current,
        ];

      pendingIceCandidatesRef.current =
        [];

      for (
        const candidate of pending
      ) {
        try {
          await connection.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (candidateError) {
          console.error(
            "Erro ICE pendente:",
            candidateError
          );
        }
      }
    }, []);

  // =========================================================
  // ICE DO VIEWER
  // =========================================================

  const handleViewerIceCandidate =
    useCallback(
      async (candidate) => {
        if (!candidate) {
          return;
        }

        const connection =
          peerConnectionRef.current;

        if (!connection) {
          pendingIceCandidatesRef.current.push(
            candidate
          );

          return;
        }

        if (
          !connection.remoteDescription
        ) {
          pendingIceCandidatesRef.current.push(
            candidate
          );

          return;
        }

        try {
          await connection.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (iceError) {
          console.error(
            "Erro ICE viewer:",
            iceError
          );
        }
      },
      []
    );

  // =========================================================
  // CRIAR CONEXÃO HOST
  // =========================================================

  const createBroadcasterConnection =
    useCallback(
      async (createdLiveId) => {
        const stream =
          streamRef.current;

        if (!stream) {
          throw new Error(
            "Câmera e microfone não estão disponíveis."
          );
        }

        closePeerConnection();

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

        // =====================================================
        // VIDEO SENDER
        // =====================================================

        try {
          const senders =
            connection.getSenders();

          const videoSender =
            senders.find(
              (sender) =>
                sender.track?.kind ===
                "video"
            );

          if (
            videoSender?.getParameters
          ) {
            const parameters =
              videoSender.getParameters();

            if (
              !parameters.encodings
            ) {
              parameters.encodings = [
                {},
              ];
            }

            parameters.encodings =
              parameters.encodings.map(
                (encoding) => ({
                  ...encoding,

                  maxBitrate:
                    8000000,

                  maxFramerate:
                    30,

                  scaleResolutionDownBy:
                    1,
                })
              );

            try {
              await videoSender.setParameters(
                parameters
              );
            } catch (
              bitrateError
            ) {
              console.warn(
                "Bitrate avançado não aplicado:",
                bitrateError
              );
            }
          }
        } catch (
          senderError
        ) {
          console.warn(
            "Erro ao configurar vídeo:",
            senderError
          );
        }

        // =====================================================
        // ICE HOST
        // =====================================================

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
            } catch (
              candidateError
            ) {
              console.error(
                "Erro ao enviar ICE:",
                candidateError
              );
            }
          };

        // =====================================================
        // CONNECTION STATE
        // =====================================================

        connection.onconnectionstatechange =
          () => {
            if (
              !mountedRef.current
            ) {
              return;
            }

            const state =
              connection.connectionState;

            console.log(
              "WebRTC:",
              state
            );

            if (
              state === "connected"
            ) {
              setConnectionStatus(
                "connected"
              );
            } else if (
              state ===
                "connecting" ||
              state === "new"
            ) {
              setConnectionStatus(
                "connecting"
              );
            } else if (
              state ===
                "disconnected"
            ) {
              setConnectionStatus(
                "disconnected"
              );
            } else if (
              state === "failed"
            ) {
              setConnectionStatus(
                "failed"
              );

              setError(
                "A ligação com o espectador foi perdida."
              );
            } else if (
              state === "closed"
            ) {
              setConnectionStatus(
                "offline"
              );
            }
          };

        // =====================================================
        // ICE STATE
        // =====================================================

        connection.oniceconnectionstatechange =
          () => {
            const state =
              connection.iceConnectionState;

            if (
              state ===
                "connected" ||
              state ===
                "completed"
            ) {
              setConnectionStatus(
                "connected"
              );
            }

            if (
              state ===
                "checking"
            ) {
              setConnectionStatus(
                "connecting"
              );
            }

            if (
              state ===
                "disconnected"
            ) {
              setConnectionStatus(
                "disconnected"
              );
            }

            if (
              state === "failed"
            ) {
              setConnectionStatus(
                "failed"
              );
            }
          };

        // =====================================================
        // ANSWER
        // =====================================================

        unsubscribeAnswerRef.current =
          subscribeToAnswer(
            createdLiveId,
            async (answer) => {
              if (!answer) {
                return;
              }

              const pc =
                peerConnectionRef.current;

              if (!pc) {
                return;
              }

              if (
                answerAppliedRef.current ||
                pc.remoteDescription
              ) {
                return;
              }

              try {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(
                    {
                      type:
                        answer.type,

                      sdp:
                        answer.sdp,
                    }
                  )
                );

                answerAppliedRef.current =
                  true;

                await flushPendingIceCandidates(
                  pc
                );

                setConnectionStatus(
                  "connected"
                );
              } catch (
                answerError
              ) {
                console.error(
                  "Erro ao aplicar Answer:",
                  answerError
                );

                setConnectionStatus(
                  "failed"
                );
              }
            }
          );

        // =====================================================
        // ICE VIEWER
        // =====================================================

        unsubscribeAnswerCandidatesRef.current =
          subscribeToAnswerCandidates(
            createdLiveId,
            async (
              candidate
            ) => {
              await handleViewerIceCandidate(
                candidate
              );
            }
          );

        // =====================================================
        // OFFER
        // =====================================================

        const offer =
          await connection.createOffer();

        await connection.setLocalDescription(
          offer
        );

        await saveOffer(
          createdLiveId,
          connection.localDescription
        );

        offerCreatedRef.current =
          true;

        console.log(
          "Offer criada e guardada."
        );
      },
      [
        closePeerConnection,
        flushPendingIceCandidates,
        handleViewerIceCandidate,
      ]
    );

  // =========================================================
  // INICIAR LIVE
  // =========================================================

  const handleStartLive =
    useCallback(async () => {
      if (!currentUser?.uid) {
        alert(
          "É necessário iniciar sessão."
        );

        return;
      }

      if (!id) {
        alert(
          "ID da Live não encontrado."
        );

        return;
      }

      if (
        isLive ||
        starting
      ) {
        return;
      }

      setStarting(true);

      setError("");

      setConnectionStatus(
        "connecting"
      );

      try {
        if (!streamRef.current) {
          await startMedia();
        }

        if (!streamRef.current) {
          throw new Error(
            "Câmera e microfone não estão disponíveis."
          );
        }

        await createBroadcasterConnection(
          id
        );

        await startLive(id);

        liveStartedAtRef.current =
          Date.now();

        pausedTotalRef.current =
          0;

        pausedStartedAtRef.current =
          null;

        setLiveDuration(0);

        setPausedDuration(0);

        setIsPaused(false);

        setIsLive(true);

        setConnectionStatus(
          "connecting"
        );

        setInfoMessage(
          "A tua Live começou!"
        );

        setTimeout(() => {
          setInfoMessage("");
        }, 3000);
      } catch (startError) {
        console.error(
          "Erro ao iniciar Live:",
          startError
        );

        closePeerConnection();

        setIsLive(false);

        setConnectionStatus(
          "offline"
        );

        setError(
          startError?.message ||
            "Não foi possível iniciar a transmissão."
        );
      } finally {
        setStarting(false);
      }
    }, [
      currentUser,
      id,
      isLive,
      starting,
      startMedia,
      createBroadcasterConnection,
      closePeerConnection,
    ]);

  // =========================================================
  // PAUSAR LIVE
  // =========================================================

  const handlePauseLive =
    useCallback(async () => {
      if (
        !isLive ||
        isPaused ||
        !id
      ) {
        return;
      }

      try {
        pausedStartedAtRef.current =
          Date.now();

        setIsPaused(true);

        setConnectionStatus(
          "paused"
        );

        /*
         * Importante:
         *
         * Não fechamos o WebRTC.
         * Apenas desativamos câmera/microfone.
         *
         * Isso permite retomar rapidamente.
         */

        streamRef.current
          ?.getTracks()
          .forEach((track) => {
            track.enabled =
              false;
          });

        await updateLive(
          id,
          {
            isPaused: true,

            pausedAt:
              new Date(),
          }
        );

        setInfoMessage(
          "Live pausada. Os espectadores verão que a transmissão está pausada."
        );
      } catch (pauseError) {
        console.error(
          "Erro ao pausar Live:",
          pauseError
        );

        setIsPaused(false);

        setConnectionStatus(
          "connected"
        );
      }
    }, [
      isLive,
      isPaused,
      id,
    ]);

  // =========================================================
  // RETOMAR LIVE
  // =========================================================

  const handleResumeLive =
    useCallback(async () => {
      if (
        !isLive ||
        !isPaused ||
        !id
      ) {
        return;
      }

      try {
        if (
          pausedStartedAtRef.current
        ) {
          const pauseSeconds =
            Math.floor(
              (Date.now() -
                pausedStartedAtRef.current) /
                1000
            );

          pausedTotalRef.current +=
            Math.max(
              0,
              pauseSeconds
            );
        }

        pausedStartedAtRef.current =
          null;

        streamRef.current
          ?.getTracks()
          .forEach((track) => {
            if (
              track.kind ===
              "video"
            ) {
              track.enabled =
                cameraEnabled;
            }

            if (
              track.kind ===
              "audio"
            ) {
              track.enabled =
                microphoneEnabled;
            }
          });

        setIsPaused(false);

        setConnectionStatus(
          "connected"
        );

        await updateLive(
          id,
          {
            isPaused: false,

            resumedAt:
              new Date(),
          }
        );

        setInfoMessage(
          "Live retomada."
        );

        setTimeout(() => {
          setInfoMessage("");
        }, 2000);
      } catch (resumeError) {
        console.error(
          "Erro ao retomar:",
          resumeError
        );
      }
    }, [
      isLive,
      isPaused,
      id,
      cameraEnabled,
      microphoneEnabled,
    ]);

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (
      !isLive ||
      !liveStartedAtRef.current
    ) {
      if (
        liveTimerRef.current
      ) {
        clearInterval(
          liveTimerRef.current
        );

        liveTimerRef.current =
          null;
      }

      return;
    }

    const updateTimer =
      () => {
        if (
          !liveStartedAtRef.current
        ) {
          return;
        }

        const totalElapsed =
          Math.floor(
            (Date.now() -
              liveStartedAtRef.current) /
              1000
          );

        let pausedSeconds =
          pausedTotalRef.current;

        if (
          isPaused &&
          pausedStartedAtRef.current
        ) {
          pausedSeconds +=
            Math.floor(
              (Date.now() -
                pausedStartedAtRef.current) /
                1000
            );
        }

        setPausedDuration(
          pausedSeconds
        );

        setLiveDuration(
          Math.max(
            0,
            totalElapsed -
              pausedSeconds
          )
        );
      };

    updateTimer();

    if (
      liveTimerRef.current
    ) {
      clearInterval(
        liveTimerRef.current
      );
    }

    liveTimerRef.current =
      setInterval(
        updateTimer,
        1000
      );

    return () => {
      if (
        liveTimerRef.current
      ) {
        clearInterval(
          liveTimerRef.current
        );

        liveTimerRef.current =
          null;
      }
    };
  }, [
    isLive,
    isPaused,
  ]);

  // =========================================================
  // OUVIR LIVE
  // =========================================================

  useEffect(() => {
    mountedRef.current =
      true;

    if (!id) {
      setError(
        "ID da Live não informado."
      );

      setLoading(false);

      return () => {
        mountedRef.current =
          false;
      };
    }

    unsubscribeLiveRef.current =
      subscribeToLive(
        id,
        (liveData) => {
          if (
            !mountedRef.current
          ) {
            return;
          }

          if (!liveData) {
            setLive(null);

            setLoading(false);

            setError(
              "Esta Live não existe."
            );

            return;
          }

          setLive(liveData);

          setLoading(false);

          if (
            liveData.status ===
            "ended"
          ) {
            setIsLive(false);

            setIsPaused(false);

            setConnectionStatus(
              "offline"
            );

            return;
          }

          /*
           * Recuperar estado de pausa
           * caso a página seja atualizada.
           */

          if (
            liveData.isPaused
          ) {
            setIsPaused(true);

            setConnectionStatus(
              "paused"
            );
          }
        }
      );

    return () => {
      mountedRef.current =
        false;

      if (
        unsubscribeLiveRef.current
      ) {
        unsubscribeLiveRef.current();

        unsubscribeLiveRef.current =
          null;
      }
    };
  }, [id]);

  // =========================================================
  // VIEWERS
  // =========================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    unsubscribeViewersRef.current =
      subscribeToViewers(
        id,
        (viewerList) => {
          if (
            mountedRef.current
          ) {
            setViewers(
              viewerList
            );
          }
        }
      );

    return () => {
      if (
        unsubscribeViewersRef.current
      ) {
        unsubscribeViewersRef.current();

        unsubscribeViewersRef.current =
          null;
      }
    };
  }, [id]);

  // =========================================================
  // CARREGAR LIVE INICIAL
  // =========================================================

  useEffect(() => {
    if (
      authLoading ||
      !currentUser ||
      !id
    ) {
      return;
    }

    const load =
      async () => {
        try {
          const liveData =
            await getLive(id);

          if (
            !mountedRef.current
          ) {
            return;
          }

          if (!liveData) {
            setError(
              "Esta Live não existe."
            );

            setLoading(false);

            return;
          }

          setLive(
            liveData
          );
        } catch (
          loadError
        ) {
          console.error(
            "Erro ao carregar Live:",
            loadError
          );

          setError(
            "Não foi possível carregar a Live."
          );
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(false);
          }
        }
      };

    load();
  }, [
    authLoading,
    currentUser,
    id,
  ]);

  // =========================================================
  // INICIALIZAR CÂMERA
  // =========================================================

  useEffect(() => {
    if (
      authLoading ||
      !currentUser
    ) {
      return;
    }

    startMedia().catch(
      () => {}
    );

    return () => {
      if (
        liveTimerRef.current
      ) {
        clearInterval(
          liveTimerRef.current
        );
      }

      if (
        reconnectTimerRef.current
      ) {
        clearTimeout(
          reconnectTimerRef.current
        );
      }

      closePeerConnection();

      stopMedia();
    };
  }, [
    authLoading,
    currentUser,
    closePeerConnection,
    stopMedia,
  ]);

  // =========================================================
  // ENCERRAR LIVE
  // =========================================================

  const handleEndLive =
    useCallback(async () => {
      if (
        ending ||
        !id
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Tens certeza que queres encerrar esta transmissão?"
        );

      if (!confirmed) {
        return;
      }

      setEnding(true);

      try {
        if (
          isPaused &&
          pausedStartedAtRef.current
        ) {
          pausedTotalRef.current +=
            Math.floor(
              (Date.now() -
                pausedStartedAtRef.current) /
                1000
            );

          pausedStartedAtRef.current =
            null;
        }

        await endLive(id);

        setIsLive(false);

        setIsPaused(false);

        setConnectionStatus(
          "offline"
        );

        closePeerConnection();

        stopMedia();

        if (
          liveTimerRef.current
        ) {
          clearInterval(
            liveTimerRef.current
          );

          liveTimerRef.current =
            null;
        }

        liveStartedAtRef.current =
          null;

        setInfoMessage(
          "Transmissão encerrada."
        );
      } catch (endError) {
        console.error(
          "Erro ao encerrar:",
          endError
        );

        setError(
          endError?.message ||
            "Não foi possível encerrar a transmissão."
        );
      } finally {
        setEnding(false);
      }
    }, [
      ending,
      id,
      isPaused,
      closePeerConnection,
      stopMedia,
    ]);

  // =========================================================
  // PARTILHAR
  // =========================================================

  const handleShare =
    useCallback(async () => {
      const url =
        `${window.location.origin}/live/watch/${id}`;

      try {
        if (
          navigator.share
        ) {
          await navigator.share(
            {
              title:
                live?.title ||
                "KonnexVib Live",

              text:
                live?.description ||
                "Assista à minha Live no KonnexVib.",

              url,
            }
          );

          return;
        }

        await navigator.clipboard.writeText(
          url
        );

        setCopySuccess(true);

        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (
        shareError
      ) {
        console.error(
          "Erro ao partilhar:",
          shareError
        );
      }
    }, [
      id,
      live,
    ]);

  // =========================================================
  // COPIAR LINK
  // =========================================================

  const handleCopyLink =
    useCallback(async () => {
      const url =
        `${window.location.origin}/live/watch/${id}`;

      try {
        await navigator.clipboard.writeText(
          url
        );

        setCopySuccess(true);

        setInfoMessage(
          "Link copiado!"
        );

        setTimeout(() => {
          setCopySuccess(false);

          setInfoMessage("");
        }, 2000);
      } catch (
        copyError
      ) {
        console.error(
          "Erro ao copiar:",
          copyError
        );

        alert(
          "Não foi possível copiar o link."
        );
      }
    }, [id]);

  // =========================================================
  // FULLSCREEN
  // =========================================================

  const handleFullscreen =
    useCallback(async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();

          setFullscreen(false);

          return;
        }

        if (
          video.requestFullscreen
        ) {
          await video.requestFullscreen();

          setFullscreen(true);
        }
      } catch (
        fullscreenError
      ) {
        console.error(
          "Erro fullscreen:",
          fullscreenError
        );
      }
    }, []);

  // =========================================================
  // LIKE
  // =========================================================

  const handleLike =
    useCallback(() => {
      if (liked) {
        setLiked(false);

        setLikes(
          (value) =>
            Math.max(
              0,
              value - 1
            )
        );

        return;
      }

      setLiked(true);

      setLikes(
        (value) =>
          value + 1
      );
    }, [liked]);

  // =========================================================
  // STATUS
  // =========================================================

  const getConnectionText =
    () => {
      if (isPaused) {
        return "Live pausada";
      }

      if (
        connectionStatus ===
        "connected"
      ) {
        return "Conectado";
      }

      if (
        connectionStatus ===
        "connecting"
      ) {
        return "A conectar...";
      }

      if (
        connectionStatus ===
        "disconnected"
      ) {
        return "Ligação perdida";
      }

      if (
        connectionStatus ===
        "failed"
      ) {
        return "Falha na ligação";
      }

      return "Aguardando...";
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading ||
    authLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635BFF] text-white shadow-lg">
            <FaBroadcastTower
              size={24}
              className="animate-pulse"
            />
          </div>

          <p className="mt-4 text-sm font-black text-gray-900">
            A preparar a Live...
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Aguarde um momento.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // LIVE NÃO ENCONTRADA
  // =========================================================

  if (!live) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-[68px] max-w-3xl items-center px-3">
            <button
              type="button"
              onClick={() =>
                navigate("/live")
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
            >
              <FaArrowLeft />
            </button>

            <h1 className="ml-3 text-base font-black">
              KonnexVib Live
            </h1>
          </div>
        </header>

        <main className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center px-4">
          <section className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <FaExclamationTriangle
              size={34}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-lg font-black text-gray-900">
              Live indisponível
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "Esta transmissão não está disponível."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/live")
              }
              className="mt-5 rounded-xl bg-[#635BFF] px-5 py-3 text-sm font-black text-white"
            >
              Voltar para Lives
            </button>
          </section>
        </main>
      </div>
    );
  }

  // =========================================================
  // INTERFACE PRINCIPAL
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-10">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3 sm:px-5">
          <button
            type="button"
            onClick={() =>
              navigate("/live")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
            title="Voltar"
          >
            <FaArrowLeft
              size={17}
            />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-white">
              <FaBroadcastTower
                size={16}
              />

              {isLive && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>

            <div>
              <h1 className="text-sm font-black text-gray-900 sm:text-base">
                KonnexVib Live
              </h1>

              <p className="hidden text-[10px] text-gray-500 sm:block">
                Sala do transmissor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-[#635BFF]"
            title="Partilhar"
          >
            <FaShare
              size={16}
            />
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl px-3 pt-[84px] sm:px-5">
        <div
          className={`grid gap-4 ${
            showChat
              ? "lg:grid-cols-[minmax(0,1fr)_360px]"
              : ""
          }`}
        >
          {/* =================================================
              PLAYER
          ================================================= */}

          <div className="min-w-0">
            <section className="overflow-hidden rounded-2xl bg-black shadow-xl">
              <div className="relative aspect-video w-full bg-gray-950">
                {/* VIDEO */}

                {cameraReady ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                    className={`h-full w-full object-contain ${
                      cameraEnabled
                        ? "block"
                        : "hidden"
                    }`}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                    <div className="text-center text-white">
                      <FaVideoSlash
                        size={42}
                        className="mx-auto text-gray-500"
                      />

                      <p className="mt-3 text-sm font-black">
                        Câmera indisponível
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          startMedia().catch(
                            () => {}
                          )
                        }
                        className="mt-4 flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2.5 text-xs font-black text-white"
                      >
                        <FaRedo
                          size={11}
                        />
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                )}

                {/* CÂMERA DESLIGADA */}

                {!cameraEnabled &&
                  cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                      <div className="text-center text-gray-400">
                        <FaVideoSlash
                          size={44}
                          className="mx-auto"
                        />

                        <p className="mt-3 text-sm font-black">
                          Câmera desligada
                        </p>
                      </div>
                    </div>
                  )}

                {/* PAUSA */}

                {isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center text-white">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                        <FaPause
                          size={24}
                        />
                      </div>

                      <p className="mt-4 text-lg font-black">
                        LIVE PAUSADA
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Retoma quando estiveres pronto.
                      </p>
                    </div>
                  </div>
                )}

                {/* AO VIVO */}

                {isLive && (
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />

                    {isPaused
                      ? "PAUSADA"
                      : "AO VIVO"}
                  </div>
                )}

                {/* TEMPO */}

                {isLive && (
                  <div className="absolute right-4 top-4 rounded-full bg-black/75 px-3 py-1.5 font-mono text-[10px] font-black text-white backdrop-blur-sm">
                    {formatDuration(
                      liveDuration
                    )}
                  </div>
                )}

                {/* QUALIDADE */}

                {cameraReady &&
                  videoResolution && (
                    <div className="absolute bottom-20 left-4 rounded-full bg-black/70 px-3 py-1.5 text-[9px] font-black text-white">
                      {videoQuality} •{" "}
                      {videoResolution}
                    </div>
                  )}

                {/* CONTROLES */}

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent p-3 pt-14 sm:p-4 sm:pt-16">
                  <div className="flex items-center gap-2">
                    {/* CÂMERA */}

                    <button
                      type="button"
                      onClick={
                        toggleCamera
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition active:scale-95 ${
                        cameraEnabled
                          ? "bg-white text-gray-800"
                          : "bg-red-500 text-white"
                      }`}
                      title="Câmera"
                    >
                      {cameraEnabled ? (
                        <FaVideo />
                      ) : (
                        <FaVideoSlash />
                      )}
                    </button>

                    {/* MICROFONE */}

                    <button
                      type="button"
                      onClick={
                        toggleMicrophone
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition active:scale-95 ${
                        microphoneEnabled
                          ? "bg-white text-gray-800"
                          : "bg-red-500 text-white"
                      }`}
                      title="Microfone"
                    >
                      {microphoneEnabled ? (
                        <FaMicrophone />
                      ) : (
                        <FaMicrophoneSlash />
                      )}
                    </button>

                    {/* PAUSAR */}

                    {isLive && (
                      <button
                        type="button"
                        onClick={
                          isPaused
                            ? handleResumeLive
                            : handlePauseLive
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg transition active:scale-95"
                        title={
                          isPaused
                            ? "Retomar"
                            : "Pausar"
                        }
                      >
                        {isPaused ? (
                          <FaPlay
                            size={13}
                          />
                        ) : (
                          <FaPause
                            size={13}
                          />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* FULLSCREEN */}

                    <button
                      type="button"
                      onClick={
                        handleFullscreen
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                      title="Tela cheia"
                    >
                      <FaExpand
                        size={14}
                      />
                    </button>

                    {/* MENU */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowMenu(
                          (value) =>
                            !value
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                      title="Mais opções"
                    >
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>

                {/* MENU FLUTUANTE */}

                {showMenu && (
                  <div className="absolute bottom-16 right-4 z-20 w-52 overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-1 text-white shadow-2xl backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        handleShare();
                        setShowMenu(
                          false
                        );
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold hover:bg-white/10"
                    >
                      <FaShare />
                      Partilhar Live
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleCopyLink();
                        setShowMenu(
                          false
                        );
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold hover:bg-white/10"
                    >
                      <FaCopy />
                      Copiar link
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowChat(
                          true
                        );

                        setShowMenu(
                          false
                        );
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold hover:bg-white/10"
                    >
                      <FaComment />
                      Abrir chat
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                MENSAGEM
            ================================================= */}

            {infoMessage && (
              <div className="mt-3 rounded-xl border border-[#635BFF]/20 bg-[#635BFF]/5 px-4 py-3 text-center text-xs font-bold text-[#635BFF]">
                {infoMessage}
              </div>
            )}

            {/* =================================================
                ERRO
            ================================================= */}

            {error && (
              <section className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="mt-0.5 text-orange-600" />

                  <div className="flex-1">
                    <p className="text-xs font-black text-orange-700">
                      Atenção
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-600">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");

                        startMedia().catch(
                          () => {}
                        );
                      }}
                      className="mt-3 flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-[10px] font-black text-white"
                    >
                      <FaRedo />
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                ESTADO LIVE
            ================================================= */}

            {isLive && (
              <section className="mt-4 rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      isPaused
                        ? "bg-orange-50 text-orange-500"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {isPaused ? (
                      <FaPause />
                    ) : (
                      <FaBroadcastTower />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-gray-900">
                        {isPaused
                          ? "Live pausada"
                          : "Transmissão ao vivo"}
                      </p>

                      <span className="rounded-full bg-gray-100 px-2 py-1 font-mono text-[9px] font-black text-gray-600">
                        {formatDuration(
                          liveDuration
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-gray-500">
                      {getConnectionText()}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FaUsers
                        size={12}
                      />

                      <span className="text-xs font-black">
                        {viewers.length}
                      </span>
                    </div>

                    <p className="text-[9px] text-gray-400">
                      espectadores
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                TÍTULO / INFORMAÇÕES
            ================================================= */}

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                {isLive && (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase text-red-600">
                    Ao vivo
                  </span>
                )}

                {live.audience ===
                  "VIP" && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-black text-yellow-600">
                    <FaCrown />
                    VIP
                  </span>
                )}

                {live.category && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[9px] font-bold text-[#635BFF]">
                    {live.category}
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-lg font-black text-gray-900">
                {live.title ||
                  "Live KonnexVib"}
              </h2>

              {live.description && (
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {live.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                {/* ESPECTADORES */}

                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600">
                  <FaUsers />

                  {viewers.length}{" "}
                  espectadores
                </div>

                {/* LIKE */}

                <button
                  type="button"
                  onClick={
                    handleLike
                  }
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                    liked
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FaHeart />

                  {likes}
                </button>

                {/* CHAT */}

                <button
                  type="button"
                  onClick={() =>
                    setShowChat(
                      (value) =>
                        !value
                    )
                  }
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold ${
                    showChat
                      ? "bg-purple-50 text-[#635BFF]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FaComment />

                  {showChat
                    ? "Fechar chat"
                    : "Chat"}
                </button>

                {/* PARTILHAR */}

                <button
                  type="button"
                  onClick={
                    handleShare
                  }
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600"
                >
                  <FaShare />

                  Partilhar
                </button>
              </div>
            </section>

            {/* =================================================
                CONTROLO PRINCIPAL
            ================================================= */}

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                {/* CÂMERA */}

                <button
                  type="button"
                  onClick={
                    toggleCamera
                  }
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      cameraEnabled
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {cameraEnabled ? (
                      <FaVideo />
                    ) : (
                      <FaVideoSlash />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      Câmera
                    </p>

                    <p className="text-[10px] text-gray-500">
                      {cameraEnabled
                        ? "Ativa"
                        : "Desligada"}
                    </p>
                  </div>
                </button>

                {/* MICROFONE */}

                <button
                  type="button"
                  onClick={
                    toggleMicrophone
                  }
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      microphoneEnabled
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {microphoneEnabled ? (
                      <FaMicrophone />
                    ) : (
                      <FaMicrophoneSlash />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      Microfone
                    </p>

                    <p className="text-[10px] text-gray-500">
                      {microphoneEnabled
                        ? "Ativo"
                        : "Desligado"}
                    </p>
                  </div>
                </button>

                {/* QUALIDADE */}

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
                    <FaSignal />
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      Qualidade
                    </p>

                    <p className="text-[10px] text-gray-500">
                      {videoQuality}
                    </p>
                  </div>
                </div>
              </div>

              {/* PAUSA / RETOMAR */}

              {isLive && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={
                      isPaused
                        ? handleResumeLive
                        : handlePauseLive
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-black text-white hover:bg-gray-800"
                  >
                    {isPaused ? (
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

                  <button
                    type="button"
                    onClick={
                      handleEndLive
                    }
                    disabled={
                      ending
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    <FaStop />

                    {ending
                      ? "A encerrar..."
                      : "Encerrar transmissão"}
                  </button>
                </div>
              )}
            </section>

            {/* =================================================
                LINK
            ================================================= */}

            {isLive && (
              <section className="mt-4 rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <FaLink />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900">
                      Convida pessoas para a Live
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      Partilha o link para aumentar os teus espectadores.
                    </p>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/live/watch/${id}`}
                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[10px] text-gray-600 outline-none"
                      />

                      <button
                        type="button"
                        onClick={
                          handleCopyLink
                        }
                        className="flex h-10 items-center gap-2 rounded-xl bg-[#635BFF] px-3 text-[10px] font-black text-white"
                      >
                        <FaCopy />

                        <span className="hidden sm:block">
                          {copySuccess
                            ? "Copiado!"
                            : "Copiar"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                ESTATÍSTICAS
            ================================================= */}

            {isLive && (
              <section className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaUsers />

                    <span className="text-[10px] font-bold">
                      Espectadores
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-black text-gray-900">
                    {viewers.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaBroadcastTower />

                    <span className="text-[10px] font-bold">
                      Duração
                    </span>
                  </div>

                  <p className="mt-2 font-mono text-2xl font-black text-gray-900">
                    {formatDuration(
                      liveDuration
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaHeart />

                    <span className="text-[10px] font-bold">
                      Reações
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-black text-gray-900">
                    {likes}
                  </p>
                </div>
              </section>
            )}

            {/* =================================================
                INFORMAÇÃO
            ================================================= */}

            <section className="mt-4 rounded-2xl border border-[#635BFF]/10 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
                  <FaCheckCircle />
                </div>

                <div>
                  <h3 className="text-xs font-black text-gray-900">
                    KonnexVib Live
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-gray-500">
                    A transmissão usa WebRTC para enviar vídeo e áudio em tempo real. Podes desligar a câmera, silenciar o microfone ou pausar temporariamente a Live sem encerrar a sessão.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              CHAT
          ================================================= */}

          {showChat && (
            <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-[84px] lg:h-[calc(100vh-100px)]">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <div>
                    <h3 className="text-sm font-black text-gray-900">
                      Chat da Live
                    </h3>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Conversa em tempo real
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowChat(
                        false
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
                    <FaComment
                      size={22}
                    />
                  </div>

                  <h4 className="mt-4 text-sm font-black text-gray-900">
                    Chat da transmissão
                  </h4>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    O sistema de chat em tempo real será conectado aqui ao sistema de mensagens do KonnexVib.
                  </p>

                  <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-[10px] text-gray-400">
                    Próxima evolução: mensagens, emojis, moderação e mensagens fixadas.
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}