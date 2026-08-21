import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { FaArrowLeft } from "react-icons/fa";

export default function EditProfile() {
  const navigate = useNavigate();
  const usuario = auth.currentUser;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bio, setBio] = useState("");
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      if (!usuario) {
        navigate("/login");
        return;
      }

      try {
        const referencia = doc(db, "users", usuario.uid);
        const dados = await getDoc(referencia);

        if (isMounted) {
          if (dados.exists()) {
            const perfil = dados.data();
            setNome(perfil.nome || perfil.displayName || usuario.displayName || "");
            setTelefone(perfil.telefone || "");
            setBio(perfil.bio || perfil.biografia || "");
          } else {
            setNome(usuario.displayName || "");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        if (isMounted) setCarregando(false);
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, [usuario, navigate]);

  const salvar = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    try {
      setSalvando(true);
      setMensagem({ texto: "", erro: false });

      const numTelefone = telefone.replace(/\D/g, "");

      // 1. Atualizar documento na coleção 'users' no Firestore
      const referencia = doc(db, "users", usuario.uid);
      await setDoc(
        referencia,
        {
          nome,
          telefone: numTelefone,
          bio,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2. Atualizar displayName no Firebase Auth
      if (auth.currentUser && nome !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: nome });
      }

      setMensagem({ texto: "Perfil atualizado com sucesso! ✅", erro: false });

      setTimeout(() => {
        navigate(`/profile/${usuario.uid}`);
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMensagem({
        texto: "Erro ao atualizar perfil. Tenta novamente.",
        erro: true,
      });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <FaArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
            Editar Perfil
          </h1>
          <div className="w-6"></div>
        </div>

        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="O teu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Telefone
            </label>
            <input
              type="tel"
              maxLength={9}
              placeholder="Ex: 841234567"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Biografia
            </label>
            <textarea
              placeholder="Escreve algo sobre ti..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition"
              rows={4}
            />
          </div>

          {mensagem.texto && (
            <p
              className={`text-center text-sm font-medium p-2 rounded-lg ${
                mensagem.erro
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {mensagem.texto}
            </p>
          )}

          <button
            type="submit"
            disabled={salvando}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold text-sm shadow transition ${
              salvando ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {salvando ? "A guardar..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/profile/${usuario?.uid}`)}
            className="w-full text-gray-500 text-sm font-semibold hover:underline text-center pt-2"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}