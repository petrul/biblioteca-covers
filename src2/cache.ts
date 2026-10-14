import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, unlink, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { MAX_SOURCE_BYTES, type ThumbnailConfig } from './config';

export class ThumbnailError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export interface Thumbnail { body: Buffer; key: string; hit: boolean; }
const FILE = /^[a-f0-9]{64}\.webp$/;
const MARKER = '.biblioteca-thumbnail-cache';
const MARKER_CONTENT = 'biblioteca-covers/src2 thumbnail cache v1\n';

export class ThumbnailCache {
  private pending = new Map<string, Promise<Thumbnail>>();
  private clearing?: Promise<number>;
  private epoch = 0;
  private active = 0;
  private queue: Array<() => void> = [];
  private lastPrune = 0;
  constructor(readonly config: ThumbnailConfig) {}
  key(identity: string, width: number) {
    return createHash('sha256').update(`webp-v1-quality82|${width}|${identity}`).digest('hex') + '.webp';
  }
  async initialize() {
    await mkdir(this.config.directory, { recursive: true });
    const marker = path.join(this.config.directory, MARKER);
    try { await writeFile(marker, MARKER_CONTENT, { flag: 'wx' }); }
    catch (error: any) { if (error.code !== 'EEXIST') throw error; }
    if (await readFile(marker, 'utf8') !== MARKER_CONTENT) throw new Error('Not a Biblioteca thumbnail cache');
  }
  async read(key: string, fresh = false): Promise<Thumbnail | null> {
    if (!FILE.test(key)) throw new ThumbnailError(400, 'Invalid thumbnail key');
    const file = path.join(this.config.directory, key);
    try {
      if (fresh && Date.now() - (await stat(file)).mtimeMs > this.config.ttlSeconds * 1000) return null;
      return { body: await readFile(file), key, hit: true };
    } catch (error: any) { if (error.code === 'ENOENT') return null; throw error; }
  }
  async waitForClear() { while (this.clearing) await this.clearing; }
  async get(identity: string, width: number, source: () => Promise<Buffer>): Promise<Thumbnail> {
    while (this.clearing) await this.clearing;
    const epoch = this.epoch;
    const key = this.key(identity, width);
    const cached = await this.read(key, true);
    if (cached) return cached;
    const existing = this.pending.get(key);
    if (existing) return existing;
    const job = this.generate(key, width, source, epoch).finally(() => this.pending.delete(key));
    this.pending.set(key, job);
    return job;
  }
  private async generate(key: string, width: number, source: () => Promise<Buffer>, epoch: number): Promise<Thumbnail> {
    if (this.active >= 2) {
      if (this.queue.length >= 32) throw new ThumbnailError(429, 'Thumbnail queue is full');
      await new Promise<void>(resolve => this.queue.push(resolve));
    } else this.active++;
    try {
      const original = await source();
      if (!original.length || original.length > MAX_SOURCE_BYTES) throw new ThumbnailError(413, 'Image must contain at most 10 MiB');
      let body: Buffer;
      try {
        body = await sharp(original, { limitInputPixels: 40_000_000, animated: false })
          .rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      } catch { throw new ThumbnailError(422, 'Unsupported, corrupt, or excessively large image'); }
      if (epoch === this.epoch) {
        await this.initialize();
        const temp = path.join(this.config.directory, `.${key}.${randomUUID()}.tmp`);
        try {
          await writeFile(temp, body, { flag: 'wx' });
          if (epoch === this.epoch) await rename(temp, path.join(this.config.directory, key));
        } finally { await unlink(temp).catch((error: any) => { if (error.code !== 'ENOENT') throw error; }); }
        // Bound disk usage without rescanning the directory on every hit/miss.
        if (Date.now() - this.lastPrune > 30_000) { this.lastPrune = Date.now(); await this.prune(); }
      }
      return { body, key, hit: false };
    } finally {
      const next = this.queue.shift();
      if (next) next(); else this.active--;
    }
  }
  async prune() {
    const files = await this.files();
    let bytes = files.reduce((sum, entry) => sum + entry.size, 0);
    for (const entry of files.sort((a, b) => a.modified - b.modified)) {
      if (bytes <= this.config.maxCacheBytes) break;
      await unlink(path.join(this.config.directory, entry.name)).catch((error: any) => { if (error.code !== 'ENOENT') throw error; });
      bytes -= entry.size;
    }
  }
  private async files() {
    try {
      const names = (await readdir(this.config.directory)).filter(name => FILE.test(name));
      return (await Promise.all(names.map(async name => {
        try { const info = await stat(path.join(this.config.directory, name)); return { name, size: info.size, modified: info.mtimeMs }; }
        catch (error: any) { if (error.code === 'ENOENT') return null; throw error; }
      }))).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    } catch (error: any) { if (error.code === 'ENOENT') return []; throw error; }
  }
  clear(): Promise<number> {
    if (this.clearing) return this.clearing;
    this.epoch++;
    this.clearing = (async () => {
      await Promise.allSettled([...this.pending.values()]);
      await this.initialize();
      const files = await this.files();
      await Promise.all(files.map(entry => unlink(path.join(this.config.directory, entry.name))));
      return files.length;
    })().finally(() => { this.clearing = undefined; });
    return this.clearing;
  }
}
