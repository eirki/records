<template>
  <div class="album-col">
    <div v-for="album in albums" :key="`recent_${album.id}`">
      <Album
        :album="album"
        :size="album_size"
        :padding="padding"
        :show_overlay="false"
        v-on:play="propagatePlay($event)"
      />
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
      return this.landscape ? 128 : 80;
    },
  },
  methods: {
    propagatePlay(arg) {
      this.$emit("play", arg);
    },
  },
};
</script>

<style scoped>
.album-col {
  display: flex;
}

@media screen and (orientation: landscape) {
  .album-col {
    flex-direction: column;
  }
}
</style>

<style>
body {
  background-color: #333;
}
</style>
