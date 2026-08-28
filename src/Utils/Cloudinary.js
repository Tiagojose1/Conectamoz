// src/Utils/Cloudinary.js

// ======================================
// CONFIGURAÇÃO CLOUDINARY
// ======================================

const CLOUD_NAME =
  import.meta.env
    .VITE_CLOUDINARY_CLOUD_NAME;

const UPLOAD_PRESET =
  import.meta.env
    .VITE_CLOUDINARY_UPLOAD_PRESET;

// ======================================
// UPLOAD PARA CLOUDINARY
// ======================================

/**
 * Faz upload de ficheiros para o Cloudinary.
 *
 * Pastas disponíveis:
 *
 * profile
 * posts
 * stories
 * videos
 * chat
 *
 * @param {File} file
 * @param {"profile"|"posts"|"stories"|"videos"|"chat"} folder
 * @returns {Promise<Object>}
 */

export async function uploadParaCloudinary(
  file,
  folder = "posts"
) {
  // ------------------------------------
  // VERIFICAR FICHEIRO
  // ------------------------------------

  if (!file) {
    throw new Error(
      "Nenhum ficheiro foi selecionado."
    );
  }

  // ------------------------------------
  // VERIFICAR CLOUD NAME
  // ------------------------------------

  if (!CLOUD_NAME) {
    throw new Error(
      "VITE_CLOUDINARY_CLOUD_NAME não está configurado."
    );
  }

  // ------------------------------------
  // VERIFICAR UPLOAD PRESET
  // ------------------------------------

  if (!UPLOAD_PRESET) {
    throw new Error(
      "VITE_CLOUDINARY_UPLOAD_PRESET não está configurado."
    );
  }

  // ------------------------------------
  // PASTAS PERMITIDAS
  // ------------------------------------

  const pastasPermitidas = [
    "profile",
    "posts",
    "stories",
    "videos",
    "chat",
  ];

  if (
    !pastasPermitidas.includes(folder)
  ) {
    throw new Error(
      `Pasta "${folder}" não é permitida.`
    );
  }

  // ------------------------------------
  // IDENTIFICAR TIPO DO FICHEIRO
  // ------------------------------------

  let resourceType = "image";

  if (
    file.type &&
    file.type.startsWith("video/")
  ) {
    resourceType = "video";
  }

  // ------------------------------------
  // FORM DATA
  // ------------------------------------

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    UPLOAD_PRESET
  );

  formData.append(
    "folder",
    `konnexvib/${folder}`
  );

  // ------------------------------------
  // URL CLOUDINARY
  // ------------------------------------

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  // ------------------------------------
  // ENVIAR FICHEIRO
  // ------------------------------------

  const response =
    await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

  // ------------------------------------
  // LER RESPOSTA
  // ------------------------------------

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "Resposta inválida do Cloudinary."
    );
  }

  // ------------------------------------
  // VERIFICAR ERRO
  // ------------------------------------

  if (!response.ok) {
    console.error(
      "Erro Cloudinary:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "Falha no upload para o Cloudinary."
    );
  }

  // ------------------------------------
  // RETORNAR DADOS
  // ------------------------------------

  return data;
}

// ======================================
// UPLOAD DE IMAGEM
// ======================================

export async function uploadImagem(
  file,
  folder = "posts"
) {
  if (
    !file?.type?.startsWith("image/")
  ) {
    throw new Error(
      "O ficheiro selecionado não é uma imagem."
    );
  }

  return uploadParaCloudinary(
    file,
    folder
  );
}

// ======================================
// UPLOAD DE VÍDEO
// ======================================

export async function uploadVideo(
  file,
  folder = "videos"
) {
  if (
    !file?.type?.startsWith("video/")
  ) {
    throw new Error(
      "O ficheiro selecionado não é um vídeo."
    );
  }

  return uploadParaCloudinary(
    file,
    folder
  );
}