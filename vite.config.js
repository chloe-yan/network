// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['counterpoint-vis']  // Treat this module differently during SSR
  },
  optimizeDeps: {
    include: ['counterpoint-vis']  // Explicitly pre-bundle this library
  },
  json: {
    stringify: true
  }
});