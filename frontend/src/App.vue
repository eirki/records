<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';
import { useToast } from "vue-toastification";

import Spinner from "./components/Spinner.vue";
import Desktop from "./views/Desktop.vue"
import Mobile from "./views/Mobile.vue"

const inputData: Ref<any | null> = ref(null)
const error: Ref<boolean> = ref(false)
const toast = useToast();

function getAlbums() {
  return fetch("/albums").then(res => {
    if (res.status === 403) {
      error.value = true
      toast.error("Authentication error", {
        timeout: false,
        closeButton: false,
        icon: true,
      })
      throw new Error("API not authorized");
    }
    else {
      return res.json()

    }
  })
}
function getAlbumsDev() {
  return import("../dev-data/library.json")
}

onMounted(() => {
  let getAlbumsFunc = import.meta.env.PROD ? getAlbums : getAlbumsDev
  getAlbumsFunc().then(data => inputData.value = data)
})

const isMobile = window.matchMedia("(any-hover: none)").matches

</script>

<template>
  <Spinner v-if="!inputData && !error" />
  <component :is="isMobile ? Mobile : Desktop" v-else-if="!error" v-bind="inputData" />
</template>

<style>
body {
  overflow: hidden;
  background-color: #333;
}
</style>
<style scoped>
</style>
