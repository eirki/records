import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// import fs from 'fs'
// import path from 'path'

// const baseDir = path.resolve(__dirname, 'dev-data')

// function loadJsonResponse(res: any, filePath: string, notFoundMessage: string) {
//   if (!fs.existsSync(filePath)) {
//     res.writeHead(404)
//     res.end(JSON.stringify({ error: notFoundMessage }))
//     return
//   }
//   const data = fs.readFileSync(filePath, 'utf-8')
//   res.setHeader('Content-Type', 'application/json')
//   res.end(data)
// }

// function mockApiPlugin() {
//   return {
//     name: 'mock-api-plugin',
//     configureServer(server: any) {
//       server.middlewares.use((req: any, res: any, next: () => void) => {
//         const { url, method } = req

//         if (method !== 'GET' || !url) return next()

//         if (url.startsWith('/paginated_albums')) {
//           const match = url.match(/(\d+)/)
//           const page = match[1]
//           const filePath = path.join(baseDir, 'paginated', `${page}.json`)
//           loadJsonResponse(res, filePath, 'Mock page not found')
//           return
//         }

//         if (url.startsWith('/random_saved_album')) {
//           const filePath = path.join(baseDir, 'random_saved_album.json')
//           loadJsonResponse(res, filePath, 'Mock file not found')
//           return
//         }

//         if (url.startsWith('/recommendations')) {
//           const filePath = path.join(baseDir, 'recommendations.json')
//           loadJsonResponse(res, filePath, 'Mock file not found')
//           return
//         }

//         if (url.startsWith('/add_album')) {
//           res.setHeader('Content-Type', 'application/json')
//           res.end(JSON.stringify({ data: { success: true } }))
//           return
//         }

//         if (url.startsWith('/remove_album')) {
//           res.setHeader('Content-Type', 'application/json')
//           res.end(JSON.stringify({ data: { success: true } }))
//           return
//         }

//         // Add more mock routes here as needed...
//         next()
//       })
//     }
//   }
// }

export default defineConfig({
  plugins: [
    react(),
    // mockApiPlugin() // replace with proxy to use backend
  ],
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
