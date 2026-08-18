import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { FaPlus, FaVideo } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [descricao, setDescricao] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "reels"), orderBy("criadoEm", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReels(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handlePublicarReel = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim() || !user) return;

    try {
      await addDoc(collection(db, "reels"), {
        autorId: user.uid,
        autorNome: user.displayName || user.email.split("@")[0],
        videoUrl: videoUrl.trim(),
        descricao: descricao.trim(),
        criadoEm: serverTimestamp()
      });
      setVideoUrl("");
      setDescricao("");
      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao publicar reel:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={user} />
      <main className="max-w-xl mx-auto pt-4 px-4 space-y-4">
        {/* Cabeçalho */}
        <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <FaVideo size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Reels</h1>
              <p className="text-xs text-gray-500">Assiste e partilha vídeos curtos</p>
            </div>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1 bg-blue-600 text-white font-semibold text-xs px-3 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus size={12} />
            <span>Novo Reel</span>
          </button>
        </div>

        {/* Modal de Publicação */}
        {modalAberto && (
          <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
            <h2 className="font-bold text-sm text-gray-800">Partilhar Vídeo Curtos</h2>
            <input
              type="url"
              placeholder="URL do vídeo (MP4 ou Direct Link)..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Descrição do vídeo..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalAberto(false)}
                className="text-xs text-red-500 font-semibold px-3 py-1.5"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublicarReel}
                disabled={!videoUrl.trim()}
                className="bg-blue-600 text-white font-semibold text-xs px-4 py-1.5 rounded-lg disabled:opacity-50"
              >
                Publicar
              </button>
            </div>
          </div>
        )}

        {/* Feeds de Vídeos */}
        <div className="space-y-4">
          {reels.map((reel) => (
            <div key={reel.id} className="bg-white p-4 rounded-xl shadow-sm border space-y-2">
              <h3 className="font-bold text-xs text-gray-800">{reel.autorNome}</h3>
              <video
                src={reel.videoUrl}
                controls
                className="w-full rounded-lg bg-black max-h-[70vh] object-contain"
              />
              {reel.descricao && <p className="text-xs text-gray-600">{reel.descricao}</p>}
            </div>
          ))}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}