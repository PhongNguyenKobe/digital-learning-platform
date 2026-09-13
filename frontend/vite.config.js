import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_TARGET || 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: process.env.VITE_BACKEND_TARGET || 'http://localhost:3000', changeOrigin: true },
    },
  },
})
