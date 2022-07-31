<template>
    <div class="album-grid">
        <Album v-for="(album, i) in albums" :key="`${i}-${album.id}`" :album="album" :cellSize="cellSize"
            :padding="padding" :overlayMultiplier=0 :nCols=nCols :nRows=nRows :index=i :nColsAll=nColsAll
            :isInLibrary=true v-on:play="propagatePlay($event)" v-on:refreshAlbums="propagateRefreshAlbums"
            :useBigArt=true />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import Album from "./Album.vue";
import type { AlbumT } from '../types.js'


const props = defineProps<{
    albums: AlbumT[]
    cellSize: number
    padding: number
    nRows: number
    nCols: number
    nColsAll: number
}>()

const emit = defineEmits<{
    (e: "play", arg: AlbumT): void
    (e: "refreshAlbums", arg: (() => void)): void
}>()


const cellSizeStr = computed(() => `${props.cellSize}px`)


function propagatePlay(arg: AlbumT) {
    emit("play", arg);
}
function propagateRefreshAlbums(cb: (() => void)) {
    emit("refreshAlbums", cb);
}

</script>


<style scoped>
.album-grid {
    display: grid;
    grid-template-columns: repeat(v-bind(nCols), v-bind(cellSizeStr));
    grid-template-rows: repeat(v-bind(nRows), v-bind(cellSizeStr));
}
</style>
