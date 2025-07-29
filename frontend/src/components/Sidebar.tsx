import type { AlbumT, SizeData, OverlayT } from "../types";
import AlbumColumn from "./AlbumColumn";
import Player from "./Player";
import NowPlaying from "./NowPlaying";

export default function main({
  recentAlbums,
  recommendedAlbums,
  selectedAlbum,
  setSelectedAlbum,
  setOverlay,
  overlayIsContext,
  setOverlayIsContext,
  searchQuery,
  setSearchQuery,
  sizeData,
}: {
  recentAlbums: AlbumT[];
  recommendedAlbums: AlbumT[];
  selectedAlbum: AlbumT;
  setSelectedAlbum: (album: AlbumT | null) => void;
  setOverlay: (overlay: OverlayT | null) => void;
  overlayIsContext: boolean;
  setOverlayIsContext: (_: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sizeData: SizeData;
}) {
  const playerWidth = sizeData.cellSize * (sizeData.nSidebarCols - 2);
  const playerHeight =
    sizeData.cellSize * (sizeData.nRows - sizeData.nSidebarCols);
  const columnHeight = sizeData.nRows - sizeData.nSidebarCols;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
        }}
      >
        <Player
          selectedAlbum={selectedAlbum}
          playerWidth={playerWidth}
          playerHeight={playerHeight}
        />
        <AlbumColumn
          albums={recommendedAlbums}
          height={columnHeight}
          searchQuery={searchQuery}
          overlayIsContext={overlayIsContext}
          setOverlayIsContext={setOverlayIsContext}
          setOverlay={setOverlay}
          setSelectedAlbum={setSelectedAlbum}
          clearSearchQuery={() => setSearchQuery("")}
          sizeData={sizeData}
        />
        <AlbumColumn
          albums={recentAlbums}
          height={columnHeight}
          searchQuery={searchQuery}
          overlayIsContext={overlayIsContext}
          setOverlayIsContext={setOverlayIsContext}
          setOverlay={setOverlay}
          setSelectedAlbum={setSelectedAlbum}
          clearSearchQuery={() => setSearchQuery("")}
          sizeData={sizeData}
        />
      </div>
      <div>
        <NowPlaying
          album={selectedAlbum}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sizeData={sizeData}
        />
      </div>
    </div>
  );
}
