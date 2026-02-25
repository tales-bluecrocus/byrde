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
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // Rename extracted CSS bundle to style.css
          if (assetInfo.names?.some((n: string) => n.endsWith('.css'))) {
            return 'assets/style.css'
          }
          return 'assets/[name][extname]'
        },
        manualChunks: {
          // Editor-only: ThemeEditor + react-colorful + shadcn Sheet/Tabs/ColorPicker
          'editor': [
            './src/components/ThemeEditor/index.tsx',
            './src/components/ThemeEditor/panels/GlobalPanel.tsx',
            './src/components/ThemeEditor/panels/StylePanel.tsx',
            './src/components/ThemeEditor/panels/ContentPanel.tsx',
            './src/components/ThemeEditor/panels/SettingsPanel.tsx',
          ],
        },
      },
    },
  },
})
