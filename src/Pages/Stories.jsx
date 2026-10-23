import React from "react";
import { useNavigate } from "react-router-dom";

export default function Stories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">
          Stories
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((story) => (
            <button
              key={story}
              onClick={() => navigate(`/story/${story}`)}
              className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-[#635BFF] to-pink-500 text-white"
            >
              Story {story}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}