<template>
  <div class="container" :style="`width: ${size}px`">
    <img
      class="album-art"
      :src="artUrl"
      :alt="name"
      width="100%"
      height="100%"
    />
    <div class="text-box">
      <div class="album-info" v-if="cardSize > 192">
        <p>
          <b>
            {{ name }}
          </b>
        </p>
        <p v-for="artist in artists" :key="artist.name">
          {{ artist.name }}
        </p>
      </div>
      <div v-on:click="play">
        <PlayIcon
          :width="iconSize"
          :height="iconSize"
          viewBox="0 0 16 16"
          class="play-icon"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PlayIcon from "bootstrap-icons/icons/play-circle-fill.svg";

export default {
  components: {
    PlayIcon,
  },
  props: {
    album: Object,
    size: Number,
  },
  data() {
    return {
      hover: false,
      name: this.album.name,
      artists: this.album.artists,
      uri: this.album.uri,
      images: this.album.images,
      added_at: this.album.added_at,
      playUrl: "",
    };
  },
  computed: {
    cardSize() {
      return this.size + 1;
    },
    iconSize() {
      return this.size / 3;
    },
    artUrl() {
      console.log(this.size);
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
  },
  methods: {
    play() {
      console.log("playing");
      fetch(this.playUrl)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw response;
          }
        })
        .then((data) => {
          console.log(data);
        });
    },
  },
};
</script>


<style scoped>
.container {
  position: relative;
  width: 50%;
  background-color: #333;

  margin: 5px;
}

.album-art {
  opacity: 1;
  display: block;
  width: 100%;
  height: auto;
  transition: 0.2s ease;
  backface-visibility: hidden;
}

.text-box {
  font-family: Sans-Serif;
  color: white;
  font-size: 16px;
  transition: 0.2s ease;
  opacity: 0;
}

.container:hover .album-art {
  opacity: 0.3;
}

.container:hover .text-box {
  opacity: 1;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  text-align: center;
  transition: all 0.1s ease-in-out;
}

.play-icon:hover {
  color: #108954;
}

.album-info {
  position: absolute;
  top: 1px;
  left: 1px;
}
</style>

