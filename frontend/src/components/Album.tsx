import type { AlbumT, SizeData, OverlayT } from "../types";
import { padding } from "../constants";

function fuzzyMatch(album: AlbumT, query: string): boolean {
  const lcQuery = query.toLowerCase();
  const albumName = album.name.toLowerCase();
  const artistNames = album.artists.map((a) => a.name.toLowerCase());
  const fields = [albumName, ...artistNames].join(" ");
  return fields.includes(lcQuery);
}

export default function main({
  album,
  setSelectedAlbum,
  searchQuery,
  clearSearchQuery,
  overlayData,
  setOverlay,
  overlayIsContext,
  setOverlayIsContext,
  sizeData,
}: {
  album: AlbumT;
  setSelectedAlbum: (album: AlbumT | null) => void;
  searchQuery: string;
  clearSearchQuery: () => void;
  overlayData: OverlayT;
  setOverlay: (overlay: OverlayT | null) => void;
  overlayIsContext: boolean;
  setOverlayIsContext: (_: boolean) => void;
  sizeData: SizeData;
}) {
  const searchActive = searchQuery !== "";
  const isMatch = fuzzyMatch(album, searchQuery);
  const inActive = searchActive && !isMatch;
  const label =
    album.artists.map((artist) => artist.name).join(", ") + " - " + album.name;

  function handleClick() {
    if (inActive) {
      return;
    }

    setSelectedAlbum(album);
    resetOverlay();
    if (searchActive) {
      clearSearchQuery();
    }
  }

  function handleMouseOver() {
    if (overlayIsContext) {
      return;
    }

    if (inActive) {
      return;
    }
    setOverlay(overlayData);
  }

  function handleMouseLeave() {
    if (overlayIsContext) {
      return;
    }
    resetOverlay();
  }
  function resetOverlay() {
    setOverlay(null);
    setOverlayIsContext(false);
  }

  function handleContextMenu(event: React.MouseEvent) {
    console.log("Context menu for album", album.name);
    setOverlay(overlayData);
    setOverlayIsContext(true);
    event.preventDefault();
  }
  return (
    <div onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
      <img
        className={!inActive ? "hoverable" : ""}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          display: "block",
          padding: `${padding}px`,
          cursor: !inActive ? "pointer" : "default",
          filter: inActive ? "brightness(20%)" : "none",
          transition: "filter 0.2s ease-in-out",
        }}
        src={album.images[0].url}
        alt={album.name}
        width={sizeData.cellSize - padding * 2}
        height={sizeData.cellSize - padding * 2}
        title={label}
      />
    </div>
  );
}
