import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth, storage } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PostCard from "../Components/PostCard";
import { FaArrowLeft, FaEdit, FaUserCircle, FaCamera } from "react-icons/fa";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser && currentUser.uid === userId;

  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para edição de perfil
  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaBio, setNovaBio] = useState("");
  const [novaFoto, setNovaFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const carregarPerfilEPosts = async () => {
      try {
        setCarregando(true);

        // 1. Obter dados do utilizador
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const dadosUser = userSnap.data();
          setUsuario(dadosUser);
          setNovoNome(dadosUser.nome || dadosUser.displayName || "");
          setNovaBio(dadosUser.bio || "");
          setFotoPreview(dadosUser.fotoUrl || dadosUser.photoURL || null);
        } else {
          setUsuario(null);
        }

        // 2. Obter apenas os posts deste utilizador
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("autorId", "==", userId));
        const querySnapshot = await getDocs(q);

        const userPosts = querySnapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setPosts(userPosts);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setCarregando(false);
      }
    };

    if (userId) {
      carregarPerfilEPosts();
    }
  }, [userId]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNovaFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const salvarPerfil = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    try {
      setSalvando(true);
      let urlFotoFinal = usuario.fotoUrl || usuario.photoURL || "";

      // Upload da nova foto de perfil (se selecionada)
      if (novaFoto) {
        const fotoRef = ref(storage, `perfis/${userId}_${Date.now()}`);
        await uploadBytes(fotoRef, novaFoto);
        urlFotoFinal = await getDownloadURL(fotoRef);
      }

      const userRef = doc(db, "users", userId);
      const novosDados = {
        nome: novoNome,
        bio: novaBio,
        fotoUrl: urlFotoFinal
      };

      await updateDoc(userRef, novosDados);

      // Atualiza o autor de todos os posts passados no Firestore
      if (posts.length > 0) {
        const batch = writeBatch(db);
        posts.forEach((post) => {
          const postRef = doc(db, "posts", post.id);
          batch.update(postRef, {
            author: novoNome,
            autorNome: novoNome,
            autorFoto: urlFotoFinal
          });
        });
        await batch.commit();
      }

      setUsuario((prev) => ({
        ...prev,
        ...novosDados
      }));

      // Atualiza a lista local de posts
      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          author: novoNome,
          autorNome: novoNome,
          autorFoto: urlFotoFinal
        }))
      );

      setEditando(false);
      setNovaFoto(null);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800">Utilizador não encontrado</h3>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Voltar ao Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Botão de Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        <FaArrowLeft size={14} /> Voltar
      </button>

      {/* Cartão de Perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt={usuario.nome}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-600"
              />
            ) : (
              <FaUserCircle className="w-20 h-20 text-gray-300" />
            )}

            {editando && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow">
                <FaCamera size={12} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {usuario.nome || usuario.displayName || "Utilizador Conectamoz"}
            </h2>
            <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              {posts.length} {posts.length === 1 ? "Publicação" : "Publicações"}
            </p>
          </div>
        </div>

        {/* Biografia */}
        {usuario.bio && !editando && (
          <p className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {usuario.bio}
          </p>
        )}

        {/* Botão Editar */}
        {isOwnProfile && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
          >
            <FaEdit size={14} /> Editar Perfil
          </button>
        )}

        {/* Formulário de Edição */}
        {editando && (
          <form onSubmit={salvarPerfil} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Nome</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Biografia</label>
              <textarea
                value={novaBio}
                onChange={(e) => setNovaBio(e.target.value)}
                rows={3}
                placeholder="Escreve algo sobre ti..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                {salvando ? "A guardar..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditando(false);
                  setFotoPreview(usuario.fotoUrl || usuario.photoURL || null);
                  setNovaFoto(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lista de Publicações do Utilizador */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-800 px-1">Publicações</h3>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500 text-sm border border-gray-100">
            Nenhuma publicação feita até ao momento.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              autorId={post.autorId}
              author={post.author || post.autorNome}
              content={post.content || post.conteudo}
              likes={post.curtidas || post.likes || []}
              comentarios={post.comentarios || []}
              imagemUrl={post.imagemUrl}
              videoUrl={post.videoUrl}
              autorFoto={post.autorFoto}
            />
          ))
        )}
      </div>
    </div>
  );
}