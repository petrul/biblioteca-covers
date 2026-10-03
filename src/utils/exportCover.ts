import { toPng, toSvg } from 'html-to-image';
import { BookMetadata } from '../types';

export interface ExportOptions {
  pixelRatio?: number;
  format?: 'png' | 'svg' | 'tei';
}

/**
 * Exports the cover HTML node to high-resolution PNG or SVG
 */
export async function exportCoverImage(
  element: HTMLElement,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  const pixelRatio = options.pixelRatio || 2.5; // High-res 2.5x - 3x

  try {
    if (options.format === 'svg') {
      const dataUrl = await toSvg(element, { quality: 0.95 });
      triggerDownload(dataUrl, `${filename}.svg`);
      return;
    }

    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      quality: 0.95,
      filter: (node: HTMLElement) => {
        // Exclude any controls or helpers marked with no-export
        return !node.classList?.contains('no-export');
      },
    });

    triggerDownload(dataUrl, `${filename}.png`);
  } catch (err) {
    console.error('Export cover failed:', err);
    throw err;
  }
}

/**
 * Triggers a browser file download from a data URL or blob
 */
export function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the TEI XML with embedded cover configuration
 */
export function exportTeiXmlWithCoverMeta(
  metadata: BookMetadata,
  coverMeta: any
): void {
  const blob = new Blob([metadata.rawTei || ''], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeTitle = (metadata.title || 'ebook').toLowerCase().replace(/[^a-z0-9]/g, '_');
  triggerDownload(url, `${safeTitle}_tei_edition.xml`);
  URL.revokeObjectURL(url);
}
