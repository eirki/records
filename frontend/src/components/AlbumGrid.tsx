import type { AlbumT, SizeData, OverlayT } from "../types";

import Album from "./Album";
import Overlay from "./Overlay";
import { padding } from "../constants";

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

function calculateOverlay(
  gridIndex: number,
  sizeData: SizeData,
  album: AlbumT
): OverlayT {
  const colPosition = gridIndex % sizeData.nGridCols;
  const rowPosition = Math.floor(gridIndex / sizeData.nGridCols);
  const leftHalf = colPosition < Math.floor(sizeData.nGridCols / 2);
  const topHalf = rowPosition < Math.floor(sizeData.nRows / 2);

  const overlayColumn = leftHalf
    ? colPosition + 2
    : colPosition + 1 - sizeData.overlayMultiplier;
  const overlayRow = topHalf
    ? rowPosition + 1
    : rowPosition + 2 - sizeData.overlayMultiplier;

  const artUrl = getArtUrl(album, sizeData);
  const overlay: OverlayT = {
    overlayColumn,
    overlayRow,
    album,
    artUrl,
  };
  return overlay;
}

export default function Main({
  albums,
  extraAlbums,
  allAlbumIds,
  setSelectedAlbum,
  overlay,
  setOverlay,
  overlayIsContext,
  setOverlayIsContext,
  searchQuery,
  clearSearchQuery,
  refreshAlbums,
  sizeData,
}: {
  albums: AlbumT[];
  extraAlbums: AlbumT[];
  allAlbumIds: Set<string>;
  setSelectedAlbum: (album: AlbumT | null) => void;
  overlay: OverlayT | null;
  setOverlay: (overlay: OverlayT | null) => void;
  overlayIsContext: boolean;
  setOverlayIsContext: (_: boolean) => void;
  searchQuery: string;
  clearSearchQuery: () => void;
  refreshAlbums: () => Promise<void>;
  sizeData: SizeData;
}) {
  const nExtraAlbums = sizeData.nRows * sizeData.nGridCols - albums.length;
  const albumsWithExtra = albums.concat(extraAlbums.slice(0, nExtraAlbums));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${sizeData.nGridCols}, ${sizeData.cellSize}px)`,
        gridTemplateRows: `repeat(${sizeData.nRows}, ${sizeData.cellSize}px)`,
        position: "relative",
      }}
    >
      {albumsWithExtra.map((album, i) => (
        <div>
          <Album
            album={album}
            setSelectedAlbum={setSelectedAlbum}
            searchQuery={searchQuery}
            clearSearchQuery={clearSearchQuery}
            overlayData={calculateOverlay(i, sizeData, album)}
            overlayIsContext={overlayIsContext}
            setOverlayIsContext={setOverlayIsContext}
            setOverlay={setOverlay}
            sizeData={sizeData}
          />
        </div>
      ))}
      {overlay && (
        <Overlay
          overlay={overlay}
          overlayIsContext={overlayIsContext}
          setOverlayIsContext={setOverlayIsContext}
          setOverlay={setOverlay}
          allAlbumIds={allAlbumIds}
          refreshAlbums={refreshAlbums}
          sizeData={sizeData}
        />
      )}
    </div>
  );
}
