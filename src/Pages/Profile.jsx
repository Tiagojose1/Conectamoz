// src/Pages/Profile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { auth, db } from "../firebase";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { uploadParaCloudinary } from "../Utils/Cloudinary";

import PostCard from "../Components/PostCard";

import {
  FaArrowLeft,
  FaEdit,
  FaUserCircle,
  FaCamera,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  const isOwnProfile =
    currentUser && currentUser.uid === userId;

  // ================================
  // ESTADOS
  // ================================

  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);

  const [carregando, setCarregando] = useState(true);

  // Edição
  const [editando, setEditando] = useState(false);

  const [novoNome, setNovoNome] = useState("");
  const [novaBio, setNovaBio] = useState("");

  const [novaFoto, setNovaFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [salvando, setSalvando] = useState(false);

  // ================================
  // CARREGAR PERFIL
  // ================================

  useEffect(() => {
    const carregarPerfilEPosts = async () => {
      if (!userId) return;

      try {
        setCarregando(true);

        // --------------------------------
        // 1. PERFIL
        // --------------------------------

        const userRef = doc(db, "users", userId);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const dadosUser = userSnap.data();

          setUsuario(dadosUser);

          setNovoNome(
            dadosUser.nome ||
              dadosUser.displayName ||
              ""
          );

          setNovaBio(
            dadosUser.bio || ""
          );

          setFotoPreview(
            dadosUser.fotoUrl ||
              dadosUser.photoURL ||
              null
          );
        } else {
          setUsuario(null);
        }

        // --------------------------------
        // 2. POSTS DO UTILIZADOR
        // --------------------------------

        const postsRef = collection(db, "posts");

        const q = query(
          postsRef,
          where("autorId", "==", userId)
        );

        const querySnapshot = await getDocs(q);

        const userPosts = querySnapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => {
            const dataA =
              a.criadoEm?.seconds ||
              a.createdAt?.seconds ||
              0;

            const dataB =
              b.criadoEm?.seconds ||
              b.createdAt?.seconds ||
              0;

            return dataB - dataA;
          });

        setPosts(userPosts);
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfilEPosts();
  }, [userId]);

  // ================================
  // ESCOLHER FOTO
  // ================================

  const handleFotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Verificar se é imagem
    if (!file.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    // Limite de 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert(
        "A imagem deve ter no máximo 10 MB."
      );
      return;
    }

    setNovaFoto(file);

    const previewUrl =
      URL.createObjectURL(file);

    setFotoPreview(previewUrl);
  };

  // ================================
  // CANCELAR EDIÇÃO
  // ================================

  const cancelarEdicao = () => {
    setEditando(false);

    setNovoNome(
      usuario?.nome ||
        usuario?.displayName ||
        ""
    );

    setNovaBio(
      usuario?.bio || ""
    );

    setFotoPreview(
      usuario?.fotoUrl ||
        usuario?.photoURL ||
        null
    );

    setNovaFoto(null);
  };

  // ================================
  // SALVAR PERFIL
  // ================================

  const salvarPerfil = async (event) => {
    event.preventDefault();

    if (!isOwnProfile) {
      alert(
        "Não tens permissão para editar este perfil."
      );
      return;
    }

    if (!novoNome.trim()) {
      alert("Digite o seu nome.");
      return;
    }

    try {
      setSalvando(true);

      // --------------------------------
      // FOTO ATUAL
      // --------------------------------

      let urlFotoFinal =
        usuario?.fotoUrl ||
        usuario?.photoURL ||
        "";

      // --------------------------------
      // UPLOAD PARA CLOUDINARY
      // --------------------------------

      if (novaFoto) {
        const resultado =
          await uploadParaCloudinary(
            novaFoto,
            "profile"
          );

        urlFotoFinal =
          resultado?.secure_url ||
          resultado?.url ||
          "";

        if (!urlFotoFinal) {
          throw new Error(
            "O Cloudinary não devolveu o endereço da imagem."
          );
        }
      }

      // --------------------------------
      // DADOS DO UTILIZADOR
      // --------------------------------

      const userRef = doc(
        db,
        "users",
        userId
      );

      const novosDados = {
        nome: novoNome.trim(),

        displayName: novoNome.trim(),

        bio: novaBio.trim(),

        fotoUrl: urlFotoFinal,

        photoURL: urlFotoFinal,

        atualizadoEm: new Date(),
      };

      // --------------------------------
      // ATUALIZAR FIRESTORE
      // --------------------------------

      await updateDoc(
        userRef,
        novosDados
      );

      // --------------------------------
      // ATUALIZAR POSTS ANTIGOS
      // --------------------------------

      if (posts.length > 0) {
        const batchSize = 450;

        for (
          let i = 0;
          i < posts.length;
          i += batchSize
        ) {
          const batch = writeBatch(db);

          const chunk = posts.slice(
            i,
            i + batchSize
          );

          chunk.forEach((post) => {
            const postRef = doc(
              db,
              "posts",
              post.id
            );

            batch.update(postRef, {
              autorNome:
                novoNome.trim(),

              author:
                novoNome.trim(),

              autorFoto:
                urlFotoFinal,
            });
          });

          await batch.commit();
        }
      }

      // --------------------------------
      // ATUALIZAR ESTADO LOCAL
      // --------------------------------

      setUsuario((prev) => ({
        ...prev,
        ...novosDados,
      }));

      setPosts((prev) =>
        prev.map((post) => ({
          ...post,

          autorNome:
            novoNome.trim(),

          author:
            novoNome.trim(),

          autorFoto:
            urlFotoFinal,
        }))
      );

      setNovoNome(
        novoNome.trim()
      );

      setNovaBio(
        novaBio.trim()
      );

      setNovaFoto(null);

      setEditando(false);

      alert(
        "Perfil atualizado com sucesso!"
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar perfil:",
        error
      );

      alert(
        error?.message ||
          "Não foi possível atualizar o perfil."
      );
    } finally {
      setSalvando(false);
    }
  };

  // ================================
  // CARREGANDO
  // ================================

  if (carregando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner
            className="animate-spin text-blue-600"
            size={28}
          />

          <p className="text-sm text-gray-500">
            A carregar perfil...
          </p>
        </div>
      </div>
    );
  }

  // ================================
  // UTILIZADOR NÃO ENCONTRADO
  // ================================

  if (!usuario) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Utilizador não encontrado
        </h3>

        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Voltar ao Feed
        </button>
      </div>
    );
  }

  // ================================
  // NOME
  // ================================

  const nomeUsuario =
    usuario.nome ||
    usuario.displayName ||
    "Utilizador KonnexVib";

  // ================================
  // FOTO
  // ================================

  const fotoUsuario =
    usuario.fotoUrl ||
    usuario.photoURL ||
    null;

  // ================================
  // VERIFICADO
  // ================================

  const verificado =
    usuario.verificado ||
    usuario.isVerified ||
    false;

  // ================================
  // RENDER
  // ================================

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">

      {/* VOLTAR */}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        <FaArrowLeft size={14} />

        Voltar
      </button>

      {/* PERFIL */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

        <div className="flex items-center gap-4">

          {/* FOTO */}

          <div className="relative">

            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt={nomeUsuario}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-600"
              />
            ) : (
              <FaUserCircle className="w-20 h-20 text-gray-300" />
            )}

            {/* BOTÃO CÂMERA */}

            {editando &&
              isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow">

                  <FaCamera size={12} />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleFotoChange
                    }
                    className="hidden"
                  />
                </label>
              )}
          </div>

          {/* INFORMAÇÕES */}

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-1.5">

              <h2 className="text-xl font-bold text-gray-900 truncate">
                {nomeUsuario}
              </h2>

              {verificado && (
                <FaCheckCircle
                  className="text-blue-500 text-base shrink-0"
                  title="Conta Verificada"
                />
              )}
            </div>

            <p className="text-sm text-gray-500 truncate">
              {usuario.email ||
                currentUser?.email ||
                ""}
            </p>

            <p className="text-xs text-blue-600 font-semibold mt-1">
              {posts.length}{" "}
              {posts.length === 1
                ? "Publicação"
                : "Publicações"}
            </p>
          </div>
        </div>

        {/* BIO */}

        {usuario.bio &&
          !editando && (
            <p className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {usuario.bio}
            </p>
          )}

        {/* EDITAR */}

        {isOwnProfile &&
          !editando && (
            <button
              onClick={() =>
                setEditando(true)
              }
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
            >
              <FaEdit size={14} />

              Editar Perfil
            </button>
          )}

        {/* FORMULÁRIO */}

        {editando && (
          <form
            onSubmit={salvarPerfil}
            className="mt-4 space-y-3"
          >

            {/* NOME */}

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Nome
              </label>

              <input
                type="text"
                value={novoNome}
                onChange={(e) =>
                  setNovoNome(
                    e.target.value
                  )
                }
                maxLength={80}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* BIO */}

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Biografia
              </label>

              <textarea
                value={novaBio}
                onChange={(e) =>
                  setNovaBio(
                    e.target.value
                  )
                }
                rows={3}
                maxLength={250}
                placeholder="Escreve algo sobre ti..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* BOTÕES */}

            <div className="flex gap-2">

              <button
                type="submit"
                disabled={salvando}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <>
                    <FaSpinner className="animate-spin" />

                    A guardar...
                  </>
                ) : (
                  "Guardar"
                )}
              </button>

              <button
                type="button"
                onClick={cancelarEdicao}
                disabled={salvando}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                Cancelar
              </button>

            </div>
          </form>
        )}
      </div>

      {/* PUBLICAÇÕES */}

      <div className="space-y-4">

        <h3 className="text-base font-bold text-gray-800 px-1">
          Publicações
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500 text-sm border border-gray-100">
            Nenhuma publicação feita até ao momento.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}

              id={post.id}

              autorId={
                post.autorId
              }

              author={
                post.author ||
                post.autorNome ||
                nomeUsuario
              }

              content={
                post.content ||
                post.conteudo ||
                ""
              }

              likes={
                post.curtidas ||
                post.likes ||
                []
              }

              comentarios={
                post.comentarios ||
                []
              }

              imagemUrl={
                post.imagemUrl ||
                ""
              }

              videoUrl={
                post.videoUrl ||
                ""
              }

              autorFoto={
                post.autorFoto ||
                fotoUsuario ||
                ""
              }

              verificado={
                verificado ||
                post.verificado ||
                false
              }
            />
          ))
        )}
      </div>
    </div>
  );
}