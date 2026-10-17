import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The 3D scene is lazy-loaded in its own chunk; it is large but never blocks first paint.
  build: { chunkSizeWarningLimit: 1100 },
})
