<template>
  <div class="p-3"></div>
</template>

<script>
import Vue from "vue";
export { Vue };

import Album from "./components/Album.vue";

export default {
  props: {
    albums: Array,
  },
  components: {
    Album,
  },
};
</script>

<style lang="scss">
@import "base";
</style>
