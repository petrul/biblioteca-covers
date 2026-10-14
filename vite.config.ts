import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      // src2/cover/render.html is the headless entry POST /api/cover renders
      // through (server-side PNG/SVG export, see src2/cover).
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          render: path.resolve(import.meta.dirname, 'src2/cover/render.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      ws: process.env.DISABLE_HMR === 'true' ? (false as const) : { port: 24680 },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
