import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config'; // Ajuste o caminho do seu firebase.js

export default function ReelsFeed() {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReels(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory bg-black text-white relative">
      {reels.map((reel) => (
        <div key={reel.id} className="h-screen w-full snap-start relative flex items-center justify-center">
          <ReactPlayer
            url={reel.videoUrl}
            playing={true}
            loop={true}
            controls={false}
            width="100%"
            height="100%"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Informações do Criador e Legenda */}
          <div className="absolute bottom-6 left-4 right-16 z-10">
            <h4 className="font-bold text-lg">@{reel.authorName}</h4>
            <p className="text-sm text-gray-200 mt-1">{reel.caption}</p>
          </div>

          {/* Botões de Ação Lateral */}
          <div className="absolute right-4 bottom-12 flex flex-col items-center gap-6 z-10">
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-gray-800/60 rounded-full">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs">{reel.likesCount || 0}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="p-3 bg-gray-800/60 rounded-full">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs">{reel.commentsCount || 0}</span>
            </button>
            <button className="p-3 bg-gray-800/60 rounded-full">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}