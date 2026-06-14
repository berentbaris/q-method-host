import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
