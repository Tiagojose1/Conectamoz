/**
 * Utilitário para upload de ficheiros (imagens e vídeos) para o Cloudinary
 * @param {File} file - Ficheiro selecionado pelo utilizador (e.target.files[0])
 * @returns {Promise<string>} - Retorna o URL direto do ficheiro alojado
 */
export const uploadParaCloudinary = async (file) => {
  if (!file) return null;

  // Substitui pelos teus dados do painel do Cloudinary (Dashboard)
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "TEU_CLOUD_NAME";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || "TEU_UPLOAD_PRESET";

  // Determina se o ficheiro é uma imagem ou vídeo
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro no Cloudinary:", errorData);
      throw new Error("Falha ao carregar o ficheiro no Cloudinary.");
    }

    const data = await response.json();
    return data.secure_url; // Retorna o link HTTPS da imagem/vídeo
  } catch (error) {
    console.error("Erro no upload para o Cloudinary:", error);
    throw error;
  }
};