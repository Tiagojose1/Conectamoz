import React, { useState } from "react";

export default function Search() {
  const [pesquisa, setPesquisa] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Pesquisar</h1>

        <input
          type="text"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar pessoas ou publicações..."
          className="mt-5 w-full rounded-full border bg-white px-5 py-3 outline-none focus:border-[#635BFF]"
        />

        {pesquisa && (
          <div className="mt-5 rounded-xl bg-white p-5">
            <p className="text-sm text-gray-500">
              Resultados para:
            </p>

            <p className="mt-1 font-semibold">
              {pesquisa}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}