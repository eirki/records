export type ImageT = { url: string }

interface ArtistT {
    name: string
    id: string
}

export interface AlbumT {
    name: string
    id: string
    uri: string
    images: [ImageT, ImageT, ImageT]
    artists: ArtistT[]
    releaseDate: string
    addedAt: string
}

export interface OverlayT {
    overlayColumn: number
    overlayRow: number
    album: AlbumT
    artUrl: string
}

export interface SizeData {
    cellSize: number;
    nRows: number;
    nCols: number;
    nSidebarCols: number;
    nGridCols: number;
    albumColumnN: number;
    // leftColSize: number;
    // albumArtSize: number;
    // playerWidth: number;
    // playerHeight: number;
    overlaySize: number;
    overlayMultiplier: number;
}
