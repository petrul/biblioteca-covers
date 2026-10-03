/**
 * OpenAPI 3.0 specification for the FolioCraft REST API.
 *
 * Served as JSON at GET /api/docs and rendered by Swagger UI at GET /api/ui.
 * External consumers (e.g. a NestJS backend) can generate typed clients
 * from this document.
 */

import { LAYOUT_ARCHETYPES } from './src/utils/themePresets';

const LAYOUT_IDS = [
  'criterion_minimal',
  'archival_monograph',
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
];

const FOIL_EFFECTS = ['none', 'gold', 'silver', 'rose_gold'];
const ASPECT_RATIOS = ['kdp_1_6', 'standard_3_4', 'print_6_9'];
const TREATMENTS = [
  'natural',
  'etching',
  'monochrome',
  'sepia',
  'duotone',
  'high_contrast',
  'cartoon_pop',
];
const CROP_SHAPES = [
  'oval_cameo',
  'circle_medallion',
  'arch',
  'square_frame',
  'classic_shield',
  'cloud_bubble',
  'full_bleed',
];

// Swagger UI renders these under the request body's "Examples" selector.
// Keeping one small, deterministic request per layout makes the visual
// differences immediately discoverable without requiring a separate render
// endpoint or a long hand-maintained block of near-identical JSON.
const EXAMPLE_BOOKS = [
  ['Frankenstein', 'Mary Shelley'],
  ['The Picture of Dorian Gray', 'Oscar Wilde'],
  ['The Metamorphosis', 'Franz Kafka'],
  ['Pride and Prejudice', 'Jane Austen'],
  ['Meditations', 'Marcus Aurelius'],
  ['Twenty Thousand Leagues Under the Seas', 'Jules Verne'],
  ['War and Peace', 'Leo Tolstoy'],
  ['The Art of War', 'Sun Tzu'],
  ['The Decline and Fall of the Roman Empire', 'Edward Gibbon'],
  ["Alice's Adventures in Wonderland", 'Lewis Carroll'],
  ['The Wonderful Wizard of Oz', 'L. Frank Baum'],
  ['The Odyssey', 'Homer'],
  ['The Arabian Nights', 'Anonymous'],
  ['The Adventures of Sherlock Holmes', 'Arthur Conan Doyle'],
] as const;

export const THEME_EXAMPLES = Object.fromEntries(
  LAYOUT_ARCHETYPES.map((layout, index) => {
    const [title, author] = EXAMPLE_BOOKS[index % EXAMPLE_BOOKS.length];
    return [`theme_${layout.id}`, {
      summary: `${layout.name} — ${title}`,
      value: {
        title,
        author,
        genre: layout.category,
        layout: layout.id,
        format: 'png',
        theme: { paletteId: layout.suggestedPaletteId },
      },
    }];
  }),
);

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'FolioCraft Cover API',
    version: '1.0.0',
    description:
      'REST API for the FolioCraft eBook cover studio. Renders publisher-grade book covers ' +
      '(PNG or SVG) from a JSON cover request containing book metadata, a layout archetype, ' +
      'a palette/theme selection and on/off switches, plus author portrait search, an image ' +
      'proxy and AI-assisted TEI analysis. Designed to be called from an external service ' +
      '(e.g. a NestJS backend).',
  },
  servers: [{ url: 'http://localhost:3335', description: 'Local dev server' }],
  tags: [
    { name: 'covers', description: 'Headless cover rendering and theme discovery' },
    { name: 'portraits', description: 'Author portrait sourcing' },
    { name: 'analysis', description: 'AI-assisted metadata analysis' },
    { name: 'docs', description: 'API documentation' },
  ],
  paths: {
    '/api/cover': {
      post: {
        tags: ['covers'],
        summary: 'Render a book cover as PNG or SVG',
        description:
          'Accepts a cover request as JSON (book metadata + layout + theme switches) and renders ' +
          'the real studio CoverCanvas in headless Chrome. Returns the image bytes as ' +
          '`image/png` (default) or `image/svg+xml`. Only `title` and `author` are required; ' +
          'all other fields fall back to the studio defaults. Renders are serialized and take ' +
          'roughly 0.5-2 seconds each.',
        parameters: [
          {
            name: 'format',
            in: 'query',
            description: 'Output format override; takes precedence over the body `format` field.',
            schema: { type: 'string', enum: ['png', 'svg'] },
          },
          {
            name: 'download',
            in: 'query',
            description: 'Set to `1` or `true` for a Content-Disposition: attachment response.',
            schema: { type: 'string', enum: ['1', 'true'] },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CoverRenderRequest' },
              examples: {
                frankenstein: {
                  summary: 'Frankenstein — Archival Monograph (the default layout)',
                  value: {
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
                },
                ...THEME_EXAMPLES,
                minimalSvg: {
                  summary: 'Minimal SVG request (all defaults)',
                  value: {
                    title: 'Frankenstein',
                    author: 'Mary Shelley',
                    format: 'svg',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'The rendered cover.',
            content: {
              'image/png': {
                schema: { type: 'string', format: 'binary' },
              },
              'image/svg+xml': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          '400': {
            description: 'Invalid cover request (missing title/author or malformed JSON).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '500': {
            description: 'Rendering failed (e.g. no Chrome/Chromium executable found).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/api/cover/meta': {
      get: {
        tags: ['covers'],
        summary: 'List available layouts, palettes and request schema hints',
        description:
          'Discovery endpoint for integrations: all layout archetypes, all color palettes, ' +
          'foil effects, output formats, aspect ratios, required request fields and an example request.',
        responses: {
          '200': {
            description: 'Theme discovery payload.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CoverMetaResponse' } },
            },
          },
        },
      },
    },
    '/api/author-portrait': {
      get: {
        tags: ['portraits'],
        summary: 'Search Wikipedia and Wikimedia Commons for an author portrait',
        parameters: [
          {
            name: 'name',
            in: 'query',
            required: true,
            description: 'Author name, e.g. "Mary Shelley".',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Candidate portraits.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthorPortraitSearchResponse' },
              },
            },
          },
          '400': {
            description: 'Missing name query parameter.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/api/proxy-image': {
      get: {
        tags: ['portraits'],
        summary: 'Proxy a remote image to avoid CORS / canvas tainting',
        description:
          'Fetches a remote image server-side and streams it back with permissive CORS headers. ' +
          'Used internally by PortraitCanvas for remote cover art URLs; usable directly to obtain ' +
          'CORS-safe image bytes.',
        parameters: [
          {
            name: 'url',
            in: 'query',
            required: true,
            description: 'Absolute URL of the image to proxy.',
            schema: { type: 'string', format: 'uri' },
          },
        ],
        responses: {
          '200': { description: 'The proxied image bytes.', content: { 'image/*': { schema: { type: 'string', format: 'binary' } } } },
          '400': { description: 'Missing url parameter.' },
          '500': { description: 'Failed to fetch image.' },
        },
      },
    },
    '/api/ai-analyze-tei': {
      post: {
        tags: ['analysis'],
        summary: 'AI analysis of TEI XML (optional Gemini enhancement)',
        description:
          'Analyzes a book (title/author plus optional TEI XML snippet) and recommends genre, mood, ' +
          'layout archetype, palette, tagline and art direction. Requires GEMINI_API_KEY; returns 503 when not configured.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AiTeiAnalyzeRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Art direction recommendations.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AiTeiAnalyzeResponse' } },
            },
          },
          '503': {
            description: 'GEMINI_API_KEY not configured.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          '500': {
            description: 'Analysis failed.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/api/docs': {
      get: {
        tags: ['docs'],
        summary: 'This OpenAPI 3.0 specification as JSON',
        responses: {
          '200': {
            description: 'The OpenAPI document.',
            content: { 'application/json': {} },
          },
        },
      },
    },
    '/api/ui': {
      get: {
        tags: ['docs'],
        summary: 'Interactive Swagger UI for this API',
        description: 'Serves Swagger UI bound to /api/docs. Asset files live under /api/ui/*.',
        responses: {
          '200': {
            description: 'Swagger UI HTML page.',
            content: { 'text/html': { schema: { type: 'string' } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Human-readable error message.' },
        },
        required: ['error'],
      },
      ColorPalette: {
        type: 'object',
        description: 'A named color palette preset.',
        properties: {
          id: { type: 'string', example: 'oxford_blue' },
          name: { type: 'string', example: 'Oxford Navy & Gold' },
          bg: { type: 'string', example: '#0B1526' },
          text: { type: 'string', example: '#FAF7F2' },
          primary: { type: 'string', example: '#0B1526' },
          secondary: { type: 'string', example: '#D4AF37' },
          accent: { type: 'string', example: '#F3E5AB' },
          border: { type: 'string', example: '#C29B38' },
          surface: { type: 'string', example: '#13223A' },
        },
      },
      CoverRenderRequest: {
        type: 'object',
        description:
          'A cover request: flat book metadata plus layout, effects, output options and theme switches. ' +
          'Everything except `title` and `author` is optional.',
        properties: {
          title: { type: 'string', description: 'Book title.', example: 'Frankenstein' },
          subtitle: { type: 'string', example: 'Or, The Modern Prometheus' },
          author: { type: 'string', example: 'Mary Shelley' },
          editor: { type: 'string' },
          translator: { type: 'string' },
          publisher: { type: 'string', example: 'Lackington, Hughes, Harding, Mavor, & Jones' },
          pubPlace: { type: 'string', example: 'London, United Kingdom' },
          date: { type: 'string', example: '1818' },
          isbn: { type: 'string', example: '978-0-14-143947-1' },
          series: { type: 'string', example: "Oxford World's Classics" },
          volume: { type: 'string', example: 'Vol. I' },
          taglineQuote: { type: 'string', description: 'Epigraph or blurb shown on the cover front.' },
          genre: { type: 'string', example: 'Gothic Fiction, Romantic Literature, Science Fiction' },
          editionNotice: { type: 'string' },
          language: { type: 'string' },
          coverArtUrl: {
            type: 'string',
            description:
              'Author portrait / cover art: an app-relative path, a data URL, or a remote https URL (auto-proxied).',
            example: '/src/assets/images/author_mary_shelley_1790705950823.jpg',
          },
          layout: {
            type: 'string',
            description: 'Layout archetype id (see GET /api/cover/meta). Defaults to archival_monograph.',
            enum: LAYOUT_IDS,
          },
          foilEffect: {
            type: 'string',
            description: 'Hot-stamped foil effect on the title.',
            enum: FOIL_EFFECTS,
          },
          format: { type: 'string', enum: ['png', 'svg'], default: 'png', description: 'Output format.' },
          pixelRatio: {
            type: 'number',
            minimum: 1,
            maximum: 4,
            default: 2.5,
            description: 'PNG upscale factor (values outside 1-4 are clamped).',
          },
          width: {
            type: 'number',
            minimum: 200,
            maximum: 1200,
            default: 420,
            description: 'CSS width in px of the rendered cover.',
          },
          download: {
            type: 'boolean',
            default: false,
            description: 'Return a Content-Disposition: attachment response.',
          },
          theme: { $ref: '#/components/schemas/CoverThemeOverrides' },
          hardcover: {
            description:
              'Hardcover overlay: `true` for the default configuration, `false` to disable, or a full config object.',
            oneOf: [
              { type: 'boolean' },
              { $ref: '#/components/schemas/HardcoverEffectConfig' },
            ],
          },
          portrait: { $ref: '#/components/schemas/PortraitOverrides' },
        },
        required: ['title', 'author'],
      },
      CoverThemeOverrides: {
        type: 'object',
        description: 'Theme selection: palette, fonts and on/off switches.',
        properties: {
          archetypeId: { type: 'string', enum: LAYOUT_IDS, description: 'Alternative to the top-level `layout` field.' },
          paletteId: {
            type: 'string',
            description: 'Palette preset id (see GET /api/cover/meta). Ignored when `palette` is given.',
            example: 'oxford_blue',
          },
          palette: { $ref: '#/components/schemas/ColorPalette' },
          fontTitle: { type: 'string' },
          fontAuthor: { type: 'string' },
          fontMeta: { type: 'string' },
          showPublisherMark: { type: 'boolean', description: 'Publisher mark switch (default true).' },
          publisherMarkStyle: { type: 'string', enum: ['oxford', 'folio', 'penguin', 'monogram', 'classical_owl', 'urn'] },
          showBorder: { type: 'boolean', description: 'Hairline border switch (default true).' },
          showOrnaments: { type: 'boolean', description: 'Ornaments switch (default true).' },
          showBarcode: { type: 'boolean', description: 'Barcode switch (default true).' },
          spineWidthMm: { type: 'number', minimum: 12, maximum: 40, default: 22 },
          coverAspectRatio: { type: 'string', enum: ASPECT_RATIOS, default: 'kdp_1_6' },
          hardcover: { $ref: '#/components/schemas/HardcoverEffectConfig' },
          foilEffect: { type: 'string', enum: FOIL_EFFECTS, description: 'Alternative to the top-level `foilEffect` field.' },
          cinematicScrim: { type: 'string', enum: ['vibrant', 'balanced', 'moody'], default: 'balanced' },
          showQrCode: { type: 'boolean', default: false },
          qrCodeUrl: { type: 'string' },
          qrLogo: { type: 'object' },
        },
      },
      HardcoverEffectConfig: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          spineVisible: { type: 'boolean', description: 'Cylindrical hinge spine on the left edge.' },
          spineWidthPx: { type: 'number', minimum: 6, maximum: 40, default: 12 },
          textureStyle: { type: 'string', enum: ['buckram_cloth', 'leather_grain', 'fine_linen', 'antique_board', 'smooth'] },
          sheenIntensity: { type: 'number', minimum: 0.1, maximum: 0.8 },
          creaseDepth: { type: 'number', minimum: 0.2, maximum: 1.0 },
          showPageEdge: { type: 'boolean' },
          embossedTitle: { type: 'boolean' },
        },
      },
      PortraitOverrides: {
        type: 'object',
        description: 'Portrait treatment/crop overrides. Defaults come from the selected layout archetype.',
        properties: {
          title: { type: 'string' },
          treatment: { type: 'string', enum: TREATMENTS },
          cropShape: { type: 'string', enum: CROP_SHAPES },
          zoom: { type: 'number', minimum: 0.8, maximum: 2.5 },
          panX: { type: 'number', minimum: -50, maximum: 50 },
          panY: { type: 'number', minimum: -50, maximum: 50 },
          borderStyle: { type: 'string', enum: ['none', 'thin_gold', 'double_hairline', 'ornate_woodcut'] },
        },
      },
      LayoutMeta: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'archival_monograph' },
          name: { type: 'string', example: 'The Archival Monograph' },
          category: { type: 'string', example: 'Classical' },
          description: { type: 'string' },
          suggestedPaletteId: { type: 'string', example: 'archival_alabaster' },
        },
      },
      CoverMetaResponse: {
        type: 'object',
        properties: {
          layouts: { type: 'array', items: { $ref: '#/components/schemas/LayoutMeta' } },
          palettes: { type: 'array', items: { $ref: '#/components/schemas/ColorPalette' } },
          foilEffects: { type: 'array', items: { type: 'string' } },
          formats: { type: 'array', items: { type: 'string' } },
          coverAspectRatios: { type: 'array', items: { type: 'string' } },
          requiredFields: { type: 'array', items: { type: 'string' } },
          examples: {
            type: 'object',
            description: 'One complete request example for every layout theme.',
            additionalProperties: { type: 'object' },
          },
          example: { type: 'object', description: 'A complete example request body.' },
          docs: {
            type: 'object',
            description: 'Links to the API documentation.',
            properties: {
              spec: { type: 'string', example: '/api/docs' },
              ui: { type: 'string', example: '/api/ui' },
            },
          },
        },
      },
      AuthorPortraitSearchResponse: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          portraits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: { type: 'string', format: 'uri' },
                title: { type: 'string' },
                source: { type: 'string', enum: ['wikipedia', 'wikimedia'] },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      AiTeiAnalyzeRequest: {
        type: 'object',
        properties: {
          teiSnippet: { type: 'string', description: 'Optional TEI XML context.' },
          title: { type: 'string' },
          author: { type: 'string' },
        },
      },
      AiTeiAnalyzeResponse: {
        type: 'object',
        properties: {
          genre: { type: 'string' },
          mood: { type: 'string' },
          recommendedLayoutId: { type: 'string' },
          palette: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              background: { type: 'string' },
              primary: { type: 'string' },
              secondary: { type: 'string' },
              accent: { type: 'string' },
              surface: { type: 'string' },
            },
          },
          tagline: { type: 'string' },
          artDirection: { type: 'string' },
        },
      },
    },
  },
};
