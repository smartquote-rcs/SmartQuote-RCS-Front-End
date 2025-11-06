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
    exclude: ['@vite/client', '@vite/env'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          charts: ['recharts'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    target: 'es2018',
    minify: 'esbuild',
  },
  // 🚀 Importante para produção no Render
  preview: {
    allowedHosts: ['smartquote-rcs-front-end.onrender.com'],
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
  },
  // Opcional: para dev local em rede
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
