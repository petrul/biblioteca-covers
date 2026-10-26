import path from 'node:path';

export const WIDTHS = [160, 320, 640] as const;
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
export interface ThumbnailConfig {
  directory: string;
  allowedOrigins: string[];
  ttlSeconds: number;
  maxCacheBytes: number;
  adminToken?: string;
}
export function thumbnailConfig(env = process.env): ThumbnailConfig {
  const origins = [env.MINIO_PUBLIC_URL, env.MINIO_URL, ...(env.THUMBNAIL_SOURCE_ORIGINS || '').split(',')]
    .filter(Boolean).map(value => new URL(value!.trim()).origin);
  const allowedOrigins = [...new Set(origins)];
  // Fail fast: with no configured source origin every thumbnail request
  // would 400 and the reader would silently fall back to default covers.
  // Load the pass-store profile (rake run does) or set MINIO_URL /
  // MINIO_PUBLIC_URL / THUMBNAIL_SOURCE_ORIGINS.
  if (!allowedOrigins.length) {
    throw new Error('No thumbnail source origin configured: set MINIO_URL, MINIO_PUBLIC_URL or THUMBNAIL_SOURCE_ORIGINS');
  }
  const ttlSeconds = Number(env.THUMBNAIL_CACHE_TTL_SECONDS || 86400);
  const maxCacheBytes = Number(env.THUMBNAIL_CACHE_MAX_BYTES || 2 * 1024 ** 3);
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0 || !Number.isFinite(maxCacheBytes) || maxCacheBytes <= 0) {
    throw new Error('Thumbnail cache TTL and size must be positive numbers');
  }
  const directory = path.resolve(env.THUMBNAIL_CACHE_DIR || '.cache/thumbnails');
  if (directory === path.parse(directory).root || directory === process.cwd()) {
    throw new Error('THUMBNAIL_CACHE_DIR must be a dedicated cache directory');
  }
  return { directory, allowedOrigins, ttlSeconds, maxCacheBytes, adminToken: env.THUMBNAIL_CACHE_ADMIN_TOKEN };
}
