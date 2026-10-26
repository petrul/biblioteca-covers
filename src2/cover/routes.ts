import express, { type Express, type Request } from 'express';
import swaggerUi from 'swagger-ui-express';
import { renderCover } from './coverRenderer';
import { OPENAPI_SPEC, THEME_EXAMPLES } from './openapiSpec';
import { CoverRenderRequest, resolveCoverRequest } from './coverRequest';
import { COLOR_PALETTES, LAYOUT_ARCHETYPES } from '../../src/utils/themePresets';

/**
 * The headless cover rendering API (POST /api/cover -> PNG/SVG, GET
 * /api/cover/meta, GET /api/docs, Swagger UI at /api/ui), restored from the deleted root
 * server.ts/coverRenderer.ts. biblioteca-nestjs generates every work cover
 * through it. Lives in src2 because AI Studio replaces src/.
 */

// The port this same server listens on (the renderer loads its render page
// from it); src/server's own default is 3335 (the house port).
const port = () => Number(process.env.PORT) || 3335;

function wantsRenderedCover(req: Request): boolean {
  if (req.query.format || req.body?.format) return true;
  const accept = req.get('accept') || '';
  return /image\//i.test(accept);
}

const router = express.Router();
router.use(express.json({ limit: '10mb' }));

// 4. Headless cover rendering endpoint.
// Accepts a cover request as JSON (book metadata + layout + theme switches)
// and returns the rendered cover as PNG or SVG, so an external service
// (e.g. a NestJS backend) can generate covers over plain HTTP.
const COVER_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

router.options('/api/cover', (_req, res) => {
  res.set(COVER_CORS_HEADERS).sendStatus(204);
});

router.options('/api/cover/meta', (_req, res) => {
  res.set(COVER_CORS_HEADERS).sendStatus(204);
});

// Discovery endpoint: available layouts, palettes, fonts and request schema.
router.get('/api/cover/meta', (_req, res) => {
  res.set(COVER_CORS_HEADERS).json({
    layouts: LAYOUT_ARCHETYPES.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description,
      suggestedPaletteId: a.suggestedPaletteId,
    })),
    palettes: COLOR_PALETTES,
    foilEffects: ['none', 'gold', 'silver', 'rose_gold'],
    formats: ['png', 'svg'],
    coverAspectRatios: ['kdp_1_6', 'standard_3_4', 'print_6_9'],
    requiredFields: ['title', 'author'],
    examples: THEME_EXAMPLES,
    example: {
      title: 'Frankenstein',
      subtitle: 'Or, The Modern Prometheus',
      author: 'Mary Shelley',
      publisher: 'Lackington, Hughes, Harding, Mavor, & Jones',
      pubPlace: 'London, United Kingdom',
      date: '1818',
      isbn: '978-0-14-143947-1',
      series: "Oxford World's Classics",
      volume: 'Vol. I',
      taglineQuote: 'Did I request thee, Maker, from my clay to mould me man?',
      genre: 'Gothic Fiction, Romantic Literature, Science Fiction',
      coverArtUrl: '/src/assets/images/author_mary_shelley_1790705950823.jpg',
      layout: 'archival_monograph',
      foilEffect: 'none',
      format: 'png',
      pixelRatio: 2.5,
      theme: {
        paletteId: 'archival_alabaster',
        showPublisherMark: true,
        showBorder: true,
        showOrnaments: true,
        showBarcode: true,
      },
      hardcover: true,
    },
    docs: {
      spec: '/api/docs',
      ui: '/api/ui',
    },
  });
});

router.post('/api/cover', async (req, res, next) => {
  // src/ (AI Studio) answers POST /api/cover with the normalized cover config
  // JSON; this route renders only when a picture is asked for - an image
  // Accept (biblioteca-nestjs sends image/png) or an explicit format.
  if (!wantsRenderedCover(req)) return next();
  res.set(COVER_CORS_HEADERS);
  const startedAt = Date.now();
  const requestedWorkId = req.get('x-biblioteca-work-id') || undefined;
  const requestLabel = () => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : 'untitled';
    const author = typeof req.body?.author === 'string' ? req.body.author.trim() : 'unknown author';
    return requestedWorkId ? `${requestedWorkId} (${title} — ${author})` : `${title} — ${author}`;
  };
  const elapsed = () => {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} minutes`;
  };
  console.info(`[cover] generating cover for ${requestLabel()}`);
  // The JSON as received, on one line; very long strings (inline data: URL
  // cover art) are shortened so one request cannot flood the log.
  console.info(`[cover] request ${JSON.stringify(req.body ?? {}, (_key, value) =>
    typeof value === 'string' && value.length > 300 ? `${value.slice(0, 300)}…(${value.length} chars)` : value)}`);

  let spec;
  try {
    const request: CoverRenderRequest = {
      ...req.body,
      // Query params override body for convenience (?format=svg&download=1)
      format: (req.query.format as 'png' | 'svg') || req.body?.format,
      download: req.query.download ? String(req.query.download) === '1' || req.query.download === 'true' : req.body?.download,
    };
    spec = resolveCoverRequest(request);
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Invalid cover request' });
  }

  const format = spec.render.format;

  try {
    const { buffer, contentType } = await renderCover(spec, `http://127.0.0.1:${port()}`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    if (req.body?.download || req.query.download) {
      const slug = `${spec.book.title}-${spec.book.author}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'cover';
      res.setHeader('Content-Disposition', `attachment; filename="${slug}.${format}"`);
    }
    console.info(`[cover] generated cover for ${requestLabel()}; took ${elapsed()}`);
    res.send(buffer);
  } catch (error: any) {
    console.error(`[cover] failed generating cover for ${requestLabel()}; took ${elapsed()}:`, error);
    res.status(500).json({ error: error?.message || 'Failed to render cover' });
  }
});

// 5. OpenAPI documentation endpoints.
// GET /api/docs returns the OpenAPI 3.0 spec as JSON (consumable by codegen
// tools and client generators); GET /api/ui serves Swagger UI bound to it.
router.get('/api/docs', (_req, res) => {
  res.set(COVER_CORS_HEADERS).json(OPENAPI_SPEC);
});

router.use(
  '/api/ui',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set(COVER_CORS_HEADERS);
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(OPENAPI_SPEC, {
    customSiteTitle: 'FolioCraft Cover API',
    swaggerOptions: { tryItOutEnabled: true },
  })
);

/**
 * Registers the routes AHEAD of everything src/ registered at import time
 * (its own POST /api/cover would otherwise answer first), so the root
 * server.ts only has to call this once.
 */
export function registerCoverRenderRoutes(app: Express): void {
  app.use(router);
  const stack = (app as any)._router?.stack as { name?: string }[] | undefined;
  if (!stack) return;
  // Just after Express's own query/expressInit layers, ahead of src/'s.
  const layer = stack.pop()!;
  const firstAppLayer = stack.findIndex(l => l.name !== 'query' && l.name !== 'expressInit');
  stack.splice(firstAppLayer < 0 ? stack.length : firstAppLayer, 0, layer);
}
