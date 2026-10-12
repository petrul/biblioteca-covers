import { expect, test } from '@playwright/test';

const sampleBook = {
  title: 'Frankenstein',
  author: 'Mary Shelley',
  date: 1818,
  coverArtUrl: 'https://example.test/frankenstein.jpg',
};

test('GET /api/cover-config returns config defaults and a sample payload', async ({ request }) => {
  const response = await request.get('/api/cover-config');

  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.defaults).toEqual({
    applyVintageFilter: false,
    treatment: 'natural',
    cropShape: 'full_bleed',
    foilEffect: 'none',
  });
  expect(body.samplePayload).toMatchObject({
    title: 'Frankenstein',
    author: 'Mary Shelley',
    applyVintageFilter: false,
  });
});

test('POST /api/cover normalizes book and cover config fields', async ({ request }) => {
  const response = await request.post('/api/cover', {
    data: {
      ...sampleBook,
      layout: 'folio_heritage',
      paletteId: 'imperial_crimson',
      foilEffect: 'gold',
      zoom: 1.25,
      panX: -8,
      panY: 12,
    },
  });

  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({
    status: 'ok',
    book: {
      title: 'Frankenstein',
      author: 'Mary Shelley',
      date: '1818',
      publisher: 'Ediții Scriptorium',
      pubPlace: 'București',
    },
    portrait: {
      url: 'https://example.test/frankenstein.jpg',
      source: 'upload',
      applyVintageFilter: false,
      treatment: 'natural',
      cropShape: 'full_bleed',
      zoom: 1.25,
      panX: -8,
      panY: 12,
    },
    theme: {
      archetypeId: 'folio_heritage',
      paletteId: 'imperial_crimson',
      foilEffect: 'gold',
    },
    filterStatus: {
      applyVintageFilter: false,
      activeEffect: 'none (original natural color)',
      isDefault: true,
    },
  });
});

test('POST /api/cover-config accepts image and vintage-filter aliases', async ({ request }) => {
  const response = await request.post('/api/cover-config', {
    data: {
      title: 'Frankenstein',
      author: 'Mary Shelley',
      imageUrl: 'https://example.test/art.jpg',
      vintageFilter: true,
      portraitTreatment: 'sepia',
    },
  });

  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({
    portrait: {
      url: 'https://example.test/art.jpg',
      applyVintageFilter: true,
      treatment: 'sepia',
    },
    filterStatus: {
      applyVintageFilter: true,
      activeEffect: 'sepia',
      isDefault: false,
    },
  });
});

test('explicit false vintage filter takes precedence over aliases', async ({ request }) => {
  const response = await request.post('/api/cover', {
    data: {
      ...sampleBook,
      applyVintageFilter: false,
      agingFilter: true,
    },
  });

  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({
    portrait: { applyVintageFilter: false, treatment: 'natural' },
    filterStatus: { applyVintageFilter: false, isDefault: true },
  });
});

test('POST /api/cover applies defaults to an empty config', async ({ request }) => {
  const response = await request.post('/api/cover', { data: {} });

  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({
    book: {
      title: 'Untitled Work',
      author: 'Anonymous',
      date: '2026',
    },
    portrait: {
      url: '',
      applyVintageFilter: false,
      treatment: 'natural',
      zoom: 1,
      panX: 0,
      panY: 0,
    },
    theme: {
      archetypeId: 'archival_monograph',
      paletteId: 'archival_alabaster',
      foilEffect: 'none',
    },
  });
});

test('cover schema is available through its direct and API routes', async ({ request }) => {
  const direct = await request.get('/cover-request-schema.json');
  const api = await request.get('/api/cover-schema');

  expect(direct.ok()).toBe(true);
  expect(api.ok()).toBe(true);
  const schema = await direct.json();
  expect(schema).toMatchObject({
    title: 'Cover configuration request',
    type: 'object',
  });
  expect(schema.properties).toHaveProperty('applyVintageFilter');
  expect(await api.json()).toEqual(schema);

  const alias = await request.get('/cover-schema.json', { maxRedirects: 0 });
  expect(alias.status()).toBe(301);
  expect(alias.headers().location).toBe('/cover-request-schema.json');
});
