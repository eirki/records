<template>
  <div class="container" :style="{
    padding: `${padding}px`
  }" @click="play">
    <img class="album-art" :src="artUrl" :alt="album.name" :width=size :height=size @mouseover="hover"
      @mouseleave="clearHover" />

  </div>
</template>

<script lang="ts">
// import Toasted from "vue-toasted";
// import Vue from "vue";
// Vue.use(Toasted, {
//   theme: "toasted-primary",
//   position: "bottom-center",
//   duration: 5000,
// });


export default {
  props: {
    album: Object,
    size: Number,
    overlayMultiplier: Number,
    index: { type: Number, default: null },
    nCols: Number,
    nColsAll: Number,
    nRows: Number,
    padding: { type: Number, default: 0 },
  },
  data() {
    return {
      showImage: false,
      // uri: this.album.uri,
      // id: this.album.id,
      // images: this.album.images,
      // name: this.album.name,
      // artists: this.album.artists,
      playUrl: "",
      playingMessage: "",
    };
  },
  computed: {
    colPosition() {
      return (this.index % this.nCols)
    },
    rowPosition() {
      return (Math.floor(this.index / this.nCols))
    },
    leftHalf() {
      if (this.index === null) {
        return null
      }
      return this.colPosition < Math.floor(this.nCols / 2)
    },
    topHalf() {
      if (this.index === null) {
        return null
      }
      return this.rowPosition < Math.floor(this.nRows / 2)
    },
    artUrl() {
      if (this.size <= 64) {
        return this.album.images[2].url;
      } else if (this.size <= 300) {
        return this.album.images[1].url;
      } else {
        return this.album.images[0].url;
      }
    },
  },
  created() {
    let tmp = new URL("http://example.com");
    tmp.search = new URLSearchParams({ uri: this.album.uri }).toString();
    this.playUrl = "/play" + tmp.search;

    // this.playingMessage =
    //   `<div><div><b>${this.album.name}</b></div> <div>` +
    //   this.album.artists.map((artist) => artist.name).join("<br>") +
    //   "</div></div>";
  },
  methods: {
    // show() {
    //   this.showImage = !this.showImage
    // },
    hover() {
      this.$emit("hover", {
        index: this.index,
        leftHalf: this.leftHalf,
        topHalf: this.topHalf,
        colPosition: this.colPosition,
        rowPosition: this.rowPosition,
        data: this.album,
      });
    },
    clearHover() {
      this.$emit("clearHover");
    },
    play() {
      this.$emit("play", this.album);
      this.$emit("clearHover");
      // Vue.toasted.clear();
      // Vue.toasted.show(this.playingMessage);
    },
  },
};
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
