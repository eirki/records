import Button from "./Button";
import { useState } from "react";
import Spinner from "./Spinner";
import type { AlbumT, SizeData, OverlayT } from "../types";
import { padding } from "../constants";
import minus from "../assets/circle-minus-solid-full.svg";
import plus from "../assets/circle-plus-solid-full.svg";
import xmark from "../assets/circle-xmark-solid-full.svg";

function Context({
  album,
  allAlbumIds,
  setOverlayIsContext,
  setOverlay,
  refreshAlbums,
}: {
  album: AlbumT;
  allAlbumIds: Set<string>;
  setOverlayIsContext: (_: boolean) => void;
  setOverlay: (overlay: OverlayT | null) => void;
  refreshAlbums: () => Promise<void>;
}) {
  const isSaved = allAlbumIds.has(album.id);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  function toggleInLibrary(url: string) {
    setIsWaiting(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshAlbums().then(() => setIsWaiting(false));
        } else {
          setIsWaiting(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setIsWaiting(false);
      });
  }
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: 8,
      }}
    >
      {isWaiting && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Spinner />
        </div>
      )}

      <div
        style={{ color: "white", fontFamily: "sans-serif", lineHeight: 1.4 }}
      >
        <div style={{ fontSize: 20, fontWeight: 600, paddingBottom: 10 }}>
          <a
            className="no-underline"
            style={{
              color: "white",
            }}
            target="_blank"
            href={`https://open.spotify.com/album/${album.id}`}
          >
            {album.name}
          </a>
        </div>
        <div style={{ fontSize: 14, fontWeight: 400, paddingBottom: 10 }}>
          <a
            className="no-underline"
            style={{
              color: "white",
            }}
            target="_blank"
            href={`https://open.spotify.com/artist/${album.artists[0].id}`}
          >
            {album.artists.map((artist) => artist.name).join(", ")}
          </a>
        </div>
        {isSaved ? (
          <Button
            title="Remove from library"
            disabled={isWaiting}
            path={minus}
            onClick={() => toggleInLibrary(`/remove_album/${album.id}`)}
          />
        ) : (
          <Button
            title="Add to library"
            disabled={isWaiting}
            path={plus}
            onClick={() => toggleInLibrary(`/add_album/${album.id}`)}
          />
        )}
      </div>
      <Button
        title="Clear search"
        path={xmark}
        onClick={() => {
          setOverlay(null);
          setOverlayIsContext(false);
        }}
      />
    </div>
  );
}

export default function Main({
  overlay,
  overlayIsContext,
  setOverlayIsContext,
  setOverlay,
  allAlbumIds,
  refreshAlbums,
  sizeData,
}: {
  overlay: OverlayT;
  overlayIsContext: boolean;
  setOverlayIsContext: (_: boolean) => void;
  setOverlay: (overlay: OverlayT | null) => void;
  allAlbumIds: Set<string>;
  refreshAlbums: () => Promise<void>;
  sizeData: SizeData;
}) {
  const overlaySize = sizeData.overlaySize - padding * 2;

  return (
    <div
      style={{
        gridColumnStart: overlay.overlayColumn,
        gridRowStart: overlay.overlayRow,
        position: "absolute",
        padding: `${padding}px`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: overlaySize,
          height: overlaySize,
        }}
      >
        <img
          src={overlay.artUrl}
          alt={overlay.album.name}
          width={overlaySize}
          height={overlaySize}
          style={{
            display: "block",
            filter: overlayIsContext ? "brightness(20%)" : "none",
          }}
        />

        {overlayIsContext && (
          <Context
            album={overlay.album}
            allAlbumIds={allAlbumIds}
            refreshAlbums={refreshAlbums}
            setOverlayIsContext={setOverlayIsContext}
            setOverlay={setOverlay}
          />
        )}
      </div>
    </div>
  );
}
