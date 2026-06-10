import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7001,
    strictPort: true,
    host: 'localhost',
    // Hot Module Replacement configuration for proper dev updates
    hmr: {
      host: 'localhost',
      port: 7001,
      protocol: 'http'
    }
  },
  // Optimize for development - prevent caching issues
  define: {
    'process.env.NODE_ENV': '"development"'
  }
})
