import React from "react";
import { Sparkles, Hammer } from "lucide-react";

export default function EmConstrucao({ 
  titulo = "KonnexVib em Construção", 
  mensagem = "Estamos a preparar novidades incríveis para si. Volte muito em breve!" 
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
      {/* GLOW DE FUNDO */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-40 w-40 rounded-full bg-purple-600/30 blur-3xl animate-pulse" />

        {/* LOGÓTIPO DA APP */}
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-2xl p-1">
          <div className="h-full w-full bg-slate-900 rounded-[22px] flex items-center justify-center overflow-hidden">
            {/* Caso tenhas a imagem do logo na pasta public */}
            <img 
              src="/logo.png" 
              alt="KonnexVib Logo" 
              className="h-20 w-20 object-contain drop-shadow-md"
              onError={(e) => {
                // Fallback visual caso a imagem não esteja no diretório
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* TÍTULO E BADGE */}
      <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 border border-purple-500/20 mb-4">
        <Hammer size={14} className="animate-bounce" />
        <span>Modo de Desenvolvimento</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-200">
        {titulo}
      </h1>

      <p className="max-w-md text-sm text-slate-400 leading-relaxed mb-8">
        {mensagem}
      </p>

      {/* RODAPÉ COM SPARKLES */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Sparkles size={14} className="text-yellow-400" />
        <span>KonnexVib — Connect Your Vibe</span>
      </div>
    </div>
  );
}