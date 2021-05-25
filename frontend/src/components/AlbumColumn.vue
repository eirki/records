<template>
  <div class="album-grid" :style="{ padding: `${padding}px`, width: '300px' }">
    <div v-for="album in albums" :key="`recent_${album.id}`">
      <Album
        :album="album"
        :size="album_size"
        :padding="padding"
        :overlay_mult="landscape ? 3 : 5"
        v-on:play="propagatePlay($event)"
      >
      </Album>
    </div>
  </div>
</template>

<script>
import Album from "./Album.vue";

function checkSize(self) {
  self.landscape = window.innerWidth > window.innerHeight;
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
      landscape: window.innerWidth > window.innerHeight,
      selected_album_id: this.albums[0].id,
    };
  },
  mounted() {
    checkSize(this);
    window.addEventListener("resize", () => checkSize(this));
  },
  updated() {
    checkSize(this);
  },
  computed: {
    album_size() {
      return this.landscape ? 150 : 80;
    },
  },
  methods: {
    propagatePlay(arg) {
      console.log("handling play");
      this.$emit("play", arg);
    },
  },
};
</script>

<style scoped>
.album-grid {
  display: flex;
}

@media screen and (orientation: landscape) {
  .album-grid {
    flex-wrap: wrap;
  }
}
</style>

<style>
body {
  background-color: #333;
}
</style>
