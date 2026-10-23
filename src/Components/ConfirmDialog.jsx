import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirmação", message = "Tem a certeza?" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
        <button onClick={onConfirm} className="px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl">Confirmar</button>
      </div>
    </Modal>
  );
}