import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * Editor-only build — separate from production.
 *
 * Outputs to dist/editor/ with its own manifest.
 * Loaded only on ?byrde_preview=1 pages (admin editor).
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/editor',
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'editor.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('node_modules') && (id.includes('react-dom') || id.includes('/react/'))) {
            return 'vendor';
          }
        },
      },
    },
  },
})
