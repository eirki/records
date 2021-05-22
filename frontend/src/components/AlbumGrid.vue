<template>
  <div class="d-flex">
    <Album
      v-for="album in albums"
      :key="`all_${album.id}`"
      :album="album"
      :size="album_size"
    ></Album>
  </div>
</template>

<script>
import Album from "./Album.vue";

export default {
  components: {
    Album,
  },
  props: {
    album_size: Number,
    albums: Array,
  },
};
</script>

<style scoped>
.d-flex {
  display: flex;
  flex-wrap: wrap;
}
</style>

<style>
body {
  background-color: #333;
}
</style>
