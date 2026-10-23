import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  const [leaving, setLeaving] = useState(false);

  // Impede que a navegação seja executada mais de uma vez
  const navigationStarted = useRef(false);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      if (navigationStarted.current) return;

      navigationStarted.current = true;

      // Começa a animação de saída
      setLeaving(true);

      // Aguarda a animação terminar antes de abrir a Home
      window.setTimeout(() => {
        navigate("/home", { replace: true });
      }, 500);
    }, 5900);

    return () => {
      window.clearTimeout(splashTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#756EFF] via-[#635BFF] to-[#392FB8] text-white transition-all duration-500 ${
        leaving
          ? "scale-105 opacity-0"
          : "scale-100 opacity-100"
      }`}
    >
      {/* =====================================================
          FUNDO
      ====================================================== */}

      <div className="absolute inset-0">

        {/* Luz superior esquerda */}
        <div className="absolute left-[-120px] top-[-120px] h-[350px] w-[350px] animate-pulse rounded-full bg-white/10 blur-3xl" />

        {/* Luz inferior direita */}
        <div className="absolute bottom-[-150px] right-[-120px] h-[400px] w-[400px] animate-pulse rounded-full bg-white/10 blur-3xl [animation-delay:1s]" />

        {/* Luz central */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-2xl" />

      </div>

      {/* =====================================================
          PARTÍCULAS
      ====================================================== */}

      <span className="absolute left-[18%] top-[25%] h-2 w-2 animate-ping rounded-full bg-white/40" />

      <span className="absolute right-[20%] top-[30%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />

      <span className="absolute bottom-[28%] left-[20%] h-1.5 w-1.5 animate-ping rounded-full bg-white/30" />

      <span className="absolute bottom-[25%] right-[18%] h-2 w-2 animate-pulse rounded-full bg-white/40" />

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}

      <div
        className={`relative z-10 flex flex-col items-center px-6 transition-all duration-500 ${
          leaving
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >

        {/* =================================================
            LOGO
        ================================================== */}

        <div className="relative flex h-32 w-32 items-center justify-center">

          {/* Anel externo */}
          <div className="absolute inset-0 animate-ping rounded-[38px] border border-white/20" />

          {/* Anel giratório */}
          <div className="absolute inset-[-7px] animate-spin rounded-[40px] border-2 border-transparent border-r-white/30 border-t-white/70" />

          {/* Segundo anel */}
          <div className="absolute inset-[-14px] animate-[spin_4s_linear_infinite_reverse] rounded-[44px] border border-white/10" />

          {/* Brilho */}
          <div className="absolute inset-2 animate-pulse rounded-[32px] bg-white/20 blur-xl" />

          {/* K */}
          <div className="relative flex h-24 w-24 animate-[pulse_2s_ease-in-out_infinite] items-center justify-center rounded-[28px] bg-white shadow-2xl">

            <span className="text-5xl font-black tracking-tight text-[#635BFF]">
              K
            </span>

          </div>

        </div>

        {/* =================================================
            NOME
        ================================================== */}

        <div className="mt-8 text-center">

          <h1 className="text-4xl font-black tracking-[-1.5px]">
            Konnex<span className="text-white/75">Vib</span>
          </h1>

          <p className="mt-2 text-sm font-medium tracking-wide text-white/70">
            A carregar a tua vibe...
          </p>

        </div>

        {/* =================================================
            TRÊS PONTOS
        ================================================== */}

        <div className="mt-10 flex items-center gap-2">

          <span className="h-3 w-3 animate-bounce rounded-full bg-white shadow-lg [animation-delay:-0.4s]" />

          <span className="h-3 w-3 animate-bounce rounded-full bg-white shadow-lg [animation-delay:-0.2s]" />

          <span className="h-3 w-3 animate-bounce rounded-full bg-white shadow-lg" />

        </div>

      </div>

      {/* =====================================================
          RODAPÉ
      ====================================================== */}

      <div className="absolute bottom-7 left-0 right-0 text-center">

        <p className="text-[11px] font-medium tracking-wide text-white/40">
          Conecta-te. Partilha. Vive a tua vibe.
        </p>

      </div>

    </div>
  );
}