import React from "react";

export default function KonnexVibLogo({ size = 120, className = "" }) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="rounded-[22%] shadow-xl"
      >
        <defs>
          {/* Gradiente da Opção 10: Rosa -> Roxo -> Azul */}
          <linearGradient id="gradientMaster" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Fundo do Ícone com Cantos Arredondados */}
        <rect width="512" height="512" rx="112" fill="url(#gradientMaster)" />

        {/* Iniciais KV */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="System-UI, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="210"
          letterSpacing="-6"
        >
          KV
        </text>

        {/* Nome KONNEXVIB */}
        <text
          x="50%"
          y="82%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="System-UI, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="34"
          letterSpacing="5"
          opacity="0.95"
        >
          KONNEXVIB
        </text>
      </svg>
    </div>
  );
}