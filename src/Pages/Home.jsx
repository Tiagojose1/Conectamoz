import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  FaRegImage,
  FaPlus,
  FaVideo,
  FaThumbsUp,
  FaRegCommentAlt,
  FaShare,
  FaEllipsisH,
} from "react-icons/fa";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const navigate = useNavigate();

  const { usuario } = useAuth();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingStories, setLoadingStories] = useState(true);

  const [errorPosts, setErrorPosts] = useState("");

  // ============================================================
  // PUBLICAÇÕES
  // ============================================================

  useEffect(() => {
    const postsRef = collection(db, "posts");

    const postsQuery = query(
      postsRef,
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const listaPosts = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setPosts(listaPosts);
        setLoadingPosts(false);
        setErrorPosts("");
      },
      (error) => {
        console.error(
          "Erro ao carregar publicações:",
          error
        );

        setLoadingPosts(false);

        setErrorPosts(
          "Não foi possível carregar as publicações."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // ============================================================
  // STORIES
  // ============================================================

  useEffect(() => {
    const storiesRef = collection(db, "stories");

    const storiesQuery = query(
      storiesRef,
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(
      storiesQuery,
      (snapshot) => {
        const listaStories = snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );

        setStories(listaStories);
        setLoadingStories(false);
      },
      (error) => {
        console.error(
          "Erro ao carregar Stories:",
          error
        );

        setLoadingStories(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ============================================================
  // CURTIR
  // ============================================================

  const handleLike = async (post) => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    try {
      const postRef = doc(db, "posts", post.id);

      const curtidas = Array.isArray(post.curtidas)
        ? post.curtidas
        : [];

      const jaCurtiu = curtidas.includes(usuario.uid);

      if (jaCurtiu) {
        await updateDoc(postRef, {
          curtidas: arrayRemove(usuario.uid),
        });
      } else {
        await updateDoc(postRef, {
          curtidas: arrayUnion(usuario.uid),
        });
      }
    } catch (error) {
      console.error(
        "Erro ao atualizar gosto:",
        error
      );
    }
  };

  // ============================================================
  // PARTILHAR
  // ============================================================

  const handleShare = async (post) => {
    const url =
      `${window.location.origin}/post/${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "KonnexVib",
          text:
            post.conteudo ||
            "Veja esta publicação no KonnexVib.",
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        alert(
          "Link da publicação copiado!"
        );
      } else {
        alert(
          `Copie este link:\n${url}`
        );
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Erro ao partilhar:",
          error
        );
      }
    }
  };

  // ============================================================
  // FORMATAR DATA
  // ============================================================

  const formatarData = (data) => {
    if (!data) return "";

    try {
      const dataPost =
        typeof data?.toDate === "function"
          ? data.toDate()
          : new Date(data);

      if (Number.isNaN(dataPost.getTime())) {
        return "";
      }

      const agora = new Date();

      const diferenca =
        agora.getTime() -
        dataPost.getTime();

      const minutos = Math.floor(
        diferenca / (1000 * 60)
      );

      const horas = Math.floor(
        diferenca / (1000 * 60 * 60)
      );

      const dias = Math.floor(
        diferenca /
          (1000 * 60 * 60 * 24)
      );

      if (minutos < 1) {
        return "agora";
      }

      if (minutos < 60) {
        return `${minutos} min`;
      }

      if (horas < 24) {
        return `${horas} h`;
      }

      if (dias < 7) {
        return `${dias} d`;
      }

      return dataPost.toLocaleDateString(
        "pt-PT"
      );
    } catch {
      return "";
    }
  };

  // ============================================================
  // FOTO DO UTILIZADOR
  // ============================================================

  const fotoUsuario =
    usuario?.photoURL ||
    usuario?.fotoURL ||
    "https://ui-avatars.com/api/?name=KonnexVib&background=635BFF&color=fff";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-16 font-sans text-gray-900">

      {/* ======================================================
          CRIAR PUBLICAÇÃO
      ====================================================== */}

      <section className="bg-white px-4 py-3 mt-1 flex items-center gap-3 border-b border-gray-100">

        <img
          src={fotoUsuario}
          alt="Perfil"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />

        <button
          onClick={() =>
            navigate("/create-post")
          }
          className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition rounded-full px-4 py-2.5 text-gray-400 text-sm"
        >
          O que está a acontecer?
        </button>

        <button
          onClick={() =>
            navigate("/create-post")
          }
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#635BFF] transition"
          aria-label="Adicionar foto"
        >
          <FaRegImage size={21} />

          <span className="text-[10px] font-medium">
            Foto
          </span>
        </button>

        <button
          onClick={() =>
            navigate("/create-post")
          }
          className="hidden sm:flex flex-col items-center justify-center text-gray-500 hover:text-[#635BFF] transition"
          aria-label="Adicionar vídeo"
        >
          <FaVideo size={19} />

          <span className="text-[10px] font-medium">
            Vídeo
          </span>
        </button>

      </section>

      {/* ======================================================
          STORIES
      ====================================================== */}

      <section className="bg-white py-4 mt-2 border-y border-gray-100">

        <div className="flex items-center justify-between px-4 mb-3">

          <h2 className="font-bold text-base text-gray-900">
            Stories
          </h2>

          <button
            onClick={() =>
              navigate("/stories")
            }
            className="text-xs font-semibold text-[#635BFF] hover:underline"
          >
            Ver todos
          </button>

        </div>

        <div className="flex items-center gap-3 px-4 overflow-x-auto">

          {/* CRIAR STORY */}

          <button
            onClick={() =>
              navigate("/create-story")
            }
            className="relative w-24 h-36 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#635BFF] to-[#3B28CC] shadow-sm"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">

              <div className="w-9 h-9 rounded-full bg-white text-[#635BFF] flex items-center justify-center mb-2 shadow">
                <FaPlus size={14} />
              </div>

              <span className="text-[11px] font-semibold">
                Criar Story
              </span>

            </div>
          </button>

          {/* STORIES */}

          {loadingStories ? (
            <div className="text-sm text-gray-400 px-3">
              A carregar...
            </div>
          ) : stories.length === 0 ? (
            <div className="text-sm text-gray-400 px-3">
              Ainda não há Stories.
            </div>
          ) : (
            stories.map((story) => (
              <button
                key={story.id}
                onClick={() =>
                  navigate(
                    `/stories/${story.id}`
                  )
                }
                className="flex flex-col items-center flex-shrink-0"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500">

                  <img
                    src={
                      story.autorFoto ||
                      story.foto ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt={
                      story.autorNome ||
                      "Story"
                    }
                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  />

                </div>

                <span className="text-xs font-medium text-gray-700 mt-1.5 max-w-16 truncate">
                  {story.autorNome ||
                    "Utilizador"}
                </span>

              </button>
            ))
          )}

        </div>

      </section>

      {/* ======================================================
          FEED
      ====================================================== */}

      <main className="mt-2 space-y-2">

        {loadingPosts ? (

          <div className="bg-white py-12 text-center text-gray-500">
            <div className="animate-pulse">
              A carregar publicações...
            </div>
          </div>

        ) : errorPosts ? (

          <div className="bg-white py-12 text-center px-4">

            <p className="text-red-500 font-medium">
              {errorPosts}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Verifique a ligação ao Firebase.
            </p>

          </div>

        ) : posts.length === 0 ? (

          <div className="bg-white py-14 text-center px-4">

            <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <FaRegImage size={22} />
            </div>

            <h3 className="font-bold text-gray-800 mt-4">
              Nenhuma publicação ainda
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Seja o primeiro a publicar algo no KonnexVib.
            </p>

            <button
              onClick={() =>
                navigate("/create-post")
              }
              className="mt-5 bg-[#635BFF] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#5148d9] transition"
            >
              Criar publicação
            </button>

          </div>

        ) : (

          posts.map((post) => {

            const curtidas =
              Array.isArray(post.curtidas)
                ? post.curtidas
                : [];

            const comentarios =
              Array.isArray(
                post.comentarios
              )
                ? post.comentarios
                : [];

            const jaCurtiu =
              usuario &&
              curtidas.includes(
                usuario.uid
              );

            const autorId =
              post.autorId ||
              post.uid;

            return (

              <article
                key={post.id}
                className="bg-white border-y border-gray-100"
              >

                {/* CABEÇALHO */}

                <div className="flex items-center justify-between px-4 py-3">

                  <button
                    onClick={() => {
                      if (autorId) {
                        navigate(
                          `/profile/${autorId}`
                        );
                      }
                    }}
                    className="flex items-center gap-3 text-left"
                  >

                    <img
                      src={
                        post.autorFoto ||
                        post.fotoPerfil ||
                        "https://ui-avatars.com/api/?name=User"
                      }
                      alt={
                        post.autorNome ||
                        "Utilizador"
                      }
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />

                    <div>

                      <h3 className="font-bold text-sm text-gray-900 leading-tight">
                        {post.autorNome ||
                          "Utilizador"}
                      </h3>

                      <p className="text-xs text-gray-400">
                        {formatarData(
                          post.criadoEm
                        )}{" "}
                        · 🌐
                      </p>

                    </div>

                  </button>

                  <button
                    className="text-gray-400 hover:text-gray-600 p-2"
                    aria-label="Mais opções"
                  >
                    <FaEllipsisH size={16} />
                  </button>

                </div>

                {/* TEXTO */}

                {post.conteudo && (
                  <p className="px-4 pb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {post.conteudo}
                  </p>
                )}

                {/* IMAGEM */}

                {post.imagemUrl && (
                  <div className="w-full max-h-[520px] overflow-hidden bg-gray-100">

                    <img
                      src={post.imagemUrl}
                      alt="Publicação"
                      className="w-full max-h-[520px] object-cover"
                      loading="lazy"
                    />

                  </div>
                )}

                {/* VÍDEO */}

                {post.videoUrl && (
                  <div className="w-full bg-black">

                    <video
                      src={post.videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-[520px] object-contain"
                    />

                  </div>
                )}

                {/* ESTATÍSTICAS */}

                <div className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 border-b border-gray-100">

                  <div className="flex items-center gap-2">

                    {curtidas.length > 0 && (
                      <span className="flex items-center gap-1">

                        <span className="w-5 h-5 rounded-full bg-[#635BFF] flex items-center justify-center text-[10px] text-white">
                          👍
                        </span>

                        <span className="font-medium">
                          {curtidas.length}
                        </span>

                      </span>
                    )}

                  </div>

                  <div className="flex items-center gap-3 font-medium">

                    <button
                      onClick={() =>
                        navigate(
                          `/post/${post.id}`
                        )
                      }
                    >
                      {comentarios.length}{" "}
                      comentários
                    </button>

                    <span>
                      {post.partilhas || 0}{" "}
                      partilhas
                    </span>

                  </div>

                </div>

                {/* AÇÕES */}

                <div className="flex items-center justify-around py-2 text-gray-600 text-sm font-medium">

                  {/* GOSTO */}

                  <button
                    onClick={() =>
                      handleLike(post)
                    }
                    className={`flex items-center gap-2 transition py-2 px-3 rounded-lg ${
                      jaCurtiu
                        ? "text-[#635BFF]"
                        : "hover:text-[#635BFF]"
                    }`}
                  >
                    <FaThumbsUp size={16} />

                    <span>
                      {jaCurtiu
                        ? "Gostei"
                        : "Gosto"}
                    </span>
                  </button>

                  {/* COMENTAR */}

                  <button
                    onClick={() =>
                      navigate(
                        `/post/${post.id}`
                      )
                    }
                    className="flex items-center gap-2 hover:text-[#635BFF] transition py-2 px-3 rounded-lg"
                  >
                    <FaRegCommentAlt size={16} />

                    <span>
                      Comentar
                    </span>
                  </button>

                  {/* PARTILHAR */}

                  <button
                    onClick={() =>
                      handleShare(post)
                    }
                    className="flex items-center gap-2 hover:text-[#635BFF] transition py-2 px-3 rounded-lg"
                  >
                    <FaShare size={16} />

                    <span>
                      Partilhar
                    </span>
                  </button>

                </div>

              </article>
            );
          })
        )}

      </main>

    </div>
  );
}