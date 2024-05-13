import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/paginated_albums': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/redirect': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/random_saved_album': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/recommendations': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
