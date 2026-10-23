import React from "react";

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 my-2">
      {message}
    </div>
  );
}