import React, { useState } from "react";
import { db, auth } from "../Firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreatePost() {
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!conteudo.trim() || !user) return;

    try {
      setLoading(true);

      await addDoc(collection(db, "posts"), {
        conteudo: conteudo.trim(),
        autorId: user.uid,
        autorNome: user.displayName || user.email.split("@")[0],
        autorEmail: user.email,
        curtidas: [],
        criadoEm: serverTimestamp()
      });

      setConteudo("");
    } catch (error) {
      console.error("Erro ao criar publicação:", error);
      alert("Não foi possível publicar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          rows="3"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="O que está a acontecer ou que oportunidade quer partilhar?"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading || !conteudo.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "A publicar..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
