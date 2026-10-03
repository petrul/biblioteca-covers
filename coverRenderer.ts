import fs from 'node:fs';
import puppeteer, { HTTPRequest } from 'puppeteer-core';
import { ResolvedCoverSpec } from './src/utils/coverRequest';

/**
 * Headless cover renderer.
 *
 * Renders the real studio CoverCanvas (React + Tailwind, same components as
 * the browser UI) in system Chrome and captures it as PNG (element
 * screenshot, scaled by pixelRatio) or SVG (html-to-image, same code path
 * as the studio's SVG export).
 */

interface RenderResult {
  buffer: Buffer;
  contentType: string;
}

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
].filter(Boolean) as string[];

function findChrome(): string {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore
    }
  }
  throw new Error(
    'No Chrome/Chromium executable found. Set CHROME_PATH to a Chrome >= 100 binary.'
  );
}

let browserPromise: Promise<any> | null = null;
let renderQueue: Promise<unknown> = Promise.resolve();
let renderSequence = 0;

async function getBrowser(): Promise<any> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      executablePath: findChrome(),
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--hide-scrollbars',
        '--font-render-hinting=none',
      ],
    });
  }
  return browserPromise;
}

async function disposeBrowser(): Promise<void> {
  const p = browserPromise;
  browserPromise = null;
  if (p) {
    try {
      const b = await p;
      await b.close();
    } catch {
      // ignore
    }
  }
}

function encodePayload(spec: ResolvedCoverSpec): string {
  return Buffer.from(JSON.stringify(spec), 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeSvgDataUrl(dataUrl: string): Buffer {
  const commaIndex = dataUrl.indexOf(',');
  const meta = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);
  if (meta.includes('base64')) {
    return Buffer.from(payload, 'base64');
  }
  return Buffer.from(decodeURIComponent(payload), 'utf-8');
}

async function renderWithFreshPage(spec: ResolvedCoverSpec, baseUrl: string): Promise<RenderResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on('request', (intercepted: HTTPRequest) => {
      // Block third-party analytics noise; allow everything else (fonts, assets, proxy).
      intercepted.continue();
    });

    await page.setViewport({
      width: spec.render.width + 32,
      height: 900,
      deviceScaleFactor: spec.render.format === 'png' ? spec.render.pixelRatio : 1,
    });

    const url = `${baseUrl}/render.html?payload=${encodePayload(spec)}`;
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });

    await page.waitForFunction(() => window.__coverReady === true, { timeout: 60_000 });

    const coverError: string | null = await page.evaluate(() => window.__coverError);
    if (coverError) {
      throw new Error(coverError);
    }

    if (spec.render.format === 'svg') {
      const dataUrl: string = await page.evaluate(() => window.__exportSvg());
      return { buffer: decodeSvgDataUrl(dataUrl), contentType: 'image/svg+xml' };
    }

    const element = await page.$('#book-cover-export-node');
    if (!element) {
      throw new Error('Cover element not found after render');
    }
    const buffer = (await element.screenshot({ type: 'png' })) as Buffer;
    return { buffer, contentType: 'image/png' };
  } finally {
    await page.close().catch(() => undefined);
  }
}

/**
 * Renders a resolved cover spec. Renders are serialized on a queue and the
 * browser is recycled between requests; on failure the browser is restarted.
 */
export async function renderCover(spec: ResolvedCoverSpec, baseUrl: string): Promise<RenderResult> {
  const sequence = ++renderSequence;
  const queuedAt = Date.now();
  console.info(`[cover] queued render #${sequence}`);
  const run = renderQueue.then(async () => {
    const startedAt = Date.now();
    console.info(`[cover] started render #${sequence} after ${Math.round((startedAt - queuedAt) / 1000)}s queue wait`);
    try {
      return await renderWithFreshPage(spec, baseUrl);
    } catch (err) {
      await disposeBrowser();
      throw err;
    } finally {
      console.info(`[cover] finished render #${sequence} in ${Math.round((Date.now() - startedAt) / 1000)}s`);
    }
  });
  // Keep the queue tail alive even if this render fails.
  renderQueue = run.catch(() => undefined);
  return run;
}
