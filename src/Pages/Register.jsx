import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import ErrorMessage from "../components/ErrorMessage";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(email, password, name, username);
      navigate("/home");
    } catch (err) {
      setError("Erro ao criar conta. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col justify-center">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Konnex<span className="text-[#635BFF]">Vib</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Cria a tua conta e começa a partilhar.</p>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Nome de Utilizador</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Palavra-passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#635BFF] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "A criar conta..." : "Criar Conta"}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-8">
        Já tens uma conta?{" "}
        <Link to="/login" className="text-[#635BFF] font-bold hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}