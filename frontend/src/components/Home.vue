<template>
  <div class="d-flex-main">
    <div class="d-flex-sub">
      <iframe
        class="item"
        :src="`https://open.spotify.com/embed/album/${selected_album_id}`"
        width="300"
        height="80"
        frameborder="0"
        allowtransparency="true"
        allow="encrypted-media"
      />

      <AlbumColumn
        :albums="recent_albums"
        :padding="padding"
        v-on:play="handlePlay($event)"
      />
    </div>
    <div>
      <AlbumGrid
        :albums="all_albums"
        :padding="padding"
        v-on:play="handlePlay($event)"
      />
    </div>
  </div>
</template>

<script>
import AlbumColumn from "./AlbumColumn.vue";
import AlbumGrid from "./AlbumGrid.vue";

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
      selected_album_id: this.recent_albums[0].id,
    };
  },
  methods: {
    handlePlay(id) {
      console.log("playing something");
      this.selected_album_id = id;
    },
  },
};
</script>

<style scoped>
.d-flex-main {
  display: flex;
}
.d-flex-sub {
  display: flex;
}
@media screen and (orientation: portrait) {
  .d-flex-main {
    flex-direction: column;
  }
}
@media screen and (orientation: landscape) {
  .d-flex-sub {
    flex-direction: column;
  }
}
</style>

<style>
body {
  background-color: #333;
}
</style>
