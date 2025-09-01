import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-label']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
