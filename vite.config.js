import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [
    VitePWA({ registerType: 'autoUpdate' })
  ]
});