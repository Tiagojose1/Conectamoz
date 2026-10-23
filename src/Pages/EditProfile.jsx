import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("Utilizador");
  const [bio, setBio] = useState("");

  const salvar = (event) => {
    event.preventDefault();

    alert("Perfil atualizado!");

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold">
          Editar perfil
        </h1>

        <form onSubmit={salvar} className="mt-5 space-y-4">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="w-full rounded-xl border px-4 py-3"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Biografia"
            className="min-h-32 w-full rounded-xl border p-4"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-[#635BFF] py-3 font-semibold text-white"
          >
            Guardar alterações
          </button>
        </form>
      </div>
    </div>
  );
}