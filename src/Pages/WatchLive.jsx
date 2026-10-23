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
  FaShare,
  FaComment,
  FaUserCircle,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCrown,
  FaCheckCircle,
  FaUsers,
  FaPlay,
  FaRedo,
  FaPause,
} from "react-icons/fa";

import {
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  WEBRTC_CONFIG,
  saveAnswer,
  addAnswerCandidate,
} from "../services/liveService";


export default function WatchLive() {
  const navigate = useNavigate();
  const { id } = useParams();

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const unsubscribeLiveRef =
    useRef(null);

  const unsubscribeOfferCandidatesRef =
    useRef(null);

  const candidateQueueRef =
    useRef([]);

  const remoteDescriptionReadyRef =
    useRef(false);

  const answerCreatedRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const reconnectTimeoutRef =
    useRef(null);


  const [live, setLive] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [connecting, setConnecting] =
    useState(false);

  const [connectionStatus, setConnectionStatus] =
    useState("offline");

  const [error, setError] =
    useState("");

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [showChat, setShowChat] =
    useState(false);


  // =========================================================
  // LIMPAR TIMEOUT
  // =========================================================

  const clearReconnectTimeout =
    useCallback(() => {
      if (
        reconnectTimeoutRef.current
      ) {
        clearTimeout(
          reconnectTimeoutRef.current
        );

        reconnectTimeoutRef.current =
          null;
      }
    }, []);


  // =========================================================
  // LIMPAR WEBRTC
  // =========================================================

  const closePeerConnection =
    useCallback(() => {
      clearReconnectTimeout();

      if (
        unsubscribeOfferCandidatesRef.current
      ) {
        unsubscribeOfferCandidatesRef.current();

        unsubscribeOfferCandidatesRef.current =
          null;
      }

      if (
        peerConnectionRef.current
      ) {
        peerConnectionRef.current.onicecandidate =
          null;

        peerConnectionRef.current.ontrack =
          null;

        peerConnectionRef.current.onconnectionstatechange =
          null;

        peerConnectionRef.current.oniceconnectionstatechange =
          null;

        try {
          peerConnectionRef.current.close();
        } catch (closeError) {
          console.error(
            "Erro ao fechar conexão:",
            closeError
          );
        }

        peerConnectionRef.current =
          null;
      }

      candidateQueueRef.current =
        [];

      remoteDescriptionReadyRef.current =
        false;

      answerCreatedRef.current =
        false;

      if (videoRef.current) {
        videoRef.current.pause();

        videoRef.current.srcObject =
          null;
      }

      setIsPlaying(false);
      setConnecting(false);
    }, [
      clearReconnectTimeout,
    ]);


  // =========================================================
  // ADICIONAR ICE CANDIDATE
  // =========================================================

  const addIceCandidate =
    useCallback(
      async (candidate) => {
        const peerConnection =
          peerConnectionRef.current;

        if (
          !peerConnection ||
          !candidate
        ) {
          return;
        }

        if (
          !remoteDescriptionReadyRef.current
        ) {
          candidateQueueRef.current.push(
            candidate
          );

          return;
        }

        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (candidateError) {
          console.error(
            "Erro ao adicionar ICE candidate:",
            candidateError
          );
        }
      },
      []
    );


  // =========================================================
  // PROCESSAR CANDIDATES EM ESPERA
  // =========================================================

  const flushCandidateQueue =
    useCallback(async () => {
      const peerConnection =
        peerConnectionRef.current;

      if (
        !peerConnection ||
        !remoteDescriptionReadyRef.current
      ) {
        return;
      }

      const candidates = [
        ...candidateQueueRef.current,
      ];

      candidateQueueRef.current =
        [];

      for (
        const candidate of candidates
      ) {
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (candidateError) {
          console.error(
            "Erro ao aplicar ICE candidate:",
            candidateError
          );
        }
      }
    }, []);


  // =========================================================
  // CONECTAR À LIVE
  // =========================================================

  const connectToLive =
    useCallback(
      async (offer) => {
        if (!offer) {
          return;
        }

        if (!mountedRef.current) {
          return;
        }

        if (answerCreatedRef.current) {
          return;
        }

        setConnecting(true);

        setConnectionStatus(
          "connecting"
        );

        setError("");

        try {
          closePeerConnection();

          const peerConnection =
            new RTCPeerConnection(
              WEBRTC_CONFIG
            );

          peerConnectionRef.current =
            peerConnection;


          // ===================================================
          // ICE DO VIEWER
          // ===================================================

          peerConnection.onicecandidate =
            async (event) => {
              if (
                !event.candidate
              ) {
                return;
              }

              try {
                await addAnswerCandidate(
                  id,
                  event.candidate.toJSON()
                );
              } catch (
                candidateError
              ) {
                console.error(
                  "Erro ao guardar ICE candidate:",
                  candidateError
                );
              }
            };


          // ===================================================
          // RECEBER VÍDEO / ÁUDIO
          // ===================================================

          peerConnection.ontrack =
            (event) => {
              const remoteStream =
                event.streams?.[0];

              if (
                !remoteStream ||
                !videoRef.current
              ) {
                return;
              }

              videoRef.current.srcObject =
                remoteStream;

              videoRef.current.muted =
                isMuted;

              videoRef.current
                .play()
                .then(() => {
                  if (
                    !mountedRef.current
                  ) {
                    return;
                  }

                  setIsPlaying(true);
                })
                .catch(() => {
                  if (
                    !mountedRef.current
                  ) {
                    return;
                  }

                  setIsPlaying(false);
                });
            };


          // ===================================================
          // ESTADO DA CONEXÃO
          // ===================================================

          peerConnection.onconnectionstatechange =
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              const state =
                peerConnection.connectionState;

              if (
                state ===
                "connected"
              ) {
                setConnectionStatus(
                  "connected"
                );

                setConnecting(false);
                setError("");
              }

              if (
                state === "new" ||
                state === "connecting"
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

                setConnecting(false);
              }

              if (
                state === "failed"
              ) {
                setConnectionStatus(
                  "failed"
                );

                setConnecting(false);

                setError(
                  "A ligação com a transmissão foi perdida."
                );
              }

              if (
                state === "closed"
              ) {
                setConnectionStatus(
                  "offline"
                );

                setConnecting(false);
              }
            };


          // ===================================================
          // ICE CONNECTION
          // ===================================================

          peerConnection.oniceconnectionstatechange =
            () => {
              const state =
                peerConnection.iceConnectionState;

              if (
                state === "connected" ||
                state === "completed"
              ) {
                if (
                  mountedRef.current
                ) {
                  setConnectionStatus(
                    "connected"
                  );

                  setConnecting(
                    false
                  );
                }
              }

              if (
                state === "failed"
              ) {
                if (
                  mountedRef.current
                ) {
                  setConnectionStatus(
                    "failed"
                  );

                  setConnecting(
                    false
                  );

                  setError(
                    "Não foi possível estabelecer a ligação."
                  );
                }
              }
            };


          // ===================================================
          // RECEBER OFFER
          // ===================================================

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription({
              type:
                offer.type,
              sdp:
                offer.sdp,
            })
          );

          remoteDescriptionReadyRef.current =
            true;


          // ===================================================
          // RECEBER ICE DO HOST
          //
          // IMPORTANTE:
          // O liveService guarda aqui:
          //
          // lives/{id}/signal/data/offerCandidates
          // ===================================================

          const candidatesRef =
            collection(
              db,
              "lives",
              id,
              "signal",
              "data",
              "offerCandidates"
            );

          unsubscribeOfferCandidatesRef.current =
            onSnapshot(
              candidatesRef,
              (snapshot) => {
                snapshot.docChanges().forEach(
                  (change) => {
                    if (
                      change.type !==
                      "added"
                    ) {
                      return;
                    }

                    const data =
                      change.doc.data();

                    if (
                      data?.candidate
                    ) {
                      addIceCandidate(
                        data.candidate
                      );
                    }
                  }
                );
              },
              (candidateSnapshotError) => {
                console.error(
                  "Erro ao acompanhar ICE do host:",
                  candidateSnapshotError
                );
              }
            );


          // ===================================================
          // CANDIDATES EM ESPERA
          // ===================================================

          await flushCandidateQueue();


          // ===================================================
          // CRIAR ANSWER
          // ===================================================

          const answer =
            await peerConnection.createAnswer();

          await peerConnection.setLocalDescription(
            answer
          );

          if (
            !peerConnection.localDescription
          ) {
            throw new Error(
              "LocalDescription não foi criada."
            );
          }

          await saveAnswer(
            id,
            peerConnection.localDescription.toJSON()
          );

          answerCreatedRef.current =
            true;

        } catch (connectionError) {
          console.error(
            "Erro ao conectar à Live:",
            connectionError
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          setConnectionStatus(
            "failed"
          );

          setConnecting(false);

          setError(
            "Não foi possível estabelecer a ligação com esta transmissão."
          );
        }
      },
      [
        id,
        closePeerConnection,
        addIceCandidate,
        flushCandidateQueue,
        isMuted,
      ]
    );


  // =========================================================
  // RECONectar
  // =========================================================

  const handleReconnect =
    useCallback(() => {
      if (
        !live ||
        live.status !== "live" ||
        !live.offer
      ) {
        return;
      }

      closePeerConnection();

      setError("");

      setConnectionStatus(
        "connecting"
      );

      reconnectTimeoutRef.current =
        setTimeout(() => {
          if (
            mountedRef.current
          ) {
            connectToLive(
              live.offer
            );
          }
        }, 300);

    }, [
      live,
      closePeerConnection,
      connectToLive,
    ]);


  // =========================================================
  // OUVIR LIVE
  // =========================================================

  useEffect(() => {
    mountedRef.current =
      true;

    if (!id) {
      setError(
        "A transmissão não foi identificada."
      );

      setLoading(false);

      return () => {
        mountedRef.current =
          false;
      };
    }

    const liveRef =
      doc(
        db,
        "lives",
        id
      );

    unsubscribeLiveRef.current =
      onSnapshot(
        liveRef,
        async (snapshot) => {
          if (
            !mountedRef.current
          ) {
            return;
          }

          // =================================================
          // LIVE NÃO EXISTE
          // =================================================

          if (!snapshot.exists()) {
            setLive(null);

            setLoading(false);

            closePeerConnection();

            setError(
              "Esta transmissão não está disponível."
            );

            return;
          }

          const liveData = {
            id:
              snapshot.id,
            ...snapshot.data(),
          };

          setLive(liveData);

          setLoading(false);


          // =================================================
          // LIVE PAUSADA
          // =================================================

          if (
            liveData.status ===
            "paused"
          ) {
            setConnectionStatus(
              "paused"
            );

            setConnecting(false);

            closePeerConnection();

            setError("");

            return;
          }


          // =================================================
          // LIVE ENCERRADA
          // =================================================

          if (
            liveData.status ===
            "ended"
          ) {
            setConnectionStatus(
              "offline"
            );

            setConnecting(false);

            closePeerConnection();

            setError(
              "Esta transmissão terminou."
            );

            return;
          }


          // =================================================
          // LIVE EM ESPERA
          // =================================================

          if (
            liveData.status ===
            "waiting"
          ) {
            setConnectionStatus(
              "offline"
            );

            setConnecting(false);

            closePeerConnection();

            setError(
              "A transmissão ainda não começou."
            );

            return;
          }


          // =================================================
          // OUTRO STATUS
          // =================================================

          if (
            liveData.status !==
            "live"
          ) {
            setConnectionStatus(
              "offline"
            );

            setConnecting(false);

            return;
          }


          // =================================================
          // LIVE RETOMADA
          // =================================================

          setError("");


          // =================================================
          // NOVA OFFER
          // =================================================

          if (
            liveData.offer &&
            !answerCreatedRef.current
          ) {
            await connectToLive(
              liveData.offer
            );
          }

        },
        (snapshotError) => {
          console.error(
            "Erro ao acompanhar Live:",
            snapshotError
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          setLoading(false);

          setError(
            "Não foi possível acompanhar esta transmissão."
          );
        }
      );


    // =======================================================
    // CLEANUP
    // =======================================================

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

      closePeerConnection();
    };

  }, [
    id,
    connectToLive,
    closePeerConnection,
  ]);


  // =========================================================
  // PLAY / PAUSE LOCAL
  // =========================================================

  const handlePlayPause =
    async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      try {
        if (video.paused) {
          await video.play();

          setIsPlaying(true);
        } else {
          video.pause();

          setIsPlaying(false);
        }
      } catch (playError) {
        console.error(
          "Erro ao reproduzir transmissão:",
          playError
        );
      }
    };


  // =========================================================
  // VOLUME
  // =========================================================

  const handleMute = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const muted =
      !video.muted;

    video.muted =
      muted;

    setIsMuted(
      muted
    );
  };


  // =========================================================
  // PARTILHAR
  // =========================================================

  const handleShare =
    async () => {
      if (!live) {
        return;
      }

      const url =
        window.location.href;

      const shareData = {
        title:
          live.title ||
          "KonnexVib Live",

        text:
          live.description ||
          "",

        url,
      };

      try {
        if (
          navigator.share
        ) {
          await navigator.share(
            shareData
          );

          return;
        }

        if (
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            url
          );

          alert(
            "Link da transmissão copiado."
          );
        }

      } catch (
        shareError
      ) {
        console.error(
          "Erro ao partilhar:",
          shareError
        );
      }
    };


  // =========================================================
  // FULLSCREEN
  // =========================================================

  const handleFullscreen =
    async () => {
      const player =
        playerRef.current;

      if (!player) {
        return;
      }

      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();

          return;
        }

        await player.requestFullscreen();

      } catch (
        fullscreenError
      ) {
        console.error(
          "Erro ao abrir tela cheia:",
          fullscreenError
        );
      }
    };


  // =========================================================
  // STATUS
  // =========================================================

  const getConnectionMessage =
    () => {
      if (
        connectionStatus ===
        "connected"
      ) {
        return "Ligado";
      }

      if (
        connectionStatus ===
        "connecting"
      ) {
        return "A conectar...";
      }

      if (
        connectionStatus ===
        "paused"
      ) {
        return "Transmissão pausada";
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

      return "Aguardando transmissão";
    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">

        <div className="flex flex-col items-center text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635BFF] text-white shadow-lg">

            <FaBroadcastTower
              size={22}
            />

          </div>

          <p className="mt-4 text-sm font-black text-gray-900">
            A carregar transmissão...
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

        <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white">

          <div className="mx-auto flex h-[68px] max-w-3xl items-center px-3 sm:px-4">

            <button
              type="button"
              onClick={() =>
                navigate("/live")
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
              aria-label="Voltar"
            >
              <FaArrowLeft
                size={18}
              />
            </button>

            <div className="ml-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-white">

                <FaBroadcastTower
                  size={16}
                />

              </div>

              <h1 className="text-sm font-black text-gray-900">
                KonnexVib Live
              </h1>

            </div>

          </div>

        </header>


        <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4 pt-[68px]">

          <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">

              <FaBroadcastTower
                size={22}
              />

            </div>

            <h2 className="mt-4 text-base font-black text-gray-900">
              Transmissão indisponível
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
              className="mt-5 rounded-xl bg-[#635BFF] px-5 py-3 text-xs font-black text-white transition hover:bg-[#5148e5]"
            >
              Voltar para Lives
            </button>

          </section>

        </main>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-10">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white">

        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3 sm:px-4">

          <button
            type="button"
            onClick={() =>
              navigate("/live")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
            aria-label="Voltar"
            title="Voltar"
          >
            <FaArrowLeft
              size={18}
            />
          </button>


          <div className="flex items-center gap-2">

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-white">

              <FaBroadcastTower
                size={16}
              />

              {live.status ===
                "live" && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-white" />
              )}

            </div>


            <div>

              <h1 className="text-sm font-black text-gray-900 sm:text-base">
                KonnexVib Live
              </h1>

              <p className="hidden text-[10px] text-gray-500 sm:block">
                Transmissão ao vivo
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-[#635BFF]"
            aria-label="Partilhar"
            title="Partilhar"
          >
            <FaShare
              size={17}
            />
          </button>

        </div>

      </header>


      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <main className="mx-auto w-full max-w-7xl px-3 pt-[88px] sm:px-4">

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

            <section
              ref={playerRef}
              className="overflow-hidden rounded-2xl bg-black shadow-lg"
            >

              <div className="relative aspect-video w-full overflow-hidden bg-gray-950">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className="h-full w-full bg-black object-contain"
                />


                {/* =========================================
                    LIVE PAUSADA
                ========================================= */}

                {live.status ===
                  "paused" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90">

                    <div className="flex flex-col items-center px-6 text-center text-white">

                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">

                        <FaPause
                          size={25}
                          className="text-white"
                        />

                      </div>

                      <h2 className="mt-5 text-lg font-black">
                        Transmissão pausada
                      </h2>

                      <p className="mt-2 max-w-sm text-xs leading-5 text-gray-400">
                        O transmissor pausou temporariamente esta Live.
                      </p>

                      <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-bold text-gray-300">

                        <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />

                        Aguarde o retorno da transmissão

                      </div>

                    </div>

                  </div>
                )}


                {/* =========================================
                    CONECTANDO
                ========================================= */}

                {live.status ===
                  "live" &&
                  connectionStatus !==
                    "connected" &&
                  connectionStatus !==
                    "paused" && (

                  <div className="absolute inset-0 flex items-center justify-center bg-gray-950">

                    <div className="flex flex-col items-center px-6 text-center text-white">

                      {connecting ? (
                        <>

                          <FaBroadcastTower
                            size={38}
                            className="mb-4 animate-pulse text-[#635BFF]"
                          />

                          <p className="text-sm font-black">
                            A conectar à transmissão...
                          </p>

                          <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                            A ligação está a ser estabelecida.
                          </p>

                        </>
                      ) : (

                        <>

                          {connectionStatus ===
                            "failed" ? (
                            <FaBroadcastTower
                              size={30}
                              className="mb-4 text-red-500"
                            />
                          ) : (
                            <FaPlay
                              size={30}
                              className="mb-4 text-gray-600"
                            />
                          )}

                          <p className="text-sm font-black">
                            {getConnectionMessage()}
                          </p>

                          <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                            O vídeo será apresentado quando a transmissão estiver disponível.
                          </p>


                          {/* RECONNECT */}

                          {(connectionStatus ===
                            "failed" ||
                            connectionStatus ===
                              "disconnected") && (

                            <button
                              type="button"
                              onClick={
                                handleReconnect
                              }
                              className="mt-5 flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-3 text-xs font-black text-white transition hover:bg-[#5148e5] active:scale-95"
                            >

                              <FaRedo
                                size={11}
                              />

                              Tentar novamente

                            </button>

                          )}

                        </>
                      )}

                    </div>

                  </div>
                )}


                {/* =========================================
                    AO VIVO
                ========================================= */}

                {live.status ===
                  "live" && (
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />

                    AO VIVO

                  </div>
                )}


                {/* =========================================
                    PAUSADA BADGE
                ========================================= */}

                {live.status ===
                  "paused" && (
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">

                    <FaPause
                      size={9}
                    />

                    PAUSADA

                  </div>
                )}


                {/* =========================================
                    VIP
                ========================================= */}

                {live.audience ===
                  "VIP" && (

                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#635BFF] px-3 py-1.5 text-[10px] font-black text-white shadow-lg">

                    <FaCrown
                      size={10}
                    />

                    VIP

                  </div>
                )}


                {/* =========================================
                    CONTROLOS
                ========================================= */}

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-3 pt-12 sm:p-4 sm:pt-14">

                  <div className="flex items-center gap-2">

                    {/* PLAY */}

                    <button
                      type="button"
                      onClick={
                        handlePlayPause
                      }
                      disabled={
                        live.status !==
                        "live"
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Reproduzir ou pausar"
                      title="Reproduzir/Pausar"
                    >

                      {isPlaying ? (
                        <span className="text-xs">
                          ❚❚
                        </span>
                      ) : (
                        <FaPlay
                          size={11}
                        />
                      )}

                    </button>


                    {/* VOLUME */}

                    <button
                      type="button"
                      onClick={
                        handleMute
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                      aria-label="Volume"
                      title="Volume"
                    >

                      {isMuted ? (
                        <FaVolumeMute
                          size={13}
                        />
                      ) : (
                        <FaVolumeUp
                          size={13}
                        />
                      )}

                    </button>

                  </div>


                  {/* FULLSCREEN */}

                  <button
                    type="button"
                    onClick={
                      handleFullscreen
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
                    aria-label="Tela cheia"
                    title="Tela cheia"
                  >

                    <FaExpand
                      size={13}
                    />

                  </button>

                </div>

              </div>

            </section>


            {/* =================================================
                INFORMAÇÕES
            ================================================= */}

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="flex flex-wrap items-center gap-2">

                {live.status ===
                  "live" && (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-red-600">
                    Ao vivo
                  </span>
                )}

                {live.status ===
                  "paused" && (
                  <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-yellow-600">
                    Pausada
                  </span>
                )}

                {live.category && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[9px] font-bold text-[#635BFF]">
                    {live.category}
                  </span>
                )}

                {live.audience ===
                  "VIP" && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-black text-yellow-600">

                    <FaCrown
                      size={9}
                    />

                    VIP

                  </span>
                )}

              </div>


              <h2 className="mt-2 text-lg font-black text-gray-900 sm:text-xl">
                {live.title}
              </h2>


              {live.description && (
                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  {live.description}
                </p>
              )}


              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">

                {/* CHAT */}

                <button
                  type="button"
                  onClick={() =>
                    setShowChat(
                      (current) =>
                        !current
                    )
                  }
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                    showChat
                      ? "bg-purple-50 text-[#635BFF]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >

                  <FaComment
                    size={13}
                  />

                  {showChat
                    ? "Fechar chat"
                    : "Abrir chat"}

                </button>


                {/* PARTILHAR */}

                <button
                  type="button"
                  onClick={
                    handleShare
                  }
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-200 active:scale-95"
                >

                  <FaShare
                    size={13}
                  />

                  Partilhar

                </button>


                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-400">

                  <FaBroadcastTower
                    size={11}
                  />

                  {getConnectionMessage()}

                </div>

              </div>

            </section>


            {/* =================================================
                TRANSMISSOR
            ================================================= */}

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-50 text-[#635BFF]">

                  {live.hostPhotoURL ? (
                    <img
                      src={
                        live.hostPhotoURL
                      }
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle
                      size={30}
                    />
                  )}

                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-1.5">

                    <h3 className="truncate text-sm font-black text-gray-900">
                      {live.hostName ||
                        "Transmissor"}
                    </h3>

                    {live.hostVerified && (
                      <FaCheckCircle
                        size={13}
                        className="shrink-0 text-[#635BFF]"
                      />
                    )}

                  </div>


                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">

                    <span className="flex items-center gap-1">

                      <FaUsers
                        size={10}
                      />

                      Transmissão ao vivo

                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                ERRO / INFORMAÇÃO
            ================================================= */}

            {error &&
              live.status !==
                "paused" && (

              <section className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">

                    <FaBroadcastTower
                      size={15}
                    />

                  </div>


                  <div className="flex-1">

                    <p className="text-sm font-black text-orange-700">
                      Informação
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-600">
                      {error}
                    </p>

                  </div>

                </div>

              </section>
            )}

          </div>


          {/* =================================================
              CHAT
          ================================================= */}

          {showChat && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-[84px] lg:h-[calc(100vh-100px)]">

              <div className="flex h-full flex-col items-center justify-center text-center">

                <FaComment
                  size={28}
                  className="text-gray-300"
                />

                <h3 className="mt-3 text-sm font-black text-gray-900">
                  Chat da transmissão
                </h3>

                <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">
                  O chat em tempo real será conectado ao sistema de mensagens do KonnexVib.
                </p>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}