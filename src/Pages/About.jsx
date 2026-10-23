import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#635BFF] text-3xl font-bold text-white">
            K
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            KonnexVib
          </h1>

          <p className="mt-2 text-gray-500">
            Conecta. Partilha. Vibra.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-bold">
            Sobre o KonnexVib
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            O KonnexVib é uma rede social criada para
            permitir que pessoas possam conectar-se,
            partilhar conteúdos e comunicar.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          KonnexVib © 2026
        </p>
      </div>
    </div>
  );
}