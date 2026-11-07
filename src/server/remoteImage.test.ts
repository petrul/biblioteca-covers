import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchRemoteImage, RemoteImageError, type Lookup } from './remoteImage';

// No network: a fake DNS and a fake web, so these run anywhere (CI included).
const PNG = Buffer.from('89504e470d0a1a0a', 'hex');
const dns: Record<string, string> = {
  'historychronicles.org': '104.21.10.1', 'upload.wikimedia.org': '185.15.59.240', 'cdn.example.org': '93.184.216.34',
  'intranet.example.org': '192.168.0.45', 'sneaky.example.org': '127.0.0.1',
};
const lookup: Lookup = async (host) => { if (!dns[host]) throw new Error('ENOTFOUND'); return [{ address: dns[host] }]; };
function web(routes: Record<string, () => Response>) {
  const asked: string[] = [];
  const fetch = (async (input: string | URL | Request) => {
    const url = String(input); asked.push(url);
    const route = routes[url]; if (!route) throw new Error(`unexpected fetch ${url}`);
    return route();
  }) as typeof globalThis.fetch;
  return { fetch, asked };
}
const image = () => new Response(PNG, { headers: { 'Content-Type': 'image/png' } });
async function refusal(promise: Promise<unknown>): Promise<RemoteImageError> {
  try { await promise; } catch (error) { assert(error instanceof RemoteImageError, String(error)); return error; }
  assert.fail('expected a refusal');
}

test('any public image host is fetched - no host list (historychronicles.org was refused before)', async () => {
  const { fetch } = web({ 'https://historychronicles.org/wp-content/uploads/anna.jpg': image });
  const got = await fetchRemoteImage('https://historychronicles.org/wp-content/uploads/anna.jpg', { fetch, lookup });
  assert.equal(got.contentType, 'image/png');
  assert.deepEqual(got.bytes, PNG);
});

test('plain http and redirects are followed, each hop checked', async () => {
  const { fetch, asked } = web({
    'http://cdn.example.org/a.png': () => new Response(null, { status: 301, headers: { Location: 'https://upload.wikimedia.org/a.png' } }),
    'https://upload.wikimedia.org/a.png': image,
  });
  const got = await fetchRemoteImage('http://cdn.example.org/a.png', { fetch, lookup });
  assert.equal(got.finalUrl, 'https://upload.wikimedia.org/a.png');
  assert.deepEqual(asked, ['http://cdn.example.org/a.png', 'https://upload.wikimedia.org/a.png']);
});

test('the LAN and this server itself stay out of reach - directly, by name, or by a redirect', async () => {
  const { fetch, asked } = web({ 'https://cdn.example.org/x.png': () => new Response(null, { status: 302, headers: { Location: 'http://intranet.example.org/admin.png' } }) });
  for (const url of ['http://127.0.0.1:3335/api/cover', 'http://192.168.0.45:9035/x.png', 'https://sneaky.example.org/x.png', 'http://[::1]/x.png']) {
    assert.equal((await refusal(fetchRemoteImage(url, { fetch, lookup }))).status, 400, url);
  }
  const viaRedirect = await refusal(fetchRemoteImage('https://cdn.example.org/x.png', { fetch, lookup }));
  assert.match(viaRedirect.message, /intranet\.example\.org must resolve only to public addresses/);
  assert.deepEqual(asked, ['https://cdn.example.org/x.png']); // the private hop is never fetched
});

test('only images, up to 10 MiB, with a reason a person can act on', async () => {
  const { fetch } = web({
    'https://cdn.example.org/page': () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } }),
    'https://cdn.example.org/huge.png': () => new Response(PNG, { headers: { 'Content-Type': 'image/png', 'Content-Length': String(11 * 1024 * 1024) } }),
    'https://cdn.example.org/blocked.webp': () => new Response('denied', { status: 403 }),
  });
  const page = await refusal(fetchRemoteImage('https://cdn.example.org/page', { fetch, lookup }));
  assert.equal(page.status, 415);
  assert.match(page.message, /answered with a web page, not the image/);
  assert.equal((await refusal(fetchRemoteImage('https://cdn.example.org/huge.png', { fetch, lookup }))).status, 413);
  const blocked = await refusal(fetchRemoteImage('https://cdn.example.org/blocked.webp', { fetch, lookup }));
  assert.equal(blocked.status, 502);
  assert.match(blocked.message, /cdn\.example\.org answered 403 \(it refuses this server/);
  assert.equal((await refusal(fetchRemoteImage('ftp://cdn.example.org/a.png', { fetch, lookup }))).status, 400);
  assert.equal((await refusal(fetchRemoteImage('https://user:pw@cdn.example.org/a.png', { fetch, lookup }))).status, 400);
});
