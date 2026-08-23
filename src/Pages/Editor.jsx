import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Editor() {
  const [imagem, setImagem] = useState(null);
  const [filtro, setFiltro] = useState("none");
  const [isPremium, setIsPremium] = useState(false);
  const [remocoesUsadas, setRemocoesUsadas] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [modalPremium, setModalPremium] = useState(false);

  const LIMITE_DIARIO_GRATIS = 2; // Máximo de 2 remoções de fundo por dia

  // Carregar dados de conta do utilizador no Firestore
  useEffect(() => {
    const carregarDadosUtilizador = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setIsPremium(data.isPremium || false);
          
          // Verificar data e reiniciar contagem diária se necessário
          const hoje = new Date().toISOString().split("T")[0];
          if (data.lastResetDate !== hoje) {
            await updateDoc(userRef, {
              bgRemovalsCount: 0,
              lastResetDate: hoje,
            });
            setRemocoesUsadas(0);
          } else {
            setRemocoesUsadas(data.bgRemovalsCount || 0);
          }
        }
      }
    };

    carregarDadosUtilizador();
  }, []);

  // Seleção de foto local
  const handleUploadImagem = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(URL.createObjectURL(file));
      setFiltro("none");
      setMensagem("");
    }
  };

  // Aplicar filtro com verificação de Premium
  const aplicarFiltro = (estiloFiltro, requerPremium) => {
    if (requerPremium && !isPremium) {
      setModalPremium(true);
      return;
    }
    setFiltro(estiloFiltro);
  };

  // Função de Remoção de Fundo com limite diário
  const removerFundo = async () => {
    if (!imagem) {
      setMensagem("Selecione uma imagem primeiro!");
      return;
    }

    if (!isPremium && remocoesUsadas >= LIMITE_DIARIO_GRATIS) {
      setModalPremium(true);
      return;
    }

    setMensagem("A processar a remoção do fundo...");

    // Se for utilizador normal, incrementa o uso diário no Firestore
    if (!isPremium) {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const novoUso = remocoesUsadas + 1;
        await updateDoc(userRef, { bgRemovalsCount: novoUso });
        setRemocoesUsadas(novoUso);
      }
    }

    // Simulação da remoção de fundo
    setTimeout(() => {
      setMensagem("Fundo removido com sucesso!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Editor ConectMoz
        </h1>

        {/* Status da Conta */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4 text-sm">
          <span>
            Plano: <strong>{isPremium ? "Premium (Ilimitado) 👑" : "Grátis"}</strong>
          </span>
          {!isPremium && (
            <span className="text-gray-600">
              Remoções de Fundo: {remocoesUsadas}/{LIMITE_DIARIO_GRATIS} hoje
            </span>
          )}
        </div>

        {/* Input para carregar foto */}
        <input
          type="file"
          accept="image/*"
          onChange={handleUploadImagem}
          className="w-full mb-4 p-2 border rounded-lg"
        />

        {/* Pré-visualização da Imagem com Filtro */}
        {imagem && (
          <div className="flex justify-center my-4 overflow-hidden rounded-lg bg-black/5 p-2">
            <img
              src={imagem}
              alt="Preview"
              className="max-h-80 object-contain rounded-lg transition-all"
              style={{ filter: filtro }}
            />
          </div>
        )}

        {/* Botões de Filtros */}
        <div className="mt-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Filtros:</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => aplicarFiltro("none", false)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm"
            >
              Normal
            </button>

            <button
              onClick={() => aplicarFiltro("grayscale(100%)", false)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm"
            >
              P&B
            </button>

            <button
              onClick={() => aplicarFiltro("sepia(100%)", false)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm"
            >
              Sépia
            </button>

            {/* Filtros Exclusivos Premium */}
            <button
              onClick={() => aplicarFiltro("saturate(200%)", true)}
              className="px-3 py-1 bg-yellow-100 border border-yellow-400 rounded-lg text-sm flex items-center gap-1"
            >
              Saturação Máxima 👑
            </button>

            <button
              onClick={() => aplicarFiltro("contrast(180%) hue-rotate(90deg)", true)}
              className="px-3 py-1 bg-yellow-100 border border-yellow-400 rounded-lg text-sm flex items-center gap-1"
            >
              Vintage 👑
            </button>
          </div>
        </div>

        {/* Ferramenta de Remoção de Fundo */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={removerFundo}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Remover Fundo da Foto {!isPremium && "(Uso Limitado)"}
          </button>
        </div>

        {mensagem && (
          <p className="text-center mt-3 text-sm text-blue-600">{mensagem}</p>
        )}
      </div>

      {/* Modal / Popup de Upgrade para Premium */}
      {modalPremium && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-yellow-600 mb-2">
              Recurso ConectMoz Premium 👑
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Atingiu o limite gratuito ou tentou usar um filtro exclusivo. Assine o plano Premium para ter acesso ilimitado!
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => alert("Redirecionando para o pagamento...")}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold"
              >
                Seja Premium Agora
              </button>
              <button
                onClick={() => setModalPremium(false)}
                className="w-full bg-gray-200 py-2 rounded-lg text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editor;