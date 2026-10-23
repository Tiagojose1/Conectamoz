import React from "react";

export default function SavedPosts() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">
          Publicações guardadas
        </h1>

        <div className="mt-5 rounded-xl bg-white p-6 text-center">
          <p className="text-gray-500">
            Não tens publicações guardadas.
          </p>
        </div>
      </div>
    </div>
  );
}