import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-[#635BFF]">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold">
          Página não encontrada
        </h2>

        <p className="mt-2 text-gray-500">
          A página que procuras não existe.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-full bg-[#635BFF] px-6 py-3 font-semibold text-white"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}