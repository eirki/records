import type { AlbumT, SizeData } from "../types";
import Button from "./Button";
import { padding } from "../constants";
import { useState } from "react";
import xmark from "../assets/circle-xmark-solid-full.svg";

export default function NowPlaying({
  album,
  searchQuery,
  setSearchQuery,
  sizeData,
}: {
  album: AlbumT;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sizeData: SizeData;
}) {
  const albumArtSize = sizeData.cellSize * sizeData.nSidebarCols - padding * 2;
  const [hovered, setHovered] = useState(false);
  const showSearch = searchQuery !== "" || hovered;

  const searchBoxSize = sizeData.cellSize * 2;

  const baseFontSize = sizeData.cellSize / 2;
  const minFontSize = 14;
  const maxLengthBeforeShrink = 10;
  const dynamicFontSize = Math.max(
    minFontSize,
    baseFontSize - Math.max(0, searchQuery.length - maxLengthBeforeShrink) * 1.5
  );

  function handleKeyDown(event: any) {
    if (event.key === "Escape") {
      if (searchQuery === "") {
        setHovered(false);
      }
      setSearchQuery("");
      event.preventDefault();
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: albumArtSize,
        height: albumArtSize,
        padding: `${padding}px`,
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={album.images[0].url}
        alt={album.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      <div
        style={{
          position: "absolute",
          margin: padding,
          bottom: 0,
          left: 0,
          right: 0,
          height: showSearch ? `${searchBoxSize}px` : "0px",
          overflow: "hidden",
          background: "#000",
          transition: "height 0.3s ease, padding 0.3s ease",
          padding: showSearch ? "10px" : "0px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="…"
          style={{
            width: "100%",
            fontSize: `${dynamicFontSize}px`,
            padding: "10px",
            boxSizing: "border-box",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#000",
            color: "#fff",
            outline: "none",
            caretColor: "#fff",
            textAlign: "center",
          }}
          title="Filter albums"
        />
        {searchQuery && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "8px",
              transform: "translateY(-50%)",
            }}
          >
            <Button
              title="Clear search"
              path={xmark}
              onClick={() => setSearchQuery("")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
