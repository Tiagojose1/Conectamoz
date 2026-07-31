import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase.js";

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


      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );


      setMensagem("Login efetuado com sucesso!");


      setTimeout(() => {
  navigate("/home");
}, 1000);
    } catch (error) {

      console.log(error.code);


      if (error.code === "auth/invalid-credential") {
        setMensagem("E-mail ou senha incorretos.");
      }

      else if (error.code === "auth/invalid-email") {
        setMensagem("E-mail inválido.");
      }

      else {
        setMensagem(error.message);
      }


    } finally {

      setLoading(false);

    }

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



          <button

            type="submit"

            disabled={loading}

            className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg"

          >

            {loading ? "Entrando..." : "Entrar"}

          </button>



        </form>



        {mensagem && (

          <p className="text-center mt-4 text-red-500">

            {mensagem}

          </p>

        )}



        <button

          onClick={() => navigate("/register")}

          className="w-full mt-4 text-blue-600"

        >

          Criar conta

        </button>



      </div>


    </div>

  );

}


export default Login;