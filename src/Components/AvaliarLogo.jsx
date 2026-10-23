import React, { useState } from "react";
import { Crown, Radio, Sparkles, Check } from "lucide-react";

export default function AvaliarLogo() {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(1);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="text-center max-w-lg mb-8">
        <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
          KonnexVib Branding
        </span>
        <h1 className="text-3xl font-extrabold mt-1">Escolha o Teu Logótipo</h1>
        <p className="text-slate-400 text-sm mt-2">
          Avalie as 3 propostas visuais abaixo e diz-me qual combina melhor com a tua visão do app.
        </p>
      </div>

      {/* ÁREA DE EXIBIÇÃO DO LOGO SELECIONADO */}
      <div className="mb-8 p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden w-full max-w-xs">
        <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full" />
        
        {/* LOGO 1: COROA MODERNA + ONDA DE VIBE */}
        {opcaoSelecionada === 1 && (
          <svg width="160" height="160" viewBox="0 0 512 512" fill="none">
            <defs>
              <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#635BFF" />
                <stop offset="100%" stopColor="#9333EA" />
              </linearGradient>
              <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#FB923C" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="128" fill="url(#bg1)" />
            <path d="M120 220 L180 340 L256 160 L332 340 L392 220 L350 380 L162 380 Z" fill="url(#gold1)" />
            <circle cx="120" cy="200" r="20" fill="#FACC15" />
            <circle cx="256" cy="140" r="24" fill="#FACC15" />
            <circle cx="392" cy="200" r="20" fill="#FACC15" />
            <path d="M150 420 Q256 460 362 420" stroke="#00F0FF" strokeWidth="24" strokeLinecap="round" />
          </svg>
        )}

        {/* LOGO 2: CONEXÃO VIBRANTE (LETRA K + V) */}
        {opcaoSelecionada === 2 && (
          <svg width="160" height="160" viewBox="0 0 512 512" fill="none">
            <defs>
              <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>
              <linearGradient id="neon2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#635BFF" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="128" fill="url(#bg2)" stroke="#334155" strokeWidth="8" />
            <path d="M140 120 V392 M140 256 L320 120 M140 256 L320 392" stroke="url(#neon2)" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="320" cy="120" r="28" fill="#FACC15" />
          </svg>
        )}

        {/* LOGO 3: MINIMALISTA VIP GOLD */}
        {opcaoSelecionada === 3 && (
          <svg width="160" height="160" viewBox="0 0 512 512" fill="none">
            <defs>
              <linearGradient id="gold3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE57F" />
                <stop offset="50%" stopColor="#FFC107" />
                <stop offset="100%" stopColor="#FF8F00" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="128" fill="#111827" />
            <rect x="20" y="20" width="472" height="472" rx="108" stroke="url(#gold3)" strokeWidth="12" strokeOpacity="0.4" />
            <path d="M160 180 L210 300 L256 200 L302 300 L352 180 L330 350 L182 350 Z" fill="url(#gold3)" />
            <circle cx="256" cy="170" r="18" fill="#FFE57F" />
          </svg>
        )}

        <span className="mt-4 font-bold text-lg text-slate-200">
          Opção {opcaoSelecionada}
        </span>
      </div>

      {/* PAINEL DE SELEÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        <button
          onClick={() => setOpcaoSelecionada(1)}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
            opcaoSelecionada === 1
              ? "bg-purple-600/20 border-purple-500 text-white"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div>
            <p className="font-bold text-sm text-white">Opção 1</p>
            <p className="text-xs text-slate-400">Coroa VIP + Onda Vibe</p>
          </div>
          {opcaoSelecionada === 1 && <Check size={18} className="text-purple-400" />}
        </button>

        <button
          onClick={() => setOpcaoSelecionada(2)}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
            opcaoSelecionada === 2
              ? "bg-purple-600/20 border-purple-500 text-white"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div>
            <p className="font-bold text-sm text-white">Opção 2</p>
            <p className="text-xs text-slate-400">Neon "K" Tecnológico</p>
          </div>
          {opcaoSelecionada === 2 && <Check size={18} className="text-purple-400" />}
        </button>

        <button
          onClick={() => setOpcaoSelecionada(3)}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
            opcaoSelecionada === 3
              ? "bg-purple-600/20 border-purple-500 text-white"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div>
            <p className="font-bold text-sm text-white">Opção 3</p>
            <p className="text-xs text-slate-400">Premium Gold Luxo</p>
          </div>
          {opcaoSelecionada === 3 && <Check size={18} className="text-purple-400" />}
        </button>
      </div>
    </div>
  );
}