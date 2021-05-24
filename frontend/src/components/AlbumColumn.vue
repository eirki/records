<template>
  <div class="album-grid" ref="elem">
    <div v-for="album in albums" :key="`recent_${album.id}`">
      <Album
        :album="album"
        :size="album_size"
        :padding="padding"
        :overlay_mult="height < width ? 6 : 5"
      >
      </Album>
    </div>
  </div>
</template>

<script>
import Album from "./Album.vue";

function checkSize(self) {
  let { top, left } = self.$refs.elem.getBoundingClientRect();
  self.width = window.innerWidth - left;
  self.height = window.innerHeight - top;
  let size = Math.min(self.height, self.width) / self.albums.length;
  self.album_size = size;
}
export default {
  components: {
    Album,
  },
  props: {
    padding: Number,
    albums: Array,
  },
  data() {
    return {
      album_size: 0,
      width: 0,
      height: 0,
    };
  },
  mounted() {
    checkSize(this);
    window.addEventListener("resize", () => checkSize(this));
  },
  updated() {
    checkSize(this);
  },
};
</script>

<style scoped>
@media screen and (orientation: portrait) {
  .album-grid {
    display: flex;
  }
}
@media screen and (orientation: landscape) {
  .album-grid {
    flex-direction: column;
    display: flex;
  }
}
</style>

<style>
body {
  background-color: #333;
}
</style>
