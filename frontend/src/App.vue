<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';

import Spinner from "./components/Spinner.vue";
import Home from "./components/Home.vue"

const inputData: Ref<any | null> = ref(null)

function getAlbums() {
  return fetch(`/albums`).then(res => res.json())
}
function getAlbumsDev() {
  return import("../dev-data/library.json")
}

onMounted(() => {
  let getAlbumsFunc = import.meta.env.PROD ? getAlbums : getAlbumsDev
  getAlbumsFunc().then(data => inputData.value = data)
})

</script>

<template>
  <Spinner v-if="!inputData" />
  <Home v-else v-bind="inputData" />
</template>

<style>
body {
  overflow: hidden;
  background-color: #333;
}
</style>
<style scoped>
</style>
