<template>
  <div class="main-grid">
    <div class="left-grid">
      <iframe class="player" :src="`https://open.spotify.com/embed/album/${selected_album.id}`" :width="playerWidth"
        :height="playerHeight" frameborder="0" allowtransparency="true" allow="encrypted-media" />
      <AlbumColumn :padding="padding" :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows="nRows - nLeftCols"
        v-on:play="handlePlay($event)" v-on:clearHover="clearHover" v-on:hover="hover($event)"
        v-on:refreshAlbums=refreshAlbums :areInLibrary=true class="albumColumn recentAlbums" :albums="recent_albums" />
      <AlbumColumn :padding="padding" :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows="nRows - nLeftCols"
        v-on:play="handlePlay($event)" v-on:clearHover="clearHover" v-on:hover="hover($event)"
        v-on:refreshAlbums=refreshAlbums :areInLibrary=false class="albumColumn recommendedAlbums"
        :albums="recommended_albums" />

      <img class="albumArt" :src="selected_album.images[0].url" :alt="selected_album.name" :width=albumArtSize
        :height=albumArtSize @contextmenu="onAlbumArtContextMenu($event)" />
    </div>
    <div class="overlayGrid">
      <img v-if="overlayAlbum" class="album-overlay" :src="overlayAlbum.images[0].url" :alt="overlayAlbum.name"
        :width="homeOverlaySize" :height="homeOverlaySize" />
    </div>

    <AlbumGrid class="albumGrid" :albums="all_albums" :padding="padding" v-on:play="handlePlay($event)"
      :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows=nRows :nCols="nCols - nLeftCols" :nColsAll=nCols />
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu'

import AlbumColumn from "../components/AlbumColumn.vue";
import AlbumGrid from "../components/AlbumGrid.vue";
import type { AlbumT, OverlayT } from '../types.js'

import getSquareSize from "../squareSize.js";


const props = defineProps<{
  all_albums: AlbumT[]
  recent_albums: AlbumT[]
  recommended_albums: AlbumT[]
}>()

const all_albums = ref(props.all_albums)
const recent_albums = ref(props.recent_albums)
const recommended_albums = ref(props.recommended_albums)

function randomAlbum() {
  return all_albums.value[Math.floor(Math.random() * all_albums.value.length)]
}
const selected_album = ref(randomAlbum())
const playerMaxWidth = ref(400);
const padding = ref(2);
const cellSize = ref(0);
const cellSizeStr = computed(() => `${cellSize.value}px`)
const nRows = ref(0);
const nCols = ref(0);
const nLeftCols = ref(0);
const nGridCols = ref(0);
const albumColumnN = ref(0);
const leftColSize = ref("0px");
const albumArtSize = ref(0);
const playerWidth = ref(0);
const playerHeight = ref(0);
const overlayMultiplier = ref(0);
const overlayAlbum: Ref<AlbumT | null> = ref(null);
const homeOverlaySize = ref(0);


function checkSize() {
  let y = window.innerHeight - (8 * 2)
  let x = window.innerWidth - (8 * 2)
  let n = all_albums.value.length
  let nAdded = 1
  let res
  let colsToAdd
  do {
    res = getSquareSize({ y: y, x: x, n: n + nAdded });
    colsToAdd = Math.floor(playerMaxWidth.value / res.cellSize) + 2
    if (nAdded < res.nRows * colsToAdd) {
      nAdded++
      continue
    } else {
      break
    }
  } while (nAdded < (n * 100))
  cellSize.value = res.cellSize
  // console.log("cellSize", cellSize)
  nRows.value = res.nRows
  // console.log("nRows", nRows)
  nCols.value = res.nCols
  nGridCols.value = nCols.value - colsToAdd
  // console.log("nGridCols", nGridCols)
  nLeftCols.value = colsToAdd
  albumColumnN.value = nRows.value - nLeftCols.value
  leftColSize.value = `${nLeftCols.value * cellSize.value}px`
  albumArtSize.value = (cellSize.value * nLeftCols.value) - (padding.value * 2)
  // console.log("albumArtSize", albumArtSize)
  playerWidth.value = (cellSize.value * (colsToAdd - 2)) - (padding.value * 2)
  playerHeight.value = (cellSize.value * (nRows.value - colsToAdd)) - (padding.value * 2)

  overlayMultiplier.value = Math.floor(Math.min(nRows.value, nGridCols.value) / 2)
  // console.log("overlayMultiplier", overlayMultiplier)
  if (nRows.value < nGridCols.value) {
    // vertical overlay can include cellSize of album being hovered
    overlayMultiplier.value++
    // console.log("overlayMultiplier", overlayMultiplier)
  }
  // console.log("overlayMultiplier", overlayMultiplier)
  homeOverlaySize.value = cellSize.value * overlayMultiplier.value - padding.value * 2
}

function onAlbumArtContextMenu(e: MouseEvent) {
  e.preventDefault();
  ContextMenu.showContextMenu({
    customClass: "context-menu",
    iconFontClass: "context-menu__icon",
    x: e.x,
    y: e.y,
    items: [
      {
        label: "Shuffle album",
        onClick: () => selected_album.value = randomAlbum(),
      }
    ]
  })
}
function handlePlay(album_data: AlbumT) {
  selected_album.value = album_data;
}

function hover(arg: OverlayT) {
  overlayAlbum.value = arg.data
}

function clearHover() {
  overlayAlbum.value = null
}

function refreshAlbums(callback: (() => void)) {
  fetch(`/albums`).then(res => res.json()).then(data => {
    all_albums.value = data.all_albums
    recent_albums.value = data.recent_albums
    recommended_albums.value = data.recommended_albums
    checkSize()
    callback()
  })
}

checkSize()
window.addEventListener("resize", checkSize);

</script>

<style>
.Vue-Toastification__toast--default.custom-toast {
  background-color: #333;
  color: white;
  border-radius: 0px;
}

.Vue-Toastification__toast--error.custom-toast {
  background-color: #333;
  color: white;
  border-radius: 0px;
}

.context-menu {
  border-radius: 0px;
}

.context-menu__icon {
  max-width: 0px;
}

.mx-context-menu-item.disabled {
  cursor: default;
}
</style>
<style scoped>
.main-grid {
  display: grid;
  grid-template-columns: [left-col] v-bind(leftColSize) [right-col] min-content;
}

.left-grid {
  display: grid;
  grid-template-columns: repeat(v-bind(nLeftCols), v-bind(cellSizeStr));
  grid-template-rows: repeat(v-bind(nRows), v-bind(cellSizeStr));
}

.albumGrid {
  grid-column-start: right-col;
  grid-row-start: 1;
  z-index: 0
}

.overlayGrid {
  grid-column-start: right-col;
  grid-row-start: 1;
  z-index: 1
}

.player {
  padding: 2px;
  grid-column-start: 1;
  grid-row-start: 1;
}

.albumColumn {
  grid-row-start: 1;
  grid-row-end: v-bind(albumColumnN+1);
}

.recentAlbums {
  grid-column-start: -3;
}

.recommendedAlbums {
  grid-column-start: -2;

}

.albumArt {
  padding: 2px;
  grid-column-start: 1;
  grid-row-start: v-bind(- nLeftCols - 1);
}

.album-overlay {
  padding: 2px;
}
</style>
