import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  // REMOVIDO: root: path.resolve(__dirname, 'src'), - Isso estava causando problemas
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
