import { ColorPalette } from '../types';
import { COLOR_PALETTES } from './themePresets';

/**
 * Calculates perceived relative luminance of a color according to WCAG 2.1 specs
 */
export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255;
    g = parseInt(clean[1] + clean[1], 16) / 255;
    b = parseInt(clean[2] + clean[2], 16) / 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) / 255;
    g = parseInt(clean.substring(2, 4), 16) / 255;
    b = parseInt(clean.substring(4, 6), 16) / 255;
  }

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Computes contrast ratio (1:1 to 21:1) between two colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

export interface SurpriseResult {
  palette: ColorPalette;
  contrastRatio: number;
  genreCategory: string;
  reason: string;
}

interface GenreRule {
  keywords: string[];
  category: string;
  paletteIds: string[];
  reasons: Record<string, string>;
}

const GENRE_RULES: GenreRule[] = [
  {
    keywords: ['greek', 'latin', 'classical', 'antiquity', 'roman', 'athens', 'spqr', 'homer', 'plato', 'aristotle', 'aeneid', 'iliad', 'odyssey', 'cicero', 'virgil', 'marcus aurelius'],
    category: 'Classical Antiquity (Graeco-Roman)',
    paletteIds: ['graeco_roman_marble', 'oxford_blue', 'archival_alabaster', 'terracotta_linen', 'imperial_crimson'],
    reasons: {
      graeco_roman_marble: 'Deep Athenian basalt marble and antique bronze gold evokes the Parthenon and Roman Forum.',
      oxford_blue: 'Authoritative Oxford academic navy with gilded typography reflects timeless classical wisdom.',
      archival_alabaster: 'Clean, scholarly alabaster parchment with carbon ink embodies classical intellectual rigor.',
      terracotta_linen: 'Mediterranean terracotta and sand parchment evokes ancient Greco-Roman stoic scrolls.',
      imperial_crimson: 'Imperial Roman Tyrian purple and ivory commands monumental dignity.',
    },
  },
  {
    keywords: ['history', 'historical', 'chronicle', 'annals', 'documentary', 'biography', 'memoir', 'monograph', 'medieval', 'renaissance', 'civilization', 'empire'],
    category: 'Historical Documentary & Annals',
    paletteIds: ['historical_codex', 'archival_alabaster', 'oxford_blue', 'forest_emerald', 'terracotta_linen'],
    reasons: {
      historical_codex: 'Antiquarian morocco leather and aged vellum reflects rare manuscript archival collections.',
      archival_alabaster: 'Museum and university press alabaster tone mirrors authentic archival documents.',
      oxford_blue: 'Distinguished university press navy delivers authoritative historical presence.',
      forest_emerald: 'Antique bookcloth emerald mirrors bound historical annals and presidential archives.',
      terracotta_linen: 'Weathered linen and sand parchment captures archaeological and chronological records.',
    },
  },
  {
    keywords: ['slavic', 'slavonic', 'russian', 'cyrillic', 'eastern european', 'tolstoy', 'dostoevsky', 'chekhov', 'gogol', 'pushkin', 'turgenev'],
    category: 'Slavonic & Eastern European',
    paletteIds: ['slavonic_cinnabar', 'midnight_obsidian', 'swiss_vermilion', 'archival_alabaster', 'imperial_crimson'],
    reasons: {
      slavonic_cinnabar: 'Iconographic cinnabar red and obsidian coal delivers fierce East European emotional intensity.',
      midnight_obsidian: 'Stark obsidian with platinum typography evokes deep Russian psychological novels.',
      swiss_vermilion: 'Avant-garde constructivist red and black honors 1920s Eastern European graphic arts.',
      archival_alabaster: 'Bleached birch parchment and carbon black ink captures classical 19th-century Slavic literature.',
      imperial_crimson: 'Imperial Russian ruby velvet and warm amber evokes St. Petersburg grandeur.',
    },
  },
  {
    keywords: ['asian', 'japanese', 'chinese', 'east asian', 'zen', 'tao', 'haiku', 'oriental', 'silk road', 'samurai', 'tokugawa', 'buddhist', 'confucius', 'sun tzu', 'manga'],
    category: 'East Asian & Silk Road',
    paletteIds: ['asian_sumie', 'archival_alabaster', 'gallimard_cream', 'midnight_obsidian', 'forest_emerald'],
    reasons: {
      asian_sumie: 'Kyoto indigo sumi-e ink with vermilion cinnabar seal stamp reflects Japanese woodblock mastery.',
      archival_alabaster: 'Pure handmade mulberry washi paper tone with carbon sumi ink brings tranquil balance.',
      gallimard_cream: 'Silken cream parchment evokes ancient calligraphic scrolls and meditative philosophy.',
      midnight_obsidian: 'Nocturnal ink wash captures the mystery of mountain mist and zen moonlit nights.',
      forest_emerald: 'Lush bamboo forest emerald with gilded accents honors Eastern pastoral poetry.',
    },
  },
  {
    keywords: ['adventure', 'expedition', 'voyage', 'sea', 'nautical', 'island', 'pulp', 'jules verne', 'treasure', 'lost world', 'conan doyle', 'safari', 'journey', 'travel'],
    category: 'High Adventure & Expedition',
    paletteIds: ['adventure_safari', 'oxford_blue', 'terracotta_linen', 'forest_emerald', 'midnight_obsidian'],
    reasons: {
      adventure_safari: 'Expedition canvas khaki and polished nautical brass evokes Jules Verne voyages of discovery.',
      oxford_blue: 'Deep oceanic navy with windrose gold highlights high-seas exploration and uncharted waters.',
      terracotta_linen: 'Sunbaked safari canvas and weathered leather recalls legendary field expeditions.',
      forest_emerald: 'Dense jungle canopy emerald captures lost-world exploration and discovery.',
      midnight_obsidian: 'Deep cavern obsidian delivers thrilling suspense and pulp serial intensity.',
    },
  },
  {
    keywords: ['gothic', 'horror', 'ghost', 'dark', 'vampire', 'creepy', 'supernatural', 'terror'],
    category: 'Gothic & Horror',
    paletteIds: ['imperial_crimson', 'midnight_obsidian', 'oxford_blue', 'archival_alabaster', 'forest_emerald'],
    reasons: {
      imperial_crimson: 'Deep velvet crimson with hot-pressed ivory text reflects dramatic 19th-century gothic terror.',
      midnight_obsidian: 'Stark obsidian with platinum typography evokes shadowy catacombs and midnight intrigue.',
      oxford_blue: 'Nocturnal Oxford navy creates chilling high-contrast atmospheric depth.',
      archival_alabaster: 'Archival paper tone with pitch-black carbon ink captures historical gothic monographs.',
      forest_emerald: 'Shadowy forest emerald brings dark, haunting Victorian romanticism.',
    },
  },
  {
    keywords: ['philosophy', 'philosophical', 'stoic', 'meditation', 'treatise', 'essay', 'academic', 'scholarly'],
    category: 'Philosophy & Classical',
    paletteIds: ['archival_alabaster', 'oxford_blue', 'gallimard_cream', 'forest_emerald', 'terracotta_linen'],
    reasons: {
      archival_alabaster: 'Clean, scholarly alabaster parchment with carbon ink embodies intellectual rigor.',
      oxford_blue: 'Authoritative Oxford academic navy with gilded typography reflects timeless classical wisdom.',
      gallimard_cream: 'Prestigious French literary cream with carmine imprint captures contemplative continental thought.',
      forest_emerald: 'Dignified forest emerald binding mirrors traditional university press masterworks.',
      terracotta_linen: 'Mediterranean terracotta and sand parchment evokes ancient Greco-Roman stoic scrolls.',
    },
  },
  {
    keywords: ['modernist', 'absurd', 'absurdist', 'existential', 'dystopian', 'novella', 'avant-garde', 'kafka'],
    category: 'Modernist & Avant-Garde',
    paletteIds: ['swiss_vermilion', 'midnight_obsidian', 'gallimard_cream', 'oxford_blue', 'archival_alabaster'],
    reasons: {
      swiss_vermilion: 'Pure Swiss International Typographic white and vermilion delivers high-contrast psychological tension.',
      midnight_obsidian: 'Monochromatic obsidian ink highlights existential isolation and stark alienation.',
      gallimard_cream: 'Refined Parisian cream captures 20th-century existential modernist fiction.',
      oxford_blue: 'Sleek, deep navy with high contrast provides crisp modernist clarity.',
      archival_alabaster: 'Minimalist monochrome alabaster framing brings stark literary focus.',
    },
  },
  {
    keywords: ['children', 'fairytale', 'fairy', 'fantasy', 'wonderland', 'oz', 'magic', 'whimsy', 'juvenile', 'fable'],
    category: "Children's & Fairytale",
    paletteIds: ['storybook_sky', 'candy_coral', 'lavender_fairytale', 'comic_canary', 'mint_bubblegum'],
    reasons: {
      storybook_sky: 'Classic Little Golden Book sky with deep navy typography guarantees playful, crisp contrast.',
      candy_coral: 'Sunburst coral paper with deep ink lettering inspires childhood adventure and wonder.',
      lavender_fairytale: 'Enchanted lilac with regal deep purple text sparks fantastical imagination.',
      comic_canary: 'Vibrant canary yellow and ink lines evoke colorful illustrated wonder.',
      mint_bubblegum: 'Whimsical mint gelato with high-contrast forest text brings vintage nursery charm.',
    },
  },
  {
    keywords: ['comic', 'cartoon', 'pop', 'graphic', 'pulp', 'superhero', 'satire', 'humor', 'parody'],
    category: 'Comic Pop & Satire',
    paletteIds: ['comic_canary', 'swiss_vermilion', 'candy_coral', 'mint_bubblegum'],
    reasons: {
      comic_canary: 'Bold Golden-Age comic yellow with black ink lines provides maximum graphic punch.',
      swiss_vermilion: 'High-contrast vermilion and deep ink commands instant poster-like eye attention.',
      candy_coral: 'Dynamic pop-art coral with bold accents delivers expressive humor and energy.',
      mint_bubblegum: 'Playful retro palette with strong contrast brings vibrant cartoon joy.',
    },
  },
  {
    keywords: ['romance', 'regency', 'victorian', 'love', 'poetry', 'satire', 'social comedy', 'austen'],
    category: 'Romance & Regency',
    paletteIds: ['gallimard_cream', 'imperial_crimson', 'archival_alabaster', 'terracotta_linen', 'lavender_fairytale'],
    reasons: {
      gallimard_cream: 'Warm cream paper with carmine accents evokes elegant drawing-room letters and Regency society.',
      imperial_crimson: 'Passionate velvet crimson with ivory title creates timeless romantic drama.',
      archival_alabaster: 'Delicate alabaster paper with sharp ink reflects Jane Austen’s wit and precision.',
      terracotta_linen: 'Warm terracotta linen suggests sunlit country estates and romantic warmth.',
      lavender_fairytale: 'Gentle enchanted lilac with deep violet text adds lyrical, poetic romance.',
    },
  },
];

/**
 * Picks a high-contrast palette tailored to the book's genre, ensuring a different palette is chosen.
 */
export function pickSurprisePalette(
  genre?: string,
  currentPaletteId?: string
): SurpriseResult {
  const normGenre = (genre || '').toLowerCase().trim();

  // Find matching genre rule
  let matchedRule: GenreRule | undefined;
  if (normGenre) {
    matchedRule = GENRE_RULES.find((rule) =>
      rule.keywords.some((kw) => normGenre.includes(kw))
    );
  }

  // Determine candidate palette IDs
  let candidateIds: string[] = [];
  let category = matchedRule ? matchedRule.category : 'Classic Literature';

  if (matchedRule) {
    candidateIds = [...matchedRule.paletteIds];
  } else {
    // General fallback: all palettes with high contrast (ratio >= 7.0:1)
    candidateIds = COLOR_PALETTES.map((p) => p.id);
  }

  // Filter out current palette if possible to ensure a real change
  let availableIds = candidateIds.filter((id) => id !== currentPaletteId);
  if (availableIds.length === 0) {
    // If all candidates were filtered, fallback to any other palette from all palettes
    availableIds = COLOR_PALETTES.map((p) => p.id).filter((id) => id !== currentPaletteId);
  }
  if (availableIds.length === 0) {
    availableIds = candidateIds;
  }

  // Random selection
  const selectedId = availableIds[Math.floor(Math.random() * availableIds.length)];
  const selectedPalette = COLOR_PALETTES.find((p) => p.id === selectedId) || COLOR_PALETTES[0];

  // Calculate actual contrast ratio between text and background
  const contrastRatio = parseFloat(getContrastRatio(selectedPalette.text, selectedPalette.bg).toFixed(1));

  // Determine curated reason
  let reason = '';
  if (matchedRule && matchedRule.reasons[selectedId]) {
    reason = matchedRule.reasons[selectedId];
  } else {
    reason = `Striking ${selectedPalette.name} with ${contrastRatio}:1 contrast ratio ensures AAA readability for ${genre || 'classic monographs'}.`;
  }

  return {
    palette: selectedPalette,
    contrastRatio,
    genreCategory: category,
    reason,
  };
}
