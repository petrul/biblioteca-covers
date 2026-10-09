export interface BookMetadata {
  title: string;
  subtitle?: string;
  author: string;
  editor?: string;
  translator?: string;
  publisher: string;
  pubPlace?: string;
  date: string;
  isbn?: string;
  series?: string;
  volume?: string;
  taglineQuote?: string;
  genre?: string;
  editionNotice?: string;
  rawTei?: string;
  language?: string;
}

export type PortraitTreatment =
  | 'natural'
  | 'etching'
  | 'monochrome'
  | 'sepia'
  | 'duotone'
  | 'high_contrast'
  | 'cartoon_pop';

export type CropShape =
  | 'oval_cameo'
  | 'circle_medallion'
  | 'arch'
  | 'square_frame'
  | 'classic_shield'
  | 'cloud_bubble'
  | 'full_bleed';

export interface AuthorPortraitConfig {
  url: string;
  title: string;
  source: 'wikipedia' | 'wikimedia' | 'upload' | 'curated';
  treatment: PortraitTreatment;
  cropShape: CropShape;
  zoom: number; // 0.8 - 2.5
  panX: number; // -50 - 50
  panY: number; // -50 - 50
  borderStyle: 'none' | 'thin_gold' | 'double_hairline' | 'ornate_woodcut';
  applyVintageFilter?: boolean; // Optional B&W / vintage aging filter (default: false / off)
}

export type LayoutArchetypeId =
  | 'criterion_minimal'
  | 'archival_monograph'
  | 'folio_heritage'
  | 'cinematic_bleed'
  | 'swiss_modernist'
  | 'woodcut_broadside'
  | 'faber_poetry'
  | 'constructivist'
  | 'storybook_whimsy'
  | 'classical_graeco_roman'
  | 'historical_annals'
  | 'slavonic_construct'
  | 'asian_inkwash'
  | 'adventure_pulp';

export interface ColorPalette {
  id: string;
  name: string;
  bg: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  surface: string;
}

export interface HardcoverEffectConfig {
  enabled: boolean;
  spineVisible: boolean; // "cotorul cărții vizibil" (left spine cylindrical hinge)
  spineWidthPx: number; // 6 - 40px (default: 12px)
  textureStyle: 'buckram_cloth' | 'leather_grain' | 'fine_linen' | 'antique_board' | 'smooth';
  sheenIntensity: number; // 0.1 - 0.8
  creaseDepth: number; // 0.2 - 1.0
  showPageEdge: boolean; // right-edge subtle book page trim
  embossedTitle?: boolean; // foil-stamping deboss & tracking effect on spine text
}

export type FoilEffectStyle = 'none' | 'gold' | 'silver' | 'rose_gold';
export type CinematicScrimStyle = 'vibrant' | 'balanced' | 'moody';

export interface QrLogoConfig {
  enabled: boolean;
  url?: string; // Data URL for uploaded image or SVG
  presetStyle?: 'oxford' | 'folio' | 'penguin' | 'monogram' | 'classical_owl' | 'urn';
  shape?: 'circle' | 'rounded' | 'square';
  sizePercent?: number; // 18 - 30% (default 24%)
}

export interface CoverThemeConfig {
  archetypeId: LayoutArchetypeId;
  palette: ColorPalette;
  fontTitle: 'Cormorant Garamond' | 'Cinzel' | 'Bodoni Moda' | 'Newsreader' | 'Plus Jakarta Sans' | 'Sniglet' | 'Fredoka' | 'Bubblegum Sans';
  fontAuthor: 'Cormorant Garamond' | 'Cinzel' | 'Bodoni Moda' | 'Newsreader' | 'Plus Jakarta Sans' | 'Sniglet' | 'Fredoka' | 'Patrick Hand';
  fontMeta: 'Plus Jakarta Sans' | 'Space Mono' | 'Newsreader' | 'Fredoka' | 'Sniglet';
  showPublisherMark: boolean;
  publisherMarkStyle: 'oxford' | 'folio' | 'penguin' | 'monogram' | 'classical_owl' | 'urn';
  showBorder: boolean;
  showOrnaments: boolean;
  showBarcode: boolean;
  spineWidthMm: number; // 12 - 40mm
  coverAspectRatio: 'kdp_1_6' | 'standard_3_4' | 'print_6_9';
  hardcover?: HardcoverEffectConfig;
  foilEffect?: FoilEffectStyle;
  cinematicScrim?: CinematicScrimStyle;
  showQrCode?: boolean;
  qrCodeUrl?: string;
  qrLogo?: QrLogoConfig;
}

export type ViewMode = 'front' | 'spine' | 'back' | 'wrap' | '3d_hardcover' | '3d_ereader';
