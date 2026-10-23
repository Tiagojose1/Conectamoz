import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaShare,
  FaEllipsisH,
} from "react-icons/fa";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between p-4">

        <button
          onClick={() => navigate(`/profile/${post.autorId}`)}
          className="flex items-center gap-3"
        >
          <img
            src={post.avatar}
            alt={post.nome}
            className="h-11 w-11 rounded-full object-cover"
          />

          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">
              {post.nome}
            </h3>

            <p className="text-xs text-gray-500">
              {post.data}
            </p>
          </div>
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
          <FaEllipsisH className="text-gray-500" />
        </button>

      </div>

      {/* TEXTO */}
      {post.texto && (
        <div className="px-4 pb-4">
          <p className="text-sm leading-6 text-gray-800">
            {post.texto}
          </p>
        </div>
      )}

      {/* IMAGEM */}
      {post.imagem && (
        <div className="w-full bg-gray-100">
          <img
            src={post.imagem}
            alt="Publicação"
            className="max-h-[600px] w-full object-cover"
          />
        </div>
      )}

      {/* ESTATÍSTICAS */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
        <span>{post.curtidas + (liked ? 1 : 0)} curtidas</span>
        <span>{post.comentarios} comentários</span>
      </div>

      <div className="mx-4 border-t border-gray-100" />

      {/* AÇÕES */}
      <div className="grid grid-cols-3">

        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
            liked
              ? "text-[#635BFF]"
              : "text-gray-600 hover:text-[#635BFF]"
          }`}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
          Curtir
        </button>

        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-[#635BFF]"
        >
          <FaRegComment />
          Comentar
        </button>

        <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-[#635BFF]">
          <FaShare />
          Partilhar
        </button>

      </div>

    </article>
  );
}