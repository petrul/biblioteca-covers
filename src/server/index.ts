import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { registerRoutes } from './routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root directory of the project (two levels up from src/server)
export const projectRoot = path.resolve(__dirname, '..', '..');

export const app = express();
export const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Statically serve public directory (schemas, assets)
app.use(express.static(path.resolve(projectRoot, 'public')));

// Register all API routes and schema endpoints
registerRoutes(app, projectRoot);

// Setup Vite middleware in dev or static serving in prod
export async function startServer(customPort = port) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      root: projectRoot,
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(projectRoot, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(projectRoot, 'dist', 'index.html'));
    });
  }

  return app.listen(customPort, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${customPort}`);
  });
}
