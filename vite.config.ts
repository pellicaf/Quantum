import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so GitHub Pages works for any repo name
  // (e.g. https://<user>.github.io/Quantum/)
  base: './',
  server: {
    port: 5173,
    open: true,
  },
})
