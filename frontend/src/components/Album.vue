<template>
  <div
    class="container"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      padding: `${padding}px`,
    }"
    ref="elem"
    v-on:click="play"
  >
    <img
      class="album-art"
      :src="artUrl"
      :alt="album_data.name"
      @mouseover="showImage = true"
      @mouseleave="showImage = false"
    />
    <div class="overlay" v-if="show_overlay">
      <img
        :src="album_data.images[0].url"
        :alt="album_data.name"
        :width="overlay_size"
        :height="overlay_size"
        v-show="showImage"
        :style="{
          position: 'relative',
          top: topHalf ? `-${size}px` : `-${topOffset}px`,
          left: leftHalf ? `${size}px` : `-${leftOffset}px`,
        }"
      />
    </div>
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

function checkLocation(self) {
  let parent = self.$parent.$refs.elem.getBoundingClientRect();
  let { left, right, top, bottom } = self.$refs.elem.getBoundingClientRect();
  self.leftHalf = (left + right) / 2 < (parent.left + parent.right) / 2;
  self.topHalf = (top + bottom) / 2 < (parent.top + parent.bottom) / 2;
}

export default {
  props: {
    album: Object,
    size: Number,
    show_overlay: { type: Boolean, default: true },
    overlay_mult: Number,
    index: Number,
    padding: { type: Number, default: 0 },
    parent_height: { type: Number, default: window.innerHeight },
    parent_width: { type: Number, default: window.innerWidth },
  },
  data() {
    return {
      showImage: false,
      album_data: this.album,
      // uri: this.album.uri,
      // id: this.album.id,
      // images: this.album.images,
      // name: this.album.name,
      // artists: this.album.artists,
      playUrl: "",
      topHalf: false,
      leftHalf: false,
      playingMessage: "",
    };
  },
  computed: {
    overlay_size() {
      return this.size * this.overlay_mult - this.padding * 2;
    },
    leftOffset() {
      return this.size * this.overlay_mult;
    },
    topOffset() {
      return this.size * this.overlay_mult;
    },
    artUrl() {
      if (this.size <= 64) {
        return this.album_data.images[2].url;
      } else if (this.size <= 300) {
        return this.album_data.images[1].url;
      } else {
        return this.album_data.images[0].url;
      }
    },
  },
  created() {
    let tmp = new URL("http://example.com");
    tmp.search = new URLSearchParams({ uri: this.album_data.uri }).toString();
    this.playUrl = "/play" + tmp.search;

    this.playingMessage =
      `<div><div><b>${this.album_data.name}</b></div> <div>` +
      this.album_data.artists.map((artist) => artist.name).join("<br>") +
      "</div></div>";
  },
  updated() {
    checkLocation(this);
  },
  methods: {
    play() {
      this.$emit("play", this.album_data);
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

.overlay {
  box-sizing: border-box;
  position: absolute;
  z-index: 10;
}

.album-art {
      max-width: 100%;
    max-height: 100%;
}
</style>

<style>
body {
  font-family: sans-serif;
}
</style>
