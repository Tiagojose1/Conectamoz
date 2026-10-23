import React from "react";
import Avatar from "./Avatar";

export default function CommentCard({ comment }) {
  return (
    <div className="flex gap-3 py-2">
      <Avatar src={comment?.userPhoto} size="sm" />
      <div className="flex-1 bg-gray-100 p-3 rounded-2xl">
        <h5 className="font-bold text-xs text-gray-900">{comment?.userName || "Utilizador"}</h5>
        <p className="text-xs text-gray-700 mt-1">{comment?.text}</p>
      </div>
    </div>
  );
}