<template>
  <div
    class="container"
    :style="`width: ${size}px; height: ${size}px;padding: ${padding}px`"
    ref="elem"
    v-on:click="play"
  >
    <img
      class="album-art"
      :src="artUrl"
      :alt="name"
      width="100%"
      height="100%"
      @mouseover="showImage = true"
      @mouseleave="showImage = false"
    />
    <div class="overlay">
      <img
        :src="this.images[0].url"
        :alt="name"
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

<script>
import Toasted from "vue-toasted";
import Vue from "vue";
Vue.use(Toasted, {
  theme: "toasted-primary",
  position: "bottom-center",
  duration: 5000,
});

function checkLocation(self) {
  let { left, top, bottom, right } = self.$refs.elem.getBoundingClientRect();
  self.topHalf = self.parent_height / 2 > (top + bottom) / 2;
  // console.log(self.topHalf);
  self.leftHalf = self.parent_width / 2 > (left + right) / 2;
  // console.log(self.leftHalf);
}

export default {
  props: {
    album: Object,
    size: Number,
    overlay_mult: Number,
    index: Number,
    padding: { type: Number, default: 0 },
    parent_height: { type: Number, default: window.innerHeight },
    parent_width: { type: Number, default: window.innerWidth },
  },
  data() {
    return {
      showImage: false,
      uri: this.album.uri,
      images: this.album.images,
      name: this.album.name,
      artists: this.album.artists,
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
        return this.images[2].url;
      } else if (this.size <= 300) {
        return this.images[1].url;
      } else {
        return this.images[0].url;
      }
    },
  },
  created() {
    let tmp = new URL("http://example.com");
    tmp.search = new URLSearchParams({ uri: this.uri }).toString();
    this.playUrl = "/play" + tmp.search;

    this.playingMessage =
      `<div><div><b>${this.name}</b></div> <div>` +
      this.artists.map((artist) => artist.name).join("<br>") +
      "</div></div>";
  },
  mounted() {
    checkLocation(this);
    window.addEventListener("resize", () => checkLocation(this));
  },
  updated() {
    checkLocation(this);
  },
  methods: {
    play() {
      Vue.toasted.clear();
      Vue.toasted.show(this.playingMessage);
      fetch(this.playUrl)
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            Vue.toasted.error(data.message);
          }
        })
        .catch((error) => {
          console.log(error);
          Vue.toasted.error("Failed: Internal Server Error");
        });
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
</style>


<style>
body {
  font-family: sans-serif;
}
</style>
