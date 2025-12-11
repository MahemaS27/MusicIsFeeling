import { useState } from "react";

// this is how you declare the interface for props in typescript!
interface ColorTileProps {
  name: string;
  bgClass: string;
  feeling: string;
  isExpanded: boolean;
  handleTileClick: () => void;
}

export function ColorTile({
  name,
  bgClass,
  feeling,
  isExpanded,
  handleTileClick,
}: ColorTileProps) {
  // STATE
  const [isHovered, setIsHovered] = useState(false);

  // CALLBACKS
  const handleClick = () => {
    if (!isExpanded) {
      handleTileClick();
    }
  };

  const handleCloseTile = () => {
    if (isExpanded) {
      handleTileClick();
      setIsHovered(false);
    }
  };

  //DEBUG

  return (
    <div
      className={`${bgClass} shadow-lg flex items-center justify-center cursor-pointer
        ${
          isExpanded
            ? "absolute inset-0 z-50 transition-all duration-500 ease-in-out"
            : "aspect-square transition-opacity duration-300"
        }
        ${isHovered && !isExpanded ? "opacity-50" : "opacity-100"}
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)} // dont do the hover when tile is expanded
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isHovered && !isExpanded && (
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

      {isExpanded && (
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
          <button
            onClick={handleCloseTile}
            className="absolute top-8 right-8 p-2 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            X
          </button>
          {feeling}
        </span>
      )}
    </div>
  );
}
