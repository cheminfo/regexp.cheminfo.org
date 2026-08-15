import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const servicePort = Number(process.env.PORT ?? 10801);
const devServerPort = Number(process.env.VITE_PORT ?? servicePort + 1);

export default defineConfig({
  plugins: [react()],
  server: {
    port: devServerPort,
    // Fail loudly instead of drifting to the next free port, which would leave
    // the Playwright baseURL and the README disagreeing.
    strictPort: true,
  },
});
