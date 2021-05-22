<template>
  <div>
    <input
      type="range"
      min="64"
      max="640"
      step="64"
      v-model.number="album_size"
    />
    <div class="d-flex">
      <AlbumGrid :albums="all_albums" :album_size="album_size" />
      <AlbumColumn :albums="recent_albums" :album_size="album_size" />
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
      album_size: 320,
    };
  },
};
</script>

<style scoped>
.d-flex {
  display: flex;
}
</style>

<style>
body {
  background-color: #333;
}
</style>
