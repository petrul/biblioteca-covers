# Supplementary APIs (thumbnails, cover rendering)

Maintained code lives entirely in `src2/`; AI Studio can replace `src/`.
The root `server.ts` only imports and registers these routes before starting
its existing server. Original cover endpoints and original images are untouched.

## Routes

- `GET /api/thumbnails?url=<encoded-original-cover-url>&width=320`
  returns WebP. Allowed widths are 160, 320 (default), and 640. Aspect ratio
  is preserved, orientation is applied, and small images are not enlarged.
- `POST /api/thumbnails?width=320` accepts raw image bytes with an `image/*`
  content type and returns the converted WebP. No original image is persisted.
- `GET /api/thumbnails/cache/<key>` reads an existing nonexpired thumbnail.
  The key/URL is returned in the `Content-Location` response header.
- `DELETE /api/thumbnails/cache` clears generated thumbnails and returns
  `{"removed": N}`. Requires `Authorization: Bearer <admin-token>`.
- `GET /api/thumbnails/openapi.json` documents this supplementary API.

Image responses include `X-Thumbnail-Cache: HIT|MISS`, ETag, Content-Location,
and browser-cache headers. Conditional requests support `If-None-Match`.
The reader can proxy GET requests or send original bytes via POST; integration
into reader image components is deliberately separate from this API change.

## Configuration

| Variable | Default / meaning |
|---|---|
| `THUMBNAIL_CACHE_DIR` | `.cache/thumbnails` relative to the process working directory |
| `THUMBNAIL_SOURCE_ORIGINS` | Additional comma-separated allowed HTTP(S) origins |
| `MINIO_PUBLIC_URL`, `MINIO_URL` | Their origins are allowed automatically when configured |
| `THUMBNAIL_CACHE_TTL_SECONDS` | 86400; refetch originals at unchanged URLs after expiration |
| `THUMBNAIL_CACHE_MAX_BYTES` | 2147483648; oldest generated thumbnails evicted when over budget |
| `THUMBNAIL_CACHE_ADMIN_TOKEN` | Required to enable DELETE; keep it in the pass-store profile |

The URL loader requires public/readable image URLs, does not follow redirects,
and does not use MinIO credentials. For private originals the reader should
fetch them with its existing credentials and use the binary POST endpoint.
A cache hit performs no original-source download. A changed/versioned source
URL gets a different cache key immediately; an unchanged URL refreshes on TTL
expiration. Byte-upload keys include a digest of the original contents.

Sharp generates thumbnails once per key within the process. Generation is
bounded to two concurrent jobs, 10 MiB input and 40 million decoded pixels;
an overflowed queue returns 429. Files are written through unique temporary
files and atomic renames. Generation interrupted by cache clearing cannot
repopulate the old cache. Deletion only removes managed hash-named `.webp`
files after checking a cache ownership marker; unrelated files are preserved.
Size-budget pruning is checked on writes, at most once per 30 seconds, so the
budget may be temporarily exceeded between checks. GET cache hits do not scan
or clean the cache. Clearing disk does not purge browser caches.

Persist the directory with a writable mounted volume when Docker deployment
is eventually authorized; set `THUMBNAIL_CACHE_DIR` to that mount. There are no
Docker/deployment changes in this implementation. Local `.cache/` is already
ignored by Git. No development server is started by the test task:

```sh
rake -f src2/Rakefile test
```

Tests use generated images and short-lived HTTP listeners on ephemeral ports,
without importing the app bootstrap, external services or credentials.

Example reader-side requests:

```sh
curl --get http://localhost:3335/api/thumbnails \
  --data-urlencode 'url=https://your-minio-origin/biblioteca/covers/book.png' \
  --data-urlencode width=320 --output /tmp/cover.webp

curl http://localhost:3335/api/thumbnails?width=320 \
  -H 'Content-Type: image/png' --data-binary @/tmp/original-cover.png \
  --output /tmp/cover.webp
```

## Headless cover rendering (`src2/cover/`)

Restored from the root `server.ts`, `coverRenderer.ts`, `render.html`,
`openapiSpec.ts`, `src/render/main.tsx` and `src/utils/coverRequest.ts`, removed
by mistake on 2026-10-12. biblioteca-nestjs generates every work cover through it.

- `POST /api/cover` renders a cover request (flat `title`, `author`, `layout`,
  `theme`...) to PNG, or SVG with `format: "svg"` / `?format=svg`. It renders only
  when a picture is asked for - an `image/*` Accept (biblioteca-nestjs sends
  `image/png`) or an explicit `format`; any other `POST /api/cover` falls through
  to `src/`'s cover-config JSON endpoint.
- `GET /api/cover/meta`: layouts, palettes, foils, formats, examples.
- `GET /api/docs` (OpenAPI JSON) and `GET /api/ui` (Swagger UI).

The render page (`src2/cover/render.html` + `main.tsx`) draws `src/`'s own
`CoverCanvas` - nothing from `src/` is copied - in headless Chromium:
`CHROME_PATH` when set (the Docker image), otherwise Playwright's downloaded
Chromium. `registerCoverRenderRoutes` mounts these routes ahead of `src/`'s;
`vite.config.ts` builds the render page for production.
Tests: `tests/cover-api.spec.ts`, `tests/cover-api-extended.spec.ts`.

