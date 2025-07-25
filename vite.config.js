import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // Replace 'vite-pwa-starter' with your actual GitHub repository name if needed.
  base: '/vite-pwa-starter/', 
  plugins: [
    VitePWA({ registerType: 'autoUpdate' })
  ]
});