import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { FaBriefcase, FaPlus, FaMapMarkerAlt, FaTrash, FaEnvelope, FaPhone } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import BottomNavigation from "../Components/BottomNavigation";
import CreateJobModal from "../Components/CreateJobModal";

export default function Jobs() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCidade, setFiltroCidade] = useState("Todas");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    // Consulta limitada às 15 vagas mais recentes para otimizar leitura e custos
    const q = query(
      collection(db, "vagas"),
      orderBy("criadoEm", "desc"),
      limit(15)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVagas(list);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar vagas:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleApagarVaga = async (vagaId) => {
    if (window.confirm("Tem certeza que deseja apagar esta vaga de emprego?")) {
      try {
        await deleteDoc(doc(db, "vagas", vagaId));
      } catch (error) {
        console.error("Erro ao apagar vaga:", error);
        alert("Não foi possível apagar a vaga.");
      }
    }
  };

  const vagasFiltradas =
    filtroCidade === "Todas"
      ? vagas
      : vagas.filter((vaga) => vaga.cidade === filtroCidade);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar user={user} />

      <main className="max-w-xl mx-auto pt-4 px-4 space-y-4">
        {/* Cabeçalho do Módulo */}
        <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <FaBriefcase size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg leading-tight">
                Oportunidades & Empregos
              </h1>
              <p className="text-xs text-gray-500">
                Encontre ou publique vagas de trabalho
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-2 rounded-lg transition"
          >
            <FaPlus size={12} />
            <span>Anunciar Vaga</span>
          </button>
        </div>

        {/* Filtro por Cidade */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {["Todas", "Maputo", "Matola", "Beira", "Nampula", "Tete", "Outra / Remoto"].map(
            (cidade) => (
              <button
                key={cidade}
                onClick={() => setFiltroCidade(cidade)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                  filtroCidade === cidade
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {cidade}
              </button>
            )
          )}
        </div>

        {/* Lista de Vagas */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
            A carregar oportunidades...
          </div>
        ) : vagasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border text-gray-500 shadow-sm">
            <p className="font-semibold text-gray-700">Nenhuma vaga encontrada.</p>
            <p className="text-xs text-gray-400 mt-1">
              Seja o primeiro a publicar uma oportunidade nesta localização!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vagasFiltradas.map((vaga) => {
              const eMinhaVaga = user && user.uid === vaga.autorId;
              const isEmail = vaga.contacto?.includes("@");

              return (
                <div
                  key={vaga.id}
                  className="bg-white p-4 rounded-xl shadow-sm border space-y-2 hover:border-blue-200 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-bold text-gray-900 text-base">
                        {vaga.titulo}
                      </h2>
                      <p className="text-xs font-semibold text-blue-600">
                        {vaga.empresa}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                        <FaMapMarkerAlt size={10} className="text-gray-400" />
                        <span>{vaga.cidade}</span>
                      </span>

                      {eMinhaVaga && (
                        <button
                          onClick={() => handleApagarVaga(vaga.id)}
                          className="text-gray-400 hover:text-red-600 text-xs p-1 transition"
                          title="Apagar Vaga"
                        >
                          <FaTrash size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed pt-1">
                    {vaga.descricao}
                  </p>

                  <div className="pt-2 border-t flex justify-between items-center text-xs">
                    <span className="text-gray-400">
                      Publicado por: {vaga.autorNome}
                    </span>

                    {vaga.contacto && (
                      <a
                        href={
                          isEmail
                            ? `mailto:${vaga.contacto}`
                            : `tel:${vaga.contacto}`
                        }
                        className="flex items-center space-x-1.5 bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                      >
                        {isEmail ? <FaEnvelope size={12} /> : <FaPhone size={12} />}
                        <span>Candidatar-se</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <BottomNavigation />
    </div>
  );
}