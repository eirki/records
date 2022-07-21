<script setup lang="ts">
import Home from "./Home.vue"

const data = import.meta.env.DEV ?
    await import("../../dev-data/library.json") :
    JSON.parse(document.querySelector("#app-data").dataset.app)
</script>

<template>
    <Home :all_albums="data.all_albums" :recent_albums="data.recent_albums" />
</template>

