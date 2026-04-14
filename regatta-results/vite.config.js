import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rr-proxy': {
        target: 'https://regattaresults.co.za',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rr-proxy/, ''),
        secure: false,
      },
    },
  },
})
