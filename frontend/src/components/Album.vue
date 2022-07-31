<template>
  <div class="container" :style="{
    padding: `${padding}px`
  }" @click="play">
    <img class="album-art" :src="artUrl" :alt="album.name" :width=cellSize :height=cellSize @mouseover="hover"
      @mouseleave="clearHover" @contextmenu="onContextMenu($event)" />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu'
import { useToast } from "vue-toastification";

import Spinner from "./Spinner.vue";
import type { AlbumT, OverlayT } from '../types.js'

export interface Props {
  album: AlbumT
  cellSize: number
  overlayMultiplier: number
  padding: number
  index?: number
  nRows?: number
  nCols?: number
  nColsAll?: number
  isInLibrary: boolean
  useBigArt?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  useBigArt: false
})

const emit = defineEmits<{
  (e: "play", arg: AlbumT): void
  (e: "hover", arg: OverlayT): void
  (e: "clearHover"): void
  (e: "refreshAlbums", cb: (() => void)): void
}>()

let albumDesc = computed(
  () =>
    (props.album.artists.length === 1
      ? props.album.artists[0].name + " - "
      : "")
    + `${props.album.name}`)

const colPosition = computed(() => (props.index === undefined || props.nCols === undefined ? 1 : props.index % props.nCols))
const rowPosition = computed(() => (props.index === undefined || props.nCols === undefined ? 1 : Math.floor(props.index / props.nCols)))
const leftHalf = computed(() => {
  if (props.index === undefined || props.nCols === undefined) {
    return false
  }
  return colPosition.value < Math.floor(props.nCols / 2)
})
const topHalf = computed(() => {
  if (props.index === undefined || props.nRows === undefined) {
    return false
  }
  return rowPosition.value < Math.floor(props.nRows / 2)
})
const artUrl = computed(() => {
  if (props.useBigArt || props.cellSize > 300) {
    return props.album.images[0].url;
  } else if (props.cellSize > 64) {
    return props.album.images[1].url;
  } else {
    return props.album.images[0].url;
  }
})

const toast = useToast();


function hover() {
  let arg: OverlayT = {
    leftHalf: leftHalf.value,
    topHalf: topHalf.value,
    colPosition: colPosition.value,
    rowPosition: rowPosition.value,
    data: props.album,
  }
  emit("hover", arg);
}

function clearHover() {
  emit("clearHover");
}

function play() {
  emit("play", props.album);
  emit("clearHover");
  toast(albumDesc.value)
}


interface arg { remove: boolean }
function toggleLibrary({ remove }: arg) {
  let spinnerToastId = toast(Spinner, { timeout: false })
  let doneCallback = () => {
    toast.dismiss(spinnerToastId)
    toast(`${remove ? "Remov" : "Add"}ed ${albumDesc.value}`)
  }
  fetch(`/${remove ? "remove" : "add"}_album/${props.album.id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        throw new Error('failed')
      }
    })
    .then(() => emit("refreshAlbums", doneCallback))
    .catch(error => {
      console.log(error)
      toast.dismiss(spinnerToastId)
      toast.error("Server error")
    })
}


function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  ContextMenu.showContextMenu({
    customClass: "context-menu",
    iconFontClass: "context-menu__icon",
    x: e.x,
    y: e.y,
    items: [
      {
        label: albumDesc.value,
        disabled: true,
      },
      {
        label: "Go to album",
        onClick: () => {
          let url = `https://open.spotify.com/album/${props.album.id}`
          window.open(url, "_blank")
        }
      },
      props.album.artists.length === 1 ?
        {
          label: "Go to artist",
          onClick: () => {
            let url = `https://open.spotify.com/artist/${props.album.artists[0].id}`
            window.open(url, "_blank")
          }
        }
        :
        {
          label: "Go to artist",
          children: props.album.artists.map(artist => ({
            label: artist.name,
            onClick: () => {
              let url = `https://open.spotify.com/artist/${artist.id}`
              window.open(url, "_blank")
            }
          })),

        },

      {
        label: `${props.isInLibrary ? "Remove from" : "Add to"} library`,
        onClick: () => toggleLibrary({ remove: props.isInLibrary })
      }

    ]
  })
}
</script>

<style scoped>
.container {
  position: static;
  box-sizing: border-box;
  cursor: pointer;
}

.container:hover {
  outline: 1px solid white;
  outline-offset: -3px;
}


.album-art {
  max-width: 100%;
  max-height: 100%;
}
</style>
