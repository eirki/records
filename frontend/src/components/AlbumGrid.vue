<template>
  <div class="container">
    <div class="album-grid">
      <img v-if="overlayAlbum" class="album-overlay" :src="overlayAlbum.data.images[0].url" :alt="overlayAlbum.data.name"
        :width="overlaySize" :height="overlaySize" />
    </div>
    <div class="album-grid">
      <Album v-for="(album, i) in albumsWithExtra" :key="`${i}-${album.id}`" :album="album" :cellSize="cellSize"
        :padding="padding" :overlayMultiplier=overlayMultiplier :nCols=nCols :nRows=nRows :index=i :nColsAll=nColsAll
        :isInLibrary=true v-on:play="propagatePlay($event)" v-on:hover="hover($event)" v-on:clearHover="clearHover"
        v-on:refreshAlbums="propagateRefreshAlbums" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ref } from 'vue';

import Album from "./Album.vue";
import type { AlbumT, OverlayT } from '../types.js'


const props = defineProps<{
  albums: AlbumT[]
  extraAlbums: AlbumT[]
  cellSize: number
  overlayMultiplier: number
  padding: number
  nRows: number
  nCols: number
  nColsAll: number
}>()

const emit = defineEmits<{
  (e: "play", arg: AlbumT): void
  (e: "refreshAlbums", arg: (() => void)): void
}>()

const overlayAlbum: Ref<OverlayT | null> = ref(null);

const cellSizeStr = computed(() => `${props.cellSize}px`)
const overlaySize = computed(() => props.cellSize * props.overlayMultiplier - props.padding * 2)
const overlayColumn = computed(() => {
  if (!overlayAlbum.value) {
    return 1
  } else if (overlayAlbum.value.leftHalf) {
    return overlayAlbum.value.colPosition + 2
  } else {
    return overlayAlbum.value.colPosition + 1 - props.overlayMultiplier
  }
})
const overlayRow = computed(() => {
  if (!overlayAlbum.value) {
    return 1
  } else if (overlayAlbum.value.topHalf) {
    return overlayAlbum.value.rowPosition + 1
  } else {
    return overlayAlbum.value.rowPosition + 2 - props.overlayMultiplier
  }
})

const nExtraAlbums = computed(() => (props.nRows * props.nCols) - props.albums.length)
const albumsWithExtra = computed(() => props.albums.concat(props.extraAlbums.slice(0, nExtraAlbums.value)))


function propagatePlay(arg: AlbumT) {
  emit("play", arg);
}

function hover(arg: OverlayT) {
  overlayAlbum.value = arg
}

function clearHover() {
  overlayAlbum.value = null
}

function propagateRefreshAlbums(cb: (() => void)) {
  emit("refreshAlbums", cb);
}

</script>


<style scoped>
.container {
  position: relative;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(v-bind(nCols), v-bind(cellSizeStr));
  grid-template-rows: repeat(v-bind(nRows), v-bind(cellSizeStr));
  position: absolute;
}

.album-overlay {
  grid-row-start: v-bind(overlayRow);
  grid-column-start: v-bind(overlayColumn);
  padding: 2px;
  z-index: 1
}
</style>
