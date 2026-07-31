import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function Stories() {
  const currentUser = auth.currentUser;
  const [stories, setStories] = useState([]);
  const [storyAtivo, setStoryAtivo] = useState(null);
  const [carregandoUpload, setCarregandoUpload] = useState(false);

  const fileInputRef = useRef(null);

  // Escutar histórias reais salvas no Firestore
  useEffect(() => {
    const q = query(
      collection(db, "stories"),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStories(list);
    });

    return () => unsubscribe();
  }, []);

  // Fazer upload de uma nova imagem para o Story
  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    try {
      setCarregandoUpload(true);
      const storageRef = ref(
        storage,
        `stories/${currentUser.uid}_${Date.now()}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "stories"), {
        autorId: currentUser.uid,
        autorNome: currentUser.displayName || currentUser.email.split("@")[0],
        autorFoto: currentUser.photoURL || "",
        imagemUrl: downloadURL,
        criadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao publicar história:", error);
      alert("Erro ao publicar a história. Tente novamente.");
    } finally {
      setCarregandoUpload(false);
    }
  };

  // Iniciais do utilizador logado para a capa "Criar história"
  const userInitial = currentUser?.displayName
    ? currentUser.displayName.slice(0, 2).toUpperCase()
    : "TJ";

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide my-2">
      {/* Input de ficheiro oculto */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleAddStory}
        className="hidden"
      />

      {/* Cartão de Criar História */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative min-w-[105px] h-40 rounded-xl overflow-hidden shadow bg-white flex flex-col justify-between cursor-pointer flex-shrink-0 group hover:opacity-95 transition"
      >
        <div className="h-3/4 bg-gray-200 overflow-hidden">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Perfil"
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {carregandoUpload ? "..." : userInitial}
            </div>
          )}
        </div>

        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center text-white shadow">
          <FaPlus size={12} />
        </div>

        <div className="h-1/4 bg-white flex items-end justify-center pb-1">
          <span className="text-[11px] font-semibold text-gray-800">
            {carregandoUpload ? "Enviando..." : "Criar história"}
          </span>
        </div>
      </div>

      {/* Cartões de Histórias reais do Firebase */}
      {stories.map((story) => (
        <div
          key={story.id}
          onClick={() => setStoryAtivo(story)}
          className="relative min-w-[105px] h-40 rounded-xl overflow-hidden shadow cursor-pointer flex-shrink-0 bg-gray-900 group"
        >
          {/* Foto/Fundo da história */}
          {story.imagemUrl && (
            <img
              src={story.imagemUrl}
              alt="Story"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          )}

          {/* Sombra para destaque das informações */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10" />

          {/* Avatar no Topo Esquerdo */}
          <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full border-2 border-blue-600 overflow-hidden bg-gray-300">
            {story.autorFoto ? (
              <img
                src={story.autorFoto}
                alt={story.autorNome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {story.autorNome ? story.autorNome[0].toUpperCase() : "U"}
              </div>
            )}
          </div>

          {/* Nome do autor no Rodapé */}
          <span className="absolute bottom-2 left-2 right-2 z-20 text-white text-[11px] font-semibold leading-tight drop-shadow truncate">
            {story.autorNome}
          </span>
        </div>
      ))}

      {/* Modal para Visualizar a História inteira ao clicar */}
      {storyAtivo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setStoryAtivo(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition"
          >
            <FaTimes size={20} />
          </button>

          <div className="max-w-md w-full flex flex-col items-center space-y-3">
            <div className="flex items-center gap-2 self-start text-white mb-1">
              <div className="w-8 h-8 rounded-full border border-white overflow-hidden">
                {storyAtivo.autorFoto ? (
                  <img src={storyAtivo.autorFoto} alt={storyAtivo.autorNome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {storyAtivo.autorNome ? storyAtivo.autorNome[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <span className="font-bold text-sm">{storyAtivo.autorNome}</span>
            </div>

            <img
              src={storyAtivo.imagemUrl}
              alt="História em tela cheia"
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain bg-black shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}