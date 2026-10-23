import React from "react";

export default function Avatar({ src, alt = "Avatar", size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };

  return (
    <img
      src={src || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
      alt={alt}
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-gray-100`}
    />
  );
}