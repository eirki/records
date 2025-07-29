import type { AlbumT, SizeData, OverlayT } from "../types";
import Album from "./Album";

function getArtUrl(album: AlbumT, sizeData: SizeData): string {
  const useBigArt = true;
  if (useBigArt || sizeData.cellSize > 300) {
    return album.images[0].url;
  } else if (sizeData.cellSize > 64) {
    return album.images[1].url;
  } else {
    return album.images[0].url;
  }
}

function calculateOverlay(sizeData: SizeData, album: AlbumT): OverlayT {
  const artUrl = getArtUrl(album, sizeData);
  const overlay: OverlayT = {
    overlayColumn: 1,
    overlayRow: 1,
    album,
    artUrl,
  };
  return overlay;
}

export default function main({
  albums,
  height,
  searchQuery,
  setOverlay,
  overlayIsContext,
  setOverlayIsContext,
  setSelectedAlbum,
  clearSearchQuery,
  sizeData,
}: {
  albums: AlbumT[];
  height: number;
  searchQuery: string;
  setOverlay: (overlay: OverlayT | null) => void;
  overlayIsContext: boolean;
  setOverlayIsContext: (_: boolean) => void;
  setSelectedAlbum: (album: AlbumT | null) => void;
  clearSearchQuery: () => void;
  sizeData: SizeData;
}) {
  return (
    <div
      className="no-scrollbar"
      style={{
        maxHeight: `${height * sizeData.cellSize}px`,
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {albums.map((album) => (
        <div style={{ scrollSnapAlign: "start" }}>
          <Album
            album={album}
            searchQuery={searchQuery}
            setSelectedAlbum={setSelectedAlbum}
            clearSearchQuery={clearSearchQuery}
            overlayData={calculateOverlay(sizeData, album)}
            overlayIsContext={overlayIsContext}
            setOverlayIsContext={setOverlayIsContext}
            setOverlay={setOverlay}
            sizeData={sizeData}
          />
        </div>
      ))}
    </div>
  );
}
