import React from "react";

export function KVCoinIcon({ className = "w-6 h-6", country = "MOÇAMBIQUE" }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente Dourado para Borda e Fundo */}
        <linearGradient id="goldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>

        <linearGradient id="goldInner" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A640F" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FFF1B8" />
        </linearGradient>

        {/* Anel para Texto em Curva */}
        <path
          id="textRing"
          d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
        />
      </defs>

      {/* Sombra Externa */}
      <circle cx="100" cy="100" r="95" fill="#543A02" opacity="0.4" />

      {/* Anel Externo Dourado */}
      <circle cx="100" cy="100" r="90" fill="url(#goldOuter)" stroke="#FFF1B8" strokeWidth="3" />

      {/* Borda Frisada / Serrilhada Externa */}
      <circle cx="100" cy="100" r="82" stroke="#684A0A" strokeWidth="2" strokeDasharray="3 3" />

      {/* Texto ao Redor (País e Nome da Plataforma) */}
      <text fill="#FFE885" fontSize="11" fontWeight="bold" letterSpacing="2.5">
        <textPath href="#textRing" startOffset="50%" textAnchor="middle">
          KONNEXVIB • {country.toUpperCase()} •
        </textPath>
      </text>

      {/* Círculo Interno */}
      <circle cx="100" cy="100" r="62" fill="url(#goldInner)" stroke="#FFF1B8" strokeWidth="2" />
      <circle cx="100" cy="100" r="56" stroke="#543A02" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Logo Central: KV */}
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fill="#2B1D02"
        fontSize="52"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
      >
        KV
      </text>
      <text
        x="98"
        y="112"
        textAnchor="middle"
        fill="url(#goldOuter)"
        fontSize="52"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
      >
        KV
      </text>
    </svg>
  );
}