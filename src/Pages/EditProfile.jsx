import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { FaArrowLeft, FaCamera, FaSave } from "react-icons/fa";

export default function EditProfile() {
  const navigate = useNavigate();
  const usuario = auth.currentUser;

  // Estado único para os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    bio: "",
    localizacao: "",
    escola: "",
    nivelEstudos: "Ensino Secundário",
    estadoCivil: "Solteiro(a)",
    trabalho: "",
    fotoPerfil: "",
    fotoCapa: "",
  });

  const [mensagem, setMensagem] = useState({ texto: "", erro: false });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      if (!usuario) {
        navigate("/login");
        return;
      }

      try {
        const referencia = doc(db, "users", usuario.uid);
        const dados = await getDoc(referencia);

        if (isMounted) {
          if (dados.exists()) {
            const perfil = dados.data();
            setFormData({
              nome: perfil.nome || perfil.displayName || usuario.displayName || "",
              telefone: perfil.telefone || "",
              bio: perfil.bio || perfil.biografia || "",
              localizacao: perfil.localizacao || "",
              escola: perfil.escola || "",
              nivelEstudos: perfil.nivelEstudos || "Ensino Secundário",
              estadoCivil: perfil.estadoCivil || "Solteiro(a)",
              trabalho: perfil.trabalho || "",
              fotoPerfil: perfil.foto || perfil.photoURL || usuario.photoURL || "",
              fotoCapa: perfil.fotoCapa || "",
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              nome: usuario.displayName || "",
              fotoPerfil: usuario.photoURL || "",
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        if (isMounted) setCarregando(false);
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, [usuario, navigate]);

  // Atualizador genérico para inputs de texto e select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload Cloudinary
  const uploadImagemCloudinary = async (file) => {
    const dataForm = new FormData();
    dataForm.append("file", file);
    dataForm.append("upload_preset", "conectamoz"); // Ajusta o preset se necessário

    const res = await fetch("https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload", {
      method: "POST",
      body: dataForm,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleUploadFoto = async (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSalvando(true);
      const url = await uploadImagemCloudinary(file);
      setFormData((prev) => ({ ...prev, [campo]: url }));
    } catch (err) {
      setMensagem({ texto: `Erro ao carregar a ${campo === "fotoPerfil" ? "foto de perfil" : "foto de capa"}.`, erro: true });
    } finally {
      setSalvando(false);
    }
  };

  // Salvar alterações
  const salvar = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    try {
      setSalvando(true);
      setMensagem({ texto: "", erro: false });

      const numTelefone = formData.telefone.replace(/\D/g, "");

      const dadosAtualizados = {
        nome: formData.nome,
        telefone: numTelefone,
        bio: formData.bio,
        localizacao: formData.localizacao,
        escola: formData.escola,
        nivelEstudos: formData.nivelEstudos,
        estadoCivil: formData.estadoCivil,
        trabalho: formData.trabalho,
        foto: formData.fotoPerfil,
        fotoCapa: formData.fotoCapa,
        updatedAt: serverTimestamp(),
      };

      // Atualiza ambas as coleções
      await setDoc(doc(db, "users", usuario.uid), dadosAtualizados, { merge: true });
      await setDoc(doc(db, "usuarios", usuario.uid), dadosAtualizados, { merge: true });

      // Atualiza o perfil no Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.nome,
          photoURL: formData.fotoPerfil,
        });
      }

      setMensagem({ texto: "Perfil atualizado com sucesso! ✅", erro: false });

      setTimeout(() => {
        navigate(`/profile/${usuario.uid}`);
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMensagem({
        texto: "Erro ao atualizar perfil. Tenta novamente.",
        erro: true,
      });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <FaArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
            Editar Perfil
          </h1>
          <div className="w-6"></div>
        </div>

        <form onSubmit={salvar} className="space-y-4">
          {/* FOTO DE CAPA */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Foto de Capa
            </label>
            <div className="relative h-32 bg-gray-200 rounded-xl overflow-hidden border">
              {formData.fotoCapa ? (
                <img src={formData.fotoCapa} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem foto de capa
                </div>
              )}
              <label className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full cursor-pointer hover:bg-black transition">
                <FaCamera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadFoto(e, "fotoCapa")}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* FOTO DE PERFIL */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-600 flex-shrink-0">
              <img
                src={formData.fotoPerfil || "https://via.placeholder.com/150"}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition">
                <FaCamera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadFoto(e, "fotoPerfil")}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-800">Foto de Perfil</h4>
              <p className="text-xs text-gray-500">Clica para alterar a imagem</p>
            </div>
          </div>

          {/* NOME COMPLETO */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* TELEFONE */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              maxLength={9}
              placeholder="Ex: 841234567"
              value={formData.telefone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  telefone: e.target.value.replace(/\D/g, ""),
                }))
              }
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* BIOGRAFIA */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Biografia / Sobre mim
            </label>
            <textarea
              name="bio"
              placeholder="Escreve algo sobre ti..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition"
              rows={3}
            />
          </div>

          {/* LOCALIZAÇÃO E ESCOLA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Localização
              </label>
              <input
                type="text"
                name="localizacao"
                placeholder="Ex: Maputo, Moçambique"
                value={formData.localizacao}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Escola / Universidade
              </label>
              <input
                type="text"
                name="escola"
                placeholder="Ex: UEM, ISCTEM..."
                value={formData.escola}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* NÍVEL DE ESTUDOS E ESTADO CIVIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Nível de Estudos
              </label>
              <select
                name="nivelEstudos"
                value={formData.nivelEstudos}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="Ensino Primário">Ensino Primário</option>
                <option value="Ensino Secundário">Ensino Secundário</option>
                <option value="Técnico Médio">Técnico Médio</option>
                <option value="Licenciatura">Licenciatura</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutoramento">Doutoramento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Estado Civil
              </label>
              <select
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Num relacionamento">Num relacionamento</option>
                <option value="Noivo(a)">Noivo(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>
          </div>

          {/* TRABALHO */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Trabalho / Profissão
            </label>
            <input
              type="text"
              name="trabalho"
              placeholder="Ex: Desenvolvedor de Software"
              value={formData.trabalho}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* MENSAGEM DE FEEDBACK */}
          {mensagem.texto && (
            <p
              className={`text-center text-sm font-medium p-2 rounded-lg ${
                mensagem.erro ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}
            >
              {mensagem.texto}
            </p>
          )}

          {/* BOTAO SALVAR */}
          <button
            type="submit"
            disabled={salvando}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold text-sm shadow transition flex items-center justify-center gap-2 ${
              salvando ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <FaSave /> {salvando ? "A guardar..." : "Salvar Alterações"}
          </button>

          {/* BOTAO CANCELAR */}
          <button
            type="button"
            onClick={() => navigate(`/profile/${usuario?.uid}`)}
            className="w-full text-gray-500 text-sm font-semibold hover:underline text-center pt-2 block"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}