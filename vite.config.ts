import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const clientPort = Number(process.env.VITE_PORT || 4173)
const apiPort = Number(process.env.PORT || 4174)

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: clientPort,
    strictPort: false,
    open: true,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
      '/uploads': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
})
