import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, writeFile, readFile, utimes, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import sharp from 'sharp';
import { ThumbnailCache } from './cache';
import { registerThumbnailRoutes } from './index';
import { thumbnailConfig, type ThumbnailConfig } from './config';

async function image(width = 960, height = 1440) {
  return sharp({ create: { width, height, channels: 3, background: '#003366' } }).png().toBuffer();
}
async function fixture(run: (cache: ThumbnailCache, config: ThumbnailConfig) => Promise<void>) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'covers-thumbnails-'));
  const config = { directory, allowedOrigins: ['https://covers.example'], ttlSeconds: 86400, maxCacheBytes: 100_000_000, adminToken: 'test-token' };
  try { await run(new ThumbnailCache(config), config); } finally { await rm(directory, { recursive: true, force: true }); }
}

test('resize preserves aspect ratio and disk hits survive a new cache instance', async () => {
  await fixture(async (cache, config) => {
    const original = await image(); let reads = 0;
    const first = await cache.get('cover', 320, async () => { reads++; return original; });
    const metadata = await sharp(first.body).metadata();
    assert.equal(metadata.width, 320); assert.equal(metadata.height, 480); assert.equal(metadata.format, 'webp');
    const second = await new ThumbnailCache(config).get('cover', 320, async () => { reads++; return original; });
    assert.equal(second.hit, true); assert.equal(reads, 1); assert.deepEqual(first.body, second.body);
    const small = await cache.get('small', 320, async () => image(80, 120));
    assert.equal((await sharp(small.body).metadata()).width, 80);
  });
});

test('simultaneous misses for one variant share a source load and conversion', async () => {
  await fixture(async cache => {
    const original = await image(); let reads = 0;
    const results = await Promise.all(Array.from({ length: 8 }, () => cache.get('same', 160, async () => {
      reads++; await new Promise(resolve => setTimeout(resolve, 20)); return original;
    })));
    assert.equal(reads, 1); assert.equal(new Set(results.map(r => r.key)).size, 1);
  });
});

test('source identity, dimensions and expiration invalidate the disk cache', async () => {
  await fixture(async (cache, config) => {
    const original = await image();
    const a = await cache.get('revision-a', 160, async () => original);
    const b = await cache.get('revision-b', 160, async () => original);
    const c = await cache.get('revision-a', 640, async () => original);
    assert.equal(new Set([a.key, b.key, c.key]).size, 3);
    await utimes(path.join(config.directory, a.key), new Date(0), new Date(0));
    const refreshed = await cache.get('revision-a', 160, async () => original);
    assert.equal(refreshed.hit, false);
  });
});

test('cache clearing waits for generation and cannot be undone by an earlier miss', async () => {
  await fixture(async (cache, config) => {
    const original = await image();
    await cache.get('existing', 160, async () => original);
    await writeFile(path.join(config.directory, 'original.png'), original);
    let started!: () => void; const sourceStarted = new Promise<void>(resolve => { started = resolve; });
    let release!: () => void; const hold = new Promise<void>(resolve => { release = resolve; });
    const generating = cache.get('pending', 320, async () => { started(); await hold; return original; });
    await sourceStarted;
    const clearing = cache.clear(); release();
    await generating; assert.equal(await clearing, 1);
    assert.equal((await readdir(config.directory)).filter(name => name.endsWith('.webp')).length, 0);
    assert.deepEqual(await readFile(path.join(config.directory, 'original.png')), original);
    assert.equal((await cache.get('new', 320, async () => original)).hit, false);
  });
});

test('corrupt images leave no partial cache files and eviction respects the size limit', async () => {
  await fixture(async (cache, config) => {
    await assert.rejects(cache.get('broken', 160, async () => Buffer.from('not an image')), /Unsupported/);
    assert.equal((await readdir(config.directory).catch(() => [])).some(name => name.endsWith('.tmp')), false);
    await cache.get('a', 160, async () => image());
    await cache.get('b', 320, async () => image());
    config.maxCacheBytes = 1; await cache.prune();
    assert.equal((await readdir(config.directory)).filter(name => name.endsWith('.webp')).length, 0);
  });
});

test('REST requests serve actual WebP, hit disk, support ETags and authenticate clearing', async () => {
  await fixture(async (_cache, config) => {
    const original = await image(); let downloads = 0;
    const app = express(); registerThumbnailRoutes(app, config, async () => { downloads++; return original; });
    // An ephemeral test-only HTTP listener; never imports/starts the dev application.
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address(); assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/api/thumbnails`;
    try {
      const url = `${base}?url=${encodeURIComponent('https://covers.example/book.png')}&width=320`;
      const first = await fetch(url);
      assert.equal(first.status, 200); assert.equal(first.headers.get('content-type'), 'image/webp');
      assert.equal(first.headers.get('x-thumbnail-cache'), 'MISS');
      assert.equal((await sharp(Buffer.from(await first.arrayBuffer())).metadata()).width, 320);
      const second = await fetch(url); assert.equal(second.headers.get('x-thumbnail-cache'), 'HIT'); assert.equal(downloads, 1);
      const conditional = await fetch(url, { headers: { 'If-None-Match': second.headers.get('etag')! } });
      assert.equal(conditional.status, 304);
      const cached = await fetch(`http://127.0.0.1:${address.port}${second.headers.get('content-location')}`);
      assert.equal(cached.status, 200);
      const posted = await fetch(`${base}?width=160`, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: original });
      assert.equal(posted.status, 200); assert.equal((await sharp(Buffer.from(await posted.arrayBuffer())).metadata()).width, 160);
      assert.equal((await fetch(`${base}/openapi.json`)).status, 200);
      assert.equal((await fetch(`${base}/cache`, { method: 'DELETE' })).status, 403);
      const cleared = await fetch(`${base}/cache`, { method: 'DELETE', headers: { Authorization: 'Bearer test-token' } });
      assert.deepEqual(await cleared.json(), { removed: 2 });
      assert.equal((await fetch(`http://127.0.0.1:${address.port}${second.headers.get('content-location')}`)).status, 404);
      assert.equal((await fetch(url)).headers.get('x-thumbnail-cache'), 'MISS');
    } finally { server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  });
});

test('REST rejects disallowed origins, oversized/corrupt uploads and invalid widths', async () => {
  await fixture(async (_cache, config) => {
    const app = express(); let downloads = 0;
    registerThumbnailRoutes(app, config, async () => { downloads++; return image(); });
    const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address(); assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/api/thumbnails`;
    try {
      assert.equal((await fetch(`${base}?url=http://localhost/private`)).status, 400);
      assert.equal((await fetch(`${base}?url=https://covers.example/book.png&width=99999`)).status, 400);
      assert.equal(downloads, 0);
      assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: 'broken' })).status, 422);
      assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 415);
      assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: Buffer.alloc(10 * 1024 * 1024 + 1) })).status, 413);
      assert.equal((await fetch(`${base}/cache/not-a-key`)).status, 400);
      config.adminToken = undefined;
      assert.equal((await fetch(`${base}/cache`, { method: 'DELETE' })).status, 503);
    } finally { server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  });
});


test('clearing during an initial disk lookup also prevents stale repopulation', async () => {
  await fixture(async (cache, config) => {
    const original = await image();
    const request = cache.get('early-miss', 320, async () => original);
    const clearing = cache.clear();
    await Promise.all([request, clearing]);
    assert.equal((await readdir(config.directory)).filter(name => name.endsWith('.webp')).length, 0);
  });
});

// Regression: the reader's cards thumbnail covers straight from the MinIO
// public URL, so the MinIO origins MUST be in the allowlist. A covers
// service started without its pass-store profile (no MINIO_URL /
// MINIO_PUBLIC_URL) allowed no origin at all and 400'd every thumbnail -
// the UI then silently fell back to the default covers (2026-10-26).
test('thumbnailConfig refuses to boot without any thumbnail source origin', async () => {
  // The 2026-10-26 bug's other half: no MINIO_URL/MINIO_PUBLIC_URL meant an
  // empty allowlist and silent 400s. Now the service cannot boot that way.
  const directory = await mkdtemp(path.join(os.tmpdir(), 'covers-config-'));
  assert.throws(
    () => thumbnailConfig({ THUMBNAIL_CACHE_DIR: directory } as NodeJS.ProcessEnv),
    /No thumbnail source origin configured/);
});

test('thumbnailConfig allows the MinIO origins and the extra configured ones', async () => {
  const config = thumbnailConfig({
    MINIO_URL: 'http://minio.internal:9000/biblioteca',
    MINIO_PUBLIC_URL: 'https://assets.example/biblioteca/',
    THUMBNAIL_SOURCE_ORIGINS: ' https://legacy.example ,https://assets.example',
    THUMBNAIL_CACHE_DIR: await mkdtemp(path.join(os.tmpdir(), 'covers-config-')),
  } as NodeJS.ProcessEnv);
  assert.deepEqual(
    [...config.allowedOrigins].sort(),
    ['http://minio.internal:9000', 'https://assets.example', 'https://legacy.example'],
    'MinIO (public and internal) plus extra origins, deduplicated, trailing slashes and spaces stripped');
});

test('a thumbnail for a cover on the configured MinIO origin is served, not rejected', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'covers-thumbnails-'));
  const config: ThumbnailConfig = {
    directory,
    allowedOrigins: thumbnailConfig({
      MINIO_URL: 'http://minio.internal:9000/biblioteca',
      THUMBNAIL_CACHE_DIR: directory,
    } as NodeJS.ProcessEnv).allowedOrigins,
    ttlSeconds: 86400, maxCacheBytes: 100_000_000,
  };
  try {
    const app = express();
    registerThumbnailRoutes(app, config, async () => image());
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address(); assert(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}/api/thumbnails`;
    try {
      const cover = 'http://minio.internal:9000/biblioteca/covers/works/author/opus-abc123.png';
      const response = await fetch(`${base}?url=${encodeURIComponent(cover)}&width=320`);
      assert.equal(response.status, 200, 'a MinIO-origin cover URL must not 400');
      assert.equal(response.headers.get('content-type'), 'image/webp');
    } finally { server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
