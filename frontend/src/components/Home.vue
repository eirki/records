  <template>
  <div class="main-grid">
    <div class="left-grid">
      <iframe class="player" :src="`https://open.spotify.com/embed/album/${selected_album.id}`" :width="playerWidth"
        :height="playerHeight" frameborder="0" allowtransparency="true" allow="encrypted-media" />
      <AlbumColumn class="albumColumn recentAlbums" :albums="recent_albums" :padding="padding" :cellSize=cellSize
        :overlayMultiplier=overlayMultiplier :nRows="nRows - nLeftCols" v-on:play="handlePlay($event)"
        v-on:clearHover="clearHover" v-on:hover="hover($event)" />
      <AlbumColumn class="albumColumn recommendedAlbums" :albums="recommended_albums" :padding="padding"
        :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows="nRows - nLeftCols"
        v-on:play="handlePlay($event)" v-on:clearHover="clearHover" v-on:hover="hover($event)" />

      <img class="albumArt" :src="selected_album.images[0].url" :alt="selected_album.name" :width=albumArtSize
        :height=albumArtSize />
    </div>
    <div class="overlayGrid">
      <img v-if="overlayAlbum" class="album-overlay" :src="overlayAlbum.images[0].url" :alt="overlayAlbum.name"
        :width="homeOverlaySize" :height="homeOverlaySize" />
    </div>

    <AlbumGrid class="albumGrid" :albums="all_albums" :padding="padding" v-on:play="handlePlay($event)"
      :cellSize=cellSize :overlayMultiplier=overlayMultiplier :nRows=nRows :nCols="nCols - nLeftCols" :nColsAll=nCols />
  </div>
</template>

<script lang="ts">
import AlbumColumn from "./AlbumColumn.vue";
import AlbumGrid from "./AlbumGrid.vue";

import getSquareSize from "../squareSize.js";

function checkSize(self) {
  let y = window.innerHeight - (8 * 2)
  let x = window.innerWidth - (8 * 2)
  let n = self.all_albums.length
  let nAdded = 1
  while (true) {
    let { cellSize, nRows, nCols, nExtra } = getSquareSize({
      y: y,
      x: x,
      n: n + nAdded,
    });
    let colsToAdd = Math.floor(self.playerMaxWidth / cellSize) + 2
    if (nAdded < nRows * colsToAdd) {
      nAdded++
      // console.log("nAdded", nAdded)

    } else {
      self.cellSize = cellSize
      // console.log("cellSize", cellSize)
      self.nRows = nRows
      console.log("nRows", nRows)
      self.nCols = nCols
      self.nGridCols = nCols - colsToAdd
      console.log("nGridCols", self.nGridCols)
      self.nLeftCols = colsToAdd
      self.albumColumnN = nRows - colsToAdd
      self.leftColSize = `${colsToAdd * cellSize}px`
      self.albumArtSize = (cellSize * colsToAdd) - (self.padding * 2)
      // console.log("self.albumArtSize", self.albumArtSize)
      self.playerWidth = (cellSize * (colsToAdd - 2)) - (self.padding * 2)
      self.playerHeight = (cellSize * (nRows - colsToAdd)) - (self.padding * 2)

      let overlayMultiplier = Math.floor(Math.min(nRows, self.nGridCols) / 2)
      // console.log("overlayMultiplier", overlayMultiplier)
      if (nRows < self.nGridCols) {
        // vertical overlay can include cellSize of album being hovered
        overlayMultiplier++
        // console.log("overlayMultiplier", overlayMultiplier)
      }
      self.overlayMultiplier = overlayMultiplier
      // console.log("self.overlayMultiplier", self.overlayMultiplier)

      self.homeOverlaySize = cellSize * overlayMultiplier - self.padding * 2
      // self.homeOverlaySize = (Math.min((nRows - colsToAdd), self.nGridCols) * cellSize) - (self.padding * 2)
      return
    }
  }


}
export default {
  components: {
    AlbumGrid,
    AlbumColumn,
  },
  props: {
    all_albums: Array,
    recent_albums: Array,
    recommended_albums: Array,
  },
  data() {
    return {
      height: window.innerHeight - (8 * 2),
      width: window.innerWidth - (8 * 2),
      playerMaxWidth: 400,
      padding: 2,
      selected_album: this.all_albums[
        Math.floor(Math.random() * this.all_albums.length)
      ],
      cellSize: 0,
      nRows: 0,
      nCols: 0,
      nLeftCols: 0,
      albumColumnN: 0,
      leftColSize: "0px",
      albumArtSize: 0,
      playerWidth: 0,
      playerHeight: 0,
      overlayMultiplier: 0,
      overlayAlbum: null
    };
  },
  computed: {
    cellSizeStr(): String {
      return `${this.cellSize}px`
    }
  },
  methods: {
    handlePlay(album_data) {
      this.selected_album = album_data;
    },
    hover(data) {
      this.overlayAlbum = data
    },
    clearHover() {
      this.overlayAlbum = null
    },

  },
  created() {
    checkSize(this)
    window.addEventListener("resize", () => checkSize(this));
  },
  updated() {
    checkSize(this);
  },
};
</script>

<style>
body {
  overflow: hidden;
  background-color: #333;
}
</style>
<style scoped>
.main-grid {
  display: grid;
  grid-template-columns: [left-col] v-bind(leftColSize) [right-col] min-content;
}

.left-grid {
  display: grid;
  grid-template-columns: repeat(v-bind(nLeftCols), v-bind(cellSizeStr));
  grid-template-rows: repeat(v-bind(nRows), v-bind(cellSizeStr));
}

.albumGrid {
  grid-column-start: right-col;
  grid-row-start: 1;
  z-index: 0
}

.overlayGrid {
  grid-column-start: right-col;
  grid-row-start: 1;
  z-index: 1
}

.player {
  padding: 2px;
  grid-column-start: 1;
  grid-row-start: 1;
}

.albumColumn {
  grid-row-start: 1;
  grid-row-end: v-bind(albumColumnN+1);
}

.recentAlbums {
  grid-column-start: -3;
}

.recommendedAlbums {
  grid-column-start: -2;

}

.albumArt {
  padding: 2px;
  grid-column-start: 1;
  grid-row-start: v-bind(- nLeftCols - 1);
}

.album-overlay {
  padding: 2px;
}
</style>
