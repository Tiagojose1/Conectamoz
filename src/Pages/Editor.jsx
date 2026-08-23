import { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Editor() {
  const [media, setMedia] = useState(null);
  const [tipoMedia, setTipoMedia] = useState("image"); // 'image' ou 'video'
  const [filtro, setFiltro] = useState("none");
  const [efeitoEspecial, setEfeitoEspecial] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [remocoesUsadas, setRemocoesUsadas] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [modalPremium, setModalPremium] = useState(false);
  const [textoOverlay, setTextoOverlay] = useState("");

  const videoRef = useRef(null);
  const LIMITE_DIARIO_GRATIS = 2;

  // Carregar status do utilizador no Firestore
  useEffect(() => {
    const carregarPerfil = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setIsPremium(data.isPremium || false);

          const hoje = new Date().toISOString().split("T")[0];
          if (data.lastResetDate !== hoje) {
            await updateDoc(userRef, { bgRemovalsCount: 0, lastResetDate: hoje });
            setRemocoesUsadas(0);
          } else {
            setRemocoesUsadas(data.bgRemovalsCount || 0);
          }
        }
      }
    };
    carregarPerfil();
  }, []);

  // Upload de Média (Fotos ou Vídeos)
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia(url);
      setTipoMedia(file.type.startsWith("video") ? "video" : "image");
      setFiltro("none");
      setEfeitoEspecial("");
      setMensagem("");
    }
  };

  // Função para aplicar efeitos com verificação de nível Premium
  const aplicarEfeito = (estiloCSS, requerPremium, classeEspecial = "") => {
    if (requerPremium && !isPremium) {
      setModalPremium(true);
      return;
    }
    setFiltro(estiloCSS);
    setEfeitoEspecial(classeEspecial);
  };

  // Remoção de Fundo / Recorte IA
  const processarRemocaoFundo = async () => {
    if (!media) return setMensagem("Carregue uma foto ou vídeo primeiro.");

    if (!isPremium && remocoesUsadas >= LIMITE_DIARIO_GRATIS) {
      setModalPremium(true);
      return;
    }

    setMensagem("A processar corte com Inteligência Artificial...");

    if (!isPremium) {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const novoUso = remocoesUsadas + 1;
        await updateDoc(userRef, { bgRemovalsCount: novoUso });
        setRemocoesUsadas(novoUso);
      }
    }

    setTimeout(() => {
      setMensagem("Fundo removido com sucesso!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-extrabold text-blue-500">
            ConectMoz Studio 🎬
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPremium ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-300"}`}>
            {isPremium ? "PREMIUM VIP 👑" : "PLANO GRÁTIS"}
          </span>
        </div>

        {/* Input de Carregamento */}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
          className="w-full mb-6 p-3 bg-gray-700 rounded-xl cursor-pointer text-sm"
        />

        {/* Área de Visualização com Efeitos e Overlay */}
        {media && (
          <div className="relative flex justify-center items-center my-4 overflow-hidden rounded-xl bg-black min-h-[300px] border border-gray-700">
            {tipoMedia === "image" ? (
              <img
                src={media}
                alt="Preview"
                className={`max-h-96 object-contain transition-all duration-300 ${efeitoEspecial}`}
                style={{ filter: filtro }}
              />
            ) : (
              <video
                ref={videoRef}
                src={media}
                controls
                className={`max-h-96 w-full object-contain transition-all duration-300 ${efeitoEspecial}`}
                style={{ filter: filtro }}
              />
            )}

            {/* Texto Estilo TikTok / Reels */}
            {textoOverlay && (
              <div className="absolute bottom-6 bg-black/60 px-4 py-2 rounded-lg text-lg font-bold tracking-wide border border-white/20">
                {textoOverlay}
              </div>
            )}
          </div>
        )}

        {/* Painel de Ferramentas e Filtros */}
        <div className="space-y-6 mt-6">
          
          {/* Filtros Básicos (Instagram) */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Filtros Essenciais (Grátis)</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => aplicarEfeito("none", false)} className="px-3 py-1.5 bg-gray-700 rounded-lg text-xs hover:bg-gray-600">Normal</button>
              <button onClick={() => aplicarEfeito("grayscale(100%)", false)} className="px-3 py-1.5 bg-gray-700 rounded-lg text-xs hover:bg-gray-600">P&B Clássico</button>
              <button onClick={() => aplicarEfeito("sepia(80%)", false)} className="px-3 py-1.5 bg-gray-700 rounded-lg text-xs hover:bg-gray-600">Sépia Retro</button>
            </div>
          </div>

          {/* Efeitos Pro & Tendências (CapCut & TikTok) - PREMIUM */}
          <div>
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              Efeitos CapCut & TikTok VIP 👑
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => aplicarEfeito("contrast(150%) brightness(110%) saturate(130%)", true)} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-medium">
                Glow Neon ✨
              </button>
              <button onClick={() => aplicarEfeito("hue-rotate(90deg) contrast(170%)", true)} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-medium">
                Cyberpunk 🤖
              </button>
              <button onClick={() => aplicarEfeito("invert(80%)", true)} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-medium">
                Raio-X Viral ⚡
              </button>
              <button onClick={() => aplicarEfeito("blur(4px) brightness(120%)", true)} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-medium">
                Soft Focus / Cinema 🎥
              </button>
            </div>
          </div>

          {/* Filtros de Beleza e Lentes (Snapchat) - PREMIUM */}
          <div>
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2">
              Lentes de Beleza Snapchat 👑
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => aplicarEfeito("saturate(160%) brightness(105%) contrast(95%)", true)} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-medium">
                Suavização de Pele 🌸
              </button>
              <button onClick={() => aplicarEfeito("sepia(30%) saturate(200%) hue-rotate(-10deg)", true)} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-medium">
                Pôr do Sol Dourado ☀️
              </button>
            </div>
          </div>

          {/* Adicionar Legenda / Texto Overlay */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Adicionar Legenda TikTok</h3>
            <input
              type="text"
              placeholder="Digite um texto para aparecer no vídeo/foto..."
              value={textoOverlay}
              onChange={(e) => setTextoOverlay(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded-lg text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Recorte com IA (Remoção de Fundo) */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={processarRemocaoFundo}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg"
            >
              Remover Fundo com IA {!isPremium && `(${remocoesUsadas}/${LIMITE_DIARIO_GRATIS} hoje)`}
            </button>
          </div>

        </div>

        {mensagem && <p className="text-center mt-4 text-sm text-blue-400">{mensagem}</p>}
      </div>

      {/* Modal Bloqueio Premium */}
      {modalPremium && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-yellow-500/30 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-2">👑</div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              Recurso ConectMoz Premium
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Os efeitos visuais avançados do CapCut, TikTok, Snapchat e o corte IA ilimitado são exclusivos para utilizadores VIP.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => alert("A redirecionar para a página de pagamento...")}
                className="w-full bg-yellow-500 text-black font-extrabold py-3 rounded-xl hover:bg-yellow-400 transition"
              >
                Ser Premium Agora
              </button>
              <button
                onClick={() => setModalPremium(false)}
                className="w-full bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm hover:bg-gray-600"
              >
                Continuar Versão Grátis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editor;