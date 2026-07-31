import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { FaCamera, FaUserEdit, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PostCard from "../Components/PostCard";
import BottomNavigation from "../Components/BottomNavigation";

export default function Profile() {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");

  const fileInputRef = useRef(null);

  // Carregar apenas os posts do utilizador ligado
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "posts"),
      where("autorId", "==", currentUser.uid),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const meusPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(meusPosts);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar posts do perfil:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Upload da nova Foto de Perfil
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    try {
      setCarregandoFoto(true);
      const storageRef = ref(storage, `profiles/${currentUser.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Atualizar no Firebase Auth
      await updateProfile(currentUser, { photoURL: downloadURL });
      setPhotoURL(downloadURL);
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
    } finally {
      setCarregandoFoto(false);
    }
  };

  const userInitial = currentUser?.displayName 
    ? currentUser.displayName[0].toUpperCase() 
    : (currentUser?.email ? currentUser.email[0].toUpperCase() : "U");

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Barra Topo com Botão Voltar */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-gray-600 hover:text-black">
          <FaArrowLeft size={18} />
        </button>
        <h2 className="font-bold text-gray-800 text-lg">Perfil</h2>
      </div>

      <main className="max-w-xl mx-auto px-2 sm:px-4 pt-2">
        {/* Cartão de Perfil */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-4">
          {/* Capa */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>

          {/* Foto e Informações */}
          <div className="px-4 pb-4 relative">
            <div className="flex justify-between items-end -mt-12 mb-3">
              {/* Foto de Perfil com botão de editar */}
              <div className="relative">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md">
                    {userInitial}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={carregandoFoto}
                  className="absolute bottom-0 right-0 bg-gray-800 hover:bg-black text-white p-2 rounded-full border-2 border-white transition shadow"
                  title="Mudar foto de perfil"
                >
                  <FaCamera size={12} />
                </button>
              </div>

              {/* Botão Editar Perfil */}
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg transition border">
                <FaUserEdit size={14} />
                Editar perfil
              </button>
            </div>

            {/* Nome e Email */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                {currentUser?.displayName || currentUser?.email?.split("@")[0]}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Separador do Feed Pessoal */}
        <div className="mb-3">
          <h4 className="font-bold text-gray-800 text-sm">As tuas publicações</h4>
        </div>

        {/* Publicações do Utilizador */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
            A carregar o teu perfil...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border text-gray-500">
            <p className="font-semibold text-gray-700">Ainda não fizeste nenhuma publicação.</p>
            <p className="text-xs text-gray-400 mt-1">Partilha algo com a comunidade no feed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.autorNome || "Utilizador"}
                content={post.conteudo}
                likes={post.curtidas || []}
                imagemUrl={post.imagemUrl}
                autorFoto={photoURL}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}