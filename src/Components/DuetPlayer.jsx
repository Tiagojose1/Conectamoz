import React from "react";

export default function DuetPlayer({ originalVideoUrl, duetoVideoUrl, filterCss }) {
  return (
    <div className="w-full h-full grid grid-cols-2 bg-black">
      <div className="relative border-r border-gray-800 h-full">
        <video
          src={originalVideoUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
        />
      </div>

      <div className="relative h-full">
        <video
          src={duetoVideoUrl}
          className="w-full h-full object-cover"
          style={{ filter: filterCss || "none" }}
          loop
          muted
          playsInline
          autoPlay
        />
      </div>
    </div>
  );
}

export const handlePartilharReel = async (reelId, autorNome) => {
  const shareUrl = `${window.location.origin}/reels?id=${reelId}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Reel de @${autorNome}`,
        text: "Vê este vídeo incrível!",
        url: shareUrl,
      });
    } catch (err) {
      console.log("Erro ao partilhar:", err);
    }
  } else {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copiado para a área de transferência!");
  }
};