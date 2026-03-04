import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',  // Relative paths so lazy chunks resolve correctly in WordPress
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Clean filenames without hashes — WordPress handles cache busting via ?ver= query param
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Rename extracted CSS bundle to style.css
          if (assetInfo.names?.some((n: string) => n.endsWith('.css'))) {
            return 'assets/style.css'
          }
          return 'assets/[name][extname]'
        },
        // Split React into a cacheable vendor chunk.
        // Editor and onboarding are auto-split by lazy() dynamic imports.
        // Don't manually chunk lucide/radix — let tree-shaking keep only what each chunk needs.
        manualChunks(id) {
          if (id.includes('node_modules') && (id.includes('react-dom') || id.includes('/react/'))) {
            return 'vendor';
          }
        },
      },
    },
  },
})
