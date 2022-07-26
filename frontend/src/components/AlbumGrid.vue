<template>
  <div class="container">
    <div class="album-grid">
      <img v-if="overlayAlbum" class="album-overlay" :src="overlayAlbum.data.images[0].url"
        :alt="overlayAlbum.data.name" :width="overlaySize" :height="overlaySize" />
    </div>
    <div class="album-grid">
      <Album v-for="(album, index) in albums" :key="`all_${album.id}`" :album="album" :size="cellSize"
        :padding="padding" :overlayMultiplier=overlayMultiplier :nCols=nCols :nRows=nRows :index=index
        :nColsAll=nColsAll v-on:play="propagatePlay($event)" v-on:hover="hover($event)"
        v-on:clearHover="clearHover()" />
    </div>
  </div>
</template>

<script lang="ts">
import Album from "./Album.vue";


export default {
  components: {
    Album,
  },
  props: {
    albums: Array,
    cellSize: Number,
    overlayMultiplier: Number,
    nRows: Number,
    nCols: Number,
    nColsAll: Number,
    padding: Number,
  },
  computed: {
    cellSizeStr(): String {
      return `${this.cellSize}px`
    },
    overlaySize() {
      return this.cellSize * this.overlayMultiplier - this.padding * 2;
    },
    overlayColumn() {
      if (!this.overlayAlbum) {
        return 1
      } else if (this.overlayAlbum.leftHalf) {
        return this.overlayAlbum.colPosition + 2
      } else {
        return this.overlayAlbum.colPosition + 1 - this.overlayMultiplier
      }
    },
    overlayRow() {
      if (!this.overlayAlbum) {
        return 1
      } else if (this.overlayAlbum.topHalf) {
        return this.overlayAlbum.rowPosition + 1
      } else {
        return this.overlayAlbum.rowPosition + 2 - this.overlayMultiplier
      }
    },
  },
  data() {
    return {
      overlayAlbum: null
    }
  },
  methods: {
    propagatePlay(arg) {
      this.$emit("play", arg);
    },
    hover(data) {
      this.overlayAlbum = data
    },
    clearHover() {
      this.overlayAlbum = null
    },
  },
};
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
