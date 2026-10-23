import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

const idiomas = [
  "Português",
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Italiano",
];

export default function Login() {
  const navigate = useNavigate();

  const [emailOuTelefone, setEmailOuTelefone] = useState("");
  const [palavraPasse, setPalavraPasse] = useState("");

  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const [idioma, setIdioma] = useState("Português");

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");

  // =========================================================
  // ENTRAR
  // =========================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    setErro("");
    setMensagem("");

    const identificador = emailOuTelefone.trim();

    if (!identificador) {
      setErro("Introduza o seu e-mail ou número de telefone.");
      return;
    }

    if (!palavraPasse) {
      setErro("Introduza a sua palavra-passe.");
      return;
    }

    // Nesta primeira versão o Firebase Authentication
    // utiliza e-mail + palavra-passe.
    //
    // O campo aceita "E-mail ou número de telefone" na interface.
    // O login por número será ligado ao sistema de SMS
    // quando implementarmos a autenticação por telefone.

    if (!identificador.includes("@")) {
      setErro(
        "Para esta versão, introduza o e-mail usado no cadastro."
      );
      return;
    }

    try {
      setCarregando(true);

      await signInWithEmailAndPassword(
        auth,
        identificador,
        palavraPasse
      );

      navigate("/home");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setErro("E-mail ou palavra-passe incorretos.");
          break;

        case "auth/too-many-requests":
          setErro(
            "Foram feitas muitas tentativas. Aguarde alguns minutos e tente novamente."
          );
          break;

        case "auth/user-disabled":
          setErro("Esta conta foi bloqueada.");
          break;

        case "auth/network-request-failed":
          setErro(
            "Não foi possível ligar ao servidor. Verifique a sua internet."
          );
          break;

        default:
          setErro(
            "Não foi possível iniciar a sessão. Tente novamente."
          );
      }
    } finally {
      setCarregando(false);
    }
  };

  // =========================================================
  // RECUPERAR PALAVRA-PASSE
  // =========================================================
  const handleRecuperarPalavraPasse = async (e) => {
    e.preventDefault();

    setErro("");
    setMensagem("");

    const email = emailRecuperacao.trim();

    if (!email) {
      setErro("Introduza o e-mail da sua conta.");
      return;
    }

    if (!email.includes("@")) {
      setErro("Introduza um endereço de e-mail válido.");
      return;
    }

    try {
      setCarregando(true);

      await sendPasswordResetEmail(auth, email);

      setMensagem(
        "Enviámos as instruções para recuperar a sua palavra-passe para o e-mail informado."
      );

      setEmailRecuperacao("");
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/user-not-found":
          setErro(
            "Não encontrámos uma conta associada a esse e-mail."
          );
          break;

        case "auth/invalid-email":
          setErro("O e-mail introduzido não é válido.");
          break;

        case "auth/too-many-requests":
          setErro(
            "Foram feitas muitas tentativas. Aguarde alguns minutos."
          );
          break;

        default:
          setErro(
            "Não foi possível enviar o código de recuperação."
          );
      }
    } finally {
      setCarregando(false);
    }
  };

  // =========================================================
  // ESCOLHER IDIOMA
  // =========================================================
  const selecionarIdioma = (novoIdioma) => {
    setIdioma(novoIdioma);
    setMostrarIdiomas(false);
  };

  // =========================================================
  // RECUPERAÇÃO DE E-MAIL
  // =========================================================
  const handleEsqueciEmail = () => {
    setErro("");
    setMensagem("");

    alert(
      "A recuperação do e-mail será feita através do número de telefone ou dos dados de recuperação da conta."
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* =====================================================
            LOGO
        ====================================================== */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-2xl mr-2"
              style={{ backgroundColor: "#635BFF" }}
            >
              K
            </div>

            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "#635BFF" }}
            >
              KonnexVib
            </h1>
          </div>
        </div>

        {/* =====================================================
            IDIOMA
        ====================================================== */}
        <div className="flex justify-center mb-7 relative">
          <button
            type="button"
            onClick={() => setMostrarIdiomas(!mostrarIdiomas)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <span>🌐</span>
            <span>{idioma}</span>
            <span className="text-xs">▼</span>
          </button>

          {mostrarIdiomas && (
            <div className="absolute top-8 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              {idiomas.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selecionarIdioma(item)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition ${
                    idioma === item
                      ? "font-semibold text-[#635BFF] bg-[#635BFF]/5"
                      : "text-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            CARD LOGIN
        ====================================================== */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Entrar
          </h2>

          {/* ===================================================
              ERRO
          ==================================================== */}
          {erro && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {/* ===================================================
              MENSAGEM
          ==================================================== */}
          {mensagem && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {mensagem}
            </div>
          )}

          {/* ===================================================
              FORMULÁRIO
          ==================================================== */}
          <form onSubmit={handleLogin}>

            {/* E-MAIL / TELEFONE */}
            <div className="mb-1">
              <input
                type="text"
                value={emailOuTelefone}
                onChange={(e) => setEmailOuTelefone(e.target.value)}
                placeholder="E-mail ou número de telefone"
                autoComplete="username"
                className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none text-gray-900 placeholder-gray-400 focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 transition"
              />
            </div>

            {/* ESQUECI E-MAIL */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleEsqueciEmail}
                className="text-sm font-medium text-[#635BFF] hover:underline"
              >
                Esqueci o e-mail
              </button>
            </div>

            {/* PALAVRA-PASSE */}
            <div className="relative mb-1">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={palavraPasse}
                onChange={(e) => setPalavraPasse(e.target.value)}
                placeholder="Palavra-passe"
                autoComplete="current-password"
                className="w-full h-12 px-4 pr-20 rounded-xl border border-gray-300 outline-none text-gray-900 placeholder-gray-400 focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 transition"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {/* ESQUECI PALAVRA-PASSE */}
            <div className="flex justify-end mb-5">
              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setMensagem("");
                  setMostrarRecuperacao(true);
                }}
                className="text-sm font-medium text-[#635BFF] hover:underline"
              >
                Esqueci a palavra-passe
              </button>
            </div>

            {/* ENTRAR */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full h-12 rounded-xl text-white font-bold transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#635BFF" }}
            >
              {carregando ? "A entrar..." : "ENTRAR"}
            </button>
          </form>

          {/* ===================================================
              SEPARADOR
          ==================================================== */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ===================================================
              CRIAR CONTA
          ==================================================== */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full h-12 rounded-xl border-2 border-[#635BFF] text-[#635BFF] font-bold hover:bg-[#635BFF]/5 transition"
          >
            CRIAR MINHA CONTA
          </button>
        </div>

        {/* =====================================================
            RODAPÉ
        ====================================================== */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} KonnexVib
        </p>
      </div>

      {/* =======================================================
          MODAL RECUPERAÇÃO DA PALAVRA-PASSE
      ======================================================== */}
      {mostrarRecuperacao && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                Recuperar palavra-passe
              </h3>

              <button
                type="button"
                onClick={() => setMostrarRecuperacao(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Introduza o e-mail associado à sua conta. Enviaremos
              as instruções para recuperar a sua palavra-passe.
            </p>

            <form onSubmit={handleRecuperarPalavraPasse}>

              <input
                type="email"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                placeholder="Introduza o seu e-mail"
                autoComplete="email"
                className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none text-gray-900 placeholder-gray-400 focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 transition mb-4"
              />

              <button
                type="submit"
                disabled={carregando}
                className="w-full h-12 rounded-xl text-white font-bold disabled:opacity-60"
                style={{ backgroundColor: "#635BFF" }}
              >
                {carregando
                  ? "A enviar..."
                  : "Enviar recuperação"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMostrarRecuperacao(false)}
              className="w-full mt-3 h-11 rounded-xl text-gray-600 font-medium hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}