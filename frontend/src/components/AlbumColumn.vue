<template>
  <div class="albumColumn">
    <Album v-for="(album, i) in albums" class="album" :key="i" :album="album" :cellSize="cellSize" :padding="padding"
      :overlayMultiplier=overlayMultiplier :isInLibrary=areInLibrary v-on:play="propagatePlay($event)"
      v-on:hover="propagateHover($event)" v-on:clearHover=propagateClearHover
      v-on:refreshAlbums="propagateRefreshAlbums" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Album from "./Album.vue";
import type { AlbumT, OverlayT } from '../types.js'

const props = defineProps<{
  cellSize: number
  overlayMultiplier: number
  padding: number
  albums: AlbumT[]
  nRows: number
  areInLibrary: boolean
}>()

const emit = defineEmits<{
  (e: "play", arg: AlbumT): void
  (e: "hover", arg: OverlayT): void
  (e: "clearHover"): void
  (e: "refreshAlbums", cb: (() => void)): void
}>()

const cellSizeStr = computed(() => `${props.cellSize}px`)
const nAlbums = computed(() => props.albums.length)


function propagatePlay(arg: AlbumT) {
  emit("play", arg);
}

function propagateHover(arg: OverlayT) {
  emit("hover", arg);
}

function propagateClearHover() {
  emit("clearHover");
}

function propagateRefreshAlbums(cb: (() => void)) {
  emit("refreshAlbums", cb);
}


</script>

<style scoped>
.albumColumn {
  display: grid;
  grid-template-columns: repeat(1, v-bind(cellSizeStr));
  grid-template-rows: repeat(v-bind(nAlbums), v-bind(cellSizeStr));
  max-height: v-bind(nRows*cellSize);
  overflow-y: scroll;
  scrollbar-width: none;
  scroll-snap-type: y mandatory;
}

.albumColumn::-webkit-scrollbar {
  display: none;
}

.album {
  scroll-snap-align: start;
}
</style>
