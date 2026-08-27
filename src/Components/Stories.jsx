import React, { useEffect, useRef, useState } from "react";

import { auth, db } from "../firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import {
  FaPlus,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import { uploadParaCloudinary } from "../Utils/Cloudinary";

export default function Stories({ user: userProp }) {
  const [stories, setStories] = useState([]);
  const [storyAtivo, setStoryAtivo] = useState(null);

  const [carregandoUpload, setCarregandoUpload] =
    useState(false);

  const fileInputRef = useRef(null);

  const currentUser =
    userProp || auth.currentUser;

  useEffect(() => {
    const storiesQuery = query(
      collection(db, "stories"),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(
      storiesQuery,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStories(lista);
      },
      (error) => {
        console.error(
          "Erro ao carregar Stories:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddStory = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!currentUser) {
      alert(
        "É necessário iniciar sessão para criar um Story."
      );
      return;
    }

    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
    ) {
      alert(
        "Selecione uma imagem ou vídeo válido."
      );
      return;
    }

    try {
      setCarregandoUpload(true);

      const tipo = file.type.startsWith("video/")
        ? "video"
        : "image";

      const uploaded = await uploadParaCloudinary(
        file,
        "stories"
      );

      const mediaUrl =
        uploaded.secure_url || "";

      await addDoc(collection(db, "stories"), {
        autorId: currentUser.uid,

        autorNome:
          currentUser.displayName ||
          currentUser.email?.split("@")[0] ||
          "Utilizador",

        autorFoto:
          currentUser.photoURL || "",

        mediaUrl,

        imagemUrl:
          tipo === "image"
            ? mediaUrl
            : "",

        videoUrl:
          tipo === "video"
            ? mediaUrl
            : "",

        mediaType: tipo,

        mediaPublicId:
          uploaded.public_id || "",

        criadoEm: serverTimestamp(),
      });

      alert("Story publicado com sucesso! 🎉");
    } catch (error) {
      console.error(
        "Erro ao publicar Story:",
        error
      );

      alert(
        `Erro ao publicar Story.\n\n${error.message}`
      );
    } finally {
      setCarregandoUpload(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const userInitial =
    currentUser?.displayName
      ?.slice(0, 2)
      .toUpperCase() ||
    "KV";

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">

        <div className="flex items-center justify-between mb-4">

          <h2 className="font-bold text-lg">
            Stories
          </h2>

          <button
            type="button"
            className="text-purple-600 text-sm font-semibold"
          >
            Ver todos
          </button>

        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

          {/* CRIAR STORY */}

          <div
            onClick={() =>
              !carregandoUpload &&
              fileInputRef.current?.click()
            }
            className="relative min-w-[105px] h-40 rounded-xl overflow-hidden shadow bg-white cursor-pointer flex-shrink-0"
          >

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleAddStory}
              className="hidden"
            />

            <div className="h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center">

              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Perfil"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {userInitial}
                </span>
              )}

              <div className="absolute inset-0 bg-black/20" />

              <div className="absolute bottom-4 flex flex-col items-center text-white">

                <div className="w-9 h-9 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">

                  {carregandoUpload ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPlus size={13} />
                  )}

                </div>

                <span className="text-[11px] font-semibold mt-1">
                  {carregandoUpload
                    ? "Enviando..."
                    : "Criar Story"}
                </span>

              </div>

            </div>

          </div>

          {/* STORIES */}

          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() =>
                setStoryAtivo(story)
              }
              className="relative min-w-[105px] h-40 rounded-xl overflow-hidden shadow cursor-pointer flex-shrink-0 bg-gray-900"
            >

              {story.mediaType === "video" ? (
                <video
                  src={story.videoUrl || story.mediaUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={story.imagemUrl || story.mediaUrl}
                  alt={story.autorNome}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

              {/* AVATAR */}

              <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full border-2 border-purple-500 overflow-hidden bg-purple-600">

                {story.autorFoto ? (
                  <img
                    src={story.autorFoto}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {story.autorNome
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>
                )}

              </div>

              <span className="absolute bottom-2 left-2 right-2 z-10 text-white text-[11px] font-semibold truncate">
                {story.autorNome ||
                  "Utilizador"}
              </span>

            </div>
          ))}

        </div>
      </div>

      {/* VISUALIZADOR */}

      {storyAtivo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">

          <button
            type="button"
            onClick={() =>
              setStoryAtivo(null)
            }
            className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <FaTimes />
          </button>

          <div className="w-full max-w-md flex flex-col items-center">

            <div className="w-full flex items-center gap-3 text-white mb-3">

              {storyAtivo.autorFoto ? (
                <img
                  src={storyAtivo.autorFoto}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                  {storyAtivo.autorNome
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>
              )}

              <span className="font-bold text-sm">
                {storyAtivo.autorNome}
              </span>

            </div>

            {storyAtivo.mediaType ===
            "video" ? (
              <video
                src={
                  storyAtivo.videoUrl ||
                  storyAtivo.mediaUrl
                }
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] max-w-full rounded-xl bg-black object-contain"
              />
            ) : (
              <img
                src={
                  storyAtivo.imagemUrl ||
                  storyAtivo.mediaUrl
                }
                alt="Story"
                className="max-h-[80vh] max-w-full rounded-xl object-contain"
              />
            )}

          </div>

        </div>
      )}
    </>
  );
}