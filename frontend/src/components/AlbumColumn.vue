<template>
  <div class="albumColumn">
    <Album v-for="album in albums" class="album" :key="`recent_${album.id}`" :album="album" :size="cellSize"
      :padding="padding" :overlayMultiplier=overlayMultiplier v-on:play="propagatePlay($event)"
      v-on:hover="propagateHover($event)" v-on:clearHover="propagateClearHover($event)" />
  </div>
</template>

<script lang="ts">
import Album from "./Album.vue";


export default {
  components: {
    Album,
  },
  props: {
    cellSize: Number,
    overlayMultiplier: Number,
    padding: Number,
    albums: Array,
    nRows: Number,
  },
  methods: {
    propagatePlay(arg) {
      this.$emit("play", arg);
    },
    propagateClearHover() {
      this.$emit("clearHover");
    },
    propagateHover(arg) {
      this.$emit("hover", arg.data);
    },
  },
  computed: {
    cellSizeStr(): String {
      return `${this.cellSize}px`
    }
  },
};
</script>

<style scoped>
.albumColumn {
  display: grid;
  grid-template-columns: repeat(1, v-bind(cellSizeStr));
  grid-template-rows: repeat(v-bind(albums.length), v-bind(cellSizeStr));
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
