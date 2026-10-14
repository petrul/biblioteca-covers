import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ThumbnailCache, ThumbnailError, type Thumbnail } from './cache';
import { thumbnailConfig, WIDTHS, MAX_SOURCE_BYTES, type ThumbnailConfig } from './config';
import { thumbnailOpenApi } from './openapi';

async function download(url: string): Promise<Buffer> {
  let response: globalThis.Response;
  try { response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000) }); }
  catch { throw new ThumbnailError(502, 'Cover source is unreachable'); }
  if (response.status === 404) throw new ThumbnailError(404, 'Original cover not found');
  if (!response.ok) throw new ThumbnailError(502, 'Cover source returned an error');
  if (!response.headers.get('content-type')?.startsWith('image/')) throw new ThumbnailError(415, 'Cover source must return an image');
  if (Number(response.headers.get('content-length') || 0) > MAX_SOURCE_BYTES) {
    await response.body?.cancel(); throw new ThumbnailError(413, 'Original cover exceeds 10 MiB');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new ThumbnailError(422, 'Empty cover source');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.length;
      if (length > MAX_SOURCE_BYTES) { await reader.cancel(); throw new ThumbnailError(413, 'Original cover exceeds 10 MiB'); }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ThumbnailError) throw error;
    throw new ThumbnailError(502, 'Cover source transfer failed');
  }
  return Buffer.concat(chunks);
}

export function registerThumbnailRoutes(app: Express, config: ThumbnailConfig = thumbnailConfig(), loadSource = download) {
  const cache = new ThumbnailCache(config);
  const router = express.Router();
  const width = (req: Request) => {
    const value = req.query.width === undefined ? 320 : Number(req.query.width);
    if (!WIDTHS.includes(value as typeof WIDTHS[number])) throw new ThumbnailError(400, `width must be ${WIDTHS.join(', ')}`);
    return value;
  };
  const send = (req: Request, res: Response, result: Thumbnail) => {
    const etag = '"' + createHash('sha256').update(result.body).digest('hex') + '"';
    res.set({ 'Content-Type': 'image/webp', 'Cache-Control': `public, max-age=${config.ttlSeconds}`, ETag: etag,
      'X-Thumbnail-Cache': result.hit ? 'HIT' : 'MISS', 'Content-Location': `/api/thumbnails/cache/${result.key}`,
      'X-Content-Type-Options': 'nosniff' });
    if (req.headers['if-none-match']?.split(',').map(tag => tag.trim()).includes(etag)) { res.status(304).end(); return; }
    res.send(result.body);
  };
  router.get('/openapi.json', (_req, res) => res.json(thumbnailOpenApi));
  router.get('/', async (req, res, next) => {
    try {
      const targetWidth = width(req);
      if (typeof req.query.url !== 'string') throw new ThumbnailError(400, 'url is required');
      let url: URL;
      try { url = new URL(req.query.url); } catch { throw new ThumbnailError(400, 'Invalid source URL'); }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash || !config.allowedOrigins.includes(url.origin)) {
        throw new ThumbnailError(400, 'Source URL must use an allowed cover origin');
      }
      const result = await cache.get(`url:${url.href}`, targetWidth, () => loadSource(url.href));
      send(req, res, result);
    } catch (error) { next(error); }
  });
  router.post('/', express.raw({ type: 'image/*', limit: MAX_SOURCE_BYTES }), async (req, res, next) => {
    try {
      const targetWidth = width(req);
      if (!Buffer.isBuffer(req.body) || !req.body.length) throw new ThumbnailError(415, 'Send image bytes with an image/* Content-Type');
      const digest = createHash('sha256').update(req.body).digest('hex');
      const result = await cache.get(`bytes:${digest}`, targetWidth, async () => req.body);
      send(req, res, result);
    } catch (error) { next(error); }
  });
  router.get('/cache/:key', async (req, res, next) => {
    try {
      await cache.waitForClear();
      const result = await cache.read(req.params.key, true);
      if (!result) throw new ThumbnailError(404, 'Thumbnail not cached; request it from its source');
      send(req, res, result);
    } catch (error) { next(error); }
  });
  router.delete('/cache', async (req, res, next) => {
    try {
      if (!config.adminToken) throw new ThumbnailError(503, 'Thumbnail cache clearing is not configured');
      const supplied = Buffer.from(req.headers.authorization || '');
      const expected = Buffer.from(`Bearer ${config.adminToken}`);
      if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new ThumbnailError(403, 'Cache administrator token required');
      const removed = await cache.clear();
      res.set('Cache-Control', 'no-store').json({ removed });
    } catch (error) { next(error); }
  });
  router.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ThumbnailError) { res.status(error.status).json({ error: error.message }); return; }
    if (error.type === 'entity.too.large') { res.status(413).json({ error: 'Original cover exceeds 10 MiB' }); return; }
    console.error('Thumbnail request failed:', error?.message || error);
    res.status(500).json({ error: 'Thumbnail cache operation failed' });
  });
  app.use('/api/thumbnails', router);
  return cache;
}
