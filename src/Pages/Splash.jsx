import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase.js";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário logado -> vai direto para o Feed
        navigate("/home");
      } else {
        // Sem usuário -> vai para a tela de Login
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-2">ConectMoz</h1>
      <p className="text-sm opacity-90 animate-pulse">Conectando Moçambique...</p>
    </div>
  );
}

export default Splash;