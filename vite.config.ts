import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'recharts'],
    exclude: ['@vite/client', '@vite/env']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs']
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    target: 'es2018', // mais moderno que es2015
    minify: 'esbuild',
  },
})
