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
