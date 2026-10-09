import { AuthorPortraitConfig, LayoutArchetypeId } from '../types';

export interface CuratedCoverArtItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Art Nouveau' | 'Storybook & Fairytale' | 'Folk Mosaic' | 'Spring Landscape';
  url: string;
  recommendedArchetype: LayoutArchetypeId;
  portraitConfig: AuthorPortraitConfig;
}

export const CURATED_COVER_ARTS: CuratedCoverArtItem[] = [
  {
    id: 'klimt_folk_portrait',
    title: 'Art Nouveau Mosaic Maiden',
    subtitle: 'Vibrant Cloak & Headdress in Gustav Klimt Folk Style',
    category: 'Art Nouveau',
    url: '/src/assets/images/klimt_folk_portrait_1791558965159.jpg',
    recommendedArchetype: 'faber_poetry',
    portraitConfig: {
      url: '/src/assets/images/klimt_folk_portrait_1791558965159.jpg',
      title: 'Art Nouveau Mosaic Maiden',
      source: 'curated',
      treatment: 'natural',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      borderStyle: 'none',
    },
  },
  {
    id: 'whimsical_night_town',
    title: 'Enchanted Fairytale Towers',
    subtitle: 'Nocturnal Whimsical Village with Glowing Swirl Moon',
    category: 'Storybook & Fairytale',
    url: '/src/assets/images/whimsical_night_town_1791558975529.jpg',
    recommendedArchetype: 'storybook_whimsy',
    portraitConfig: {
      url: '/src/assets/images/whimsical_night_town_1791558975529.jpg',
      title: 'Enchanted Fairytale Towers',
      source: 'curated',
      treatment: 'natural',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      borderStyle: 'none',
    },
  },
  {
    id: 'mosaic_village_tree',
    title: 'Tree of Life & Mosaic Village',
    subtitle: 'Lush Garden & Cottages under a Starry Swirling Sky',
    category: 'Folk Mosaic',
    url: '/src/assets/images/mosaic_village_tree_1791558984986.jpg',
    recommendedArchetype: 'folio_heritage',
    portraitConfig: {
      url: '/src/assets/images/mosaic_village_tree_1791558984986.jpg',
      title: 'Tree of Life & Mosaic Village',
      source: 'curated',
      treatment: 'natural',
      applyVintageFilter: false,
      cropShape: 'square_frame',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      borderStyle: 'thin_gold',
    },
  },
  {
    id: 'cherry_blossom_village',
    title: 'Cherry Blossom Hillside Village',
    subtitle: 'Springtime Rolling Hills with Flowering Sakura & Cottages',
    category: 'Spring Landscape',
    url: '/src/assets/images/cherry_blossom_village_1791558995527.jpg',
    recommendedArchetype: 'storybook_whimsy',
    portraitConfig: {
      url: '/src/assets/images/cherry_blossom_village_1791558995527.jpg',
      title: 'Cherry Blossom Hillside Village',
      source: 'curated',
      treatment: 'natural',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      borderStyle: 'none',
    },
  },
  {
    id: 'art_nouveau_golden_portrait',
    title: 'Golden Art Nouveau Muse',
    subtitle: 'Gilded Spirals, Turquoise Jewels & Ethereal Portrait',
    category: 'Art Nouveau',
    url: '/src/assets/images/art_nouveau_golden_portrait_1791559005458.jpg',
    recommendedArchetype: 'cinematic_bleed',
    portraitConfig: {
      url: '/src/assets/images/art_nouveau_golden_portrait_1791559005458.jpg',
      title: 'Golden Art Nouveau Muse',
      source: 'curated',
      treatment: 'natural',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      borderStyle: 'none',
    },
  },
];
