import type { AlbumT } from "../types";
import { padding } from "../constants";
import Spinner from "./Spinner";
import { useState, useEffect } from "react";
export default function Player({
  selectedAlbum,
  playerWidth,
  playerHeight,
}: {
  selectedAlbum: AlbumT;
  playerWidth: number;
  playerHeight: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(false);
  }, [selectedAlbum]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 300); // 300ms delay
  };
  return (
    <>
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: playerWidth - padding * 2,
            height: playerHeight - padding * 2,
          }}
        >
          <Spinner />
        </div>
      )}
      <iframe
        onLoad={handleIframeLoad}
        style={{
          padding: `${padding}px`,
          border: "none",
          visibility: isLoaded ? "visible" : "hidden",
        }}
        className="player"
        src={`https://open.spotify.com/embed/album/${selectedAlbum.id}`}
        width={playerWidth - padding * 2}
        height={playerHeight - padding * 2}
        allow="encrypted-media"
      />
    </>
  );
}
