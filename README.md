# Biblioteca Covers

Cover design studio (React + Tailwind) and the cover services the rest of
Biblioteca relies on: server-side cover rendering (`POST /api/cover`, used by
biblioteca-nestjs to generate every work cover) and cover thumbnails
(`/api/thumbnails`, used by biblioteca-reader).

## Read first: `src/` belongs to AI Studio

The studio itself - design, components, themes/layouts, palettes - is developed
in Google AI Studio, and its `src/` is periodically copied over this project's
`src/`, **replacing everything under it**. AI Studio does good design work, and
most imports only change the themes, but now and then it also drops or renames
things the other services depend on. On 2026-10-12 an import removed the
server-side rendering API together with its render page and tests; cover
generation in biblioteca-nestjs stopped until it was restored into `src2/`.

| Path | Owner | Rule |
|---|---|---|
| `src/` | AI Studio | Never edit here - it is overwritten. Fix forward in `src2/`. |
| `src2/` | us | Everything we add on top of the studio, as little as possible: the cover render API (`src2/cover/`) and the thumbnail API. It *uses* `src/` (components, types, presets) and never copies it. |
| `tests/` | us (plus AI Studio's own spec files) | The API test suites live here. |
| `server.ts` | us | Minimal glue: starts `src/server` and registers the `src2/` routes. |
| `package.json`, `vite.config.ts`, `rakefile`, `Dockerfile`, `README.md` | us | Ours to change; do not overwrite them with AI Studio's versions. |

What `src2/` relies on from `src/` - if an import changes one of these, the
cover render breaks and the tests say so:

- `src/components/CoverCanvas` - `CoverCanvas` with `book`, `portrait`, `theme`
  props, rendering the `#book-cover-export-node` element;
- `src/types` - `BookMetadata`, `AuthorPortraitConfig`, `CoverThemeConfig`,
  `ColorPalette`, `FoilEffectStyle`, `LayoutArchetypeId`;
- `src/utils/themePresets` - `COLOR_PALETTES`, `LAYOUT_ARCHETYPES`
  (`pure_typographic` among them, see below);
- `src/index.css`;
- `src/server/index` - exports `app` and `startServer`.

### Importing a new AI Studio version - checklist

1. Replace **only** `src/` with AI Studio's `src/`. Do not copy any other file
   from the export (`server.ts`, `package.json`, `vite.config.ts`, `README.md`,
   `tests/`...). If the export changed one of them in a way you want, merge
   that change by hand.
2. `git status` - only files under `src/` may have changed. Anything else
   modified or deleted: `git checkout -- <file>`.
3. If the new `src/` imports a package that is not installed:
   `npm install <package>` (that updates `package.json`, which is ours).
4. `rake test` - typecheck, the `src2/` unit tests and every API end-to-end test
   must pass. A failure in `tests/cover-api*.spec.ts` after an import almost
   always means one of the contracts above changed: adapt `src2/` to the new
   `src/`; do not edit `src/`.
5. Smoke test the render the way biblioteca-nestjs calls it:
   `curl -X POST -H 'Accept: image/png' -H 'Content-Type: application/json' -d '{"title":"T","author":"A"}' http://localhost:3335/api/cover -o t.png`
   must produce a PNG.
6. Commit the import on its own (e.g. "AI Studio import 2026-10-14"), so a bad
   import is one `git revert` away.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Cover rendering REST API

External services (e.g. a NestJS backend) can generate covers over HTTP. The server renders the real studio `CoverCanvas` in headless Chrome and returns the image bytes.

**Prerequisite:** `CHROME_PATH` pointing at a Chrome/Chromium binary (the Docker image sets it), otherwise Playwright's downloaded Chromium (`npx playwright install chromium`). The code lives in `src2/cover/` - see below and `src2/README.md`.

### `POST /api/cover`

Accepts a cover request as JSON and returns `image/png` (default) or `image/svg+xml`. Only `title` and `author` are required; every other field falls back to the studio defaults.

It renders only when a picture is asked for: an `image/*` `Accept` header (biblioteca-nestjs sends `Accept: image/png`) or an explicit `format` (body or `?format=`). Any other `POST /api/cover` is answered by `src/`'s own cover-config endpoint, which returns the normalized config JSON - AI Studio reused that path, and both coexist this way.

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
- **Works without any picture:** biblioteca-nestjs picks a random layout and palette per cover, but a work with no image of its own and an author with no portrait always gets `pure_typographic` - the one layout drawn without imagery (the others are built around a picture). If AI Studio ever renames that layout id, update `NO_ART_LAYOUT` in biblioteca-nestjs.

## End-to-end tests

Playwright tests for the cover API (36 tests across two suites), next to AI Studio's own `tests/cover-config.spec.ts`:

- `tests/cover-api.spec.ts` — meta endpoint, PNG + SVG rendering, theme switches, validation, in-browser render check.
- `tests/cover-api-extended.spec.ts` — all 14 layout archetypes, aspect ratios, pixelRatio clamping, foil effects, hardcover switch, cover art sourcing (app-relative, data URL, remote via proxy), fallbacks, download/CORS headers, and a pixel-level background/blank-image check.

```bash
npm run test:e2e
```

The suite boots the dev server itself (reusing an already-running one on the same port). `rake test` installs Playwright's Chromium and uses it for both browser tests and API cover rendering.

## CI and Docker

Run the complete pipeline with:

```bash
rake ci
```

This cleans generated output, installs the locked dependencies, runs typechecking and end-to-end tests, builds the application, and publishes the versioned Docker image to `mini.local:5000/editii/biblioteca-covers`. The container uses Node 24 and includes Chromium for cover rendering.
