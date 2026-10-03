import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { renderCover } from './coverRenderer';
import { OPENAPI_SPEC, THEME_EXAMPLES } from './openapiSpec';
import { CoverRenderRequest, resolveCoverRequest } from './src/utils/coverRequest';
import { COLOR_PALETTES, LAYOUT_ARCHETYPES } from './src/utils/themePresets';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3335;

app.use(express.json({ limit: '10mb' }));

// 1. Author portrait search endpoint (searches Wikipedia and Wikimedia Commons)
app.get('/api/author-portrait', async (req, res) => {
  const query = req.query.name as string;
  if (!query) {
    return res.status(400).json({ error: 'Missing name query parameter' });
  }

  try {
    const portraits: Array<{
      url: string;
      title: string;
      source: 'wikipedia' | 'wikimedia';
      description?: string;
    }> = [];

    // Search Wikipedia page image and summary
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        query
      )}&prop=pageimages|extracts|images&pithumbsize=1200&exintro=1&explaintext=1&format=json&origin=*`;
      const wikiResp = await fetch(wikiUrl);
      if (wikiResp.ok) {
        const wikiData = (await wikiResp.json()) as any;
        const pages = wikiData.query?.pages || {};
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          if (page.thumbnail?.source) {
            portraits.push({
              url: page.thumbnail.source,
              title: page.title || query,
              source: 'wikipedia',
              description: page.extract ? page.extract.slice(0, 180) + '...' : undefined,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Wikipedia search error:', e);
    }

    // Search Wikimedia Commons images
    try {
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        `${query} portrait OR photograph OR painting`
      )}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1200&format=json&origin=*`;
      const commonsResp = await fetch(commonsUrl);
      if (commonsResp.ok) {
        const commonsData = (await commonsResp.json()) as any;
        const pages = commonsData.query?.pages || {};
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          const info = page.imageinfo?.[0];
          if (info && info.thumburl) {
            const mime = info.mime || '';
            if (mime.includes('image/jpeg') || mime.includes('image/png') || mime.includes('image/webp')) {
              // Avoid already added
              if (!portraits.some((p) => p.url === info.thumburl)) {
                const meta = info.extmetadata || {};
                const desc = meta.ImageDescription?.value?.replace(/<[^>]+>/g, '').slice(0, 120);
                portraits.push({
                  url: info.thumburl,
                  title: page.title.replace(/^File:/i, ''),
                  source: 'wikimedia',
                  description: desc || undefined,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Commons search error:', e);
    }

    res.json({ query, portraits });
  } catch (error: any) {
    console.error('Author portrait search failed:', error);
    res.status(500).json({ error: error.message || 'Failed to search author portraits' });
  }
});

// 2. Image proxy endpoint to avoid CORS / canvas tainting on book export
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'FolioCraft-Ebook-Cover-Studio/1.0 (https://ais.dev; contact@folio.studio)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Image proxy error:', err);
    res.status(500).send('Error proxying image');
  }
});

// 3. AI analysis of TEI XML (optional enhancement using gemini-3.8-flash)
app.post('/api/ai-analyze-tei', async (req, res) => {
  try {
    const { teiSnippet, title, author } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured. Falling back to rule-based analysis.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a world-class book cover art director and typographer specializing in literary editions and classics.
Analyze this book data:
Title: "${title || 'Unknown'}"
Author: "${author || 'Unknown'}"
TEI XML Snippet/Context:
${teiSnippet ? teiSnippet.slice(0, 3000) : 'None provided'}

Provide recommendations in valid JSON with this exact structure:
{
  "genre": "Short literary genre (e.g. Gothic Horror, Philosophical Fiction, Romantic Poetry, Victorian Realism)",
  "mood": "Atmospheric mood (e.g. Somber & Haunting, Scholarly & Elegant, Avant-Garde Minimalist)",
  "recommendedLayoutId": "one of: 'archival_monograph', 'criterion_minimal', 'folio_heritage', 'cinematic_bleed', 'swiss_modernist', 'woodcut_broadside', 'faber_poetry', 'constructivist'",
  "palette": {
    "name": "Creative palette name (e.g. Oxford Blue & Gold Foil)",
    "background": "#hex",
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "surface": "#hex"
  },
  "tagline": "An evocative single-sentence blurb or epigraph suitable for a book cover front (max 15 words)",
  "artDirection": "1-2 sentence aesthetic guidance for the cover design"
}
Output only the pure JSON, no markdown backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('AI TEI analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze TEI' });
  }
});

// 4. Headless cover rendering endpoint.
// Accepts a cover request as JSON (book metadata + layout + theme switches)
// and returns the rendered cover as PNG or SVG, so an external service
// (e.g. a NestJS backend) can generate covers over plain HTTP.
const COVER_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

app.options('/api/cover', (_req, res) => {
  res.set(COVER_CORS_HEADERS).sendStatus(204);
});

app.options('/api/cover/meta', (_req, res) => {
  res.set(COVER_CORS_HEADERS).sendStatus(204);
});

// Discovery endpoint: available layouts, palettes, fonts and request schema.
app.get('/api/cover/meta', (_req, res) => {
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

app.post('/api/cover', async (req, res) => {
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
    const { buffer, contentType } = await renderCover(spec, `http://127.0.0.1:${port}`);

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
app.get('/api/docs', (_req, res) => {
  res.set(COVER_CORS_HEADERS).json(OPENAPI_SPEC);
});

app.use(
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

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, ws: process.env.DISABLE_HMR === 'true' ? false : { port: 24679 } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
