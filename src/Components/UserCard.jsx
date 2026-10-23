import React from "react";
import Avatar from "./Avatar";

export default function UserCard({ user, onAction, actionLabel = "Seguir" }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={user?.photoURL} alt={user?.displayName} />
        <div>
          <h4 className="font-bold text-sm text-gray-900">{user?.displayName || "Utilizador"}</h4>
          <p className="text-xs text-gray-400">@{user?.username || "username"}</p>
        </div>
      </div>
      <button 
        onClick={() => onAction && onAction(user)} 
        className="bg-[#635BFF] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-700 transition"
      >
        {actionLabel}
      </button>
    </div>
  );
}