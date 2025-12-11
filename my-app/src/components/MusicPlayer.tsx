import { useState } from "react";
import React from "react";
import { Track } from "../hooks/useGetCurrentlyPlayingTrack";

interface MusicPlayerProps {
  currentlyPlaying: Track | null;
}

export function MusicPlayer({ currentlyPlaying }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <div className="fixed top-10 right-4 flex gap-2 z-50">
        <button
          onClick={() => {}}
          className="w-10 h-10 bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
          aria-label="Previous track"
        >
          <span className="text-white">|◀</span>
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <span className="text-white">||</span>
          ) : (
            <span className="text-white">▶</span>
          )}
        </button>
        <button
          onClick={() => {}}
          className="w-10 h-10 bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
          aria-label="Next track"
        >
          <span className="text-white">▶|</span>
        </button>
      </div>
      <span
        className="flex"
        style={{
          fontFamily: "Snell Roundhand, cursive",
          fontSize: "1.5rem",
        }}
      >
        {currentlyPlaying?.artistName} , {currentlyPlaying?.songTitle}
      </span>
    </div>
  );
}
