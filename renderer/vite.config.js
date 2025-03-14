import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'react',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: "./", // Ensure relative paths for assets
  build: {
    outDir: path.resolve(__dirname, "../renderer/dist"), // Ensure correct output path
    emptyOutDir: true, // Clean old files on build
  },
})

