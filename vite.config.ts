import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['recharts', 'react', 'react-dom'],
    exclude: []
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            return 'vendor';
          }
          
          // App chunks
          if (id.includes('src/components/pages')) {
            return 'pages';
          }
          if (id.includes('src/services')) {
            return 'services';
          }
          if (id.includes('src/components/ui/chart')) {
            return 'ui-charts';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
    minify: 'esbuild'
  }
})
