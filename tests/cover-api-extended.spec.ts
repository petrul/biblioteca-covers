import { expect, test } from '@playwright/test';

/**
 * Extended coverage for POST /api/cover:
 * - all layout archetypes render (theme selection)
 * - aspect ratios and pixelRatio clamping
 * - foil effects and hardcover switch
 * - cover art sourcing (app-relative, data URL, remote via proxy)
 * - fallbacks, validation and HTTP semantics (download, CORS)
 * - pixel-level render sanity (background color + non-blank image)
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

// 1x1 PNG
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function postCover(
  request: any,
  payload: object,
  query = ''
): Promise<{ status: number; headers: Record<string, string>; contentType: string; body: Buffer }> {
  const response = await request.post(`/api/cover${query}`, { data: payload });
  const headers = response.headers();
  return {
    status: response.status(),
    headers,
    contentType: headers['content-type'] || '',
    body: Buffer.from(await response.body()),
  };
}

function pngDimensions(buf: Buffer): { width: number; height: number } {
  expect(buf.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test.describe('layout archetypes', () => {
  let layoutIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const meta = await (await request.get('/api/cover/meta')).json();
    layoutIds = meta.layouts.map((l: { id: string }) => l.id);
    expect(layoutIds.length).toBeGreaterThanOrEqual(14);
  });

  for (const layoutId of [
    'archival_monograph',
    'criterion_minimal',
    'folio_heritage',
    'cinematic_bleed',
    'swiss_modernist',
    'woodcut_broadside',
    'faber_poetry',
    'constructivist',
    'storybook_whimsy',
    'classical_graeco_roman',
    'historical_annals',
    'slavonic_construct',
    'asian_inkwash',
    'adventure_pulp',
  ]) {
    test(`renders layout '${layoutId}' as PNG`, async ({ request }) => {
      expect(layoutIds).toContain(layoutId);
      const { status, contentType, body } = await postCover(request, {
        ...frankensteinRequest,
        layout: layoutId,
        format: 'png',
        pixelRatio: 1,
      });
      expect(status).toBe(200);
      expect(contentType).toContain('image/png');
      expect(pngDimensions(body)).toEqual({ width: 420, height: 672 });
    });
  }

  test('falls back to a valid layout for an unknown layout id', async ({ request }) => {
    const { status, body } = await postCover(request, {
      ...frankensteinRequest,
      layout: 'not_a_real_layout',
      format: 'svg',
    });
    expect(status).toBe(200);
    expect(body.toString('utf-8')).toContain('Frankenstein');
  });
});

test.describe('output geometry', () => {
  test('standard_3_4 aspect ratio produces 3:4 PNG', async ({ request }) => {
    const { body } = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 1,
      theme: { coverAspectRatio: 'standard_3_4' },
    });
    expect(pngDimensions(body)).toEqual({ width: 420, height: 560 });
  });

  test('print_6_9 aspect ratio produces 1:1.5 PNG', async ({ request }) => {
    const { body } = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 1,
      theme: { coverAspectRatio: 'print_6_9' },
    });
    expect(pngDimensions(body)).toEqual({ width: 420, height: 630 });
  });

  test('pixelRatio below 1 is clamped to 1', async ({ request }) => {
    const { body } = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 0,
    });
    expect(pngDimensions(body)).toEqual({ width: 420, height: 672 });
  });

  test('pixelRatio above 4 is clamped to 4', async ({ request }) => {
    const { body } = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 99,
    });
    expect(pngDimensions(body)).toEqual({ width: 1680, height: 2688 });
  });
});

test.describe('effects and switches', () => {
  test('gold foil effect applies the gold gradient to the title', async ({ request }) => {
    const { status, body } = await postCover(request, {
      ...frankensteinRequest,
      layout: 'folio_heritage',
      foilEffect: 'gold',
      format: 'svg',
      theme: { paletteId: 'imperial_crimson' },
    });
    expect(status).toBe(200);
    const svg = body.toString('utf-8');
    // #E5B834 from getFoilTitleStyle, serialized as computed rgb()
    expect(svg).toContain('rgb(229, 184, 52)');
    expect(svg).toContain('linear-gradient(135deg');
  });

  test('silver and rose_gold foil effects render', async ({ request }) => {
    for (const foilEffect of ['silver', 'rose_gold'] as const) {
      const { status, body } = await postCover(request, {
        ...frankensteinRequest,
        foilEffect,
        format: 'svg',
      });
      expect(status).toBe(200);
      const svg = body.toString('utf-8');
      expect(svg).toContain('linear-gradient(135deg');
    }
  });

  test('hardcover switch changes the rendered PNG', async ({ request }) => {
    const withHardcover = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 1,
      hardcover: true,
    });
    const withoutHardcover = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 1,
      hardcover: false,
    });

    expect(withHardcover.status).toBe(200);
    expect(withoutHardcover.status).toBe(200);
    expect(withHardcover.body.equals(withoutHardcover.body)).toBe(false);
  });
});

test.describe('cover art sourcing', () => {
  test('accepts a data URL portrait and inlines it in the SVG', async ({ request }) => {
    const { status, body } = await postCover(request, {
      ...frankensteinRequest,
      coverArtUrl: TINY_PNG,
      format: 'svg',
    });
    expect(status).toBe(200);
    expect(body.toString('utf-8')).toContain('data:image/png;base64');
  });

  test('accepts a remote cover art URL through the image proxy', async ({ request }) => {
    const { baseURL } = test.info().project.use;
    const remoteUrl = `${baseURL}/src/assets/images/author_mary_shelley_1790705950823.jpg`;
    const { status, body } = await postCover(request, {
      ...frankensteinRequest,
      coverArtUrl: remoteUrl,
      format: 'png',
      pixelRatio: 1,
    });
    expect(status).toBe(200);
    expect(pngDimensions(body)).toEqual({ width: 420, height: 672 });
  });

  test('renders without any cover art (placeholder path)', async ({ request }) => {
    const { status, body } = await postCover(request, {
      ...frankensteinRequest,
      coverArtUrl: '',
      format: 'png',
      pixelRatio: 1,
    });
    expect(status).toBe(200);
    expect(body.length).toBeGreaterThan(10_000);
  });
});

test.describe('validation and HTTP semantics', () => {
  test('rejects a request without author with 400', async ({ request }) => {
    const response = await request.post('/api/cover', {
      data: { title: 'Frankenstein' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('author');
  });

  test('rejects an empty JSON object with 400', async ({ request }) => {
    const response = await request.post('/api/cover', { data: {} });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('title');
  });

  test('rejects malformed JSON with 400', async ({ request }) => {
    const response = await request.post('/api/cover', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"title": "Frankenstein", broken',
    });
    expect(response.status()).toBe(400);
  });

  test('?format=svg query parameter overrides the body format', async ({ request }) => {
    const { status, contentType, body } = await postCover(
      request,
      { ...frankensteinRequest, format: 'png' },
      '?format=svg'
    );
    expect(status).toBe(200);
    expect(contentType).toContain('image/svg+xml');
    expect(body.toString('utf-8')).toContain('<svg');
  });

  test('?download=1 sets a Content-Disposition attachment header', async ({ request }) => {
    const { status, headers } = await postCover(
      request,
      { ...frankensteinRequest, format: 'png' },
      '?download=1'
    );
    expect(status).toBe(200);
    expect(headers['content-disposition']).toBe(
      'attachment; filename="frankenstein-mary-shelley.png"'
    );
  });

  test('responds with CORS headers for cross-origin service calls', async ({ request }) => {
    const preflight = await request.fetch('/api/cover', { method: 'OPTIONS' });
    expect(preflight.status()).toBe(204);
    expect(preflight.headers()['access-control-allow-origin']).toBe('*');

    const { headers } = await postCover(request, { ...frankensteinRequest, format: 'png' });
    expect(headers['access-control-allow-origin']).toBe('*');
  });
});

test.describe('pixel-level render verification', () => {
  test('PNG has the palette background and is not a blank image', async ({ request, page }) => {
    // archival_alabaster background #F9F7F2, hardcover overlay disabled so the
    // corner sample hits the layout background
    const { body } = await postCover(request, {
      ...frankensteinRequest,
      format: 'png',
      pixelRatio: 1,
      hardcover: false,
      theme: { paletteId: 'archival_alabaster' },
    });

    const result = await page.evaluate(async (pngB64: string) => {
      const img = new Image();
      img.src = `data:image/png;base64,${pngB64}`;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const corner = Array.from(ctx.getImageData(12, 12, 1, 1).data).slice(0, 3);

      const full = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colors = new Set<string>();
      const step = Math.max(4, Math.floor(full.length / 4000 / 4) * 4);
      for (let i = 0; i < full.length; i += step) {
        colors.add(`${full[i] >> 4},${full[i + 1] >> 4},${full[i + 2] >> 4}`);
      }
      return { corner, distinctColors: colors.size };
    }, body.toString('base64'));

    // Background should be close to #F9F7F2 = rgb(249, 247, 242)
    expect(Math.abs(result.corner[0] - 249)).toBeLessThanOrEqual(8);
    expect(Math.abs(result.corner[1] - 247)).toBeLessThanOrEqual(8);
    expect(Math.abs(result.corner[2] - 242)).toBeLessThanOrEqual(8);

    // Text, borders, ornaments and the portrait must produce a rich image
    expect(result.distinctColors).toBeGreaterThan(20);
  });
});
