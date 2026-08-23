import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (!email || !senha) {
      setMensagem("Digite o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, senha);
      setMensagem("Login efetuado com sucesso!");

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      console.log(error.code);

      if (error.code === "auth/invalid-credential") {
        setMensagem("E-mail ou senha incorretos.");
      } else if (error.code === "auth/invalid-email") {
        setMensagem("E-mail inválido.");
      } else {
        setMensagem(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir a palavra-passe via Firebase
  const handleEsqueciSenha = async () => {
    if (!email) {
      setMensagem("Por favor, digite o seu e-mail no campo acima para redefinir a palavra-passe.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("E-mail de redefinição enviado! Verifique a sua caixa de entrada.");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setMensagem("Este e-mail não está cadastrado.");
      } else {
        setMensagem("Erro ao enviar e-mail de redefinição.");
      }
    }
  };

  // Função para ajuda de e-mail esquecido
  const handleEsqueciEmail = () => {
    setMensagem("Se esqueceu o e-mail cadastrado, entre em contacto com o suporte do ConectMoz.");
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          ConectMoz
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Entre na sua conta
        </p>

        <form onSubmit={entrar}>
          <input
            type="email"
            placeholder="E-mail"
            className="w-full mt-6 p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full mt-4 p-3 border rounded-lg"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {/* Links para esqueci e-mail e palavra-passe */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <button
              type="button"
              onClick={handleEsqueciEmail}
              className="text-gray-500 hover:underline"
            >
              Esqueci o e-mail
            </button>

            <button
              type="button"
              onClick={handleEsqueciSenha}
              className="text-blue-600 hover:underline"
            >
              Esqueci a senha
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {mensagem && (
          <p className="text-center mt-4 text-sm text-red-500">
            {mensagem}
          </p>
        )}

        <button
          onClick={() => navigate("/register")}
          className="w-full mt-4 text-blue-600 hover:underline"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}

export default Login;