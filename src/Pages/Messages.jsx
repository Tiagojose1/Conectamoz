import React from "react";
import { useNavigate } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">
          Mensagens
        </h1>

        <button
          onClick={() => navigate("/chat/1")}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF] font-bold text-white">
            U
          </div>

          <div>
            <h2 className="font-semibold">
              Utilizador
            </h2>

            <p className="text-sm text-gray-500">
              Iniciar conversa
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}