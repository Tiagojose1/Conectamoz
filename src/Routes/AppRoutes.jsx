import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Componentes estáticos
import Navbar from "../Components/Navbar";

// Páginas de acesso imediato (Públicas)
import Splash from "../Pages/Splash";
import Login from "../Pages/Login";
import Register from "../Pages/Register";

// Páginas carregadas sob procura (Code Splitting / Lazy Loading)
const Home = lazy(() => import("../Pages/Home"));
const Jobs = lazy(() => import("../Pages/Jobs"));
const Chat = lazy(() => import("../Pages/Chat"));
const Profile = lazy(() => import("../Pages/Profile"));
const EditProfile = lazy(() => import("../Pages/EditProfile"));
const Search = lazy(() => import("../Pages/Search"));
const Notifications = lazy(() => import("../Pages/Notifications"));
const Admin = lazy(() => import("../Pages/Admin"));
const PostDetail = lazy(() => import("../Pages/PostDetail"));
const Pagamento = lazy(() => import("../Pages/Pagamento")); // 📍 Rota da carteira M-Pesa / e-Mola
const HistoricoTransacoes = lazy(() => import("../Pages/HistoricoTransacoes")); // 📍 Histórico de Transações

export default function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white font-bold">
        <h1 className="text-3xl mb-2">ConectMoz</h1>
        <p className="text-sm opacity-80 animate-pulse">A carregar sessão...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Exibe a Navbar do topo apenas se o utilizador estiver autenticado */}
      {user && <Navbar />}

      {/* Padding pt-28 quando autenticado para evitar sobreposição da Navbar */}
      <div className={user ? "pt-28 min-h-screen bg-gray-100" : "min-h-screen"}>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
              A carregar...
            </div>
          }
        >
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={user ? <Navigate to="/home" /> : <Splash />} />
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />

            {/* Rotas Protegidas */}
            <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route path="/jobs" element={user ? <Jobs /> : <Navigate to="/login" />} />
            <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />
            <Route path="/search" element={user ? <Search /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
            
            {/* 📍 Rota da Carteira & Pagamento */}
            <Route path="/pagamento" element={user ? <Pagamento /> : <Navigate to="/login" />} />

            {/* 📍 Rota do Histórico de Transações */}
            <Route path="/historico-transacoes" element={user ? <HistoricoTransacoes /> : <Navigate to="/login" />} />

            {/* 📍 Rota do Post Individual */}
            <Route path="/post/:id" element={user ? <PostDetail /> : <Navigate to="/login" />} />

            {/* Redirecionamento Padrão */}
            <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}