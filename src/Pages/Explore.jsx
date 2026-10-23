import React from "react";

export default function Explore() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Explorar</h1>

        <p className="mt-2 text-gray-500">
          Descubra novas publicações e pessoas.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="flex aspect-square items-center justify-center rounded-xl bg-white shadow-sm"
            >
              <span className="text-gray-400">
                Explorar {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}