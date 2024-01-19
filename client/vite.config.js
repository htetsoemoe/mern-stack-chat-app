import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/chatty': {
        target: 'http://localhost:3500',
        secure: false,
      }
    }
  },
  plugins: [react()],
})
