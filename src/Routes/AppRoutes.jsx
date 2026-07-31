import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase.js";

// Páginas do Projeto ConectMoz
import Splash from "../Pages/Splash";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import Home from "../Pages/Home";
import Jobs from "../Pages/Jobs";
import Chat from "../Pages/Chat";
import Profile from "../Pages/Profile";

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
      <Routes>
        {/* Rotas Públicas (Apenas para utilizadores não autenticados) */}
        <Route path="/" element={user ? <Navigate to="/home" /> : <Splash />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />

        {/* Rotas Protegidas (Requerem login) */}
        <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/jobs" element={user ? <Jobs /> : <Navigate to="/login" />} />
        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

        {/* Rota de Redirecionamento Padrão */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
}
