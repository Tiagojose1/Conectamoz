import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}