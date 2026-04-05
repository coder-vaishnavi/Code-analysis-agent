import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /analyze calls to Flask backend during development
      '/analyze': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
