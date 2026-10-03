export interface PortraitSearchResult {
  url: string;
  title: string;
  source: 'wikipedia' | 'wikimedia';
  description?: string;
}

/**
 * Searches Wikipedia and Wikimedia Commons for historical portraits of an author.
 * Tries the local backend proxy first, falling back to direct CORS Wikimedia API.
 */
export async function searchAuthorPortraits(
  authorName: string
): Promise<PortraitSearchResult[]> {
  const cleanName = authorName
    .replace(/\b(sir|lord|lady|rev|dr|prof)\b/gi, '')
    .trim();

  if (!cleanName) return [];

  // 1. Try local server endpoint first
  try {
    const res = await fetch(`/api/author-portrait?name=${encodeURIComponent(cleanName)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.portraits) && data.portraits.length > 0) {
        return data.portraits;
      }
    }
  } catch (err) {
    console.warn('Backend portrait search failed, falling back to client-side search:', err);
  }

  // 2. Direct client-side search on Wikipedia (CORS supported with origin=*)
  const results: PortraitSearchResult[] = [];

  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      cleanName
    )}&prop=pageimages|extracts&pithumbsize=1000&exintro=1&explaintext=1&format=json&origin=*`;
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const json = await res.json();
      const pages = json.query?.pages || {};
      for (const id of Object.keys(pages)) {
        const page = pages[id];
        if (page.thumbnail?.source) {
          results.push({
            url: page.thumbnail.source,
            title: page.title,
            source: 'wikipedia',
            description: page.extract ? page.extract.slice(0, 150) + '...' : undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Client Wikipedia fetch error:', err);
  }

  // 3. Direct client-side search on Wikimedia Commons
  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      `${cleanName} portrait OR photograph OR painting`
    )}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1000&format=json&origin=*`;
    const res = await fetch(commonsUrl);
    if (res.ok) {
      const json = await res.json();
      const pages = json.query?.pages || {};
      for (const id of Object.keys(pages)) {
        const page = pages[id];
        const info = page.imageinfo?.[0];
        if (info?.thumburl) {
          const mime = info.mime || '';
          if (mime.includes('image/jpeg') || mime.includes('image/png') || mime.includes('image/webp')) {
            if (!results.some((r) => r.url === info.thumburl)) {
              results.push({
                url: info.thumburl,
                title: page.title.replace(/^File:/i, ''),
                source: 'wikimedia',
                description: info.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, '').slice(0, 100),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Client Wikimedia fetch error:', err);
  }

  return results;
}

/**
 * Returns a proxied URL for canvas rendering to prevent tainted canvas export errors
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:') || originalUrl.startsWith('/')) {
    return originalUrl;
  }
  return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}
