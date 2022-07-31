<template>
    <div class="main-grid">
        <AlbumGridMobile class="albumGrid" :albums="all_albums" :padding="padding" v-on:play="handlePlay($event)"
            :cellSize=cellSize :overlayMultiplier=0 :nRows=nRows :nCols=nCols :nColsAll=nCols />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AlbumGridMobile from "../src/components/AlbumGridMobile.vue";
import type { AlbumT } from '../src/types.js'

import getSquareSize from "../src/squareSize.js";


const props = defineProps<{
    all_albums: AlbumT[]
    recent_albums: AlbumT[]
    recommended_albums: AlbumT[]
}>()

const all_albums = ref(props.all_albums)

const padding = ref(2);
const cellSize = ref(0);
const cellSizeStr = computed(() => `${cellSize.value}px`)
const nRows = ref(0);
const nCols = ref(0);

function checkSize() {
    let y = window.innerHeight - (8 * 2)
    let x = window.innerWidth - (8 * 2)
    let n = all_albums.value.length
    let res = getSquareSize({ y: y, x: x, n: n });
    cellSize.value = res.cellSize
    // console.log("cellSize", cellSize)
    nRows.value = res.nRows
    // console.log("nRows", nRows)
    nCols.value = res.nCols
}

checkSize()
window.addEventListener("resize", checkSize);

function handlePlay(album_data: AlbumT) {
    let url = `https://open.spotify.com/album/${album_data.id}`
    window.open(url, "_blank")

}

</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(v-bind(nCols), v-bind(cellSizeStr));
    grid-template-rows: repeat(v-bind(nRows), v-bind(cellSizeStr));
}
</style>
