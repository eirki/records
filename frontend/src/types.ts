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
    leftHalf: boolean
    topHalf: boolean
    colPosition: number
    rowPosition: number
    data: AlbumT
}
