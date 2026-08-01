"use client";

import { useState } from "react";

const PHOTO_EXTENSIONS = ["jpg", "png", "webp"];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.trim().slice(0, 2) || "?").toUpperCase();
}

export default function UserAvatar({
  name,
  className = "",
  fallbackClassName = "from-green-500 to-green-600",
  textClassName = "",
}: {
  name: string;
  className?: string;
  fallbackClassName?: string;
  textClassName?: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const firstName = name.trim().split(/\s+/)[0] || name;

  if (!failed && attempt < PHOTO_EXTENSIONS.length) {
    const ext = PHOTO_EXTENSIONS[attempt];
    return (
      <img
        src={`/uploads/photos/${firstName}.${ext}`}
        alt={name}
        loading="lazy"
        onError={() => {
          if (attempt + 1 >= PHOTO_EXTENSIONS.length) {
            setFailed(true);
          } else {
            setAttempt(attempt + 1);
          }
        }}
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-gradient-to-br ${fallbackClassName} text-white`}
    >
      <span className={textClassName}>{getInitials(name)}</span>
    </div>
  );
}
