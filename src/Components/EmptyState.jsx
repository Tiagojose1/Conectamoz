import React from "react";

export default function EmptyState({ message = "Nenhum conteúdo encontrado." }) {
  return (
    <div className="text-center py-12 px-4 text-gray-400">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}