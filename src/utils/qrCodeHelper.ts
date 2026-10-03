import { BookMetadata } from '../types';

export function getCleanIsbn(isbn?: string): string {
  if (!isbn) return '';
  return isbn.replace(/[^0-9Xx]/g, '');
}

export function getOpenLibraryUrl(isbn?: string, title?: string): string {
  const clean = getCleanIsbn(isbn);
  if (clean) {
    return `https://openlibrary.org/isbn/${clean}`;
  }
  return `https://openlibrary.org/search?q=${encodeURIComponent(title || 'classic book')}`;
}

export function getGutenbergUrl(title: string): string {
  return `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(title)}`;
}

export function getWikipediaUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
}

export function resolveBookMetadataUrl(book: BookMetadata, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim();
  }
  // If book has an authentic ISBN, OpenLibrary provides direct scholarly metadata
  if (book.isbn) {
    return getOpenLibraryUrl(book.isbn, book.title);
  }
  // Otherwise, Project Gutenberg provides authentic free eBook edition
  return getGutenbergUrl(book.title);
}
