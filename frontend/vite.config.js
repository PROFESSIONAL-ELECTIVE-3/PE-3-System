import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Permit the temporary ngrok endpoint used for local device testing.
    allowedHosts: ['.ngrok-free.app', 'chewy-palm-sliver.ngrok-free.dev','feed-grid-freedom.ngrok-free.dev', 'dyslexia-engine-sardine.ngrok-free.dev'],
    proxy: {
      '/api': {
        // Keep this in sync with backend/src/Server.js (PORT defaults to 5000).  
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
