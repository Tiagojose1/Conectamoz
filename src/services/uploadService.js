export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  // Define automaticamente se é vídeo ou imagem
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Falha ao efetuar o upload para o Cloudinary');
    }

    return {
      url: data.secure_url,
      type: resourceType,
    };
  } catch (error) {
    console.error("Erro no upload para o Cloudinary:", error);
    throw error;
  }
};