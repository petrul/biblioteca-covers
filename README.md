# Biblioteca Covers

Renders the book covers of [Biblioteca](https://biblioteca.scriptorium.ro)
and the thumbnails its reader shows.

- **Cover rendering** - `POST /api/cover` turns a work's title and author
  (plus optional art, layout and palette) into a PNG or SVG cover.
  biblioteca-nestjs calls it for every work.
- **Thumbnails** - `/api/thumbnails` serves small WebP versions of cover
  images for biblioteca-reader.
- **Cover studio** - a React + Tailwind web app for designing covers by hand.

```
biblioteca-nestjs ──POST /api/cover──▶ biblioteca-covers ◀──/api/thumbnails── biblioteca-reader
```

## Quick start

Every Biblioteca project has the same Rake interface. The tasks load the
`biblioteca/<profile>` pass-store profile, by default the machine's hostname.

```bash
rake run              # dev server on http://localhost:3335 (PORT overrides)
rake test             # typecheck, unit tests, Playwright API end-to-end tests
rake ci               # clean, test, build, publish the Docker image (TeamCity)
rake "test[ci]"       # any task with an explicit profile
```

Rendering needs Chrome: `CHROME_PATH`, or the Playwright Chromium that
`rake test` installs. The Docker image (Node 24, Chromium included) is
published to `mini.local:5000/editii/biblioteca-covers`.

Try it:

```bash
curl -X POST http://localhost:3335/api/cover \
  -H 'Accept: image/png' -H 'Content-Type: application/json' \
  -d '{"title":"Frankenstein","author":"Mary Shelley"}' -o cover.png
```

## Read first: `src/` belongs to AI Studio

The studio (design, components, themes, palettes) is developed in Google AI
Studio, and each import **replaces everything under `src/`**. Our own code
therefore lives beside it, never inside it. (On 2026-10-12 an import deleted
the render API, and cover generation stopped until it was restored in `src2/`.)

| Path | Owner | Rule |
|---|---|---|
| `src/` | AI Studio | Never edit - it is overwritten. Fix forward in `src2/`. |
| `src2/` | us | The cover render API (`src2/cover/`) and the thumbnail API. Uses `src/`, never copies it. |
| `tests/` | us | API test suites (plus AI Studio's own specs). |
| `server.ts` | us | Starts `src/server` and registers the `src2/` routes. |
| `package.json`, `vite.config.ts`, `rakefile`, `Dockerfile`, `README.md` | us | Never overwrite them with AI Studio's versions. |

`src2/` relies on these parts of `src/`; if an import changes one, the tests
fail:

- `src/components/CoverCanvas` - `CoverCanvas` (`book`, `portrait`, `theme`),
  rendering `#book-cover-export-node`;
- `src/types` - `BookMetadata`, `AuthorPortraitConfig`, `CoverThemeConfig`,
  `ColorPalette`, `FoilEffectStyle`, `LayoutArchetypeId`;
- `src/utils/themePresets` - `COLOR_PALETTES`, `LAYOUT_ARCHETYPES` (including
  `pure_typographic`, below);
- `src/index.css`, and `src/server/index` (exports `app`, `startServer`).

**Importing a new AI Studio version:**

1. Replace **only** `src/`. Merge wanted changes to other exported files by hand.
2. `git status` must show changes under `src/` only; `git checkout --` the rest.
3. `npm install` any new package the new `src/` imports.
4. `rake test`. A failing `tests/cover-api*.spec.ts` almost always means one of
   the contracts above changed: adapt `src2/`, not `src/`.
5. Run the `curl` above; it must produce a PNG.
6. Commit the import on its own ("AI Studio import 2026-10-14"), so a bad one is
   one `git revert` away.

## API

The full OpenAPI spec is at `GET /api/docs` (generate clients from it) and an
interactive Swagger UI at `GET /api/ui`.

### `POST /api/cover`

Only `title` and `author` are required; everything else falls back to the
studio defaults. Returns `image/png` (default) or `image/svg+xml`.

```json
{
  "title": "Frankenstein", "subtitle": "Or, The Modern Prometheus", "author": "Mary Shelley",
  "publisher": "Lackington", "date": "1818", "series": "Oxford World's Classics",
  "coverArtUrl": "https://upload.wikimedia.org/...jpg",
  "layout": "archival_monograph", "foilEffect": "gold",
  "theme": { "paletteId": "archival_alabaster", "showBarcode": false, "coverAspectRatio": "kdp_1_6" },
  "hardcover": false, "portrait": { "treatment": "etching", "cropShape": "oval_cameo" },
  "format": "png", "pixelRatio": 2.5
}
```

| Field | Meaning |
|---|---|
| `layout`, `theme.paletteId` | A layout archetype and palette; list them with `GET /api/cover/meta`. |
| `foilEffect` | `none`, `gold`, `silver` or `rose_gold`. |
| `theme` | Any `CoverThemeConfig` override: fonts, on/off switches, aspect ratio. |
| `hardcover` | `true`/`false`, or a full overlay config. |
| `coverArtUrl` | App-relative path, data URL or remote URL (proxied server-side): any public `http(s)` image host, at most 10 MiB, redirects followed; never a private or LAN address. A remote image that cannot be fetched fails the render with 422 and the reason (e.g. the host answered 403, or a web page instead of the image) - no placeholder cover. Only administrators reach a render through the reader. See `src/server/remoteImage.ts`. |
| `format`, `pixelRatio` | `png` or `svg` (also `?format=`); PNG scale 1-4, default 2.5 (1050×1680). |
| `download` | `true` (or `?download=1`) for `Content-Disposition: attachment`. |

A cover is rendered only when an image is asked for, by an `image/*` `Accept`
header or an explicit `format`. Other `POST /api/cover` requests reach
`src/`'s own cover-config endpoint, which answers with the normalized config
as JSON.

For callers:

- A render takes 0.5-2 s, and renders go one at a time through a single
  Chrome. Use a 60 s timeout, and queue requests rather than firing them in
  parallel.
- Errors: `400 {"error": ...}` for a missing title/author or bad JSON; `500`
  when rendering fails (usually no Chrome; text falls back to system fonts if
  Google Fonts is unreachable).
- A work with no art and an author with no portrait gets `pure_typographic`,
  the one layout drawn without a picture. If AI Studio renames it, update
  `NO_ART_LAYOUT` in biblioteca-nestjs.

### Other endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/cover/meta` | Layouts, palettes, foil effects, formats, aspect ratios, an example body. |
| `GET /api/author-portrait?name=...` | Candidate portraits from Wikipedia/Wikimedia. |
| `GET /api/thumbnails?url=...&width=320` | A WebP thumbnail (widths 160/320/640) of an allowlisted image. |
| `POST /api/thumbnails?width=320` | A WebP thumbnail of uploaded image bytes. |

Thumbnails, their cache, allowlist and configuration are described in
[`src2/README.md`](src2/README.md).

## Tests

- `tests/cover-api.spec.ts` - meta, PNG and SVG rendering, theme switches,
  validation.
- `tests/cover-api-extended.spec.ts` - all layouts, aspect ratios, foil,
  hardcover, cover-art sources, headers, and a pixel check against blank images.
- `src2/*.test.ts` - thumbnail unit tests (`rake -f src2/Rakefile test`).

The Playwright suites start the dev server themselves, or reuse one already
running.

## License

Copyright 2026 Editii Scriptorium srl. Licensed under the [Apache License, Version 2.0](LICENSE); see also [NOTICE](NOTICE).
