import {
  AuthorPortraitConfig,
  BookMetadata,
  ColorPalette,
  CoverThemeConfig,
  FoilEffectStyle,
  LayoutArchetypeId,
} from '../types';
import { COLOR_PALETTES, LAYOUT_ARCHETYPES } from './themePresets';

/**
 * REST payload accepted by POST /api/cover.
 * Mirrors the studio UI: flat book fields + layout/theme selection + toggles.
 * Everything except `title` and `author` is optional and falls back to the
 * same defaults the studio app uses.
 */
export interface CoverRenderRequest {
  // --- Book metadata (TEI-equivalent flat fields) ---
  title: string;
  subtitle?: string;
  author: string;
  editor?: string;
  translator?: string;
  publisher?: string;
  pubPlace?: string;
  date?: string;
  isbn?: string;
  series?: string;
  volume?: string;
  taglineQuote?: string;
  genre?: string;
  editionNotice?: string;
  language?: string;
  /** Author portrait / cover art. Same-origin path, data URL, or remote https URL (auto-proxied). */
  coverArtUrl?: string;

  // --- Layout & effects (top-level shorthand) ---
  /** Layout archetype id, e.g. 'archival_monograph' (see GET /api/cover/meta) */
  layout?: LayoutArchetypeId;
  foilEffect?: FoilEffectStyle;

  // --- Output ---
  /** 'png' (default) or 'svg' */
  format?: 'png' | 'svg';
  /** PNG upscale factor, 1-4 (default 2.5, like the studio export) */
  pixelRatio?: number;
  /** CSS width in px of the rendered cover (default 420, the studio design width) */
  width?: number;
  /** Set true to get a Content-Disposition: attachment response */
  download?: boolean;

  // --- Theme selection (on/off switches + palette + fonts) ---
  theme?: Partial<CoverThemeConfig> & {
    /** Palette preset id, e.g. 'oxford_blue' (see GET /api/cover/meta). Ignored when `palette` is given. */
    paletteId?: string;
  };

  /** Hardcover effect: true/false for default config, or full override */
  hardcover?: boolean | CoverThemeConfig['hardcover'];

  /** Portrait treatment/crop overrides */
  portrait?: Partial<AuthorPortraitConfig>;
}

export interface ResolvedCoverSpec {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
  render: {
    format: 'png' | 'svg';
    pixelRatio: number;
    width: number;
  };
}

const FALLBACK_ARCHETYPE_ID: LayoutArchetypeId = 'archival_monograph';

export function resolveCoverRequest(request: CoverRenderRequest): ResolvedCoverSpec {
  if (!request || typeof request !== 'object') {
    throw new Error('Cover request body must be a JSON object');
  }
  if (!request.title || typeof request.title !== 'string') {
    throw new Error('Missing required field: title');
  }
  if (!request.author || typeof request.author !== 'string') {
    throw new Error('Missing required field: author');
  }

  const themeReq = request.theme || {};

  const archetypeId = (request.layout || themeReq.archetypeId || FALLBACK_ARCHETYPE_ID) as LayoutArchetypeId;
  const meta =
    LAYOUT_ARCHETYPES.find((a) => a.id === archetypeId) ||
    LAYOUT_ARCHETYPES.find((a) => a.id === FALLBACK_ARCHETYPE_ID)!;

  let palette: ColorPalette;
  if (themeReq.palette) {
    palette = themeReq.palette;
  } else if (themeReq.paletteId) {
    palette =
      COLOR_PALETTES.find((p) => p.id === themeReq.paletteId) ||
      COLOR_PALETTES.find((p) => p.id === meta.suggestedPaletteId)!;
  } else {
    palette = COLOR_PALETTES.find((p) => p.id === meta.suggestedPaletteId) || COLOR_PALETTES[0];
  }

  // Hardcover: default to the studio configuration unless switched off
  let hardcover: CoverThemeConfig['hardcover'];
  if (request.hardcover === undefined) {
    hardcover = themeReq.hardcover;
  } else if (typeof request.hardcover === 'boolean') {
    hardcover = {
      enabled: request.hardcover,
      spineVisible: true,
      spineWidthPx: 12,
      textureStyle: 'buckram_cloth',
      sheenIntensity: 0.25,
      creaseDepth: 0.4,
      showPageEdge: true,
      embossedTitle: true,
    };
  } else {
    hardcover = request.hardcover;
  }

  const theme: CoverThemeConfig = {
    archetypeId: meta.id,
    palette,
    fontTitle: themeReq.fontTitle || meta.defaultFont,
    fontAuthor: themeReq.fontAuthor || meta.defaultFont,
    fontMeta: themeReq.fontMeta || 'Plus Jakarta Sans',
    showPublisherMark: themeReq.showPublisherMark ?? true,
    publisherMarkStyle: themeReq.publisherMarkStyle || 'oxford',
    showBorder: themeReq.showBorder ?? true,
    showOrnaments: themeReq.showOrnaments ?? true,
    showBarcode: themeReq.showBarcode ?? true,
    spineWidthMm: themeReq.spineWidthMm ?? 22,
    coverAspectRatio: themeReq.coverAspectRatio || 'kdp_1_6',
    hardcover,
    foilEffect: request.foilEffect || themeReq.foilEffect || 'none',
    cinematicScrim: themeReq.cinematicScrim || 'balanced',
    showQrCode: themeReq.showQrCode ?? false,
    qrCodeUrl: themeReq.qrCodeUrl,
    qrLogo: themeReq.qrLogo || { enabled: false, presetStyle: 'oxford', shape: 'circle', sizePercent: 24 },
  };

  const book: BookMetadata = {
    title: request.title,
    subtitle: request.subtitle,
    author: request.author,
    editor: request.editor,
    translator: request.translator,
    publisher: request.publisher || '',
    pubPlace: request.pubPlace,
    date: request.date || '',
    isbn: request.isbn,
    series: request.series,
    volume: request.volume,
    taglineQuote: request.taglineQuote,
    genre: request.genre,
    editionNotice: request.editionNotice,
    language: request.language,
  };

  const portrait: AuthorPortraitConfig = {
    url: request.coverArtUrl || '',
    title: request.portrait?.title || request.author,
    source: request.coverArtUrl?.startsWith('http') ? 'wikipedia' : 'curated',
    treatment: request.portrait?.treatment || meta.treatment,
    cropShape: request.portrait?.cropShape || meta.defaultCrop,
    zoom: request.portrait?.zoom ?? 1,
    panX: request.portrait?.panX ?? 0,
    panY: request.portrait?.panY ?? 0,
    borderStyle: request.portrait?.borderStyle || 'none',
  };

  const format = request.format === 'svg' || request.format === 'png' ? request.format : 'png';
  const rawPixelRatio = Number(request.pixelRatio);
  const pixelRatio =
    request.pixelRatio === undefined || Number.isNaN(rawPixelRatio)
      ? 2.5
      : Math.min(Math.max(rawPixelRatio, 1), 4);
  const width = Math.min(Math.max(Number(request.width) || 420, 200), 1200);

  return {
    book,
    portrait,
    theme,
    render: { format, pixelRatio, width },
  };
}
