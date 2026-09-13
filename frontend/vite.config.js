import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backendTarget = process.env.VITE_BACKEND_TARGET || 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    // Accept each changing ngrok subdomain without opening arbitrary hosts.
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io', '.ngrok.app'],
    proxy: {
      '/api': { target: backendTarget, changeOrigin: true, timeout: 30000, proxyTimeout: 30000 },
      '/uploads': { target: backendTarget, changeOrigin: true, timeout: 30000, proxyTimeout: 30000 },
    },
  },
})
