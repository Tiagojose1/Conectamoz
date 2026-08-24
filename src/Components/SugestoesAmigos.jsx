import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, limit, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function SugestoesAmigos() {
  const [novosMembros, setNovosMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarNovosMembros = async () => {
      try {
        const userAtual = auth.currentUser;
        const usersRef = collection(db, "users");

        // Busca até 15 utilizadores
        const querySnapshot = await getDocs(usersRef);
        const listaUtilizadores = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;

          // Filtra para remover o próprio usuário autenticado
          if (userAtual && docId !== userAtual.uid && data.uid !== userAtual.uid) {
            listaUtilizadores.push({
              id: docId,
              displayName: data.displayName || data.nome || "Membro ConectMoz",
              photoURL: data.photoURL || null,
              isPremium: data.isPremium || false,
              ...data,
            });
          }
        });

        // Limita a exibição para até 10 membros
        setNovosMembros(listaUtilizadores.slice(0, 10));
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarNovosMembros();
  }, []);

  if (carregando) {
    return <p className="text-xs text-gray-500 text-center py-2">A carregar novos membros...</p>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full my-4 border">
      <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center justify-between">
        <span>Novos Membros no ConectMoz 🌟</span>
        <span className="text-xs font-normal text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/search")}>
          Ver todos
        </span>
      </h2>

      {novosMembros.length === 0 ? (
        <p className="text-xs text-gray-500">Nenhum novo membro encontrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {novosMembros.map((membro) => (
            <div key={membro.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${membro.id}`)}
              >
                <img
                  src={membro.photoURL || "/default-avatar.png"}
                  alt={membro.displayName}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 leading-none">
                    {membro.displayName}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {membro.isPremium ? "Membro VIP 👑" : "Novo no ConectMoz"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/profile/${membro.id}`)}
                className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                Ver Perfil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SugestoesAmigos;