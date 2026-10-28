import type { Express, Request, Response } from 'express';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const MAX_PROXY_IMAGE_BYTES = 10 * 1024 * 1024;
const DEFAULT_PROXY_IMAGE_HOSTS = ['upload.wikimedia.org', 'images.unsplash.com', 'plus.unsplash.com', 'images.pexels.com'];

function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const octets = address.split('.').map(Number);
    const [a, b, c] = octets;
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 168))
      || (a === 198 && (b === 18 || b === 19 || b === 51 && c === 100))
      || (a === 203 && b === 0 && c === 113));
  }
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase().split('%')[0];
    return /^[23]/.test(normalized) && !normalized.startsWith('::ffff:');
  }
  return false;
}

async function validateProxyImageUrl(value: string): Promise<URL> {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Invalid image URL'); }
  const configured = (process.env.COVER_IMAGE_PROXY_ALLOWED_HOSTS || '').split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
  const allowedHosts = new Set([...DEFAULT_PROXY_IMAGE_HOSTS, ...configured]);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash
    || (url.port && url.port !== '443') || !allowedHosts.has(url.hostname.toLowerCase())) {
    throw new Error('Image URL host is not allowed');
  }
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(address => !isPublicAddress(address.address))) {
    throw new Error('Image URL must resolve only to public addresses');
  }
  return url;
}

async function readProxyImage(response: globalThis.Response): Promise<Buffer> {
  if (!response.ok || response.status >= 300) throw new Error('Image source returned an error or redirect');
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(contentType)) {
    throw new Error('Image source must return a supported raster image');
  }
  if (Number(response.headers.get('content-length') || 0) > MAX_PROXY_IMAGE_BYTES) throw new Error('Image exceeds 10 MiB');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Image source returned an empty body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_PROXY_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error('Image exceeds 10 MiB');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export function registerRoutes(app: Express, projectRoot: string): void {
  // Statically serve public directory (schemas, assets)
  // Explicit static route for the cover JSON request schema
  app.get('/cover-request-schema.json', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(projectRoot, 'public', 'cover-request-schema.json'));
  });

  app.get('/cover-schema.json', (_req: Request, res: Response) => {
    res.redirect(301, '/cover-request-schema.json');
  });

  // 1. Author portrait search endpoint (searches Wikipedia and Wikimedia Commons)
  app.get('/api/author-portrait', async (req: Request, res: Response) => {
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
  app.get('/api/proxy-image', async (req: Request, res: Response) => {
    const imageUrl = req.query.url as string;
    if (typeof imageUrl !== 'string' || !imageUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const url = await validateProxyImageUrl(imageUrl);
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(15_000),
        headers: {
          'User-Agent': 'FolioCraft-Ebook-Cover-Studio/1.0 (https://ais.dev; contact@folio.studio)',
        },
      });
      const body = await readProxyImage(response);
      const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(body);
    } catch (err: any) {
      const status = /host is not allowed|public addresses|Invalid image URL/.test(err?.message || '') ? 400
        : /10 MiB/.test(err?.message || '') ? 413
          : /supported raster/.test(err?.message || '') ? 415 : 502;
      res.status(status).send(err?.message || 'Error proxying image');
    }
  });

  // 3. AI analysis of TEI XML (optional enhancement using gemini-3.8-flash)
  app.post('/api/ai-analyze-tei', async (req: Request, res: Response) => {
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

  // 4. REST endpoint for book cover JSON schema
  app.get('/api/cover-schema', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(projectRoot, 'public', 'cover-request-schema.json'));
  });

  // 5. REST endpoint to process, validate, and normalize cover JSON payload
  const handleCoverConfig = (req: Request, res: Response) => {
    const body = req.body || {};
    console.log('[Cover Generation] Received JSON:', JSON.stringify(body, null, 2));

    // Extract vintage filter flag (supporting aliases: vintageFilter, agingFilter, bwFilter)
    // CRITICAL REQUIREMENT: By default OFF (false)
    const applyVintageFilter =
      body.applyVintageFilter !== undefined
        ? Boolean(body.applyVintageFilter)
        : body.vintageFilter !== undefined
        ? Boolean(body.vintageFilter)
        : body.agingFilter !== undefined
        ? Boolean(body.agingFilter)
        : body.bwFilter !== undefined
        ? Boolean(body.bwFilter)
        : false;

    const coverArtUrl = body.coverArtUrl || body.imageUrl || body.graphicUrl || body.portraitUrl || '';
    const treatment = body.portraitTreatment || (applyVintageFilter ? 'sepia' : 'natural');

    const normalized = {
      status: 'ok',
      book: {
        title: body.title || 'Untitled Work',
        subtitle: body.subtitle || '',
        author: body.author || 'Anonymous',
        publisher: body.publisher || 'Ediții Scriptorium',
        pubPlace: body.pubPlace || 'București',
        date: body.date ? String(body.date) : '2026',
        isbn: body.isbn || '',
        series: body.series || '',
        volume: body.volume || '',
        taglineQuote: body.taglineQuote || '',
        genre: body.genre || 'Literature',
      },
      portrait: {
        url: coverArtUrl,
        title: body.author || body.title || 'Cover Artwork',
        source: 'upload',
        applyVintageFilter, // false by default
        treatment,
        cropShape: body.cropShape || 'full_bleed',
        zoom: typeof body.zoom === 'number' ? body.zoom : 1.0,
        panX: typeof body.panX === 'number' ? body.panX : 0,
        panY: typeof body.panY === 'number' ? body.panY : 0,
      },
      theme: {
        archetypeId: body.layout || body.archetypeId || 'archival_monograph',
        paletteId: body.paletteId || 'archival_alabaster',
        foilEffect: body.foilEffect || 'none',
      },
      filterStatus: {
        applyVintageFilter,
        activeEffect: applyVintageFilter ? treatment : 'none (original natural color)',
        isDefault: !applyVintageFilter,
      },
    };

    res.json(normalized);
  };

  app.post('/api/cover', handleCoverConfig);
  app.post('/api/cover-config', handleCoverConfig);

  // GET /api/cover-config returns default sample config with applyVintageFilter: false
  app.get('/api/cover-config', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      description: 'Book cover configuration endpoint. Post any book JSON payload here.',
      defaults: {
        applyVintageFilter: false, // by default off
        treatment: 'natural',
        cropShape: 'full_bleed',
        foilEffect: 'none',
      },
      samplePayload: {
        title: 'Frankenstein',
        subtitle: 'The Modern Prometheus',
        author: 'Mary Shelley',
        publisher: 'Ediții Scriptorium',
        pubPlace: 'București',
        date: String(new Date().getFullYear()),
        coverArtUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
        applyVintageFilter: false,
        layout: 'archival_monograph',
      },
    });
  });
}
