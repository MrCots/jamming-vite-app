import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // bind to 0.0.0.0 so ngrok can reach it
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      // replace with your ngrok hostname when using ngrok, e.g. 'rosalia-....ngrok-free.dev'
      host: 'rosalia-unswarming-semiexternally.ngrok-free.dev'
    }
  }
});