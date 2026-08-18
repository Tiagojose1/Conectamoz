import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { FaHeart, FaRegHeart, FaImage, FaPaperPlane } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [carregando, setCarregando] = useState(false);
  const user = auth.currentUser;

  // Escutar publicações em tempo real
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("criadoEm", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Criar nova publicação
  const handleCriarPost = async (e) => {
    e.preventDefault();
    if ((!novoTexto.trim() && !imagemUrl.trim()) || !user) return;

    setCarregando(true);
    try {
      await addDoc(collection(db, "posts"), {
        autorId: user.uid,
        autorNome: user.displayName || user.email.split("@")[0],
        texto: novoTexto,
        imagemUrl: imagemUrl.trim() || null,
        likes: [],
        criadoEm: serverTimestamp()
      });
      setNovoTexto("");
      setImagemUrl("");
    } catch (error) {
      console.error("Erro ao criar post:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Curtir ou descurtir publicação
  const handleLike = async (post) => {
    if (!user) return;
    const postRef = doc(db, "posts", post.id);
    const jaGostou = post.likes?.includes(user.uid);

    try {
      if (jaGostou) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error("Erro ao atualizar likes:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={user} />
      <main className="max-w-xl mx-auto pt-4 px-4 space-y-4">
        {/* Formulário de Publicação */}
        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
          <textarea
            placeholder="No que estás a pensar?"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <FaImage size={12} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="url"
                placeholder="URL da imagem (opcional)..."
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleCriarPost}
              disabled={carregando || (!novoTexto.trim() && !imagemUrl.trim())}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FaPaperPlane size={11} />
              <span>Publicar</span>
            </button>
          </div>
        </div>

        {/* Lista de Publicações */}
        <div className="space-y-4">
          {posts.map((post) => {
            const gostou = post.likes?.includes(user?.uid);
            return (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-800">{post.autorNome}</h3>
                </div>

                {post.texto && <p className="text-xs text-gray-700 leading-relaxed">{post.texto}</p>}

                {post.imagemUrl && (
                  <img
                    src={post.imagemUrl}
                    alt="Publicação"
                    className="w-full max-h-80 object-cover rounded-lg border"
                  />
                )}

                <div className="pt-2 border-t flex items-center gap-2">
                  <button
                    onClick={() => handleLike(post)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 transition"
                  >
                    {gostou ? <FaHeart className="text-red-500" size={14} /> : <FaRegHeart size={14} />}
                    <span>{post.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}