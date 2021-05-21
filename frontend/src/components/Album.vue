<template>
  <div class="card album-card" :style="`width: ${images[1].width + 1}px`">
    <img
      class="album-art"
      :src="images[1].url"
      :alt="name"
      :width="images[1].width"
      :height="images[1].height"
    />
    <div class="card-img-overlay album-info text">
      <p class="card-text">
        <b>
          {{ name }}
        </b>
      </p>
      <p class="card-text" v-for="artist in artists" :key="artist.name">
        {{ artist.name }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    artists: Array,
    release_date: String,
    images: Array,
    added_at: String,
  },
  data() {
    return {
      hover: false,
    };
  },
};
</script>


<style scoped>
.album-art {
  opacity: 1;
  display: block;
  transition: 0.5s ease;
  backface-visibility: hidden;
}

.album-info {
  background-color: #333;
  transition: 0.5s ease;
  opacity: 0;
}

.album-card:hover .album-art {
  opacity: 0.3;
}

.album-card:hover .album-info {
  opacity: 0.75;
}

.text {
  color: white;
}
</style>

<style lang="scss">
@import "../base";
</style>
