// src/services/liveService.js

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";

/**
 * ============================================================
 * KONNEXVIB - LIVE SERVICE
 * ============================================================
 *
 * WebRTC + Firebase Firestore
 *
 * Estrutura:
 *
 * lives/{liveId}
 *
 * lives/{liveId}/signal/offer
 * lives/{liveId}/signal/answer
 *
 * lives/{liveId}/signal/data/offerCandidates/{candidateId}
 * lives/{liveId}/signal/data/answerCandidates/{candidateId}
 *
 * lives/{liveId}/viewers/{viewerId}
 *
 * Arquitetura atual:
 *
 * 1 HOST -> 1 VIEWER
 *
 * Para grande escala será necessário SFU/CDN.
 */

/* ============================================================
   CONFIGURAÇÃO WEBRTC
============================================================ */

export const WEBRTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],

  iceCandidatePoolSize: 10,
};

/* ============================================================
   CONFIGURAÇÃO DE GRAVAÇÃO
============================================================ */

/*
 * Uma Live normal fica disponível durante 30 dias.
 *
 * IMPORTANTE:
 * O Reel NÃO será considerado uma Live expirada.
 * Quando uma Live é transformada em Reel:
 *
 * isReel = true
 * expiresAt = null
 *
 * Dessa forma, a rotina de limpeza poderá ignorar o Reel.
 */

export const LIVE_RECORDING_DAYS = 30;

export const LIVE_RECORDING_DURATION_MS =
  LIVE_RECORDING_DAYS *
  24 *
  60 *
  60 *
  1000;

/* ============================================================
   REFERÊNCIAS FIRESTORE
============================================================ */

function getLiveRef(liveId) {
  return doc(db, "lives", liveId);
}

function getSignalRef(liveId) {
  return doc(
    db,
    "lives",
    liveId,
    "signal",
    "data"
  );
}

function getOfferRef(liveId) {
  return doc(
    db,
    "lives",
    liveId,
    "signal",
    "offer"
  );
}

function getAnswerRef(liveId) {
  return doc(
    db,
    "lives",
    liveId,
    "signal",
    "answer"
  );
}

function getOfferCandidatesRef(liveId) {
  return collection(
    getSignalRef(liveId),
    "offerCandidates"
  );
}

function getAnswerCandidatesRef(liveId) {
  return collection(
    getSignalRef(liveId),
    "answerCandidates"
  );
}

function getViewersRef(liveId) {
  return collection(
    db,
    "lives",
    liveId,
    "viewers"
  );
}

/* ============================================================
   CRIAR LIVE
============================================================ */

export async function createLive({
  hostId,
  hostName,
  title,
  description,
  audience,
}) {
  if (!hostId) {
    throw new Error(
      "Utilizador não autenticado."
    );
  }

  const liveRef = doc(
    collection(db, "lives")
  );

  const liveData = {
    /* Dados da Live */

    hostId,

    hostName:
      hostName || "Utilizador",

    title:
      title || "Live KonnexVib",

    description:
      description || "",

    audience:
      audience || "Público",

    /* Estado */

    status: "waiting",

    /* WebRTC */

    offer: null,

    answer: null,

    /* Datas */

    createdAt:
      serverTimestamp(),

    startedAt: null,

    endedAt: null,

    /* Estatísticas */

    viewersCount: 0,

    likesCount: 0,

    /* ========================================================
       GRAVAÇÃO
    ======================================================== */

    recordingUrl: null,

    recordingPublicId: null,

    recordingResourceType: null,

    recordingFormat: null,

    recordingSize: 0,

    recordingDuration: null,

    recordingWidth: null,

    recordingHeight: null,

    recordingMimeType: null,

    /*
     * Estados possíveis:
     *
     * not_recorded
     * recording
     * ready
     * reel
     * delete_requested
     */

    recordingStatus:
      "not_recorded",

    recordedAt: null,

    /*
     * Live normal:
     * expira depois de 30 dias.
     */

    expiresAt: null,

    /*
     * Reel:
     * false enquanto for Live normal.
     */

    isReel: false,

    reelId: null,

    reelCreatedAt: null,

    recordingDeleteRequestedAt:
      null,
  };

  await setDoc(
    liveRef,
    liveData
  );

  return liveRef.id;
}

/* ============================================================
   OBTER LIVE
============================================================ */

export async function getLive(liveId) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  const liveRef =
    getLiveRef(liveId);

  const snapshot =
    await getDoc(liveRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/* ============================================================
   ACOMPANHAR LIVE
============================================================ */

export function subscribeToLive(
  liveId,
  callback
) {
  if (!liveId) {
    return () => {};
  }

  const liveRef =
    getLiveRef(liveId);

  return onSnapshot(
    liveRef,

    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },

    (error) => {
      console.error(
        "Erro ao acompanhar Live:",
        error
      );
    }
  );
}

/* ============================================================
   ATUALIZAR LIVE
============================================================ */

export async function updateLive(
  liveId,
  data
) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  const liveRef =
    getLiveRef(liveId);

  await updateDoc(
    liveRef,
    data
  );
}

/* ============================================================
   INICIAR LIVE
============================================================ */

export async function startLive(
  liveId
) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  await updateLive(
    liveId,
    {
      status: "live",

      startedAt:
        serverTimestamp(),

      /*
       * Quando a Live começa,
       * a gravação fica preparada.
       */

      recordingStatus:
        "recording",
    }
  );
}

/* ============================================================
   ENCERRAR LIVE
============================================================ */

export async function endLive(
  liveId
) {
  if (!liveId) {
    return;
  }

  await updateLive(
    liveId,
    {
      status: "ended",

      endedAt:
        serverTimestamp(),
    }
  );
}

/* ============================================================
   ELIMINAR LIVE
============================================================ */

export async function deleteLive(
  liveId
) {
  if (!liveId) {
    return;
  }

  await deleteDoc(
    getLiveRef(liveId)
  );
}

/* ============================================================
   OFFER
============================================================ */

export async function saveOffer(
  liveId,
  offer
) {
  if (!liveId || !offer) {
    throw new Error(
      "Live ou Offer não informado."
    );
  }

  const offerData = {
    type: offer.type,

    sdp: offer.sdp,

    createdAt:
      serverTimestamp(),
  };

  const offerRef =
    getOfferRef(liveId);

  await setDoc(
    offerRef,
    offerData
  );

  await updateLive(
    liveId,
    {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    }
  );
}

/* ============================================================
   OUVIR OFFER
============================================================ */

export function subscribeToOffer(
  liveId,
  callback
) {
  if (!liveId) {
    return () => {};
  }

  const offerRef =
    getOfferRef(liveId);

  return onSnapshot(
    offerRef,

    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback(
        snapshot.data()
      );
    },

    (error) => {
      console.error(
        "Erro ao ouvir Offer:",
        error
      );
    }
  );
}

/* ============================================================
   ANSWER
============================================================ */

export async function saveAnswer(
  liveId,
  answer
) {
  if (!liveId || !answer) {
    throw new Error(
      "Live ou Answer não informado."
    );
  }

  const answerData = {
    type: answer.type,

    sdp: answer.sdp,

    createdAt:
      serverTimestamp(),
  };

  const answerRef =
    getAnswerRef(liveId);

  await setDoc(
    answerRef,
    answerData
  );

  await updateLive(
    liveId,
    {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    }
  );
}

/* ============================================================
   OUVIR ANSWER
============================================================ */

export function subscribeToAnswer(
  liveId,
  callback
) {
  if (!liveId) {
    return () => {};
  }

  const answerRef =
    getAnswerRef(liveId);

  return onSnapshot(
    answerRef,

    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback(
        snapshot.data()
      );
    },

    (error) => {
      console.error(
        "Erro ao ouvir Answer:",
        error
      );
    }
  );
}

/* ============================================================
   OFFER ICE
============================================================ */

export async function addOfferCandidate(
  liveId,
  candidate
) {
  if (!liveId || !candidate) {
    return;
  }

  const candidatesRef =
    getOfferCandidatesRef(
      liveId
    );

  const candidateData =
    candidate.toJSON
      ? candidate.toJSON()
      : candidate;

  await addDoc(
    candidatesRef,
    {
      candidate:
        candidateData,

      createdAt:
        serverTimestamp(),
    }
  );
}

/* ============================================================
   OUVIR OFFER ICE
============================================================ */

export function subscribeToOfferCandidates(
  liveId,
  callback
) {
  if (!liveId) {
    return () => {};
  }

  const candidatesRef =
    getOfferCandidatesRef(
      liveId
    );

  return onSnapshot(
    candidatesRef,

    (snapshot) => {
      snapshot.docChanges()
        .forEach((change) => {
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
            callback(
              data.candidate
            );
          }
        });
    },

    (error) => {
      console.error(
        "Erro ao ouvir ICE do host:",
        error
      );
    }
  );
}

/* ============================================================
   ANSWER ICE
============================================================ */

export async function addAnswerCandidate(
  liveId,
  candidate
) {
  if (!liveId || !candidate) {
    return;
  }

  const candidatesRef =
    getAnswerCandidatesRef(
      liveId
    );

  const candidateData =
    candidate.toJSON
      ? candidate.toJSON()
      : candidate;

  await addDoc(
    candidatesRef,
    {
      candidate:
        candidateData,

      createdAt:
        serverTimestamp(),
    }
  );
}

/* ============================================================
   OUVIR ANSWER ICE
============================================================ */

export function subscribeToAnswerCandidates(
  liveId,
  callback
) {
  if (!liveId) {
    return () => {};
  }

  const candidatesRef =
    getAnswerCandidatesRef(
      liveId
    );

  return onSnapshot(
    candidatesRef,

    (snapshot) => {
      snapshot.docChanges()
        .forEach((change) => {
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
            callback(
              data.candidate
            );
          }
        });
    },

    (error) => {
      console.error(
        "Erro ao ouvir ICE do viewer:",
        error
      );
    }
  );
}

/* ============================================================
   GUARDAR GRAVAÇÃO DA LIVE
============================================================ */

export async function saveLiveRecording(
  liveId,
  {
    recordingUrl,

    recordingPublicId =
      null,

    recordingResourceType =
      "video",

    recordingFormat =
      null,

    recordingSize =
      0,

    recordingDuration =
      null,

    recordingWidth =
      null,

    recordingHeight =
      null,

    recordingMimeType =
      "video/webm",
  }
) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  if (!recordingUrl) {
    throw new Error(
      "URL da gravação não informada."
    );
  }

  /*
   * A gravação normal expira
   * 30 dias depois de ser guardada.
   */

  const expiresAt =
    Timestamp.fromMillis(
      Date.now() +
        LIVE_RECORDING_DURATION_MS
    );

  await updateLive(
    liveId,
    {
      recordingUrl,

      recordingPublicId,

      recordingResourceType,

      recordingFormat,

      recordingSize,

      recordingDuration,

      recordingWidth,

      recordingHeight,

      recordingMimeType,

      recordingStatus:
        "ready",

      recordedAt:
        serverTimestamp(),

      expiresAt,

      isReel: false,

      reelId: null,

      reelCreatedAt: null,

      recordingDeleteRequestedAt:
        null,
    }
  );
}

/* ============================================================
   TRANSFORMAR LIVE EM REEL
============================================================ */

export async function markLiveAsReel(
  liveId,
  reelId = null
) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  /*
   * IMPORTANTE:
   *
   * O Reel não recebe expiresAt.
   *
   * Portanto não será eliminado
   * pela rotina de limpeza das Lives.
   */

  await updateLive(
    liveId,
    {
      isReel: true,

      reelId:
        reelId || liveId,

      recordingStatus:
        "reel",

      reelCreatedAt:
        serverTimestamp(),

      expiresAt: null,
    }
  );
}

/* ============================================================
   MANTER LIVE COMO GRAVAÇÃO NORMAL
============================================================ */

export async function keepLiveRecording(
  liveId
) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  /*
   * Não alteramos expiresAt aqui.
   *
   * Assim a contagem dos 30 dias
   * continua sendo feita a partir
   * da gravação original.
   */

  await updateLive(
    liveId,
    {
      isReel: false,

      recordingStatus:
        "ready",
    }
  );
}

/* ============================================================
   SOLICITAR ELIMINAÇÃO DA GRAVAÇÃO
============================================================ */

export async function requestDeleteLiveRecording(
  liveId
) {
  if (!liveId) {
    throw new Error(
      "ID da Live não informado."
    );
  }

  /*
   * Não apagamos o vídeo diretamente
   * pelo navegador.
   *
   * A API Secret do Cloudinary
   * NÃO deve ficar no frontend.
   *
   * O backend/Firebase Functions
   * poderá executar a eliminação
   * física no Cloudinary.
   */

  await updateLive(
    liveId,
    {
      recordingStatus:
        "delete_requested",

      recordingDeleteRequestedAt:
        serverTimestamp(),

      expiresAt:
        Timestamp.now(),
    }
  );
}

/* ============================================================
   VIEWERS
============================================================ */

export async function addViewer(
  liveId,
  viewerId,
  data = {}
) {
  if (!liveId || !viewerId) {
    return;
  }

  const viewerRef =
    doc(
      db,
      "lives",
      liveId,
      "viewers",
      viewerId
    );

  await setDoc(
    viewerRef,
    {
      userId:
        viewerId,

      name:
        data.name ||
        "Utilizador",

      joinedAt:
        serverTimestamp(),
    }
  );
}

/* ============================================================
   REMOVER VIEWER
============================================================ */

export async function removeViewer(
  liveId,
  viewerId
) {
  if (!liveId || !viewerId) {
    return;
  }

  const viewerRef =
    doc(
      db,
      "lives",
      liveId,
      "viewers",
      viewerId
    );

  await deleteDoc(
    viewerRef
  );
}

/* ============================================================
   LISTAR VIEWERS
============================================================ */

export function subscribeToViewers(
  liveId,
  callback
) {
  if (!liveId) {
    return () => {};
  }

  const viewersRef =
    getViewersRef(liveId);

  return onSnapshot(
    viewersRef,

    (snapshot) => {
      const viewers =
        snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

      callback(viewers);
    },

    (error) => {
      console.error(
        "Erro ao acompanhar espectadores:",
        error
      );
    }
  );
}

/* ============================================================
   CONTADOR DE VIEWERS
============================================================ */

export function subscribeToViewerCount(
  liveId,
  callback
) {
  return subscribeToViewers(
    liveId,
    (viewers) => {
      callback(
        viewers.length
      );
    }
  );
}