import React from "react";
import Avatar from "./Avatar";

export default function StoryCard({ story }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
      <div className={`p-0.5 rounded-full ${story?.active ? "bg-gradient-to-tr from-purple-600 to-indigo-500" : "border-2 border-indigo-400"}`}>
        <Avatar src={story?.img} size="md" />
      </div>
      <span className="text-xs font-medium text-gray-700 mt-1.5">{story?.name}</span>
    </div>
  );
}