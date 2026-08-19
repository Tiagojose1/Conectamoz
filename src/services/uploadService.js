/**
 * Faz o upload de um ficheiro (imagem ou vídeo) para o Cloudinary.
 * @param {File} file - Ficheiro selecionado pelo utilizador.
 * @returns {Promise<{url: string, type: string, publicId: string, duration?: number}>}
 */
export const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error("Nenhum ficheiro fornecido para upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  // Determina dinamicamente se é vídeo ou imagem
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Falha ao efetuar o upload para o Cloudinary.");
    }

    // Retorna os dados essenciais para salvar no Firestore (Posts / Reels)
    return {
      url: data.secure_url,
      type: resourceType,
      publicId: data.public_id,
      ...(data.duration && { duration: data.duration }), // Útil para validar limite de Reels
    };
  } catch (error) {
    console.error("Erro no upload para o Cloudinary:", error);
    throw error;
  }
};