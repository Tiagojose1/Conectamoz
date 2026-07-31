import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../Firebase";
import { useAuth } from "../Context/AuthContext";


function EditProfile() {

  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [biografia, setBiografia] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);



  useEffect(() => {

    const carregarDados = async () => {

      if (!usuario) {
        navigate("/login");
        return;
      }


      const referencia = doc(
        db,
        "usuarios",
        usuario.uid
      );


      const dados = await getDoc(referencia);


      if (dados.exists()) {

        const perfil = dados.data();

        setNome(perfil.nome || "");
        setTelefone(perfil.telefone || "");
        setBiografia(perfil.biografia || "");

      }


      setCarregando(false);

    };


    carregarDados();


  }, [usuario, navigate]);



  const salvar = async () => {

    try {

      const referencia = doc(
        db,
        "usuarios",
        usuario.uid
      );


      await updateDoc(referencia, {

        nome,
        telefone,
        biografia

      });


      setMensagem("Perfil atualizado com sucesso! ✅");


      setTimeout(() => {

        navigate("/profile");

      }, 1500);



    } catch (error) {

      setMensagem(
        "Erro ao atualizar perfil."
      );

      console.log(error);

    }

  };



  if (carregando) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        Carregando...

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-100 p-4">


      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">


        <h1 className="text-3xl font-bold text-center text-blue-600">

          Editar Perfil

        </h1>



        <input

          type="text"

          placeholder="Nome completo"

          value={nome}

          onChange={(e) => setNome(e.target.value)}

          className="w-full mt-6 p-3 border rounded-lg"

        />



        <input

          type="tel"

          placeholder="Telefone"

          value={telefone}

          onChange={(e) => setTelefone(e.target.value)}

          className="w-full mt-4 p-3 border rounded-lg"

        />



        <textarea

          placeholder="Biografia"

          value={biografia}

          onChange={(e) => setBiografia(e.target.value)}

          className="w-full mt-4 p-3 border rounded-lg"

          rows="4"

        />



        <button

          onClick={salvar}

          className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg"

        >

          Salvar Alterações

        </button>



        {mensagem && (

          <p className="text-center mt-4 text-green-600">

            {mensagem}

          </p>

        )}



        <button

          onClick={() => navigate("/profile")}

          className="w-full mt-4 text-blue-600"

        >

          Cancelar

        </button>


      </div>


    </div>

  );

}


export default EditProfile;
