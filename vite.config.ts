import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7001,
    strictPort: true,
    host: process.env.VITE_HOST || 'localhost',
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: 7001,
      clientPort: process.env.VITE_HMR_CLIENT_PORT ? parseInt(process.env.VITE_HMR_CLIENT_PORT) : undefined,
      protocol: process.env.VITE_HMR_PROTOCOL === 'https' || process.env.VITE_HMR_PROTOCOL === 'wss' ? 'wss' : 'ws'
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5011',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5011',
        changeOrigin: true,
        secure: false
      }
    }
  },
})
