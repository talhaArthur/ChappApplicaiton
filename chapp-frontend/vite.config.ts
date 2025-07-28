import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['3613d21a230f.ngrok-free.app'] // Replace with your current ngrok domain
  }
})