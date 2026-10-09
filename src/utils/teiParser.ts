import { BookMetadata } from '../types';

/**
 * Robust XML parser for TEI (Text Encoding Initiative) documents
 * Handles both strict namespaces and plain XML/HTML structures.
 */
export function parseTeiXml(xmlString: string): BookMetadata {
  const cleanXml = xmlString.trim();

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(cleanXml, 'application/xml');

    // Check for parse errors
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0 && !xmlDoc.querySelector('teiHeader, TEI, teiCorpus')) {
      // Fallback to regex extraction if XML has invalid entities
      return parseTeiWithRegex(cleanXml);
    }

    // Helper to query with or without namespace
    const getVal = (selectors: string[]): string => {
      for (const sel of selectors) {
        const el = xmlDoc.querySelector(sel);
        if (el && el.textContent) {
          const txt = el.textContent.trim();
          if (txt) return txt;
        }
      }
      return '';
    };

    // Helper to get multiple terms
    const getTerms = (): string[] => {
      const terms: string[] = [];
      const nodes = xmlDoc.querySelectorAll('keywords term, textClass term, term');
      nodes.forEach((n) => {
        const t = n.textContent?.trim();
        if (t && !terms.includes(t)) terms.push(t);
      });
      return terms;
    };

    // 1. Title Extraction
    let mainTitle = getVal([
      'teiHeader fileDesc titleStmt title[type="main"]',
      'titleStmt title[type="main"]',
      'title[type="main"]',
      'teiHeader fileDesc titleStmt title:not([type])',
      'titleStmt title',
      'title',
    ]);

    let subtitle = getVal([
      'teiHeader fileDesc titleStmt title[type="sub"]',
      'titleStmt title[type="sub"]',
      'title[type="sub"]',
      'title[type="subtitle"]',
    ]);

    // If main title contains subtitle delimiter
    if (mainTitle && !subtitle) {
      if (mainTitle.includes(': ')) {
        const parts = mainTitle.split(': ');
        mainTitle = parts[0].trim();
        subtitle = parts.slice(1).join(': ').trim();
      } else if (mainTitle.includes('; or, ')) {
        const parts = mainTitle.split('; or, ');
        mainTitle = parts[0].trim();
        subtitle = 'Or, ' + parts.slice(1).join('; or, ').trim();
      } else if (mainTitle.includes('—')) {
        const parts = mainTitle.split('—');
        mainTitle = parts[0].trim();
        subtitle = parts.slice(1).join('—').trim();
      }
    }

    // 2. Author Extraction
    let author = getVal([
      'teiHeader fileDesc titleStmt author persName',
      'titleStmt author persName',
      'titleStmt author',
      'teiHeader fileDesc titleStmt author',
      'author',
    ]);

    // If author has forename and surname tags
    const authorEl = xmlDoc.querySelector('titleStmt author, author');
    if (authorEl) {
      const forename = authorEl.querySelector('forename')?.textContent?.trim();
      const surname = authorEl.querySelector('surname')?.textContent?.trim();
      if (forename && surname) {
        author = `${forename} ${surname}`;
      }
    }

    // 3. Editor / Translator
    const editor = getVal([
      'titleStmt editor',
      'teiHeader fileDesc titleStmt editor',
      'respStmt[resp*="editor" i] name',
    ]);
    const translator = getVal([
      'titleStmt respStmt[resp*="translat" i] name',
      'respStmt[resp*="translat" i] name',
      'respStmt[resp*="traduit" i] name',
    ]);

    // 4. Publisher & Publication Info
    const publisher = getVal([
      'publicationStmt publisher name',
      'publicationStmt publisher',
      'publisher',
      'publicationStmt distributor',
    ]) || 'Ediții Scriptorium';

    const pubPlace = getVal([
      'publicationStmt pubPlace',
      'pubPlace',
    ]) || 'București';

    const date = getVal([
      'publicationStmt date[when]',
      'publicationStmt date',
      'date',
    ]) || new Date().getFullYear().toString();

    // 5. ISBN & Identifiers
    const isbn = getVal([
      'idno[type="ISBN"]',
      'idno[type="isbn"]',
      'idno',
    ]);

    // 6. Series & Volume
    const series = getVal([
      'seriesStmt title',
      'seriesStmt',
    ]);
    const volume = getVal([
      'seriesStmt biblScope[unit="volume"]',
      'biblScope[unit="volume"]',
      'biblScope',
    ]);

    // 7. Epigraph / Quote / Blurb
    const quote = getVal([
      'epigraph quote',
      'epigraph p',
      'front epigraph',
      'epigraph',
      'argument p',
      'quote',
    ]);

    // 8. Keywords & Genre
    const terms = getTerms();
    const genre = terms.length > 0 ? terms.slice(0, 3).join(', ') : '';

    // 9. Edition notice
    const edition = getVal([
      'editionStmt edition',
      'editionStmt',
    ]);

    return {
      title: mainTitle || 'Untitled Folio',
      subtitle: subtitle || undefined,
      author: author || 'Anonymous',
      editor: editor || undefined,
      translator: translator || undefined,
      publisher: publisher,
      pubPlace: pubPlace || 'București',
      date: date.replace(/[^0-9\-–]/g, '').slice(0, 4) || date,
      isbn: isbn || '978-0-14-143947-1',
      series: series || undefined,
      volume: volume || undefined,
      taglineQuote: quote ? quote.replace(/\s+/g, ' ').slice(0, 160) : undefined,
      genre: genre || undefined,
      editionNotice: edition || undefined,
      rawTei: cleanXml,
    };
  } catch (err) {
    console.warn('TEI XML parsing exception, using fallback regex:', err);
    return parseTeiWithRegex(cleanXml);
  }
}

/**
 * Fallback regex extractor for malformed XML fragments
 */
function parseTeiWithRegex(xml: string): BookMetadata {
  const matchTag = (tag: string): string => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = xml.match(regex);
    if (!m) return '';
    // Strip inner tags
    return m[1].replace(/<[^>]+>/g, '').trim();
  };

  const title = matchTag('title') || 'Untitled Folio';
  const author = matchTag('author') || 'Anonymous Author';
  const publisher = matchTag('publisher') || 'Ediții Scriptorium';
  const date = matchTag('date') || '1890';
  const quote = matchTag('quote') || matchTag('epigraph') || '';
  const isbn = matchTag('idno') || '978-1-59308-000-6';
  const pubPlace = matchTag('pubPlace') || 'București';

  return {
    title,
    author,
    publisher,
    date,
    pubPlace: pubPlace || 'București',
    isbn,
    taglineQuote: quote ? quote.slice(0, 150) : undefined,
    rawTei: xml,
  };
}
