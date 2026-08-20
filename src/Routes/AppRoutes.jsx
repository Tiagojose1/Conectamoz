import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Componentes estáticos
import Navbar from "../Components/Navbar";

// Páginas públicas
import Splash from "../Pages/Splash";
import Login from "../Pages/Login";
import Register from "../Pages/Register";

// Code Splitting / Lazy Loading
const Home = lazy(() => import("../Pages/Home"));
const Jobs = lazy(() => import("../Pages/Jobs"));
const Chat = lazy(() => import("../Pages/Chat"));
const Profile = lazy(() => import("../Pages/Profile"));
const EditProfile = lazy(() => import("../Pages/EditProfile"));
const Search = lazy(() => import("../Pages/Search"));
const Notifications = lazy(() => import("../Pages/Notifications"));
const Admin = lazy(() => import("../Pages/Admin"));
const PostDetail = lazy(() => import("../Pages/PostDetail"));
const Pagamento = lazy(() => import("../Pages/Pagamento"));
const HistoricoTransacoes = lazy(() => import("../Pages/HistoricoTransacoes"));

// Componente Wrapper para Rotas Protegidas
const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/login" replace />;
};

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
        <h1 className="text-3xl mb-2">Conectamoz</h1>
        <p className="text-sm opacity-80 animate-pulse">A carregar sessão...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Navbar visível apenas para utilizadores autenticados */}
      {user && <Navbar />}

      <div className={user ? "pt-20 min-h-screen bg-gray-100" : "min-h-screen"}>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
              A carregar conteúdo...
            </div>
          }
        >
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={user ? <Navigate to="/home" /> : <Splash />} />
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />

            {/* Rotas Protegidas */}
            <Route path="/home" element={<ProtectedRoute user={user}><Home /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute user={user}><Jobs /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute user={user}><Chat /></ProtectedRoute>} />
            
            {/* Perfis */}
            <Route path="/profile/:userId" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
            <Route path="/perfil/:userId" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
            <Route path="/profile" element={user ? <Navigate to={`/profile/${user.uid}`} replace /> : <Navigate to="/login" />} />
            <Route path="/edit-profile" element={<ProtectedRoute user={user}><EditProfile /></ProtectedRoute>} />
            
            {/* Pesquisa e Notificações */}
            <Route path="/search" element={<ProtectedRoute user={user}><Search /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute user={user}><Notifications /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<Navigate to="/notifications" replace />} />

            {/* Post Único */}
            <Route path="/post/:id" element={<ProtectedRoute user={user}><PostDetail /></ProtectedRoute>} />

            {/* Finanças / Carteira M-Pesa e e-Mola */}
            <Route path="/pagamento" element={<ProtectedRoute user={user}><Pagamento /></ProtectedRoute>} />
            <Route path="/historico-transacoes" element={<ProtectedRoute user={user}><HistoricoTransacoes /></ProtectedRoute>} />

            {/* Gestão */}
            <Route path="/admin" element={<ProtectedRoute user={user}><Admin /></ProtectedRoute>} />

            {/* Rota Fallback */}
            <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}