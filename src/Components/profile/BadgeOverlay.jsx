// src/components/profile/BadgeOverlay.jsx
import React, { useState, useEffect } from 'react';
import { generateUserBadgeImage } from '../../utils/badgeCanvas';

export default function BadgeOverlay({ user }) {
  const [badgeImageUrl, setBadgeImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Define o tipo de selo com base no status do usuário no banco de dados
  const getBadgeType = () => {
    if (user?.isPremium) return 'premium';
    if (user?.isVerified) return 'verified';
    return 'normal';
  };

  const badgeType = getBadgeType();

  // Gera a imagem de forma totalmente automática
  useEffect(() => {
    async function loadBadge() {
      if (badgeType !== 'normal' && user?.photoURL && user?.displayName) {
        setLoading(true);
        try {
          const url = await generateUserBadgeImage({
            photoUrl: user.photoURL,
            userName: user.displayName, // Pega o nome real dinamicamente
            badgeType: badgeType,
          });
          setBadgeImageUrl(url);
        } catch (error) {
          console.error('Erro ao gerar foto com selo:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadBadge();
  }, [user, badgeType]);

  // Função para baixar a foto para a galeria
  const handleDownload = () => {
    if (!badgeImageUrl) return;
    const link = document.createElement('a');
    link.href = badgeImageUrl;
    link.download = `${user.displayName.replace(/\s+/g, '_')}_Selo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Exibição da Foto de Perfil */}
      <div className="relative mb-4">
        {loading ? (
          <div className="w-48 h-48 rounded-full border-4 border-gray-600 animate-pulse bg-gray-800 flex items-center justify-center text-gray-400">
            A carregar selo...
          </div>
        ) : badgeImageUrl ? (
          /* Imagem Processada com Moldura, Nome e Selo */
          <img
            src={badgeImageUrl}
            alt={`Perfil de ${user?.displayName}`}
            className="w-64 h-auto rounded-xl shadow-lg border border-gray-800"
          />
        ) : (
          /* Foto Simples (Caso o usuário não seja verificado nem premium) */
          <div className="relative">
            <img
              src={user?.photoURL || '/default-avatar.png'}
              alt={user?.displayName}
              className="w-40 h-40 rounded-full object-cover border-4 border-gray-600"
            />
          </div>
        )}
      </div>

      {/* Informações do Usuário */}
      <div className="text-center my-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-white">
          {user?.displayName}
          {badgeType === 'premium' && <span title="Membro Premium">⭐</span>}
          {badgeType === 'verified' && <span title="Verificado">✅</span>}
        </h2>
        <p className="text-sm text-gray-400">
          {badgeType === 'premium'
            ? 'Membro Premium'
            : badgeType === 'verified'
            ? 'Conta Verificada'
            : 'Membro Gratuito'}
        </p>
      </div>

      {/* Botão de Download na Galeria */}
      {badgeType !== 'normal' && (
        <button
          onClick={handleDownload}
          disabled={loading || !badgeImageUrl}
          className="mt-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg shadow transition duration-200 flex items-center gap-2 cursor-pointer"
        >
          📥 Baixar Foto com Selo
        </button>
      )}
    </div>
  );
}