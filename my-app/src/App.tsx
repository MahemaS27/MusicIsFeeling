import React, { useState } from "react";
import { colors } from "./constants/colors";
import { ColorTile } from "./components/ColorTile";

function App() {
  // STATE
  const [expandedTile, setExpandedTile] = useState<number | null>(-1);

  // CALLBACKS
  const handleTileClick = (index: number) => {
    if (index === expandedTile) {
      // closes
      setExpandedTile(null);
    } else {
      setExpandedTile(index);
    }
  };

  return (
    <>
      {/* what were doing here is defining an inline stylesheet for the scrolling div on the page */}
      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .scrolling-text {
            animation: scroll 20s linear infinite;
            font-family: Snell Roundhand, cursive;
            font-size: 8rem;
            color: white;
            -webkit-text-stroke: 3px black;
            paint-order: stroke fill;
          }
        `}
      </style>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8 relative overflow-hidden">
        {/* Scrolling background text */}
        <div className="absolute inset-0 flex items-center pointer-events-none opacity-20">
          <div className="scrolling-text whitespace-nowrap">
            Music is Feeling Music is Feeling Music is Feeling Music is Feeling
            Music is Feeling Music is Feeling Music is Feeling Music is Feeling
          </div>
        </div>

        {/* Wrap grid in a container div, should be seperated into ColorGridComponents */}
        <div className="relative z-50 w-full max-w-2xl">
          <div className="grid grid-cols-3 gap-4 w-full">
            {colors.map((color, index) => (
              <ColorTile
                key={index}
                name={color.name}
                bgClass={color.bgClass}
                feeling={color.feeling}
                isExpanded={index === expandedTile}
                handleTileClick={() => handleTileClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
