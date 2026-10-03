import { expect, test } from '@playwright/test';

/**
 * End-to-end tests for the headless cover rendering REST API.
 *
 * POST /api/cover accepts a cover request (book metadata + layout + theme
 * switches) and returns the rendered cover as PNG or SVG.
 */

const frankensteinRequest = {
  title: 'Frankenstein',
  subtitle: 'Or, The Modern Prometheus',
  author: 'Mary Shelley',
  publisher: 'Lackington, Hughes, Harding, Mavor, & Jones',
  pubPlace: 'London, United Kingdom',
  date: '1818',
  isbn: '978-0-14-143947-1',
  series: "Oxford World's Classics",
  volume: 'Vol. I',
  taglineQuote:
    '\u201cDid I request thee, Maker, from my clay to mould me man? Did I solicit thee from darkness to promote me?\u201d',
  genre: 'Gothic Fiction, Romantic Literature, Science Fiction',
  coverArtUrl: '/src/assets/images/author_mary_shelley_1790705950823.jpg',
  layout: 'archival_monograph',
  foilEffect: 'none',
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function fetchCover(request: any, payload: object): Promise<{ status: number; contentType: string; body: Buffer }> {
  const response = await request.post('/api/cover', { data: payload });
  return {
    status: response.status(),
    contentType: response.headers()['content-type'] || '',
    body: Buffer.from(await response.body()),
  };
}

test('GET /api/cover/meta lists layouts, palettes and an example request', async ({ request }) => {
  const response = await request.get('/api/cover/meta');
  expect(response.status()).toBe(200);

  const meta = await response.json();
  expect(meta.layouts.map((l: { id: string }) => l.id)).toContain('archival_monograph');
  expect(meta.palettes.some((p: { id: string }) => p.id === 'archival_alabaster')).toBe(true);
  expect(meta.formats).toEqual(['png', 'svg']);
  expect(meta.example.title).toBe('Frankenstein');
  expect(Object.keys(meta.examples)).toHaveLength(meta.layouts.length);
  for (const layout of meta.layouts) {
    expect(meta.examples[`theme_${layout.id}`].value.layout).toBe(layout.id);
  }
});

test('POST /api/cover returns a PNG at the requested pixelRatio', async ({ request }) => {
  const { status, contentType, body } = await fetchCover(request, {
    ...frankensteinRequest,
    format: 'png',
    pixelRatio: 2,
  });

  expect(status).toBe(200);
  expect(contentType).toContain('image/png');

  // Valid PNG signature + IHDR chunk
  expect(body.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
  expect(body.toString('ascii', 12, 16)).toBe('IHDR');

  // 420px CSS width at kdp_1_6 aspect ratio (672px) scaled by pixelRatio 2
  const width = body.readUInt32BE(16);
  const height = body.readUInt32BE(20);
  expect(width).toBe(840);
  expect(height).toBe(1344);
});

test('POST /api/cover?format=svg returns an SVG embedding the book data', async ({ request }) => {
  const { status, contentType, body } = await fetchCover(request, {
    ...frankensteinRequest,
    format: 'svg',
  });

  expect(status).toBe(200);
  expect(contentType).toContain('image/svg+xml');

  const svg = body.toString('utf-8');
  expect(svg.trimStart().startsWith('<')).toBe(true);
  expect(svg).toContain('Frankenstein');
  expect(svg).toContain('Mary Shelley');
  expect(svg).toContain('foreignObject');
});

test('POST /api/cover applies theme switches (layout, palette, foil, hardcover off)', async ({ request }) => {
  const { status, body } = await fetchCover(request, {
    ...frankensteinRequest,
    format: 'svg',
    layout: 'folio_heritage',
    foilEffect: 'gold',
    hardcover: false,
    theme: {
      paletteId: 'imperial_crimson',
      showPublisherMark: false,
      showBorder: true,
      showOrnaments: true,
      showBarcode: false,
    },
  });

  expect(status).toBe(200);
  const svg = body.toString('utf-8');
  // Imperial Crimson palette background (#2F0B13) appears as a computed rgb() value
  expect(svg).toContain('rgb(47, 11, 19)');
  // Publisher mark is switched off: the oxford mark path data must not appear
  expect(svg).not.toContain('M14 12H34M14 18H34M14 24H28M14 30H34');
});

test('POST /api/cover rejects a request without title with 400', async ({ request }) => {
  const response = await request.post('/api/cover', {
    data: { ...frankensteinRequest, title: '' },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toContain('title');
});

test('returned PNG and SVG both render in a real browser page', async ({ request, page }) => {
  const png = (
    await fetchCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 1,
    })
  ).body;
  const svg = (
    await fetchCover(request, {
      ...frankensteinRequest,
      format: 'svg',
    })
  ).body;

  expect(png.length).toBeGreaterThan(10_000);
  expect(svg.length).toBeGreaterThan(1_000);

  await page.setContent(
    `<img id="png" src="data:image/png;base64,${png.toString('base64')}">` +
      `<img id="svg" src="data:image/svg+xml;base64,${svg.toString('base64')}">`
  );

  await page.waitForFunction(() => {
    const png = document.getElementById('png') as HTMLImageElement;
    const svg = document.getElementById('svg') as HTMLImageElement;
    return png.complete && png.naturalWidth > 0 && svg.complete && svg.naturalWidth > 0;
  });

  const dimensions = await page.evaluate(() => {
    const png = document.getElementById('png') as HTMLImageElement;
    const svg = document.getElementById('svg') as HTMLImageElement;
    return { png: { w: png.naturalWidth, h: png.naturalHeight }, svg: { w: svg.naturalWidth, h: svg.naturalHeight } };
  });

  expect(dimensions.png.w).toBe(420);
  expect(dimensions.png.h).toBe(672);
  expect(dimensions.svg.w).toBeGreaterThan(0);
  expect(dimensions.svg.h).toBeGreaterThan(0);
});
