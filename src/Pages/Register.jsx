import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../Firebase";

function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async () => {
    setMensagem("");

    if (!nome || !telefone || !email || !senha || !confirmarSenha) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setMensagem("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        uid: userCredential.user.uid,
        nome: nome,
        telefone: telefone,
        email: email,
        fotoPerfil: "",
        biografia: "",
        criadoEm: new Date().toISOString()
      });

      setMensagem("Conta criada com sucesso! 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {

      switch (error.code) {
        case "auth/email-already-in-use":
          setMensagem("Este e-mail já está cadastrado.");
          break;

        case "auth/invalid-email":
          setMensagem("Digite um e-mail válido.");
          break;

        case "auth/weak-password":
          setMensagem("A senha é muito fraca.");
          break;

        default:
          setMensagem(error.message);
      }

    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          Criar Conta
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Faça seu cadastro no ConectMoz
        </p>

        <input
          type="text"
          placeholder="Nome completo"
          className="w-full mt-6 p-3 border rounded-lg"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Número de telefone"
          className="w-full mt-4 p-3 border rounded-lg"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mt-4 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Criar senha"
          className="w-full mt-4 p-3 border rounded-lg"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          className="w-full mt-4 p-3 border rounded-lg"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <button
          onClick={cadastrar}
          disabled={carregando}
          className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          {carregando ? "Criando conta..." : "Cadastrar"}
        </button>

        {mensagem && (
          <p className="text-center mt-4 text-red-500">
            {mensagem}
          </p>
        )}

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-blue-600 hover:underline"
        >
          Já tenho uma conta - Entrar
        </button>

      </div>
    </div>
  );
}

export default Register;
