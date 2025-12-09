import { useState } from "react";

// this is how you declare the interface for props in typescript!
interface ColorTileProps {
  name: string;
  bgClass: string;
  feeling: string;
}

export function ColorTile({ name, bgClass, feeling }: ColorTileProps) {
  // STATE
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${bgClass} w-full h-48 aspect-square shadow-lg transition-opacity duration-300 flex items-center justify-center cursor-pointer ${
        isHovered ? "opacity-50" : "opacity-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <span
          className="px-4 py-2 animate-in fade-in duration-300"
          style={{
            fontFamily: "Snell Roundhand, cursive",
            fontSize: "2rem",
            color: "white",
            WebkitTextStroke: "2px black",
            paintOrder: "stroke fill",
          }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
