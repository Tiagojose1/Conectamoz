import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const stories = [
  {
    id: 1,
    name: "Ana",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 2,
    name: "Carlos",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Maria",
    image: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: 4,
    name: "João",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 5,
    name: "Sofia",
    image: "https://i.pravatar.cc/150?img=44",
  },
];

export default function StoriesRow() {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-900">
          Stories
        </h2>

        <button
          onClick={() => navigate("/stories")}
          className="text-sm font-semibold text-[#635BFF]"
        >
          Ver todos
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1">

        {/* CRIAR STORY */}
        <button
          onClick={() => navigate("/create-story")}
          className="flex min-w-[70px] flex-col items-center"
        >
          <div className="relative h-16 w-16 rounded-full border-2 border-gray-200 p-1">

            <img
              src="https://ui-avatars.com/api/?name=Tiago&background=635BFF&color=fff"
              alt="Seu story"
              className="h-full w-full rounded-full object-cover"
            />

            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#635BFF] text-white">
              <FaPlus size={10} />
            </div>

          </div>

          <span className="mt-2 text-xs text-gray-600">
            Seu story
          </span>
        </button>

        {/* STORIES */}
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => navigate(`/stories/${story.id}`)}
            className="flex min-w-[70px] flex-col items-center"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#635BFF] to-purple-300 p-[2px]">
              <div className="h-full w-full rounded-full bg-white p-[2px]">
                <img
                  src={story.image}
                  alt={story.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>

            <span className="mt-2 max-w-[70px] truncate text-xs text-gray-600">
              {story.name}
            </span>
          </button>
        ))}

      </div>
    </section>
  );
}