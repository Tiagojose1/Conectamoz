import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegImage } from "react-icons/fa";
import Avatar from "./Avatar";

export default function CreatePostBox() {
  const navigate = useNavigate();

  return (
    <section className="bg-white px-4 py-3 mt-1 flex items-center gap-3 border-b border-gray-100">
      <Avatar />
      <div 
        onClick={() => navigate("/create-post")} 
        className="flex-1 bg-gray-100 hover:bg-gray-200 transition rounded-full px-4 py-2 text-gray-400 text-sm cursor-pointer"
      >
        O que está a acontecer?
      </div>
      <button onClick={() => navigate("/create-post")} className="flex flex-col items-center justify-center text-gray-500">
        <FaRegImage size={20} className="text-gray-600" />
        <span className="text-[10px] text-gray-500 font-medium">Foto</span>
      </button>
    </section>
  );
}