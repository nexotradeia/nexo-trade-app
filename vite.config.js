import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    // En desarrollo: "vercel dev" corre en :3000 y sirve /api/*
    // Con este proxy, "npm run dev" también puede llamar a /api/gifs, /api/chat, etc.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
