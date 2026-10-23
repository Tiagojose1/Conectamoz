import React, { useState } from "react";
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Search,
  Plus,
  Video,
} from "lucide-react";

const videosData = [
  {
    id: 1,
    user: "KonnexVib",
    username: "@konnexvib",
    avatar: "https://i.pravatar.cc/100?img=12",
    video:
      "https://videos.pexels.com/video-files/3129595/3129595-uhd_2560_1440_25fps.mp4",
    description: "Bem-vindo ao KonnexVib! 🎥✨",
    likes: 1250,
    comments: 86,
    shares: 42,
  },
  {
    id: 2,
    user: "Maria Silva",
    username: "@mariasilva",
    avatar: "https://i.pravatar.cc/100?img=47",
    video:
      "https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_25fps.mp4",
    description: "Um dia incrível! ❤️",
    likes: 843,
    comments: 51,
    shares: 21,
  },
  {
    id: 3,
    user: "Carlos Manuel",
    username: "@carlosmanuel",
    avatar: "https://i.pravatar.cc/100?img=11",
    video:
      "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
    description: "Momentos que ficam para sempre. 🔥",
    likes: 2140,
    comments: 124,
    shares: 67,
  },
];

function Videos() {
  const [activeTab, setActiveTab] = useState("Para você");
  const [likedVideos, setLikedVideos] = useState([]);

  const toggleLike = (id) => {
    setLikedVideos((current) =>
      current.includes(id)
        ? current.filter((videoId) => videoId !== id)
        : [...current, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vídeos</h1>
            <p className="text-xs text-gray-500">
              Descubra vídeos no KonnexVib
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 transition hover:bg-gray-100"
              title="Pesquisar"
            >
              <Search size={21} />
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5148e5]"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Criar</span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mx-auto flex max-w-5xl overflow-x-auto px-4">
          {["Para você", "Seguindo", "Tendências"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`mr-6 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold transition ${
                activeTab === tab
                  ? "border-[#635BFF] text-[#635BFF]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-3xl px-3 py-5">
        {/* UPLOAD CARD */}
        <div className="mb-5 flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-[#635BFF]">
              <Video size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Compartilhe um vídeo
              </h2>
              <p className="text-sm text-gray-500">
                Mostre o que está acontecendo.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5148e5]"
          >
            Publicar
          </button>
        </div>

        {/* VIDEOS */}
        <div className="space-y-6">
          {videosData.map((item) => {
            const isLiked = likedVideos.includes(item.id);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* USER */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.user}
                      className="h-11 w-11 rounded-full object-cover"
                    />

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.user}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.username}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* VIDEO */}
                <div className="relative bg-black">
                  <video
                    src={item.video}
                    controls
                    playsInline
                    className="aspect-[9/16] max-h-[650px] w-full object-cover"
                  />

                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white">
                    <Play size={13} fill="white" />
                    Vídeo
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="px-4 pt-4">
                  <p className="text-sm text-gray-800">{item.description}</p>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-2 rounded-full px-3 py-2 transition ${
                        isLiked
                          ? "bg-red-50 text-red-500"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      <span className="text-sm">
                        {item.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      <MessageCircle size={20} />
                      <span className="text-sm">{item.comments}</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      <Share2 size={20} />
                      <span className="text-sm">{item.shares}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Videos;