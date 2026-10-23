import React from "react";

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">
          Ajuda
        </h1>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl bg-white p-5">
            <h2 className="font-bold">
              Como criar uma publicação?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Na página inicial, toque em "O que está a
              acontecer?".
            </p>
          </div>

          <div className="rounded-xl bg-white p-5">
            <h2 className="font-bold">
              Como criar um Story?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Na área de Stories, selecione "Criar Story".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}