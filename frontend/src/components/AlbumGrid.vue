<template>
  <div class="d-flex" ref="elem">
    <Album
      v-for="album in albums"
      :key="`all_${album.id}`"
      :album="album"
      :size="album_size"
      :overlay_mult="overlay_mult"
      :padding="padding"
      :parent_height="height"
      :parent_width="width"
      v-on:play="propagatePlay($event)"
    />
  </div>
</template>

<script lang="ts">
import Album from "./Album.vue";
import getSquareSize from "../squareSize.js";

function checkSize(self) {
  self.width = self.$refs.elem.offsetWidth;
  let { top, left } = self.$refs.elem.getBoundingClientRect();
  console.log("top", top, "left", left);
  self.height = window.innerHeight - top;
  console.log("height", self.height);
  console.log("width", self.width);
}

export default {
  components: {
    Album,
  },
  props: {
    albums: Array,
    padding: { type: Number, default: 2 },
  },
  data() {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  },
  computed: {
    album_size() {
      let height = this.height;
      let width = this.width;
      let { cellSize } = getSquareSize({
        y: height,
        x: width,
        n: this.albums.length,
      });

      console.log("cellSize", cellSize);
      return cellSize;
    },
    overlay_mult() {
      let heigth_with_offset = this.height + this.album_size * 2;
      let smallest_dimension = Math.min(heigth_with_offset, this.width);
      let by_2 = smallest_dimension / 2;
      let by_side = by_2 / this.album_size;
      let floored = Math.floor(by_side);
      return floored;
    },
  },
  mounted() {
    checkSize(this);
    window.addEventListener("resize", () => checkSize(this));
  },
  updated() {
    checkSize(this);
  },
  methods: {
    propagatePlay(arg) {
      this.$emit("play", arg);
    },
  },
};
</script>

<style scoped>
.d-flex {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
</style>

<style>
body {
  background-color: #333;
  overflow: hidden;
}
</style>
