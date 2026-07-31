import React, { useState } from "react";
import { db, auth } from "../Firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreateJobModal({ isOpen, onClose }) {
  const [titulo, setTitulo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cidade, setCidade] = useState("Maputo");
  const [descricao, setDescricao] = useState("");
  const [contacto, setContacto] = useState("");
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim() || !user) return;

    try {
      setLoading(true);
      await addDoc(collection(db, "vagas"), {
        titulo: titulo.trim(),
        empresa: empresa.trim() || "Não especificada",
        cidade: cidade.trim(),
        descricao: descricao.trim(),
        contacto: contacto.trim() || user.email,
        autorId: user.uid,
        autorNome: user.displayName || user.email.split("@")[0],
        criadoEm: serverTimestamp(),
      });

      // Limpar campos
      setTitulo("");
      setEmpresa("");
      setDescricao("");
      setContacto("");
      onClose();
    } catch (error) {
      console.error("Erro ao publicar vaga:", error);
      alert("Erro ao publicar oportunidade. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-800">💼 Publicar Oportunidade</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Título da Vaga / Função *</label>
            <input
              type="text"
              required
              placeholder="Ex: Desenvolvedor Front-end, Contabilista"
              className="w-full p-2.5 text-sm border rounded-lg mt-1 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Empresa / Organização</label>
              <input
                type="text"
                placeholder="Ex: TechMoz, Particular"
                className="w-full p-2.5 text-sm border rounded-lg mt-1 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Cidade / Localização *</label>
              <select
                className="w-full p-2.5 text-sm border rounded-lg mt-1 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              >
                <option value="Maputo">Maputo</option>
                <option value="Matola">Matola</option>
                <option value="Beira">Beira</option>
                <option value="Nampula">Nampula</option>
                <option value="Tete">Tete</option>
                <option value="Quelimane">Quelimane</option>
                <option value="Pemba">Pemba</option>
                <option value="Outra / Remoto">Outra / Remoto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Contacto / E-mail para Candidatura</label>
            <input
              type="text"
              placeholder="Ex: vagas@empresa.co.mz ou +258 84..."
              className="w-full p-2.5 text-sm border rounded-lg mt-1 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Descrição dos Requisitos e Tarefas *</label>
            <textarea
              rows="4"
              required
              placeholder="Detalhe os requisitos para a vaga..."
              className="w-full p-2.5 text-sm border rounded-lg mt-1 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "A publicar..." : "Publicar Vaga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}