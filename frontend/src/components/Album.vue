<template>
  <div class="container" :style="{
    padding: `${padding}px`
  }" @click="play">
    <img class="album-art" :src="artUrl" :alt="album.name" :width=cellSize :height=cellSize @mouseover="hover"
      @mouseleave="clearHover" />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AlbumT, OverlayT } from '../types.js'
// import Toasted from "vue-toasted";
// import Vue from "vue";
// Vue.use(Toasted, {
//   theme: "toasted-primary",
//   position: "bottom-center",
//   duration: 5000,
// });


const props = defineProps<{
  album: AlbumT
  cellSize: number
  overlayMultiplier: number
  padding: number
  index?: number
  nRows?: number
  nCols?: number
  nColsAll?: number
}>()

const emit = defineEmits<{
  (e: "play", arg: AlbumT): void
  (e: "hover", arg: OverlayT): void
  (e: "clearHover"): void
}>()


const colPosition = computed(() => (props.index === undefined || props.nCols === undefined ? 1 : props.index % props.nCols))
const rowPosition = computed(() => (props.index === undefined || props.nCols === undefined ? 1 : Math.floor(props.index / props.nCols)))
const leftHalf = computed(() => {
  if (props.index === undefined || props.nCols === undefined) {
    return false
  }
  return colPosition.value < Math.floor(props.nCols / 2)
})
const topHalf = computed(() => {
  if (props.index === undefined || props.nRows === undefined) {
    return false
  }
  return rowPosition.value < Math.floor(props.nRows / 2)
})
const artUrl = computed(() => {
  if (props.cellSize <= 64) {
    return props.album.images[2].url;
  } else if (props.cellSize <= 300) {
    return props.album.images[1].url;
  } else {
    return props.album.images[0].url;
  }
})

function hover() {
  let arg: OverlayT = {
    leftHalf: leftHalf.value,
    topHalf: topHalf.value,
    colPosition: colPosition.value,
    rowPosition: rowPosition.value,
    data: props.album,
  }
  emit("hover", arg);
}

function clearHover() {
  emit("clearHover");
}

function play() {
  emit("play", props.album);
  emit("clearHover");
  // Vue.toasted.clear();
  // Vue.toasted.show(this.playingMessage);
}

</script>

<style scoped>
.container {
  position: static;
  box-sizing: border-box;
  cursor: pointer;
}

.container:hover {
  outline: 1px solid white;
  outline-offset: -3px;
}


.album-art {
  max-width: 100%;
  max-height: 100%;
}
</style>
