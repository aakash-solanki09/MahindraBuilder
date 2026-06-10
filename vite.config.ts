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
      protocol: (process.env.VITE_HMR_PROTOCOL as 'http' | 'ws') || 'http'
    }
  },
})
