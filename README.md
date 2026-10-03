## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Cover rendering REST API

External services (e.g. a NestJS backend) can generate covers over HTTP. The server renders the real studio `CoverCanvas` in headless Chrome and returns the image bytes.

**Prerequisite:** a Chrome/Chromium binary on the machine (or set `CHROME_PATH`).

### `POST /api/cover`

Accepts a cover request as JSON and returns `image/png` (default) or `image/svg+xml`. Only `title` and `author` are required; every other field falls back to the studio defaults.

```json
{
  "title": "Frankenstein",
  "subtitle": "Or, The Modern Prometheus",
  "author": "Mary Shelley",
  "publisher": "Lackington, Hughes, Harding, Mavor, & Jones",
  "pubPlace": "London, United Kingdom",
  "date": "1818",
  "isbn": "978-0-14-143947-1",
  "series": "Oxford World's Classics",
  "volume": "Vol. I",
  "taglineQuote": "\u201cDid I request thee, Maker...\u201d",
  "genre": "Gothic Fiction, Romantic Literature, Science Fiction",
  "coverArtUrl": "/src/assets/images/author_mary_shelley_1790705950823.jpg",
  "layout": "archival_monograph",
  "foilEffect": "none",
  "format": "png",
  "pixelRatio": 2.5,
  "download": false,
  "theme": {
    "paletteId": "archival_alabaster",
    "showPublisherMark": true,
    "showBorder": true,
    "showOrnaments": true,
    "showBarcode": true,
    "coverAspectRatio": "kdp_1_6"
  },
  "hardcover": true,
  "portrait": { "treatment": "etching", "cropShape": "oval_cameo" }
}
```

Field notes:

- `layout` — layout archetype id, `foilEffect` — `none | gold | silver | rose_gold` (both can also be given inside `theme`).
- `format` — `png` or `svg` (can also be passed as `?format=svg`); `pixelRatio` — PNG upscale factor, 1–4 (default 2.5).
- `theme.paletteId` — palette preset id; `theme` also accepts any `CoverThemeConfig` override (fonts, on/off switches, aspect ratio).
- `hardcover` — `true` for the default hardcover overlay, `false` to disable, or a full config object.
- `coverArtUrl` — author portrait / cover art: an app-relative path, a data URL, or a remote URL (auto-proxied to avoid CORS).
- `download` — set `true` (or `?download=1`) for a `Content-Disposition: attachment` response.

Example:

```bash
curl -X POST http://localhost:3335/api/cover \
  -H 'Content-Type: application/json' \
  -d @cover-request.json --output cover.png
```

### `GET /api/cover/meta`

Discovery endpoint for integrations: available `layouts`, `palettes`, `foilEffects`, `formats`, `coverAspectRatios` and an `example` request body.

### `GET /api/docs` and `GET /api/ui`

- `GET /api/docs` serves the full [OpenAPI 3.0 specification](http://localhost:3335/api/docs) as JSON — use it to generate a typed client (`openapi-typescript`, `@openapitools/openapi-generator`, NSwag, etc.).
- `GET /api/ui` serves an interactive Swagger UI bound to that spec, including "Try it out" for `POST /api/cover`.

## Using the API from another service

Typical flow for a backend (e.g. NestJS) that holds a work (opus) record and wants a cover for it:

1. **Discover themes (optional, cacheable).** `GET /api/cover/meta` returns all layout archetypes and palette presets. Pick a `layout` + `theme.paletteId` for the work, or let the user choose. If the service is configured with a fixed theme, skip this step entirely.
2. **Find cover art (optional).** If the work has no portrait, `GET /api/author-portrait?name=Mary%20Shelley` returns candidate images (Wikipedia/Wikimedia). Pass any image URL as `coverArtUrl` — remote URLs are proxied server-side automatically.
3. **Render.** `POST /api/cover` with the work's metadata plus the chosen layout/theme switches. The response body is the image (`image/png` or `image/svg+xml`), ready to save to disk/object storage or stream onward.

Minimal request — only `title` and `author` are required, everything else defaults to the studio configuration:

```json
{ "title": "Frankenstein", "author": "Mary Shelley", "format": "png" }
```

NestJS example — a service that maps a work record to a cover request:

```ts
// covers/cover-client.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CoverClientService {
  private readonly coversBaseUrl = process.env.COVERS_API_URL ?? 'http://localhost:3335';

  async renderCover(work: {
    title: string;
    author: string;
    subtitle?: string;
    publisher?: string;
    date?: string;
    isbn?: string;
    coverArtUrl?: string;
  }, format: 'png' | 'svg' = 'png'): Promise<{ buffer: Buffer; contentType: string }> {
    const response = await fetch(`${this.coversBaseUrl}/api/cover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: work.title,
        subtitle: work.subtitle,
        author: work.author,
        publisher: work.publisher,
        date: work.date,
        isbn: work.isbn,
        coverArtUrl: work.coverArtUrl, // path, data URL or remote https URL
        layout: 'archival_monograph',  // from GET /api/cover/meta
        foilEffect: 'gold',
        hardcover: false,
        theme: { paletteId: 'imperial_crimson', showBarcode: false },
        format,
        pixelRatio: 2.5,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new InternalServerErrorException(`Cover render failed: ${error.error}`);
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    };
  }
}
```

```ts
// works/works.controller.ts
@Controller('works')
export class WorksController {
  constructor(private readonly covers: CoverClientService) {}

  @Get(':id/cover')
  async getCover(@Param('id') id: string, @Res() res: Response) {
    const work = await this.worksService.findOne(id); // your opus record
    const { buffer, contentType } = await this.covers.renderCover(work, 'png');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${work.id}.png"`);
    res.send(buffer);
  }
}
```

Operational notes for the calling service:

- **Latency/concurrency:** a render takes roughly 0.5–2 s and renders are serialized through one headless Chrome instance. Use a generous HTTP timeout (60 s) and queue or throttle concurrent cover requests rather than firing them in parallel.
- **Errors:** `400` with `{ "error": "..." }` for a missing `title`/`author` or malformed JSON; `500` when rendering fails (most commonly: no Chrome/Chromium executable on the covers service host, or Google Fonts unreachable — text falls back to system fonts when offline).
- **Formats:** `png` (raster, `pixelRatio` 1–4 controls resolution, default 2.5 → 1050×1680 px at the default aspect ratio) or `svg` (vector, HTML-in-`foreignObject`, infinitely scalable). If you need to rasterize or post-process the SVG, convert it with a tool that supports `foreignObject` (e.g. resvg with a browser fallback, or headless Chrome).
- **Switches:** every studio control is settable per request — `layout`, `theme.paletteId`, fonts, `foilEffect`, `showPublisherMark`/`showBorder`/`showOrnaments`/`showBarcode`, `hardcover` on/off, `theme.coverAspectRatio`. Unspecified fields fall back to the studio defaults, so a minimal two-field request is always valid.
- **Client generation:** point your generator at `GET /api/docs` to get a typed client instead of hand-writing the request schema.

## End-to-end tests

Playwright tests for the cover API (38 tests across two suites):

- `tests/cover-api.spec.ts` — meta endpoint, PNG + SVG rendering, theme switches, validation, in-browser render check.
- `tests/cover-api-extended.spec.ts` — all 14 layout archetypes, aspect ratios, pixelRatio clamping, foil effects, hardcover switch, cover art sourcing (app-relative, data URL, remote via proxy), fallbacks, download/CORS headers, and a pixel-level background/blank-image check.

```bash
npm run test:e2e
```

The suite boots the dev server itself (reusing an already-running one on the same port) and uses the system Google Chrome binary, so no `playwright install` is required.

## CI and Docker

Run the complete pipeline with:

```bash
rake ci
```

This cleans generated output, installs the locked dependencies, runs typechecking and end-to-end tests, builds the application, and publishes the versioned Docker image to `mini.local:5000/editii/biblioteca-covers`. The container uses Node 24 and includes Chromium for cover rendering.
