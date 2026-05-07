import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['endeared-yin-carbon.ngrok-free.dev'],
    host: true
  }
})