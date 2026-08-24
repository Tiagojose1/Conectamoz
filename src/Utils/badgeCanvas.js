// src/utils/badgeCanvas.js

export async function generateUserBadgeImage({ photoUrl, userName, badgeType }) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 750;

    // 1. Fundo do Card Elegante
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borda Externa do Card
    ctx.lineWidth = 4;
    ctx.strokeStyle = badgeType === 'premium' ? '#EAB308' : '#C87D32';
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    const userImg = new Image();
    userImg.crossOrigin = 'anonymous';
    userImg.src = photoUrl || '/default-avatar.png';

    userImg.onload = () => {
      // 2. Desenhar Foto Circular Centralizada
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 200, 110, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(userImg, 190, 90, 220, 220);
      ctx.restore();

      // 3. Moldura da Foto (Bronze ou Dourada)
      ctx.beginPath();
      ctx.arc(300, 200, 110, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = badgeType === 'premium' ? '#EAB308' : '#C87D32';
      ctx.stroke();

      // 4. Nome Dinâmico do Usuário
      const cleanName = (userName || 'USUÁRIO').toUpperCase();
      ctx.font = 'bold 26px Sans-Serif';
      ctx.fillStyle = badgeType === 'premium' ? '#FEF08A' : '#F5B98C';
      
      const textMetrics = ctx.measureText(cleanName);
      const textWidth = textMetrics.width;
      const startX = 300 - (textWidth / 2) - 15;

      ctx.textAlign = 'left';
      ctx.fillText(cleanName, startX, 420);

      // 5. Desenho do Selo Azul de Verificação (Vetorizado)
      const badgeX = startX + textWidth + 15;
      const badgeY = 412;
      const badgeRadius = 14;

      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1D9BF0'; // Azul verificado oficial
      ctx.fill();

      // Desenho do Checkmark (V) branco
      ctx.beginPath();
      ctx.moveTo(badgeX - 6, badgeY - 1);
      ctx.lineTo(badgeX - 1, badgeY + 4);
      ctx.lineTo(badgeX + 6, badgeY - 5);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // 6. Texto do Status no Rodapé
      ctx.font = 'bold 16px Sans-Serif';
      ctx.fillStyle = '#A1A1AA';
      ctx.textAlign = 'center';
      const statusText = badgeType === 'premium' ? 'MEMBRO PREMIUM' : 'CONTA VERIFICADA';
      ctx.fillText(statusText, 300, 680);

      resolve(canvas.toDataURL('image/png'));
    };

    userImg.onerror = (err) => reject(err);
  });
}