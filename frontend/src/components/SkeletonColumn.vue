<template>
    <div class="albumColumn">
        <div v-for="_ in nRows" class="container" :style="{
            padding: `${padding}px`
        }">
            <Skeletor :width=myCellsSize :height=myCellsSize />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Skeletor } from 'vue-skeletor';
import 'vue-skeletor/dist/vue-skeletor.css';

const props = defineProps<{
    cellSize: number
    padding: number
    nRows: number
}>()
const myCellsSize = props.cellSize - props.padding
const cellSizeStr = computed(() => `${props.cellSize}px`)


</script>

<style scoped>
.albumColumn {
    display: grid;
    grid-template-columns: repeat(1, v-bind(cellSizeStr));
    grid-template-rows: repeat(v-bind(nRows), v-bind(cellSizeStr));
    max-height: v-bind(nRows * cellSize);
    scrollbar-width: none;
}

.albumColumn::-webkit-scrollbar {
    display: none;
}
</style>
