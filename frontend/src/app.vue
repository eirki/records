<template>
  <Home :all_albums="all_albums" :recent_albums="recent_albums" />
</template>

<script>
import Vue from "vue";
export { Vue };

import Home from "./components/Home.vue";

export default {
  props: {
    all_albums: Array,
    recent_albums: Array,
  },
  components: {
    Home,
  },
};
</script>

