import React from "react";

export default function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 animate-pulse shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-1/3" />
          <div className="h-2.5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>

      {/* Conteúdo de Texto */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>

      {/* Bloco da Imagem/Vídeo */}
      <div className="w-full h-64 bg-gray-200 rounded-xl mb-3" />

      {/* Botões */}
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}