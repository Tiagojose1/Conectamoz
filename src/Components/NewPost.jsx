const uploadRes = await uploadToCloudinary(file);

const novoPost = {
  autorId: user.uid,
  conteudo: texto,
  imagemUrl: uploadRes.type === 'image' ? uploadRes.url : null,
  videoUrl: uploadRes.type === 'video' ? uploadRes.url : null,
  criadoEm: serverTimestamp()
};