<template>
  <div class="flex-main">
    <div class="flex-left">
      <div class="flex-left-top">
        <div :style="{ padding: `${padding}px` }">
          <iframe :src="`https://open.spotify.com/embed/album/${selected_album.id}`" width="300"
            :height="landscape ? 380 : 80" frameborder="0" allowtransparency="true" allow="encrypted-media" />
        </div>
        <AlbumColumn :albums="recent_albums" :padding="padding" v-on:play="handlePlay($evepnt)" />
      </div>
      <img v-if="landscape" :src="selected_album.images[0].url" :alt="selected_album.name" width="100%" height="100%"
        :style="{
          width: `428px`,
          height: `428px`,
          padding: `${padding}px`,
        }" />
    </div>
    <div>
      <AlbumGrid :albums="all_albums" :padding="padding" v-on:play="handlePlay($event)" />
    </div>
  </div>
</template>

<script lang="ts">
import AlbumColumn from "./AlbumColumn.vue";
import AlbumGrid from "./AlbumGrid.vue";


function checkSize(self) {
  self.landscape = window.innerWidth > window.innerHeight;
}

export default {
  components: {
    AlbumGrid,
    AlbumColumn,
  },
  props: {
    all_albums: Array,
    recent_albums: Array,
  },
  data() {
    return {
      padding: 2,
      selected_album: this.all_albums[
        Math.floor(Math.random() * this.all_albums.length)
      ],
      landscape: window.innerWidth > window.innerHeight,
    };
  },
  methods: {
    handlePlay(album_data) {
      this.selected_album = album_data;
    },
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
};
</script>

<style scoped>
.flex-main {
  display: flex;
}

.flex-left {
  display: flex;
  flex-direction: column;
}

.flex-left-top {
  display: flex;
}

@media screen and (orientation: portrait) and (max-width: 555px) {
  .flex-left-top {
    flex-direction: column;
  }
}

@media screen and (orientation: portrait) {
  .flex-main {
    flex-direction: column;
  }
}
</style>

<style>
body {
  background-color: #333;
}
</style>
