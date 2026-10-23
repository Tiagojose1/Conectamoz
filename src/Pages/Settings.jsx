import React from "react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">
          Definições
        </h1>

        <div className="mt-5 space-y-2">
          <button className="w-full rounded-xl bg-white p-4 text-left">
            Conta
          </button>

          <button className="w-full rounded-xl bg-white p-4 text-left">
            Privacidade
          </button>

          <button className="w-full rounded-xl bg-white p-4 text-left">
            Segurança
          </button>
        </div>
      </div>
    </div>
  );
}