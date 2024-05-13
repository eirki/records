<template>
  <div class="main-grid">
    <div class="left-grid">
      <template v-if="selectedAlbum && playerWidth > 0">
        <iframe class="player" :src="`https://open.spotify.com/embed/album/${selectedAlbum.id}`" :width="playerWidth"
          :height="playerHeight" frameborder="0" allowtransparency="true" allow="encrypted-media" />
      </template>
      <AlbumColumn :padding="padding" :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows="nRows - nLeftCols"
        v-on:play="handlePlay($event)" v-on:clearHover="clearHover" v-on:hover="hover($event)"
        v-on:refreshAlbums=refreshAlbums :areInLibrary=true class="albumColumn recentAlbums" :albums="recentAlbums" />
      <AlbumColumn v-if="recommendedAlbums && recommendedAlbums.length > 0" :padding="padding" :cellSize=cellSize
        :overlayMultiplier=overlayMultiplier :nRows="nRows - nLeftCols" v-on:play="handlePlay($event)"
        v-on:clearHover="clearHover" v-on:hover="hover($event)" v-on:refreshAlbums=refreshAlbums :areInLibrary=false
        class="albumColumn recommendedAlbums" :albums="recommendedAlbums" />

      <img class="albumArt" v-if="selectedAlbum" :src="selectedAlbum.images[0].url" :alt="selectedAlbum.name"
        :width=albumArtSize :height=albumArtSize @contextmenu="onAlbumArtContextMenu($event)" />
    </div>
    <div class="overlayGrid">
      <img v-if="overlayAlbum" class="album-overlay" :src="overlayAlbum.images[0].url" :alt="overlayAlbum.name"
        :width="homeOverlaySize" :height="homeOverlaySize" />
    </div>

    <AlbumGrid class="albumGrid" :albums="allAlbums" :extraAlbums="generalRecommendedAlbums" :padding="padding"
      v-on:play="handlePlay($event)" :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows=nRows
      :nCols="nCols - nLeftCols" :nColsAll=nCols />
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Ref } from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu'

import AlbumColumn from "../components/AlbumColumn.vue";
import AlbumGrid from "../components/AlbumGrid.vue";
import type { AlbumT, OverlayT } from '../types.js'
import getSquareSize from "../squareSize.js";

const allAlbums: Ref<AlbumT[]> = ref([])
let allAlbumsTitles = new Set<string>()
const recentAlbums: Ref<AlbumT[]> = ref([])
const recommendedAlbums: Ref<AlbumT[]> = ref([])
const generalRecommendedAlbums: Ref<AlbumT[]> = ref([])
const selectedAlbum: Ref<AlbumT | null> = ref(null)
const nAlbums = ref(0)

async function getRecommendedAlbums(seedAlbumId: string): Promise<AlbumT[]> {
  return fetch(`/recommendations/${seedAlbumId}`)
    .then(res => res.json())
    .then(data => filterRecommendedAlbums(data.recommended_albums))
}

function filterRecommendedAlbums(recommendedAlbums: AlbumT[]): AlbumT[] {
  return recommendedAlbums.filter(recommendedAlbum => allAlbumsTitles.has(recommendedAlbum.name) === false)
}

function getRandomAlbum(total: number) {
  return fetch(`/random_saved_album/${total}`)
    .then(res => res.json())
    .then((album: AlbumT) => {
      selectedAlbum.value = album
      return getRecommendedAlbums(album.id).then(albums => {
        recommendedAlbums.value = albums
      })
    })
}

async function populateAlbums() {
  let offset = 0
  let data = null
  do {
    const res = await fetch(`/paginated_albums/${offset}`);
    data = await res.json();
    nAlbums.value = data.total;
    if (allAlbums.value.length === 0) {
      // kind of a workaround
      checkSize()
      getRandomAlbum(data.total);
    }
    let concated = allAlbums.value.concat(data.albums);
    function cleanName(name: string) {
      name = name.toLowerCase();
      name = name.replace("the ", "");
      return name;
    }
    concated.sort((a, b) => {
      const aName = cleanName(a.artists[0].name);
      const bName = cleanName(b.artists[0].name);
      if (aName !== bName) {
        return aName.localeCompare(bName);
      } else {
        return a.releaseDate.localeCompare(b.releaseDate);
      }
    });
    allAlbums.value = concated;
    offset = allAlbums.value.length
  } while (data?.has_next)
  recentAlbums.value = [...allAlbums.value].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  allAlbumsTitles = new Set(allAlbums.value.map(album => album.name))
  getRecommendedAlbums(getRandom(data.albums).id).then(albums => {
    generalRecommendedAlbums.value = albums
  })
}

function randomAlbum() {
  return allAlbums.value[Math.floor(Math.random() * allAlbums.value.length)]
}



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

function calculateMaxSquareSize(y: number, x: number, n: number) {
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
  return { ...res, colsToAdd: colsToAdd, nAdded: nAdded }
}

function calculateBestSquareSize(y: number, x: number, n: number, nAdded: number) {
  let res
  let colsToAdd

  const suggestions = [...Array(20).keys()].map(toAdd => {
    res = getSquareSize({ y: y, x: x, n: n + nAdded + toAdd });
    colsToAdd = Math.floor(playerMaxWidth.value / res.cellSize) + 2
    const width = x - (res.nCols * res.cellSize)
    const height = y - (res.nRows * res.cellSize)
    const totalPadding = width + height
    res = { ...res, colsToAdd: colsToAdd, totalPadding: totalPadding, nAdded: nAdded + toAdd }
    return res
  })
  suggestions.sort((a, b) => a.totalPadding - b.totalPadding)
  return suggestions[0]

}

function checkSize() {
  let y = window.innerHeight - (8 * 2)
  let x = window.innerWidth - (8 * 2)
  let n = nAlbums.value

  let res = calculateMaxSquareSize(y, x, n)
  res = calculateBestSquareSize(y, x, n, res.nAdded)
  cellSize.value = res.cellSize
  // console.log("cellSize", cellSize)
  nRows.value = res.nRows
  // console.log("nRows", nRows)
  nCols.value = res.nCols
  nGridCols.value = nCols.value - res.colsToAdd
  // console.log("nGridCols", nGridCols)
  nLeftCols.value = res.colsToAdd
  albumColumnN.value = nRows.value - nLeftCols.value
  leftColSize.value = `${nLeftCols.value * cellSize.value}px`
  albumArtSize.value = (cellSize.value * nLeftCols.value) - (padding.value * 2)
  // console.log("albumArtSize", albumArtSize)
  playerWidth.value = (cellSize.value * (res.colsToAdd - 2)) - (padding.value * 2)
  playerHeight.value = (cellSize.value * (nRows.value - res.colsToAdd)) - (padding.value * 2)

  overlayMultiplier.value = Math.floor(Math.min(nRows.value, nGridCols.value) / 2)
  // console.log("overlayMultiplier", overlayMultiplier)
  if ((nRows.value + 1) < nGridCols.value) {
    // vertical overlay can include cellSize of album being hovered, because it starts at the base of the album being hovered. This rule must
    // not kick in if difference between nRows and nGridCols is 1 or 0 becayse then the overlay would be too big
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
  selectedAlbum.value = album_data;
  recommendedAlbums.value = []
  getRecommendedAlbums(album_data.id).then(albums => {
    recommendedAlbums.value = albums
  })

}

function hover(arg: OverlayT) {
  overlayAlbum.value = arg.data
}

function clearHover() {
  overlayAlbum.value = null
}

function refreshAlbums(callback: (() => void)) {
  fetch(`/albums`).then(res => res.json()).then(data => {
    allAlbums.value = data.allAlbums
    recentAlbums.value = data.recentAlbums
    checkSize()
    callback()
  })
}


function getRandom(list: any) {
  return list[Math.floor((Math.random() * list.length))];
}


onMounted(() => {
  populateAlbums()
})

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
  grid-row-end: v-bind(albumColumnN + 1);
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
