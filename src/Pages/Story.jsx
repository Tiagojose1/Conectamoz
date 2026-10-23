import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Story() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center text-white">
        <p className="text-sm text-white/60">
          Story
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Story {id}
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="mt-8 rounded-full bg-white px-6 py-3 font-semibold text-black"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}