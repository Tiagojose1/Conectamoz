import React, { useState, useEffect } from 'react';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../Firebase';

export default function PostCard({ id, author, content, likes = [] }) {
  const currentUser = auth.currentUser;
  const [jaCurtiu, setJaCurtiu] = useState(false);
  const [qtdCurtidas, setQtdCurtidas] = useState(likes.length);

  // Estados dos Comentários
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setJaCurtiu(likes.includes(currentUser.uid));
    }
    setQtdCurtidas(likes.length);
  }, [likes, currentUser]);

  // Carregar comentários do post em tempo real
  useEffect(() => {
    if (!id || !mostrarComentarios) return;

    const comentariosRef = collection(db, 'posts', id, 'comentarios');
    const q = query(comentariosRef, orderBy('criadoEm', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaComentarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setComentarios(listaComentarios);
    });

    return () => unsubscribe();
  }, [id, mostrarComentarios]);

  // Alternar Curtida (Like)
  const handleToggleLike = async () => {
    if (!currentUser || !id) return;
    const postRef = doc(db, 'posts', id);

    try {
      if (jaCurtiu) {
        setJaCurtiu(false);
        setQtdCurtidas((prev) => prev - 1);
        await updateDoc(postRef, {
          curtidas: arrayRemove(currentUser.uid)
        });
      } else {
        setJaCurtiu(true);
        setQtdCurtidas((prev) => prev + 1);
        await updateDoc(postRef, {
          curtidas: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar curtida:", error);
    }
  };

  // Enviar Novo Comentário
  const handleAdicionarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !currentUser || !id) return;

    try {
      setEnviandoComentario(true);
      const comentariosRef = collection(db, 'posts', id, 'comentarios');

      await addDoc(comentariosRef, {
        texto: novoComentario.trim(),
        autorId: currentUser.uid,
        autorNome: currentUser.displayName || currentUser.email.split('@')[0],
        criadoEm: serverTimestamp()
      });

      setNovoComentario('');
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
      {/* Cabeçalho do Post */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {author ? author.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{author}</h3>
          <p className="text-xs text-gray-400">Publicado recentemente</p>
        </div>
      </div>

      {/* Conteúdo do Post */}
      <p className="text-gray-700 text-sm leading-relaxed">{content}</p>

      {/* Linha Divisória */}
      <hr className="border-gray-100" />

      {/* Botões de Interação */}
      <div className="flex items-center justify-between text-gray-500 text-sm pt-1">
        <button 
          onClick={handleToggleLike}
          className={`flex items-center space-x-1 font-medium transition ${
            jaCurtiu ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
          }`}
        >
          <span>{jaCurtiu ? '👍 Curtido' : '👍 Curtir'}</span>
          <span>({qtdCurtidas})</span>
        </button>

        <button 
          onClick={() => setMostrarComentarios(!mostrarComentarios)}
          className="hover:text-blue-600 font-medium transition"
        >
          💬 {mostrarComentarios ? 'Ocultar Comentários' : 'Comentar'}
        </button>
      </div>

      {/* Seção de Comentários */}
      {mostrarComentarios && (
        <div className="pt-3 border-t space-y-3 bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-xl">
          {/* Lista de Comentários */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comentarios.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} className="bg-white p-2.5 rounded-lg border text-xs">
                  <span className="font-bold text-gray-800 block mb-0.5">
                    {c.autorNome}
                  </span>
                  <p className="text-gray-600">{c.texto}</p>
                </div>
              ))
            )}
          </div>

          {/* Campo para Escrever Comentário */}
          <form onSubmit={handleAdicionarComentario} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Escreva um comentário..."
              className="flex-1 p-2 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button
              type="submit"
              disabled={enviandoComentario || !novoComentario.trim()}
              className="bg-blue-600 text-white font-semibold px-3 py-2 rounded-lg text-xs hover:bg-blue-700 transition disabled:opacity-50"
            >
              {enviandoComentario ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
