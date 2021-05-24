<template>
  <div class="d-flex">
    <AlbumColumn :albums="recent_albums" :padding="padding" />
    <div>
      <AlbumGrid :albums="all_albums" :padding="padding" />
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
    };
  },
};
</script>

<style scoped>
@media screen and (orientation: portrait) {
  .d-flex {
    display: flex;
    flex-direction: column;
  }
}
@media screen and (orientation: landscape) {
  .d-flex {
    display: flex;
  }
}
</style>

<style>
body {
  background-color: #333;
}
</style>
