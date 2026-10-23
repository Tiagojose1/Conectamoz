import React from "react";

export default function Followers() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">
          Seguidores
        </h1>

        <div className="mt-5 rounded-xl bg-white p-6 text-center">
          <p className="text-gray-500">
            Ainda não existem seguidores.
          </p>
        </div>
      </div>
    </div>
  );
}