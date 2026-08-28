import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import Navbar from "../Components/Navbar";

import Splash from "../Pages/Splash";
import Login from "../Pages/Login";
import Register from "../Pages/Register";

import Home from "../Pages/Home";
import Jobs from "../Pages/Jobs";
import Chat from "../Pages/Chat";

import Profile from "../Pages/Profile";
import EditProfile from "../Pages/EditProfile";

import Search from "../Pages/Search";
import Notifications from "../Pages/Notifications";

import PostDetail from "../Pages/PostDetail";
import Editor from "../Pages/Editor";

import Pagamento from "../Pages/Pagamento";
import HistoricoTransacoes from "../Pages/HistoricoTransacoes";

import Admin from "../Pages/Admin";


function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function PublicOnlyRoute({ user, children }) {
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}


export default function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao verificar autenticação:", error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold tracking-wide">
          KonnexVib
        </h1>

        <p className="mt-2 text-sm opacity-80 animate-pulse">
          A carregar sessão...
        </p>
      </div>
    );
  }


  return (
    <>
      {user && <Navbar user={user} />}

      <main
        className={
          user
            ? "pt-16 min-h-screen bg-gray-100"
            : "min-h-screen"
        }
      >
        <Routes>

          <Route
            path="/"
            element={
              <PublicOnlyRoute user={user}>
                <Splash />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute user={user}>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute user={user}>
                <Register />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute user={user}>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute user={user}>
                <Jobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute user={user}>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil/:userId"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              user ? (
                <Navigate
                  to={`/profile/${user.uid}`}
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute user={user}>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute user={user}>
                <Search />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute user={user}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notificacoes"
            element={
              <Navigate
                to="/notifications"
                replace
              />
            }
          />

          <Route
            path="/post/:id"
            element={
              <ProtectedRoute user={user}>
                <PostDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor"
            element={
              <ProtectedRoute user={user}>
                <Editor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pagamento"
            element={
              <ProtectedRoute user={user}>
                <Pagamento />
              </ProtectedRoute>
            }
          />

          <Route
            path="/historico-transacoes"
            element={
              <ProtectedRoute user={user}>
                <HistoricoTransacoes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={user ? "/home" : "/"}
                replace
              />
            }
          />

        </Routes>
      </main>
    </>
  );
}