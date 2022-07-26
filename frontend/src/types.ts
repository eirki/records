export type ImageT = { url: string }

export interface AlbumT {
    name: string
    id: string
    uri: string
    images: [ImageT, ImageT, ImageT]
}

export interface OverlayT {
    leftHalf: boolean
    topHalf: boolean
    colPosition: number
    rowPosition: number
    data: AlbumT
}
