export const thumbnailOpenApi = {
  openapi: '3.0.3',
  info: { title: 'Biblioteca supplementary thumbnail API', version: '1.0.0' },
  paths: {
    '/api/thumbnails': {
      get: {
        summary: 'Download a cover thumbnail, generating and caching it on demand',
        parameters: [
          { name: 'url', in: 'query', required: true, schema: { type: 'string', format: 'uri' }, description: 'Original image URL on a configured allowed origin' },
          { name: 'width', in: 'query', schema: { type: 'integer', enum: [160, 320, 640], default: 320 } },
        ],
        responses: { '200': { description: 'WebP thumbnail; X-Thumbnail-Cache reports HIT or MISS', content: { 'image/webp': { schema: { type: 'string', format: 'binary' } } } }, '304': { description: 'ETag unchanged' }, '400': { description: 'Invalid width or source URL' }, '404': { description: 'Original not found' }, '413': { description: 'Image exceeds 10 MiB' }, '415': { description: 'Source did not return an image' }, '422': { description: 'Invalid image' }, '429': { description: 'Generation queue is full' }, '502': { description: 'Source unavailable' } },
      },
      post: {
        summary: 'Convert supplied image bytes and cache the resulting WebP',
        parameters: [{ name: 'width', in: 'query', schema: { type: 'integer', enum: [160, 320, 640], default: 320 } }],
        requestBody: { required: true, content: Object.fromEntries(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml'].map(type => [type, { schema: { type: 'string', format: 'binary' } }])) },
        responses: { '200': { description: 'WebP thumbnail', content: { 'image/webp': { schema: { type: 'string', format: 'binary' } } } }, '400': { description: 'Invalid width' }, '413': { description: 'Image exceeds 10 MiB' }, '415': { description: 'Image bytes required' }, '422': { description: 'Invalid image' }, '429': { description: 'Generation queue is full' } },
      },
    },
    '/api/thumbnails/cache/{key}': { get: {
      summary: 'Read an existing cached thumbnail',
      parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-f0-9]{64}\\.webp$' } }],
      responses: { '200': { description: 'Cached WebP', content: { 'image/webp': { schema: { type: 'string', format: 'binary' } } } }, '304': { description: 'ETag unchanged' }, '400': { description: 'Invalid key' }, '404': { description: 'Not cached or expired' } },
    } },
    '/api/thumbnails/cache': { delete: {
      summary: 'Empty the thumbnail disk cache, preserving original covers and unrelated files',
      security: [{ cacheAdmin: [] }],
      responses: { '200': { description: 'Cache cleared', content: { 'application/json': { schema: { type: 'object', properties: { removed: { type: 'integer' } } } } } }, '403': { description: 'Admin token required' }, '503': { description: 'Admin token not configured' } },
    } },
  },
  components: { securitySchemes: { cacheAdmin: { type: 'http', scheme: 'bearer' } } },
};
