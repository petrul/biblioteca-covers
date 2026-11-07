import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';

// Fetching a cover's remote art (coverArtUrl) on the server: for the image
// proxy the render page loads it through, and to check it before rendering.
//
// Any public image host is allowed. Who may ask for a render with arbitrary
// cover art is decided before this service (only administrators reach it -
// see biblioteca-reader's admin gate); what stays here are the checks that
// never stand in the way of a real image:
// - http(s) only, no credentials in the URL;
// - every address the host resolves to must be public, at every redirect
//   hop, so a URL can never make this server reach the LAN or itself;
// - the answer must be a raster image of at most 10 MiB, within 15 s.
// Failures are RemoteImageErrors with a reason a person can act on.

export const MAX_REMOTE_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 15_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
// A browser-like identity: many image hosts refuse unknown clients.
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 biblioteca-covers';

export class RemoteImageError extends Error {
  /** HTTP status this service answers with: 400 a bad URL, 413 too large, 415 not an image, 502 the source failed. */
  constructor(message: string, readonly status: number) { super(message); }
}

export type RemoteImage = { bytes: Buffer; contentType: string; finalUrl: string };
export type Lookup = (hostname: string) => Promise<{ address: string }[]>;
export type Deps = { fetch?: typeof globalThis.fetch; lookup?: Lookup };

const defaultLookup: Lookup = (hostname) => dnsLookup(hostname, { all: true, verbatim: true });

export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 168))
      || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
      || (a === 203 && b === 0 && c === 113));
  }
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase().split('%')[0];
    return /^[23]/.test(normalized) && !normalized.startsWith('::ffff:');
  }
  return false;
}

/** A URL this service may fetch: http(s), no credentials, resolving only to public addresses. */
export async function checkRemoteImageUrl(value: string, lookup: Lookup = defaultLookup): Promise<URL> {
  let url: URL;
  try { url = new URL(value); } catch { throw new RemoteImageError(`not a valid URL: ${value}`, 400); }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new RemoteImageError(`only http(s) images can be fetched, not ${url.protocol}`, 400);
  if (url.username || url.password) throw new RemoteImageError('image URLs may not carry credentials', 400);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  let addresses: { address: string }[];
  try { addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname); }
  catch { throw new RemoteImageError(`${url.hostname} could not be resolved`, 502); }
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new RemoteImageError(`${url.hostname} must resolve only to public addresses`, 400);
  }
  return url;
}

/** Fetches a remote image under the rules above, following up to 5 redirects. */
export async function fetchRemoteImage(value: string, deps: Deps = {}): Promise<RemoteImage> {
  const doFetch = deps.fetch ?? globalThis.fetch;
  const lookup = deps.lookup ?? defaultLookup;
  let url = await checkRemoteImageUrl(value, lookup);
  for (let hop = 0; ; hop++) {
    let response: Response;
    try {
      response = await doFetch(url, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': USER_AGENT, Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' } });
    } catch (error: any) {
      throw new RemoteImageError(error?.name === 'TimeoutError' ? `${url.hostname} did not answer within 15 s` : `${url.hostname} could not be reached`, 502);
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new RemoteImageError(`${url.hostname} answered ${response.status} without a location`, 502);
      if (hop >= MAX_REDIRECTS) throw new RemoteImageError(`too many redirects fetching ${value}`, 502);
      url = await checkRemoteImageUrl(new URL(location, url).toString(), lookup); // each hop must be public too
      continue;
    }
    if (!response.ok) throw new RemoteImageError(`${url.hostname} answered ${response.status}${response.status === 403 ? ' (it refuses this server; some sites only serve images to browsers)' : ''}`, 502);
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!IMAGE_TYPES.includes(contentType)) {
      throw new RemoteImageError(contentType === 'text/html'
        ? `${url.hostname} answered with a web page, not the image (it may only serve images to browsers, after a bot check)`
        : `${url.hostname} did not answer with an image (${contentType || 'no content type'})`, 415);
    }
    return { bytes: await readLimited(response), contentType, finalUrl: url.toString() };
  }
}

async function readLimited(response: Response): Promise<Buffer> {
  if (Number(response.headers.get('content-length') || 0) > MAX_REMOTE_IMAGE_BYTES) throw new RemoteImageError('the image is larger than 10 MiB', 413);
  const reader = response.body?.getReader();
  if (!reader) throw new RemoteImageError('the image source returned an empty body', 502);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_REMOTE_IMAGE_BYTES) { await reader.cancel(); throw new RemoteImageError('the image is larger than 10 MiB', 413); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
