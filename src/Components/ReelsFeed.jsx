import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Importação padronizada conforme o resto do projeto

export default function ReelsFeed() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReels(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar Reels:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <p className="animate-pulse">A carregar Reels...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4 text-center">
        <p className="text-lg font-semibold">Nenhum Reel publicado ainda.</p>
        <p className="text-sm text-gray-400 mt-1">Seja o primeiro a carregar um vídeo!</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory bg-black text-white relative rounded-xl">
      {reels.map((reel) => (
        <div key={reel.id} className="h-full w-full snap-start relative flex items-center justify-center bg-black">
          <ReactPlayer
            url={reel.videoUrl}
            playing={true}
            loop={true}
            muted={true} // Garante o autoplay nos navegadores
            controls={false}
            width="100%"
            height="100%"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Informações do Criador e Legenda */}
          <div className="absolute bottom-6 left-4 right-16 z-10 drop-shadow-md">
            <h4 className="font-bold text-lg">@{reel.authorName || "utilizador"}</h4>
            <p className="text-sm text-gray-200 mt-1 line-clamp-2">{reel.caption}</p>
          </div>

          {/* Botões de Ação Lateral */}
          <div className="absolute right-4 bottom-12 flex flex-col items-center gap-6 z-10">
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <div className="p-3 bg-gray-800/60 backdrop-blur-md rounded-full hover:bg-gray-700/80">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium">{reel.likesCount || 0}</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <div className="p-3 bg-gray-800/60 backdrop-blur-md rounded-full hover:bg-gray-700/80">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium">{reel.commentsCount || 0}</span>
            </button>
            
            <button className="p-3 bg-gray-800/60 backdrop-blur-md rounded-full hover:bg-gray-700/80 active:scale-90 transition-transform">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}