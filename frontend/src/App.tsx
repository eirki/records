import type { AlbumT, SizeData, OverlayT } from "./types";
import Spinner from "./components/Spinner";
import getSquareSize from "./squareSize";
import AlbumGrid from "./components/AlbumGrid";
import Sidebar from "./components/Sidebar";

import { playerMaxWidth } from "./constants";
import { useState, useEffect } from "react";

async function getRecommendedAlbums(
  seedAlbumId: string,
  allAlbumsTitles: Set<string>
): Promise<AlbumT[]> {
  // return [];
  // FIXME
  return fetch(`/recommendations/${seedAlbumId}`)
    .then((res) => res.json())
    .then((data) =>
      filterRecommendedAlbums(data.recommended_albums, allAlbumsTitles)
    );
}

function filterRecommendedAlbums(
  recommendedAlbums: AlbumT[],
  allAlbumsTitles: Set<string>
): AlbumT[] {
  const blarg = recommendedAlbums.filter(
    (recommendedAlbum) => allAlbumsTitles.has(recommendedAlbum.name) === false
  );
  return blarg;
}

function calculateMaxSquareSize(y: number, x: number, n: number) {
  // Calculate the maximum square size that can fit in the given dimensions
  // Add items to make place for sidebar
  let nAdded = 1;
  let res;
  let colsToAdd;

  do {
    res = getSquareSize({ y: y, x: x, n: n + nAdded });
    colsToAdd = Math.floor(playerMaxWidth / res.cellSize) + 2;
    if (nAdded < res.nRows * colsToAdd) {
      nAdded++;
      continue;
    } else {
      break;
    }
  } while (nAdded < n * 100);
  return { ...res, colsToAdd: colsToAdd, nAdded: nAdded };
}

function calculateBestSquareSize(
  y: number,
  x: number,
  n: number,
  nAdded: number
) {
  // Calculate the best square size that can fit in the given dimensions
  // Do so 20 times, adding 0 to 20 items, and returning the one with the least padding
  let res;
  let colsToAdd;

  const suggestions = [...Array(20).keys()].map((toAdd) => {
    res = getSquareSize({ y: y, x: x, n: n + nAdded + toAdd });
    colsToAdd = Math.floor(playerMaxWidth / res.cellSize) + 2;
    const width = x - res.nCols * res.cellSize;
    const height = y - res.nRows * res.cellSize;
    const totalPadding = width + height;
    res = {
      ...res,
      colsToAdd: colsToAdd,
      totalPadding: totalPadding,
      nAdded: nAdded + toAdd,
    };
    return res;
  });
  suggestions.sort((a, b) => a.totalPadding - b.totalPadding);
  return suggestions[0];
}

function checkSize(n: number, setSizeData: (sizeData: SizeData) => void) {
  // console.log("checking size for", n, "albums");
  let y = window.innerHeight - 8 * 2;
  let x = window.innerWidth - 8 * 2;

  let res = calculateMaxSquareSize(y, x, n);
  res = calculateBestSquareSize(y, x, n, res.nAdded);
  const cellSize = res.cellSize;
  // console.log("cellSize", cellSize)
  const nRows = res.nRows;
  // console.log("nRows", nRows)
  const nCols = res.nCols;
  const nGridCols = nCols - res.colsToAdd;
  // console.log("nGridCols", nGridCols)
  const nSidebarCols = res.colsToAdd;
  const albumColumnN = nRows - nSidebarCols;
  // const leftColSize = `${nSidebarCols * cellSize}px`;
  // const albumArtSize = cellSize * nSidebarCols - padding * 2;
  // console.log("albumArtSize", albumArtSize)
  // const playerWidth = cellSize * (res.colsToAdd - 2) - padding * 2;
  // const playerHeight = cellSize * (nRows - res.colsToAdd) - padding * 2;

  let overlayMultiplier = Math.floor(Math.min(nRows, nGridCols) / 2);
  // console.log("overlayMultiplier", overlayMultiplier)
  if (nRows + 1 < nGridCols) {
    // vertical overlay can include cellSize of album being hovered, because it starts at the base of the album being hovered. This rule must
    // not kick in if difference between nRows and nGridCols is 1 or 0 becayse then the overlay would be too big
    overlayMultiplier++;
    // console.log("overlayMultiplier", overlayMultiplier)
  }
  // console.log("overlayMultiplier", overlayMultiplier)

  const overlaySize = cellSize * overlayMultiplier;
  const sizeData: SizeData = {
    cellSize: cellSize,
    nRows: nRows,
    nCols: nCols,
    nSidebarCols: nSidebarCols,
    nGridCols: nGridCols,
    albumColumnN: albumColumnN,
    overlayMultiplier: overlayMultiplier,
    overlaySize: overlaySize,
  };
  // console.log(sizeData);
  setSizeData(sizeData);
}

function selectRandomAlbum(
  total: number,
  setSelectedAlbum: (album: AlbumT) => void
) {
  return fetch(`/random_saved_album/${total}`)
    .then((res) => res.json())
    .then(setSelectedAlbum);
}

function getRandom(list: any) {
  return list[Math.floor(Math.random() * list.length)];
}

function cleanName(name: string) {
  name = name.toLowerCase();
  name = name.replace("the ", "");
  return name;
}

function albumSortCompare(a: AlbumT, b: AlbumT) {
  const aName = cleanName(a.artists[0].name);
  const bName = cleanName(b.artists[0].name);
  if (aName !== bName) {
    return aName.localeCompare(bName);
  } else {
    return a.releaseDate.localeCompare(b.releaseDate);
  }
}
async function callApi(offset: number) {
  const res = await fetch(`/paginated_albums/${offset}`);
  if (!res.ok) {
    throw new Error("Failed to fetch albums");
  }
  const data = await res.json();
  return data;
}

async function* iterAlbums(
  setSelectedAlbum: (album: AlbumT) => void,
  setSizeData: (sizeData: SizeData) => void
) {
  let offset = 0;
  let data = await callApi(offset);
  checkSize(data.total, setSizeData);
  selectRandomAlbum(data.total, setSelectedAlbum);

  yield data;
  while (data.has_next) {
    offset += data.albums.length;
    data = await callApi(offset);
    yield data;
  }
}

async function populateAlbums(
  setAllAlbums: (albums: AlbumT[]) => void,
  setSelectedAlbum: (album: AlbumT) => void,
  setSizeData: (sizeData: SizeData) => void
) {
  let allAlbums: AlbumT[] = [];
  for await (const data of iterAlbums(setSelectedAlbum, setSizeData)) {
    allAlbums = allAlbums.concat(data.albums);
    allAlbums.sort(albumSortCompare);
    setAllAlbums(allAlbums);
  }
  return allAlbums;
}

async function refreshAlbums(
  setAllAlbums: (albums: AlbumT[]) => void,
  setSizeData: (sizeData: SizeData) => void
) {
  const noop = () => {};
  let allAlbums: AlbumT[] = [];
  for await (const data of iterAlbums(noop, noop)) {
    allAlbums = allAlbums.concat(data.albums);
    allAlbums.sort(albumSortCompare);
  }
  setAllAlbums(allAlbums);
  checkSize(allAlbums.length, setSizeData);
}

export default function Main() {
  const [isError, setIsError] = useState<boolean>(false);
  const [allAlbums, setAllAlbums] = useState<AlbumT[]>([]);
  const [allAlbumIds, setAllAlbumIds] = useState<Set<string>>(new Set());
  const [recentAlbums, setRecentAlbums] = useState<AlbumT[]>([]);
  const [recommendedAlbums, setRecommendedAlbums] = useState<AlbumT[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumT | null>(null);
  const [generalRecommendedAlbums, setGeneralRecommendedAlbums] = useState<
    AlbumT[]
  >([]);
  const [sizeData, setSizeData] = useState<SizeData | null>(null);
  const [overlay, setOverlay] = useState<OverlayT | null>(null);
  const [overlayIsContext, setOverlayIsContext] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  let allAlbumsTitles: Set<string> = new Set();
  useEffect(() => {
    populateAlbums(setAllAlbums, setSelectedAlbum, setSizeData)
      .then((albums) => {
        setRecentAlbums(
          [...albums].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        );
        allAlbumsTitles = new Set(albums.map((album) => album.name));
        const seedAlbumId = getRandom(albums).id;
        getRecommendedAlbums(seedAlbumId, allAlbumsTitles).then(
          setGeneralRecommendedAlbums
        );
      })
      .catch((error) => {
        console.error("Error fetching albums:", error);
        setIsError(true);
      });
  }, []);

  let resizeTimeout: any;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(
      () => checkSize(allAlbums.length, setSizeData),
      200
    );
  });

  useEffect(() => {
    setRecommendedAlbums([]);
    if (selectedAlbum === null) {
      return;
    }
    getRecommendedAlbums(selectedAlbum.id, allAlbumsTitles).then(
      setRecommendedAlbums
    );
  }, [selectedAlbum]);

  useEffect(() => {
    setAllAlbumIds(new Set(allAlbums.map((album) => album.id)));
  }, [allAlbums]);

  function clearSearchQuery() {
    setSearchQuery("");
  }
  if (isError) {
    return <div>Error loading albums</div>;
  }

  if (allAlbums.length === 0 || sizeData === null || selectedAlbum === null) {
    return <Spinner />;
  }
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        recentAlbums={recentAlbums}
        recommendedAlbums={recommendedAlbums}
        selectedAlbum={selectedAlbum}
        setSelectedAlbum={setSelectedAlbum}
        overlayIsContext={overlayIsContext}
        setOverlayIsContext={setOverlayIsContext}
        setOverlay={setOverlay}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sizeData={sizeData}
      />
      <AlbumGrid
        albums={allAlbums}
        extraAlbums={generalRecommendedAlbums}
        allAlbumIds={allAlbumIds}
        setSelectedAlbum={setSelectedAlbum}
        sizeData={sizeData}
        overlay={overlay}
        overlayIsContext={overlayIsContext}
        setOverlayIsContext={setOverlayIsContext}
        searchQuery={searchQuery}
        clearSearchQuery={clearSearchQuery}
        setOverlay={setOverlay}
        refreshAlbums={() => refreshAlbums(setAllAlbums, setSizeData)}
      />
    </div>
  );
}
