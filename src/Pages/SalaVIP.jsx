import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Video,
  Music2,
  Users,
  Radio,
  ArrowLeft,
  Search,
  Heart,
  UserPlus,
  UserRound,
  MessageCircle,
  MoreHorizontal,
  Loader2,
  MapPin,
  Globe2,
  Play,
  X,
  SlidersHorizontal,
  Flame,
  Star,
  Camera,
  ChevronRight,
  UserRoundCheck,
  Circle,
  Send,
  Gift,
  Gamepad2,
  Bookmark,
  BookmarkCheck,
  ListMusic,
  HeartOff,
  Phone,
  Mic,
  Volume2,
  Eye,
  Film,
  Headphones,
  Menu,
  Plus,
  Share2,
  UsersRound,
  RadioTower,
  BadgeCheck,
  Image as ImageIcon,
  Smile,
  Shield,
} from "lucide-react";

import { auth, db } from "../firebase";

import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { KVCoinIcon } from "../components/KVCoinIcon";
<div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
  {/* COMPONENTE DA MOEDA */}
  <KVCoinIcon className="w-7 h-7" country="Moçambique" />

  {/* TEXTO DO SALDO */}
  <div className="flex flex-col text-left">
    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider leading-none">
      Saldo KV
    </span>
    <span className="text-xs font-black text-amber-200 leading-tight">
      1,250 <span className="text-[10px] text-amber-400">KV</span>
    </span>
  </div>
</div>

/* =========================================================
   KONNEXVIB — SALA VIP
   ========================================================= */

/* =========================================================
   GLOBO
   ========================================================= */

const GLOBO_VIB_URL = new URL(
  "../assets/globo.gif",
  import.meta.url
).href;

/* =========================================================
   CSS DA LUZ DO GLOBO 2
   ========================================================= */

const VIP_EXTRA_CSS = `
@keyframes globoLuzPiscar {
  0%, 100% {
    opacity: 0.35;
    transform: scale(0.95);
    box-shadow:
      0 0 5px rgba(217, 70, 239, 0.25),
      0 0 10px rgba(168, 85, 247, 0.15);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
    box-shadow:
      0 0 10px rgba(217, 70, 239, 0.95),
      0 0 25px rgba(168, 85, 247, 0.8),
      0 0 45px rgba(236, 72, 153, 0.6);
  }
}

.globo-luz-piscar {
  animation: globoLuzPiscar 1.2s ease-in-out infinite;
}

@keyframes vipPulse {
  0%, 100% {
    opacity: .5;
  }

  50% {
    opacity: 1;
  }
}

.vip-online-pulse {
  animation: vipPulse 1.5s ease-in-out infinite;
}
`;

/* =========================================================
   SALAS
   ========================================================= */

const ROOMS_FALLBACK = [
  {
    id: "principal",
    name: "Vib Principal",
    description:
      "Descubra pessoas, experiências e tudo o que está acontecendo no KonnexVib.",
    members: 128,
    online: 34,
    icon: "crown",
    type: "principal",
    gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
  },
  {
    id: "vip",
    name: "Sala VIP",
    description:
      "Sala exclusiva para conversar, enviar emojis, GIFs e presentes em tempo real.",
    members: 0,
    online: 0,
    icon: "crown",
    type: "vip",
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-700",
  },
  {
    id: "conexao",
    name: "Conexão",
    description:
      "Descubra pessoas, interesses e novas conexões.",
    members: 186,
    online: 47,
    icon: "ring",
    type: "connection",
    gradient: "from-pink-500 via-purple-500 to-indigo-600",
  },
  {
    id: "musica",
    name: "Vib Música",
    description:
      "Descubra músicas, artistas, playlists e novos sons.",
    members: 96,
    online: 21,
    icon: "music",
    type: "music",
    gradient: "from-purple-500 via-indigo-500 to-blue-600",
  },
  {
    id: "videos",
    name: "Vib Vídeos",
    description:
      "Explore vídeos e filmes partilhados pela comunidade.",
    members: 63,
    online: 12,
    icon: "video",
    type: "video",
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-700",
  },
  {
    id: "livevib",
    name: "LiveVib",
    description:
      "Entra numa sala ao vivo, conversa e vê quem está presente.",
    members: 74,
    online: 28,
    icon: "live",
    type: "live",
    gradient: "from-pink-600 via-rose-600 to-purple-600",
  },
  {
    id: "jogos",
    name: "Jogos",
    description:
      "Divirta-se, jogue e conheça outros membros da comunidade.",
    members: 51,
    online: 17,
    icon: "game",
    type: "games",
    gradient: "from-indigo-600 via-purple-600 to-fuchsia-600",
  },
];

/* =========================================================
   PAÍSES
   ========================================================= */

const COUNTRIES = [
  { name: "Moz", search: "Moçambique" },
  { name: "Bra", search: "Brasil" },
  { name: "Port", search: "Portugal" },
  { name: "Ang", search: "Angola" },
  { name: "Áfr", search: "África do Sul" },
  {
    name: "Outros",
    search: "",
    isGlobe: true,
  },
];

/* =========================================================
   PERFIS
   ========================================================= */

const PROFILES_FALLBACK = [
  {
    id: "profile-01",
    name: "Amélia",
    age: 27,
    country: "Moçambique",
    city: "Maputo",
    online: true,
    verified: true,
    image: "",
    interests: ["Família", "Viagens", "Música"],
  },
  {
    id: "profile-02",
    name: "Marta",
    age: 25,
    country: "Brasil",
    city: "São Paulo",
    online: true,
    verified: true,
    image: "",
    interests: ["Viagens", "Cinema", "Música"],
  },
  {
    id: "profile-03",
    name: "Sofia",
    age: 29,
    country: "Angola",
    city: "Luanda",
    online: false,
    verified: true,
    image: "",
    interests: ["Família", "Cultura", "Viagens"],
  },
  {
    id: "profile-04",
    name: "Lina",
    age: 26,
    country: "Portugal",
    city: "Lisboa",
    online: true,
    verified: false,
    image: "",
    interests: ["Fotografia", "Música", "Arte"],
  },
  {
    id: "profile-05",
    name: "Carla",
    age: 30,
    country: "Moçambique",
    city: "Matola",
    online: true,
    verified: true,
    image: "",
    interests: ["Família", "Culinária", "Viagens"],
  },
  {
    id: "profile-06",
    name: "Nádia",
    age: 28,
    country: "África do Sul",
    city: "Joanesburgo",
    online: false,
    verified: true,
    image: "",
    interests: ["Negócios", "Música", "Viagens"],
  },
];

/* =========================================================
   LIVE
   ========================================================= */

const LIVE_FALLBACK = [
  {
    id: "live-01",
    host: "KonnexVib Live",
    title: "Conversas ao vivo",
    country: "Moçambique",
    viewers: 128,
    online: true,
  },
  {
    id: "live-02",
    host: "Sofia",
    title: "Conheça pessoas novas",
    country: "Angola",
    viewers: 76,
    online: true,
  },
  {
    id: "live-03",
    host: "Marta",
    title: "Conexões internacionais",
    country: "Brasil",
    viewers: 54,
    online: true,
  },
];

/* =========================================================
   MÚSICA
   ========================================================= */

const MUSIC_CATEGORIES = [
  "Todos",
  "Pop",
  "Romântica",
  "Afrobeat",
  "Amapiano",
  "Gospel",
  "Hip-Hop",
  "Clássica",
  "Relaxar",
];

const MUSIC_FALLBACK = [
  {
    id: "music-01",
    title: "Descoberta da Semana",
    artist: "KonnexVib Music",
    category: "Pop",
    cover: "",
  },
  {
    id: "music-02",
    title: "Noite Romântica",
    artist: "Vib Romance",
    category: "Romântica",
    cover: "",
  },
  {
    id: "music-03",
    title: "African Vibes",
    artist: "Konnex Sounds",
    category: "Afrobeat",
    cover: "",
  },
  {
    id: "music-04",
    title: "Amapiano Vibes",
    artist: "Vib Africa",
    category: "Amapiano",
    cover: "",
  },
  {
    id: "music-05",
    title: "Momento de Paz",
    artist: "Konnex Relax",
    category: "Relaxar",
    cover: "",
  },
  {
    id: "music-06",
    title: "Som Gospel",
    artist: "Vib Faith",
    category: "Gospel",
    cover: "",
  },
];

/* =========================================================
   VÍDEOS
   ========================================================= */

const VIDEO_CATEGORIES = [
  "Todos",
  "Românticos",
  "Filmes",
  "Música",
  "Comédia",
  "Viagens",
  "Cultura",
  "Tendências",
  "Descobrir",
];

const VIDEO_FALLBACK = [
  {
    id: "video-01",
    title: "Momentos que aproximam",
    category: "Românticos",
    creator: "KonnexVib",
    duration: "02:18",
    image: "",
  },
  {
    id: "video-02",
    title: "Música e vibrações",
    category: "Música",
    creator: "Vib Music",
    duration: "03:41",
    image: "",
  },
  {
    id: "video-03",
    title: "Descubra novos lugares",
    category: "Viagens",
    creator: "Vib World",
    duration: "05:12",
    image: "",
  },
  {
    id: "video-04",
    title: "Filmes e histórias",
    category: "Filmes",
    creator: "Vib Cinema",
    duration: "08:25",
    image: "",
  },
  {
    id: "video-05",
    title: "Cultura africana",
    category: "Cultura",
    creator: "Konnex Africa",
    duration: "04:32",
    image: "",
  },
  {
    id: "video-06",
    title: "Tendências do Vib",
    category: "Tendências",
    creator: "KonnexVib",
    duration: "01:55",
    image: "",
  },
];

/* =========================================================
   JOGOS
   ========================================================= */

const GAMES_FALLBACK = [
  {
    id: "game-01",
    title: "Quiz Konnex",
    description: "Teste os seus conhecimentos.",
    players: 18,
    icon: "🧠",
  },
  {
    id: "game-02",
    title: "Desafio Vib",
    description: "Desafios rápidos entre membros.",
    players: 12,
    icon: "⚡",
  },
  {
    id: "game-03",
    title: "Pergunta ou Desafio",
    description: "Jogue com outros participantes.",
    players: 9,
    icon: "🎯",
  },
  {
    id: "game-04",
    title: "Batalha de Palavras",
    description: "Quem consegue chegar mais longe?",
    players: 7,
    icon: "🔤",
  },
];

/* =========================================================
   PRESENTES
   ========================================================= */

const GIFTS = [
  { id: "rose", name: "Rosa", emoji: "🌹", value: 1 },
  { id: "heart", name: "Coração", emoji: "❤️", value: 2 },
  { id: "kiss", name: "Beijo", emoji: "💋", value: 3 },
  { id: "star", name: "Estrela", emoji: "⭐", value: 5 },
  { id: "fire", name: "Fogo", emoji: "🔥", value: 10 },
  { id: "balloon", name: "Balão", emoji: "🎈", value: 15 },
  { id: "cake", name: "Bolo", emoji: "🎂", value: 20 },
  { id: "love", name: "Amor", emoji: "💝", value: 25 },
  { id: "trophy", name: "Troféu", emoji: "🏆", value: 50 },
  { id: "diamond", name: "Diamante", emoji: "💎", value: 100 },
  { id: "rocket", name: "Foguete", emoji: "🚀", value: 150 },
  { id: "ring", name: "Anel", emoji: "💍", value: 200 },
  { id: "car", name: "Carro", emoji: "🏎️", value: 300 },
  { id: "yacht", name: "Iate", emoji: "🛥️", value: 500 },
  { id: "crown", name: "Coroa", emoji: "👑", value: 1000 },
  { id: "castle", name: "Castelo", emoji: "🏰", value: 2500 },
  { id: "unicorn", name: "Unicórnio", emoji: "🦄", value: 5000 },
  { id: "planet", name: "Planeta", emoji: "🪐", value: 10000 },
];

/* =========================================================
   EMOJIS
   ========================================================= */

const EMOJI_LIST = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","🥲","🥹",
  "😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗",
  "😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓",
  "😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕",
  "🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😮‍💨",
  "😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨",
  "😰","😥","😓","🤗","🤔","🫣","🤭","🫢","🫡","🤫",
  "🤥","😶","🫠","😐","😑","😬","🙄","😯","😦","😧",
  "😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢",
  "🤮","🤧","😷","🤒","🤕",

  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎",
  "💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗",
  "💖","💘","💝","💟","💌","💋","💯","💢","💥",
  "💫","💦","💨","💎","✨","⭐","🌟","🔥","🎉","🎊",

  "👍","👎","👏","🙌","👐","🤲","🙏","🤝","✌️","🤟",
  "🤘","👌","🤌","🤏","👈","👉","👆","👇","☝️","✋",
  "🤚","🖐️","🖖","👋","🤙","💪","🖕","✍️",

  "👑","💍","🎁","🎈","🎂","🍰","🍓","🍎","🍕","🍔",
  "🍟","🍿","☕","🍾","🍷","🍹","🍺","🥂",

  "⚽","🏀","🏈","⚾","🎾","🏐","🏆","🥇","🥈","🥉",
  "🎮","🕹️","🎯","🎲","🎸","🎹","🎤","🎧",

  "🚗","🏎️","✈️","🚀","🛥️","🏝️","🌍","🌎","🌏",
  "🌙","☀️","🌈","🌺","🌹","🌻","🌸",
];

/* =========================================================
   GIFS
   ========================================================= */

const MOCK_GIFS = [
  {
    id: "g1",
    title: "Dance",
    url: "https://media.giphy.com/media/l3vR1ora9kIThp1A4/giphy.gif",
  },
  {
    id: "g2",
    title: "Happy",
    url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
  },
  {
    id: "g3",
    title: "Love",
    url: "https://media.giphy.com/media/26fldmICI4A6gYYM0/giphy.gif",
  },
  {
    id: "g4",
    title: "Party",
    url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif",
  },
];

/* =========================================================
   ÍCONES DAS SALAS
   ========================================================= */

function getRoomIcon(icon) {
  switch (icon) {
    case "heart":
      return Heart;

    case "music":
      return Music2;

    case "video":
      return Video;

    case "live":
      return Radio;

    case "game":
      return Gamepad2;

    case "ring":
      return Circle;

    case "users":
      return Users;

    default:
      return Crown;
  }
}

/* =========================================================
   ID DO UTILIZADOR
   ========================================================= */

function getProfileUserId(profile) {
  return (
    profile?.uid ||
    profile?.userId ||
    profile?.userUid ||
    profile?.id ||
    null
  );
}

/* =========================================================
   PERFIL VIP — COROA
   ========================================================= */
function isVIPUser(profile) {
  if (!profile) return false;

  return Boolean(
    profile.isVIP === true ||
    profile.isVip === true ||
    profile.vip === true ||
    profile.vipActive === true ||
    profile.vipMember === true ||
    profile.vipPurchased === true ||
    Number(profile.vipSaldo ?? profile.saldoVIP ?? profile.saldo ?? 0) > 0
  );
}

/* =========================================================
   COMPONENTE
   ========================================================= */

export default function SalaVIP() {
  const [currentUser, setCurrentUser] = useState(
    auth?.currentUser || null
  );

  const [rooms, setRooms] = useState(ROOMS_FALLBACK);
  const [profiles, setProfiles] = useState(PROFILES_FALLBACK);
  const [lives, setLives] = useState(LIVE_FALLBACK);
  const [musicItems, setMusicItems] = useState(MUSIC_FALLBACK);
  const [videoItems, setVideoItems] = useState(VIDEO_FALLBACK);
  const [userData, setUserData] = useState(null);

  const [activeSection, setActiveSection] =
    useState("connection");

  const [activeCategory, setActiveCategory] =
    useState("Todos");

  const [searchText, setSearchText] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState("");

  const [connectionFilter, setConnectionFilter] =
    useState("todos");

  const [selectedProfile, setSelectedProfile] =
    useState(null);

  const [activeRoom, setActiveRoom] =
    useState(null);

  const [message, setMessage] = useState("");
  const [conversationUser, setConversationUser] =
    useState(null);

  const [conversationMessages, setConversationMessages] =
    useState([]);

  const [showGifts, setShowGifts] = useState(false);
  const [giftTarget, setGiftTarget] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [gifSearch, setGifSearch] = useState("");
  const [activeTab, setActiveTab] = useState("emoji");

  const [vipMembers, setVipMembers] = useState([]);
  const [vipMessages, setVipMessages] = useState([]);
  const [vipMessage, setVipMessage] = useState("");
  const [isInsideVIP, setIsInsideVIP] = useState(false);
  const [vipLoading, setVipLoading] = useState(false);

  const [showVIPEmoji, setShowVIPEmoji] = useState(false);
  const [showVIPGifs, setShowVIPGifs] = useState(false);
  const [vipGifSearch, setVipGifSearch] = useState("");

  /* =========================================================
     SALDO VIP — LEITURA EM TEMPO REAL
     ========================================================= */

  const [vipSaldo, setVipSaldo] = useState(0);
  const [vipSaldoLoading, setVipSaldoLoading] = useState(false);
  const [showAdicionarSaldo, setShowAdicionarSaldo] = useState(false);

  const fileInputRef = useRef(null);

  /* =========================================================
     AUTENTICAÇÃO
     ========================================================= */

  useEffect(() => {
    if (!auth) return undefined;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user || null);

      if (!user) {
        setIsInsideVIP(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* =========================================================
     SALDO VIP — TEMPO REAL
     ========================================================= */

  useEffect(() => {
    if (!db || !currentUser) {
      setVipSaldo(0);
      setVipSaldoLoading(false);
      return undefined;
    }

    setVipSaldoLoading(true);

    const saldoRef = doc(
      db,
      "saldos",
      currentUser.uid
    );

    const unsubscribe = onSnapshot(
      saldoRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setVipSaldo(0);
          setVipSaldoLoading(false);
          return;
        }

        const data = snapshot.data() || {};

        const saldo = Number(
          data.saldo ??
          data.moedas ??
          data.balance ??
          0
        );

        setVipSaldo(
          Number.isFinite(saldo) && saldo >= 0
            ? saldo
            : 0
        );

        setVipSaldoLoading(false);
      },
      (error) => {
        console.error(
          "Erro ao carregar saldo VIP:",
          error
        );

        setVipSaldo(0);
        setVipSaldoLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  /* =========================================================
     FILTRO DE PERFIS
     ========================================================= */

  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    if (selectedCountry) {
      result = result.filter(
        (p) => p.country === selectedCountry
      );
    }

    if (connectionFilter === "online") {
      result = result.filter((profile) => profile.online);
    }

    if (connectionFilter === "novos") {
      result = [...result].reverse();
    }

    if (searchText.trim()) {
      const text = searchText
        .trim()
        .toLowerCase();

      result = result.filter((profile) =>
        [
          profile.name,
          profile.country,
          profile.city,
          ...(profile.interests || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text)
      );
    }

    return result;
  }, [
    profiles,
    selectedCountry,
    connectionFilter,
    searchText,
  ]);

  /* =========================================================
     NAVEGAÇÃO
     ========================================================= */

  const openSection = (section) => {
    setActiveSection(section);
    setSelectedProfile(null);
    setConversationUser(null);
  };

  /* =========================================================
     PERFIL
     ========================================================= */

  const openProfile = (profile) => {
    setSelectedProfile(profile);
    setShowProfile(true);
  };

  /* =========================================================
     CONVERSA PRIVADA
     ========================================================= */

  const openConversation = (profile) => {
    setConversationUser(profile);
    setConversationMessages([]);
    setMessage("");
    setShowProfile(false);
  };

  /* =========================================================
     MENSAGEM PRIVADA
     ========================================================= */

  const sendMessage = async (customMedia = null) => {
    const text = message.trim();

    if (!text && !customMedia) return;

    const newMessage = {
      id: Date.now().toString(),
      type: customMedia?.type || "text",
      text: customMedia?.type ? "" : text,
      mediaUrl: customMedia?.url || null,
      senderId: currentUser?.uid || "current-user",
      senderName:
        userData?.firstName ||
        userData?.nome ||
        currentUser?.displayName ||
        "Você",
      createdAt: new Date(),
    };

    setConversationMessages((prev) => [
      ...prev,
      newMessage,
    ]);

    if (!customMedia) {
      setMessage("");
    }
  };

  /* =========================================================
     UPLOAD DE IMAGEM
     ========================================================= */

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    sendMessage({
      type: "image",
      url: imageUrl,
    });

    e.target.value = "";
  };

  /* =========================================================
     PRESENTES
     ========================================================= */

  const openGiftBox = (target) => {
    setGiftTarget(target);
    setShowGifts(true);
  };

  /* =========================================================
     ENVIAR PRESENTE PRIVADO
     ========================================================= */

  const sendGift = async (gift) => {
    const target = giftTarget || conversationUser;

    if (!target) return;

    const targetId = getProfileUserId(target);

    const giftMessage = {
      type: "gift",
      giftId: gift.id,
      giftEmoji: gift.emoji,
      giftName: gift.name,
      value: gift.value,
      senderId: currentUser?.uid || "current-user",
      senderName:
        userData?.firstName ||
        userData?.nome ||
        currentUser?.displayName ||
        "Você",
      receiverId: targetId,
      createdAt: serverTimestamp(),
    };

    if (db && currentUser) {
      try {
        await addDoc(
          collection(db, "gifts"),
          giftMessage
        );
      } catch (error) {
        console.error(
          "Erro ao guardar presente:",
          error
        );
      }
    }

    setConversationMessages((prev) => [
      ...prev,
      {
        ...giftMessage,
        id: Date.now().toString(),
      },
    ]);

    setShowGifts(false);
  };

  /* =========================================================
     ENTRAR NA SALA VIP
     ========================================================= */

  const enterVIPRoom = async () => {
    if (!currentUser) {
      alert(
        "É necessário iniciar sessão para entrar na Sala VIP."
      );
      return;
    }

    if (!db) {
      alert(
        "Firebase Firestore não está disponível."
      );
      return;
    }

    try {
      setVipLoading(true);

      const memberRef = doc(
        db,
        "vipRooms",
        "sala-vip",
        "members",
        currentUser.uid
      );

      await setDoc(
        memberRef,
        {
          uid: currentUser.uid,

          name:
            userData?.firstName ||
            userData?.nome ||
            currentUser.displayName ||
            "Utilizador",

          photoURL:
            currentUser.photoURL || "",

          online: true,

          isVIP: vipSaldo > 0,
          vipSaldo: vipSaldo,

          joinedAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setActiveRoom("sala-vip");
      setIsInsideVIP(true);
      setActiveSection("vip");
    } catch (error) {
      console.error(
        "Erro ao entrar na Sala VIP:",
        error
      );

      alert(
        "Não foi possível entrar na Sala VIP."
      );
    } finally {
      setVipLoading(false);
    }
  };

  /* =========================================================
     SAIR DA SALA VIP
     ========================================================= */

  const leaveVIPRoom = async () => {
    if (!currentUser || !db) {
      setIsInsideVIP(false);
      setActiveRoom(null);
      return;
    }

    try {
      const memberRef = doc(
        db,
        "vipRooms",
        "sala-vip",
        "members",
        currentUser.uid
      );

      await deleteDoc(memberRef);
    } catch (error) {
      console.error(
        "Erro ao sair da Sala VIP:",
        error
      );
    }

    setIsInsideVIP(false);
    setActiveRoom(null);
    setActiveSection("explorar");
  };

  /* =========================================================
     MEMBROS VIP EM TEMPO REAL
     ========================================================= */

  useEffect(() => {
    if (!db || !isInsideVIP) return undefined;

    const membersRef = collection(
      db,
      "vipRooms",
      "sala-vip",
      "members"
    );

    const unsubscribe = onSnapshot(
      membersRef,
      (snapshot) => {
        const members = snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

        setVipMembers(members);
      },
      (error) => {
        console.error(
          "Erro ao carregar membros VIP:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [isInsideVIP]);

  /* =========================================================
     MENSAGENS VIP EM TEMPO REAL
     ========================================================= */

  useEffect(() => {
    if (!db || !isInsideVIP) return undefined;

    const messagesRef = collection(
      db,
      "vipRooms",
      "sala-vip",
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

        setVipMessages(messages);
      },
      (error) => {
        console.error(
          "Erro ao carregar mensagens VIP:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [isInsideVIP]);

  /* =========================================================
     ATUALIZAR PRESENÇA
     ========================================================= */

  useEffect(() => {
    if (!currentUser || !db || !isInsideVIP) {
      return undefined;
    }

    const updatePresence = async () => {
      try {
        const memberRef = doc(
          db,
          "vipRooms",
          "sala-vip",
          "members",
          currentUser.uid
        );

        await setDoc(
          memberRef,
          {
            online: true,
            lastSeen: serverTimestamp(),
          },
          {
            merge: true,
          }
        );
      } catch (error) {
        console.error(
          "Erro ao atualizar presença:",
          error
        );
      }
    };

    updatePresence();

    const interval = setInterval(
      updatePresence,
      30000
    );

    return () => clearInterval(interval);
  }, [currentUser, isInsideVIP]);

  /* =========================================================
     ENVIAR MENSAGEM VIP
     ========================================================= */

  const sendVIPMessage = async (
    customMedia = null
  ) => {
    if (!currentUser || !isInsideVIP || !db) {
      return;
    }

    const text = vipMessage.trim();

    if (!text && !customMedia) {
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "vipRooms",
          "sala-vip",
          "messages"
        ),
        {
          type: customMedia?.type || "text",

          text: customMedia?.type
            ? ""
            : text,

          mediaUrl:
            customMedia?.url || null,

          giftEmoji:
            customMedia?.giftEmoji || null,

          giftName:
            customMedia?.giftName || null,

          value:
            customMedia?.value || null,

          senderId: currentUser.uid,

          senderName:
            userData?.firstName ||
            userData?.nome ||
            currentUser.displayName ||
            "Utilizador",

          senderPhoto:
            currentUser.photoURL || "",

          createdAt: serverTimestamp(),
        }
      );

      setVipMessage("");
    } catch (error) {
      console.error(
        "Erro ao enviar mensagem VIP:",
        error
      );
    }
  };

  /* =========================================================
     EMOJI NA SALA VIP
     ========================================================= */

  const addVIPEmoji = (emoji) => {
    setVipMessage(
      (prev) => `${prev}${emoji}`
    );
  };

  /* =========================================================
     GIF NA SALA VIP
     ========================================================= */

  const sendVIPGif = async (gif) => {
    if (!currentUser || !isInsideVIP || !db) {
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "vipRooms",
          "sala-vip",
          "messages"
        ),
        {
          type: "gif",
          text: "",
          mediaUrl: gif.url,
          senderId: currentUser.uid,

          senderName:
            userData?.firstName ||
            userData?.nome ||
            currentUser.displayName ||
            "Utilizador",

          senderPhoto:
            currentUser.photoURL || "",

          createdAt: serverTimestamp(),
        }
      );

      setShowVIPGifs(false);
      setVipGifSearch("");
    } catch (error) {
      console.error(
        "Erro ao enviar GIF:",
        error
      );
    }
  };

  /* =========================================================
     PRESENTE DENTRO DA SALA VIP
     ========================================================= */

  const sendVIPGift = async (gift) => {
    if (!currentUser || !isInsideVIP || !db) {
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "vipRooms",
          "sala-vip",
          "messages"
        ),
        {
          type: "gift",

          text: "",

          giftId: gift.id,

          giftEmoji: gift.emoji,

          giftName: gift.name,

          value: gift.value,

          senderId: currentUser.uid,

          senderName:
            userData?.firstName ||
            userData?.nome ||
            currentUser.displayName ||
            "Utilizador",

          senderPhoto:
            currentUser.photoURL || "",

          createdAt: serverTimestamp(),
        }
      );

      setShowGifts(false);
    } catch (error) {
      console.error(
        "Erro ao enviar presente VIP:",
        error
      );
    }
  };

  /* =========================================================
     FILTRO DE GIFS
     ========================================================= */

  const filteredVIPGifs = useMemo(() => {
    if (!vipGifSearch.trim()) {
      return MOCK_GIFS;
    }

    const text =
      vipGifSearch
        .trim()
        .toLowerCase();

    return MOCK_GIFS.filter(
      (gif) =>
        gif.title
          .toLowerCase()
          .includes(text)
    );
  }, [vipGifSearch]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-screen bg-[#07030e] text-slate-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white">

      <style>{VIP_EXTRA_CSS}</style>

      {/* =====================================================
          CABEÇALHO
          ===================================================== */}

      <header className="bg-[#0b0518] border-b border-purple-900/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/30">

              <div className="w-full h-full rounded-full bg-[#0b0518] overflow-hidden flex items-center justify-center">

                <img
                  src={GLOBO_VIB_URL}
                  alt="Globo Vib"
                  className="w-full h-full object-cover animate-[spin_12s_linear_infinite]"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">

                <span className="text-xl font-extrabold tracking-wider text-white">
                  KONNEXVIB
                </span>

                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white tracking-wider uppercase">
                  VIP
                </span>

              </div>

              <p className="text-[11px] font-medium text-purple-300/70 tracking-wide">
                SALA VIB — Conexões & Experiências Premium
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">

            <div
              className="px-3 py-2 rounded-full bg-purple-950/50 border border-fuchsia-700/50 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/10"
              title="Saldo VIP"
            >
              <span className="text-sm">🪙</span>
              <span>
                Saldo: {vipSaldoLoading ? "..." : `${vipSaldo} VIP`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAdicionarSaldo(true)}
              className="px-3 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 border border-fuchsia-400/30 text-white text-xs font-extrabold shadow-lg shadow-fuchsia-500/20 hover:brightness-110 transition whitespace-nowrap"
            >
              + Adicionar saldo
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/40 border border-purple-800/40 text-xs font-semibold text-purple-200">
              <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              <span>Modo Livre Ativo</span>
            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          BANNER
          ===================================================== */}

      <section className="bg-gradient-to-b from-[#120826] to-[#07030e] border-b border-purple-900/30 px-6 py-8">

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="flex items-start md:items-center gap-5">

            {/* GLOBO 2 COM LUZ A PISCAR */}
<div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl p-1 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700 flex-shrink-0">

  <div className="w-full h-full rounded-[22px] bg-[#0b0518] overflow-hidden relative flex items-center justify-center">

    {/* GLOBO: gira continuamente */}
    <img
      src={GLOBO_VIB_URL}
      alt="Globo VIP"
      className="w-full h-full object-cover animate-[spin_15s_linear_infinite]"
     />

      {/* LUZ: pisca */}
      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-fuchsia-500 border-2 border-[#0b0518] animate-ping"></span>

         {/* LUZ FIXA NO CENTRO DO PISCA */}
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-fuchsia-500 border-2 border-[#0b0518]"></span>

            </div>
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-black text-white">

                Bem-vindo à{" "}

                <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Sala VIP
                </span>

              </h1>

              <p className="mt-1 text-xs md:text-sm text-purple-300/80 max-w-xl leading-relaxed">

                Conecte-se com pessoas de todo o mundo,
                explore streamings, salas ao vivo e momentos
                exclusivos na comunidade KonnexVib.

              </p>

            </div>
          </div>

          <div className="bg-[#140a2b]/80 border border-purple-800/40 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto self-start lg:self-center">

            {COUNTRIES.map((c) => {

              const active =
                selectedCountry === c.search;

              return (
                <button
                  key={c.name}
                  onClick={() =>
                    setSelectedCountry(
                      active ? "" : c.search
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    active
                      ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30"
                      : "text-purple-300 hover:text-white hover:bg-purple-900/30"
                  }`}
                >

                  {c.isGlobe && (
                    <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}

                  {c.name}

                </button>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          MENU
          ===================================================== */}

      <section className="bg-[#0b0518]/90 border-b border-purple-900/30 px-6 py-3">

        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">

          <button
            onClick={() =>
              openSection("explorar")
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "explorar"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                : "bg-purple-950/30 text-purple-300 border border-purple-900/40"
            }`}
          >
            <Crown className="w-4 h-4" />
            Explorar Salas
          </button>

          <button
            onClick={() =>
              openSection("connection")
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "connection"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                : "bg-purple-950/30 text-purple-300 border border-purple-900/40"
            }`}
          >
            <Heart className="w-4 h-4 text-fuchsia-400" />
            Conexões
          </button>

          <button
            onClick={() =>
              openSection("music")
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "music"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                : "bg-purple-950/30 text-purple-300 border border-purple-900/40"
            }`}
          >
            <Music2 className="w-4 h-4" />
            Vib Música
          </button>

          <button
            onClick={() =>
              openSection("videos")
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "videos"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                : "bg-purple-950/30 text-purple-300 border border-purple-900/40"
            }`}
          >
            <Video className="w-4 h-4" />
            Vib Vídeos
          </button>

          <button
            onClick={() =>
              openSection("live")
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "live"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                : "bg-purple-950/30 text-purple-300 border border-purple-900/40"
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            LiveVib
          </button>

          <button
            onClick={() =>
              openSection("games")
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "games"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                : "bg-purple-950/30 text-purple-300 border border-purple-900/40"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Jogos
          </button>

        </div>
      </section>

      {/* =====================================================
          PESQUISA
          ===================================================== */}

      {activeSection !== "vip" && (
        <section className="px-6 py-4">

          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#110724]/80 border border-purple-900/40 p-2.5 rounded-2xl">

            <div className="relative w-full sm:w-80">

              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />

              <input
                type="text"
                placeholder="Pesquisar por nome, cidade ou país..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0b0518] border border-purple-800/40 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-500"
              />

            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

              <button
                onClick={() =>
                  setConnectionFilter("todos")
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  connectionFilter === "todos"
                    ? "bg-fuchsia-600 text-white"
                    : "bg-purple-950/40 text-purple-300 border border-purple-800/40"
                }`}
              >
                Todos
              </button>

              <button
                onClick={() =>
                  setConnectionFilter("online")
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  connectionFilter === "online"
                    ? "bg-fuchsia-600 text-white"
                    : "bg-purple-950/40 text-purple-300 border border-purple-800/40"
                }`}
              >
                Online Agora
              </button>

              <button
                onClick={() =>
                  setConnectionFilter("novos")
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  connectionFilter === "novos"
                    ? "bg-fuchsia-600 text-white"
                    : "bg-purple-950/40 text-purple-300 border border-purple-800/40"
                }`}
              >
                Mais Recentes
              </button>

            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          CONTEÚDO
          ===================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">

        {/* ===================================================
            CONEXÕES
            =================================================== */}

        {activeSection === "connection" && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredProfiles.map((profile) => (

              <div
                key={profile.id}
                className="bg-[#120826]/70 border border-purple-900/40 hover:border-purple-600/50 rounded-2xl p-4 flex flex-col justify-between transition"
              >

                <div>

                  <div className="flex items-center justify-between">

                    <div className="relative">

                      <div className="w-14 h-14 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-lg overflow-hidden">

                        {profile.image ? (
                          <img
                            src={profile.image}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          profile.name?.[0]
                        )}

                      </div>

                      {isVIPUser(profile) && (
                        <span
                          className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border-2 border-[#120826] flex items-center justify-center shadow-lg shadow-yellow-500/30"
                          title="Utilizador VIP"
                        >
                          <Crown className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}

                      {profile.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#07030e]" />
                      )}

                    </div>

                    {profile.verified && (
                      <BadgeCheck className="w-5 h-5 text-fuchsia-400" />
                    )}

                  </div>

                  <div className="mt-3">

                    <h4 className="font-bold text-white text-base">
                      {profile.name}, {profile.age}
                    </h4>

                    <p className="text-xs text-purple-300 flex items-center gap-1 mt-0.5">

                      <MapPin className="w-3 h-3 text-fuchsia-400" />

                      {profile.city}, {profile.country}

                    </p>

                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">

                    {profile.interests?.map(
                      (interest, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/30 text-purple-300"
                        >
                          {interest}
                        </span>
                      )
                    )}

                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between gap-1.5">

                  <button
                    onClick={() =>
                      openProfile(profile)
                    }
                    className="flex-1 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-200 text-xs font-semibold hover:bg-purple-900/50 transition flex items-center justify-center gap-1"
                  >
                    <UserRound className="w-3.5 h-3.5" />
                    Ver Perfil
                  </button>

                  <button
                    onClick={() =>
                      openConversation(profile)
                    }
                    className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      openGiftBox(profile)
                    }
                    className="p-2 rounded-xl bg-fuchsia-950/60 border border-fuchsia-800/40 text-fuchsia-300"
                  >
                    <Gift className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* ===================================================
            EXPLORAR SALAS
            =================================================== */}

        {activeSection === "explorar" && (

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {rooms.map((room) => {

              const RoomIcon =
                getRoomIcon(room.icon);

              const isVIP =
                room.id === "vip";

              return (
                <div
                  key={room.id}
                  className="bg-[#120826]/70 border border-purple-900/40 rounded-2xl p-5"
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${room.gradient} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <RoomIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">

                      <div className="flex items-center gap-2">

                        <h3 className="font-bold text-white text-base">
                          {room.name}
                        </h3>

                        {isVIP && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-fuchsia-600 text-white font-bold">
                            VIP
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-purple-300 mt-1">
                        {room.description}
                      </p>

                    </div>

                  </div>

                  {isVIP ? (

                    <div className="mt-4">

                      <div className="flex items-center justify-between text-xs text-purple-300 mb-3">

                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {vipMembers.length} online
                        </span>

                        <span className="text-emerald-400">
                          ● Sala ativa
                        </span>

                      </div>

                      <button
                        onClick={enterVIPRoom}
                        disabled={vipLoading}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/20 disabled:opacity-50"
                      >

                        {vipLoading ? (

                          <span className="flex items-center justify-center gap-2">

                            <Loader2 className="w-4 h-4 animate-spin" />

                            A entrar...

                          </span>

                        ) : (

                          <span className="flex items-center justify-center gap-2">

                            <Crown className="w-4 h-4" />

                            Entrar na Sala VIP

                          </span>

                        )}

                      </button>

                    </div>

                  ) : (

                    <button
                      onClick={() =>
                        setActiveRoom(room.id)
                      }
                      className="mt-4 w-full py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-purple-200 text-xs font-bold"
                    >
                      Abrir sala
                    </button>

                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* ===================================================
            SALA VIP REAL
            =================================================== */}

        {activeSection === "vip" && isInsideVIP && (

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

            {/* CHAT */}

            <div className="relative bg-[#120826]/80 border border-purple-900/40 rounded-3xl overflow-hidden min-h-[650px] flex flex-col">

              {/* CABEÇALHO */}

              <div className="p-4 border-b border-purple-900/40 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <button
                    onClick={leaveVIPRoom}
                    className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div>

                    <h2 className="font-black text-white">
                      Sala VIP
                    </h2>

                    <p className="text-[10px] text-emerald-400">
                      ● {vipMembers.length} utilizadores online
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-fuchsia-950/50 border border-fuchsia-800/40 text-[10px] text-fuchsia-300 font-bold">
                    LIVE
                  </span>
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>

              </div>

              {/* MODAL ADICIONAR SALDO */}

              {showAdicionarSaldo && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="w-full max-w-md rounded-3xl bg-[#120826] border border-purple-800/50 shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">Adicionar saldo</h3>
                        <p className="text-xs text-purple-300 mt-1">
                          O teu saldo atual é {vipSaldoLoading ? "..." : `${vipSaldo} vip`}.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAdicionarSaldo(false)}
                        className="p-2 rounded-xl bg-purple-950/60 text-purple-200 hover:bg-purple-900/70"
                        aria-label="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="rounded-2xl border border-amber-700/30 bg-amber-950/20 p-4">
                      <p className="text-sm text-amber-200 font-semibold">🪙 Carregar saldo VIP</p>
                      <p className="text-xs text-amber-100/70 mt-1 leading-relaxed">
                        O botão de adicionar saldo já está no cabeçalho. O carregamento efetivo do saldo depende da integração de pagamento/crédito do KonnexVib.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAdicionarSaldo(false)}
                      className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* MENSAGENS */}

              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {vipMessages.length === 0 && (

                  <div className="h-full flex flex-col items-center justify-center text-center">

                    <div className="text-5xl mb-3">
                      👑
                    </div>

                    <h3 className="font-bold text-white">
                      Bem-vindo à Sala VIP
                    </h3>

                    <p className="text-xs text-purple-300 mt-1">
                      Seja o primeiro a enviar uma mensagem.
                    </p>

                  </div>

                )}

                {vipMessages.map((msg) => {

                  const isMe =
                    msg.senderId ===
                    currentUser?.uid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div className="max-w-[78%]">

                        {!isMe && (
                          <div className="text-[10px] text-fuchsia-300 mb-1 ml-1">
                            {msg.senderName || "Utilizador"}
                          </div>
                        )}

                        <div
                          className={`rounded-2xl p-3 text-xs ${
                            isMe
                              ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                              : "bg-purple-950/70 border border-purple-800/40 text-purple-100"
                          }`}
                        >

                          {msg.type === "gift" ? (

                            <div className="flex items-center gap-3">

                              <span className="text-4xl">
                                {msg.giftEmoji}
                              </span>

                              <div>

                                <p className="font-bold">
                                  Enviou um {msg.giftName}!
                                </p>

                                <span className="text-[10px] opacity-70">
                                  {msg.value} VIP
                                </span>

                              </div>

                            </div>

                          ) : msg.type === "gif" ? (

                            <img
                              src={msg.mediaUrl}
                              alt="GIF"
                              className="rounded-xl max-w-full max-h-64 object-cover"
                            />

                          ) : msg.type === "image" ? (

                            <img
                              src={msg.mediaUrl}
                              alt="Imagem"
                              className="rounded-xl max-w-full max-h-64 object-cover"
                            />

                          ) : (

                            <p className="whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>

                          )}

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* EMOJIS */}

              {showVIPEmoji && (

                <div className="border-t border-purple-900/30 bg-[#0b0714] p-3">

                  <div className="grid grid-cols-10 sm:grid-cols-14 gap-1 max-h-32 overflow-y-auto">

                    {EMOJI_LIST.map(
                      (emoji, index) => (

                        <button
                          key={`${emoji}-${index}`}
                          onClick={() =>
                            addVIPEmoji(emoji)
                          }
                          className="text-xl p-1.5 rounded-lg hover:bg-purple-900/50 transition"
                        >
                          {emoji}
                        </button>

                      )
                    )}

                  </div>

                </div>
              )}

              {/* GIFS */}

              {showVIPGifs && (

                <div className="border-t border-purple-900/30 bg-[#0b0714] p-3">

                  <div className="flex gap-2 mb-3">

                    <input
                      value={vipGifSearch}
                      onChange={(e) =>
                        setVipGifSearch(
                          e.target.value
                        )
                      }
                      placeholder="Pesquisar GIF..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#140c24] border border-purple-800/40 text-xs text-white"
                    />

                    <button
                      onClick={() =>
                        setShowVIPGifs(false)
                      }
                      className="p-2 rounded-xl bg-purple-950/60"
                    >
                      <X className="w-4 h-4" />
                    </button>

                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                    {filteredVIPGifs.map(
                      (gif) => (

                        <button
                          key={gif.id}
                          onClick={() =>
                            sendVIPGif(gif)
                          }
                          className="overflow-hidden rounded-xl border border-purple-800/40 hover:border-fuchsia-500"
                        >

                          <img
                            src={gif.url}
                            alt={gif.title}
                            className="w-full h-20 object-cover"
                          />

                          <span className="block text-[9px] text-purple-300 p-1">
                            {gif.title}
                          </span>

                        </button>

                      )
                    )}

                  </div>

                </div>
              )}

              {/* COMPOSER */}

              <div className="p-3 border-t border-purple-900/40 bg-[#0b0714]/80">

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      setShowVIPEmoji(
                        !showVIPEmoji
                      )
                    }
                    className={`p-2 rounded-xl border ${
                      showVIPEmoji
                        ? "bg-fuchsia-600 border-fuchsia-500 text-white"
                        : "bg-purple-950/60 border-purple-800/40 text-purple-300"
                    }`}
                    title="Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setShowVIPGifs(
                        !showVIPGifs
                      );
                      setShowVIPEmoji(false);
                    }}
                    className={`p-2 rounded-xl border ${
                      showVIPGifs
                        ? "bg-fuchsia-600 border-fuchsia-500 text-white"
                        : "bg-purple-950/60 border-purple-800/40 text-purple-300"
                    }`}
                    title="GIF"
                  >
                    <Film className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={vipMessage}
                    onChange={(e) =>
                      setVipMessage(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        sendVIPMessage();
                      }
                    }}
                    placeholder="Escreva na Sala VIP..."
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#140c24] border border-purple-500/30 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-500"
                  />

                  <button
                    onClick={() =>
                      setShowGifts(true)
                    }
                    className="p-2.5 rounded-xl bg-fuchsia-950/60 border border-fuchsia-800/40 text-fuchsia-300"
                    title="Presentes"
                  >
                    <Gift className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      sendVIPMessage()
                    }
                    className="p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                </div>

              </div>

            </div>

            {/* MEMBROS */}

            <div className="bg-[#120826]/80 border border-purple-900/40 rounded-3xl p-4 h-fit">

              <div className="flex items-center justify-between mb-4">

                <h3 className="font-bold text-white flex items-center gap-2">

                  <Users className="w-4 h-4 text-fuchsia-400" />

                  Na Sala

                </h3>

                <span className="text-xs text-emerald-400">
                  {vipMembers.length}
                </span>

              </div>

              <div className="space-y-2">

                {vipMembers.length === 0 && (

                  <p className="text-xs text-purple-400">
                    Ainda não há utilizadores.
                  </p>

                )}

                {vipMembers.map(
                  (member) => (

                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-purple-950/30 border border-purple-900/30"
                    >

                      <div className="relative">

                        <div className="w-9 h-9 rounded-full bg-purple-900/70 overflow-hidden flex items-center justify-center text-xs font-bold">

                          {member.photoURL ? (

                            <img
                              src={member.photoURL}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            member.name
                              ?.charAt(0)
                              ?.toUpperCase()

                          )}

                        </div>

                        <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#120826] vip-online-pulse" />

                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{member.name}</span>
                          <Crown
                            className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0"
                            title="Membro VIP"
                          />
                        </p>

                        <p className="text-[9px] text-emerald-400">
                          Online
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

              <div className="mt-5 pt-4 border-t border-purple-900/30">

                <button
                  onClick={leaveVIPRoom}
                  className="w-full py-2 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs font-bold"
                >
                  Sair da Sala VIP
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            CASO UTILIZADOR ABRA VIP SEM ESTAR DENTRO
            =================================================== */}

        {activeSection === "vip" && !isInsideVIP && (

          <div className="max-w-xl mx-auto text-center py-20">

            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-fuchsia-500/30">

              <Crown className="w-12 h-12 text-white" />

            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              Sala VIP
            </h2>

            <p className="mt-2 text-sm text-purple-300">
              Entre na Sala VIP para conversar com
              outros utilizadores em tempo real.
            </p>

            <button
              onClick={enterVIPRoom}
              disabled={vipLoading}
              className="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-fuchsia-500/20"
            >
              {vipLoading
                ? "A entrar..."
                : "Entrar na Sala VIP"}
            </button>

          </div>
        )}

      </main>

      {/* =====================================================
          MODAL PERFIL
          ===================================================== */}

      {showProfile &&
        selectedProfile && (

          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">

            <div className="bg-[#140c24] border border-purple-900/50 rounded-3xl max-w-md w-full p-6 space-y-6 relative overflow-hidden">

              <button
                onClick={() =>
                  setShowProfile(false)
                }
                className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/60 text-purple-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3">

                <div className="w-24 h-24 rounded-full bg-purple-900/50 border-2 border-fuchsia-500/50 flex items-center justify-center text-3xl text-purple-300 font-bold overflow-hidden">

                  {selectedProfile.image ? (

                    <img
                      src={selectedProfile.image}
                      alt={selectedProfile.name}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    selectedProfile.name?.[0]

                  )}

                </div>

                <div>

                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">

                    {selectedProfile.name},{" "}
                    {selectedProfile.age}

                    {isVIPUser(selectedProfile) && (
                      <Crown
                        className="w-5 h-5 text-yellow-400"
                        title="Utilizador VIP"
                      />
                    )}

                    {selectedProfile.verified && (
                      <BadgeCheck className="w-5 h-5 text-fuchsia-400" />
                    )}

                  </h3>

                  <p className="text-xs text-purple-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 inline" />{" "}
                    {selectedProfile.city},{" "}
                    {selectedProfile.country}
                  </p>

                </div>
              </div>

              <div className="space-y-2 border-t border-purple-900/30 pt-4">

                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">

                  <Gift className="w-3.5 h-3.5 text-fuchsia-400" />

                  Presentes Recebidos

                </h4>

                <div className="grid grid-cols-4 gap-2">

                  {(selectedProfile?.receivedGifts || [
                    { emoji: "🌹", count: 1 },
                    { emoji: "❤️", count: 2 },
                    { emoji: "👑", count: 4 },
                    { emoji: "💎", count: 8 },
                  ]).map(
                    (item, idx) => (

                      <div
                        key={idx}
                        className="bg-[#0b0714] border border-purple-900/40 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1"
                      >

                        <span className="text-2xl">
                          {item.emoji}
                        </span>

                        <span className="text-[10px] font-bold text-fuchsia-400">
                          x{item.count}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="flex items-center gap-2 pt-2">

                <button
                  onClick={() =>
                    openConversation(
                      selectedProfile
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Conversar
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false);
                    openGiftBox(
                      selectedProfile
                    );
                  }}
                  className="p-2.5 rounded-xl bg-purple-950/80 text-purple-300"
                >
                  <Gift className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          CONVERSA PRIVADA
          ===================================================== */}

      {conversationUser && (

        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">

          <div className="bg-[#140c24] border border-purple-900/50 rounded-3xl max-w-lg w-full h-[600px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

            <div className="p-3 border-b border-purple-900/40 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    setConversationUser(null)
                  }
                  className="p-1.5 rounded-xl bg-purple-950/60 text-purple-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>

                  <h4 className="font-bold text-white text-sm">
                    {conversationUser.name}
                  </h4>

                  <span className="text-[10px] text-emerald-400">
                    Online
                  </span>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button className="p-2 rounded-xl bg-purple-950/60 text-purple-300">
                  <Phone className="w-4 h-4" />
                </button>

                <button className="p-2 rounded-xl bg-purple-950/60 text-purple-300">
                  <Video className="w-4 h-4" />
                </button>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {conversationMessages.map(
                (msg) => {

                  const isMe =
                    msg.senderId ===
                      currentUser?.uid ||
                    msg.senderId ===
                      "current-user";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-xs ${
                          isMe
                            ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                            : "bg-purple-950/60 text-purple-100"
                        }`}
                      >

                        {msg.type === "gift" ? (

                          <div className="flex items-center gap-2">

                            <span className="text-2xl">
                              {msg.giftEmoji}
                            </span>

                            <div>

                              <p className="font-bold">
                                Enviou um{" "}
                                {msg.giftName}!
                              </p>

                              <span className="text-[10px] opacity-75">
                                Valor:{" "}
                                {msg.value} VIP
                              </span>

                            </div>

                          </div>

                        ) : msg.type === "image" ? (

                          <img
                            src={msg.mediaUrl}
                            alt="Enviado"
                            className="rounded-xl max-h-48 w-full object-cover"
                          />

                        ) : (

                          <p>
                            {msg.text}
                          </p>

                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <div className="p-3 border-t border-purple-900/40 bg-[#0b0714]/80">

              <div className="flex items-center gap-2">

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={
                    handleFileUpload
                  }
                />

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="p-2 rounded-xl bg-purple-950/60 text-purple-300"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Escreva uma mensagem..."
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    sendMessage()
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-[#140c24] border border-purple-500/30 text-xs text-white"
                />

                <button
                  onClick={() =>
                    sendMessage()
                  }
                  className="p-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </button>

              </div>

              <div className="flex items-center justify-between pt-2">

                <button
                  onClick={() =>
                    setShowEmojiPicker(
                      !showEmojiPicker
                    )
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 text-xs text-purple-300"
                >
                  <Smile className="w-3.5 h-3.5" />
                  Emoji & GIF
                </button>

                <button
                  onClick={() =>
                    openGiftBox(
                      conversationUser
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-fuchsia-950/60 text-xs text-fuchsia-300"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Presentes 🎁
                </button>

              </div>

              {showEmojiPicker && (

                <div className="mt-2 p-2 bg-[#10081d] border border-purple-900/40 rounded-xl">

                  <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">

                    {EMOJI_LIST.map(
                      (emoji, index) => (

                        <button
                          key={`${emoji}-${index}`}
                          onClick={() => {
                            setMessage(
                              (prev) =>
                                `${prev}${emoji}`
                            );
                            setShowEmojiPicker(
                              false
                            );
                          }}
                          className="text-lg p-1 rounded hover:bg-purple-900/40"
                        >
                          {emoji}
                        </button>

                      )
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          PRESENTES
          ===================================================== */}

      {showGifts && (

        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">

          <div className="bg-[#140c24] border border-purple-900/50 rounded-3xl max-w-md w-full p-5">

            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">

              <h3 className="text-sm font-bold text-white flex items-center gap-2">

                <Gift className="w-4 h-4 text-fuchsia-400" />

                Enviar Presente

              </h3>

              <button
                onClick={() =>
                  setShowGifts(false)
                }
                className="p-1.5 rounded-full bg-purple-950/60 text-purple-300"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <div className="grid grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1 mt-4">

              {GIFTS.map((gift) => (

                <button
                  key={gift.id}
                  onClick={() => {

                    if (
                      isInsideVIP &&
                      activeSection === "vip"
                    ) {
                      sendVIPGift(gift);
                    } else {
                      sendGift(gift);
                    }

                  }}
                  className="bg-[#0b0714] border border-purple-900/40 hover:border-fuchsia-500/60 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition"
                >

                  <span className="text-3xl hover:scale-110 transition">
                    {gift.emoji}
                  </span>

                  <span className="text-[10px] font-bold text-purple-200">
                    {gift.name}
                  </span>

                  <span className="text-[9px] text-fuchsia-400 font-semibold">
                    {gift.value} VIP
                  </span>

                </button>

              ))}

            </div>

            <p className="text-[9px] text-purple-400 mt-3 text-center">
              Novos presentes podem ser adicionados ao catálogo.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}