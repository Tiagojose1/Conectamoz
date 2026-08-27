const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Faz upload de um ficheiro para o Cloudinary.
 *
 * @param {File} file
 * @param {"profile"|"posts"|"stories"|"videos"|"chat"} folder
 * @returns {Promise<Object>}
 */
export async function uploadParaCloudinary(file, folder = "posts") {
  if (!file) {
    throw new Error("Nenhum ficheiro foi selecionado.");
  }

  if (!CLOUD_NAME) {
    throw new Error("VITE_CLOUDINARY_CLOUD_NAME não configurado.");
  }

  if (!UPLOAD_PRESET) {
    throw new Error("VITE_CLOUDINARY_UPLOAD_PRESET não configurado.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `konnexvib/${folder}`);

  const resourceType = file.type.startsWith("video/")
    ? "video"
    : "image";

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary:", data);
    throw new Error(
      data?.error?.message || "Falha no upload para o Cloudinary."
    );
  }

  return data;
}