/**
 * Utilitário para upload de ficheiros (imagens e vídeos) para o Cloudinary no ConectMoz (CMoz)
 * @param {File} file - Ficheiro selecionado pelo utilizador (ex: e.target.files[0])
 * @returns {Promise<{ url: string, duration?: number, publicId: string } | null>}
 */
export const uploadParaCloudinary = async (file) => {
  if (!file) return null;

  // Carrega do .env ou utiliza o valor de contingência (fallback)
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "gvlkibf8";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "awy4enei";

  // Validação preventiva das credenciais
  if (!CLOUD_NAME) {
    console.error("Cloudinary Error: VITE_CLOUDINARY_CLOUD_NAME não configurado.");
    throw new Error("Configuração do Cloud Name pendente.");
  }

  if (!UPLOAD_PRESET) {
    console.error("Cloudinary Error: VITE_CLOUDINARY_UPLOAD_PRESET não configurado.");
    throw new Error("Upload Preset do Cloudinary não configurado.");
  }

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
      console.error("Resposta de erro do Cloudinary:", errorData);
      throw new Error(errorData.error?.message || "Falha ao carregar o ficheiro no Cloudinary.");
    }

    const data = await response.json();

    // Retorna a URL segura e os metadados do ficheiro
    return {
      url: data.secure_url,
      publicId: data.public_id,
      duration: data.duration || null, // Duração em segundos (se for vídeo)
      format: data.format,
    };
  } catch (error) {
    console.error("Erro no processo de upload para o Cloudinary:", error);
    throw error;
  }
};