import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 text-sm font-semibold text-[#635BFF]"
        >
          ← Voltar
        </button>

        <h1 className="text-xl font-bold">
          Publicação
        </h1>

        <p className="mt-3 text-gray-500">
          ID da publicação: {id}
        </p>

        <div className="mt-6 rounded-xl bg-gray-100 p-6">
          Publicação do KonnexVib
        </div>
      </div>
    </div>
  );
}