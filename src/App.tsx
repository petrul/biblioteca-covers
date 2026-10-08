import React, { useState, useRef, useEffect } from 'react';
import {
  BookMetadata,
  AuthorPortraitConfig,
  CoverThemeConfig,
  LayoutArchetypeId,
} from './types';
import { SAMPLE_BOOKS, SampleBookItem } from './utils/sampleTei';
import { parseTeiXml } from './utils/teiParser';
import { COLOR_PALETTES, LAYOUT_ARCHETYPES } from './utils/themePresets';
import { exportCoverImage, exportTeiXmlWithCoverMeta } from './utils/exportCover';
import { Header } from './components/Header';
import { CoverCanvas } from './components/CoverCanvas';
import { LayoutGallery } from './components/LayoutGallery';
import { AuthorPortraitPicker } from './components/AuthorPortraitPicker';
import { StyleCustomizer } from './components/StyleCustomizer';
import { WrapView } from './components/WrapView';
import { Mockup3D } from './components/Mockup3D';
import { TeiImportModal } from './components/TeiImportModal';
import { JsonImportModal } from './components/JsonImportModal';
import { QrLogoCustomizer } from './components/QrLogoCustomizer';
import {
  FileCode,
  Download,
  Sparkles,
  Layers,
  BookOpen,
  User,
  Sliders,
  Check,
  ChevronRight,
  ExternalLink,
  BookMarked,
  Info,
  SunMedium,
  QrCode,
  Braces,
} from 'lucide-react';
import {
  resolveBookMetadataUrl,
  getGutenbergUrl,
  getWikipediaUrl,
  getOpenLibraryUrl,
} from './utils/qrCodeHelper';

export default function App() {
  // Initialize with Mary Shelley's Frankenstein
  const defaultSample = SAMPLE_BOOKS[0];
  const [metadata, setMetadata] = useState<BookMetadata>(() => parseTeiXml(defaultSample.teiXml));
  const [portrait, setPortrait] = useState<AuthorPortraitConfig>(defaultSample.portrait);
  
  // Theme configuration
  const [theme, setTheme] = useState<CoverThemeConfig>({
    archetypeId: 'archival_monograph',
    palette: COLOR_PALETTES[1], // Archival Alabaster
    fontTitle: 'Cinzel',
    fontAuthor: 'Cinzel',
    fontMeta: 'Plus Jakarta Sans',
    showPublisherMark: true,
    publisherMarkStyle: 'oxford',
    showBorder: true,
    showOrnaments: true,
    showBarcode: true,
    spineWidthMm: 22,
    coverAspectRatio: 'kdp_1_6',
    hardcover: {
      enabled: true,
      spineVisible: true,
      spineWidthPx: 12,
      textureStyle: 'buckram_cloth',
      sheenIntensity: 0.25,
      creaseDepth: 0.4,
      showPageEdge: true,
      embossedTitle: true,
    },
    foilEffect: 'none',
    cinematicScrim: 'balanced',
    showQrCode: true,
    qrLogo: {
      enabled: false,
      presetStyle: 'oxford',
      shape: 'circle',
      sizePercent: 24,
    },
  });

  const [activeView, setActiveView] = useState<'studio' | 'gallery' | 'portrait' | 'styles' | 'wrap' | '3d'>('studio');
  const [isTeiModalOpen, setIsTeiModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const coverRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotice = (msg: string) => {
    setNotification(msg);
  };

  // Handler for custom JSON payload import
  const handleApplyJsonData = (payload: {
    metadata: BookMetadata;
    portrait: AuthorPortraitConfig;
    themeUpdates?: Partial<CoverThemeConfig>;
  }) => {
    setMetadata(payload.metadata);
    setPortrait(payload.portrait);
    if (payload.themeUpdates) {
      setTheme((prev) => ({
        ...prev,
        ...payload.themeUpdates,
      }));
    }
    setActiveView('studio');
  };

  // Inline Sidebar JSON paste state
  const [sidebarJsonText, setSidebarJsonText] = useState<string>(() =>
    JSON.stringify(
      {
        title: defaultSample.name.split('(')[0].trim(),
        subtitle: 'A Critical Archival Edition',
        author: defaultSample.author,
        publisher: 'Lackington, Hughes, Harding, Mavor, & Jones',
        pubPlace: 'London',
        date: '1818',
        isbn: '978-0-14-143947-1',
        series: 'Standard Bibliographic Classics',
        volume: 'VOL. I',
        taglineQuote: 'Beware; for I am fearless, and therefore powerful.',
        genre: 'Gothic Fiction',
        coverArtUrl: defaultSample.portrait.url,
      },
      null,
      2
    )
  );
  const [sidebarJsonError, setSidebarJsonError] = useState<string | null>(null);
  const [isSidebarJsonOpen, setIsSidebarJsonOpen] = useState(true);

  const handleApplySidebarJson = () => {
    if (!sidebarJsonText.trim()) return;
    try {
      const data = JSON.parse(sidebarJsonText);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        setSidebarJsonError('JSON must be an object with key-value pairs (e.g. { "title": "..." })');
        return;
      }

      setMetadata((prev) => ({
        ...prev,
        title: data.title !== undefined ? String(data.title) : prev.title,
        subtitle: data.subtitle !== undefined ? String(data.subtitle) : prev.subtitle,
        author: data.author !== undefined ? String(data.author) : prev.author,
        editor: data.editor !== undefined ? String(data.editor) : prev.editor,
        translator: data.translator !== undefined ? String(data.translator) : prev.translator,
        publisher: data.publisher !== undefined ? String(data.publisher) : prev.publisher,
        pubPlace: data.pubPlace !== undefined ? String(data.pubPlace) : prev.pubPlace,
        date: data.date !== undefined ? String(data.date) : prev.date,
        isbn: data.isbn !== undefined ? String(data.isbn) : prev.isbn,
        series: data.series !== undefined ? String(data.series) : prev.series,
        volume: data.volume !== undefined ? String(data.volume) : prev.volume,
        taglineQuote: data.taglineQuote !== undefined ? String(data.taglineQuote) : prev.taglineQuote,
        genre: data.genre !== undefined ? String(data.genre) : prev.genre,
        editionNotice: data.editionNotice !== undefined ? String(data.editionNotice) : prev.editionNotice,
        language: data.language !== undefined ? String(data.language) : prev.language,
      }));

      const newArtUrl = data.coverArtUrl || data.imageUrl || data.graphicUrl || data.portraitUrl;
      if (newArtUrl) {
        setPortrait((prev) => ({
          ...prev,
          url: String(newArtUrl),
          source: 'curated',
          title: data.author || prev.title,
          treatment: data.portraitTreatment || prev.treatment,
          cropShape: data.cropShape || prev.cropShape,
        }));
      } else if (data.portraitTreatment || data.cropShape) {
        setPortrait((prev) => ({
          ...prev,
          treatment: data.portraitTreatment || prev.treatment,
          cropShape: data.cropShape || prev.cropShape,
        }));
      }

      if (data.layout || data.archetypeId) {
        const layoutId = data.layout || data.archetypeId;
        const arch = LAYOUT_ARCHETYPES.find((a) => a.id === layoutId);
        if (arch) {
          setTheme((prev) => ({
            ...prev,
            archetypeId: arch.id,
            fontTitle: arch.defaultFont as any,
          }));
        }
      }

      if (data.paletteId) {
        const pal = COLOR_PALETTES.find((p) => p.id === data.paletteId);
        if (pal) {
          setTheme((prev) => ({ ...prev, palette: pal }));
        }
      }

      if (data.foilEffect) {
        setTheme((prev) => ({ ...prev, foilEffect: data.foilEffect }));
      }

      setSidebarJsonError(null);
      showNotice('Book cover updated from JSON successfully!');
    } catch (err: any) {
      setSidebarJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleLoadCurrentIntoSidebarJson = () => {
    const current = {
      title: metadata.title,
      subtitle: metadata.subtitle,
      author: metadata.author,
      publisher: metadata.publisher,
      pubPlace: metadata.pubPlace,
      date: metadata.date,
      isbn: metadata.isbn,
      series: metadata.series,
      volume: metadata.volume,
      taglineQuote: metadata.taglineQuote,
      genre: metadata.genre,
      coverArtUrl: portrait.url,
      portraitTreatment: portrait.treatment,
      cropShape: portrait.cropShape,
      layout: theme.archetypeId,
      foilEffect: theme.foilEffect,
    };
    setSidebarJsonText(JSON.stringify(current, null, 2));
    setSidebarJsonError(null);
    setIsSidebarJsonOpen(true);
    showNotice('Loaded current book data into JSON editor');
  };

  // Handler for sample book selection
  const handleSelectSample = (sample: SampleBookItem) => {
    const parsed = parseTeiXml(sample.teiXml);
    setMetadata(parsed);
    setPortrait(sample.portrait);

    // Apply layout archetype that matches the book mood
    if (sample.id === 'frankenstein') {
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'archival_monograph',
        palette: COLOR_PALETTES[1], // Archival Alabaster
        fontTitle: 'Cinzel',
        foilEffect: 'none',
      }));
    } else if (sample.id === 'dorian_gray') {
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'folio_heritage',
        palette: COLOR_PALETTES[2], // Imperial Crimson
        fontTitle: 'Cormorant Garamond',
        foilEffect: 'gold', // Luminous Gold Foil on Imperial Crimson
      }));
    } else if (sample.id === 'metamorphosis') {
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'swiss_modernist',
        palette: COLOR_PALETTES[7], // Swiss Vermilion
        fontTitle: 'Bodoni Moda',
        foilEffect: 'none',
      }));
    } else if (sample.id === 'pride_and_prejudice') {
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'woodcut_broadside',
        palette: COLOR_PALETTES[1], // Alabaster & Ink
        fontTitle: 'Cormorant Garamond',
        foilEffect: 'none',
      }));
    } else if (sample.id === 'meditations') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'graeco_roman_marble') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'classical_graeco_roman',
        palette,
        fontTitle: 'Cinzel',
        foilEffect: 'gold',
      }));
    } else if (sample.id === 'twenty_thousand_leagues') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'adventure_safari') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'adventure_pulp',
        palette,
        fontTitle: 'Plus Jakarta Sans',
        foilEffect: 'gold',
      }));
    } else if (sample.id === 'war_and_peace') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'slavonic_cinnabar') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'slavonic_construct',
        palette,
        fontTitle: 'Bodoni Moda',
        foilEffect: 'gold',
      }));
    } else if (sample.id === 'art_of_war') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'asian_sumie') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'asian_inkwash',
        palette,
        fontTitle: 'Bodoni Moda',
        foilEffect: 'gold',
      }));
    } else if (sample.id === 'decline_and_fall') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'historical_codex') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'historical_annals',
        palette,
        fontTitle: 'Newsreader',
        foilEffect: 'none',
      }));
    } else if (sample.id === 'alice_in_wonderland') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'candy_coral') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'storybook_whimsy',
        palette,
        fontTitle: 'Sniglet',
        foilEffect: 'none',
      }));
    } else if (sample.id === 'wizard_of_oz') {
      const palette = COLOR_PALETTES.find((p) => p.id === 'storybook_sky') || COLOR_PALETTES[0];
      setTheme((prev) => ({
        ...prev,
        archetypeId: 'storybook_whimsy',
        palette,
        fontTitle: 'Sniglet',
        foilEffect: 'none',
      }));
    }

    showNotice(`Loaded "${sample.name}" with authentic TEI XML & verified portrait.`);
  };

  // Switch layout archetype
  const handleSelectLayout = (archetypeId: LayoutArchetypeId) => {
    const arch = LAYOUT_ARCHETYPES.find((a) => a.id === archetypeId);
    if (!arch) return;

    const suggestedPalette =
      COLOR_PALETTES.find((p) => p.id === arch.suggestedPaletteId) || theme.palette;

    setTheme((prev) => ({
      ...prev,
      archetypeId,
      palette: suggestedPalette,
      fontTitle: arch.defaultFont,
    }));

    setPortrait((prev) => ({
      ...prev,
      cropShape: arch.defaultCrop,
      treatment: arch.treatment,
    }));

    showNotice(`Applied "${arch.name}" layout layout with coordinated typography.`);
  };

  // Export current cover
  const handleExport = async (format: 'png' | 'svg' | 'tei' = 'png') => {
    const node = activeView === 'wrap' ? wrapRef.current : coverRef.current;
    if (!node) return;

    setIsExporting(true);
    try {
      const cleanTitle = metadata.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'ebook_cover';
      const suffix = activeView === 'wrap' ? '_wrap_jacket' : '_cover';

      if (format === 'tei') {
        exportTeiXmlWithCoverMeta(metadata, { theme, portrait });
        showNotice('Exported TEI XML document with cover metadata.');
      } else {
        await exportCoverImage(node, `${cleanTitle}${suffix}`, {
          format,
          pixelRatio: format === 'png' ? 2.5 : undefined,
        });
        showNotice(
          format === 'png'
            ? 'Cover exported at ultra high-resolution (1600×2560 standard).'
            : 'Cover exported as vector SVG.'
        );
      }
    } catch (err) {
      console.error('Export error:', err);
      showNotice('Failed to export cover. Check browser console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1E1B18] flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenTeiModal={() => setIsTeiModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onExport={() => handleExport('png')}
        isExporting={isExporting}
      />

      {/* Historical Sample Books Fast-Bar */}
      <div className="bg-[#EFECE4] border-b border-stone-200/80 px-6 py-2 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center gap-2 text-stone-600 shrink-0">
          <BookMarked className="w-3.5 h-3.5 text-amber-700" />
          <span className="font-serif font-medium">Historical Masterworks:</span>
        </div>

        <div className="flex items-center gap-2 pl-4 shrink-0">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="px-2.5 py-1 text-xs rounded-md font-semibold bg-amber-800 text-white hover:bg-amber-900 flex items-center gap-1.5 transition-all shadow-2xs"
            title="Import custom book JSON & cover graphic URL"
          >
            <Braces className="w-3.5 h-3.5 text-amber-200" />
            <span>+ Custom Book JSON</span>
          </button>

          {SAMPLE_BOOKS.map((item) => {
            const isCurrent = metadata.title.toLowerCase().includes(item.name.split(' ')[0].toLowerCase());
            return (
              <button
                key={item.id}
                onClick={() => handleSelectSample(item)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                  isCurrent
                    ? 'bg-amber-800 text-white font-medium shadow-2xs'
                    : 'bg-white/70 text-stone-700 hover:bg-white hover:text-stone-900 border border-stone-300/60'
                }`}
              >
                {item.author} ({item.name.split('(')[0].trim()})
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-stone-500 font-mono pl-4">
          <span>TEI P5 XML Standard</span>
          <span aria-hidden="true">·</span>
          <span>Wikimedia Commons Portraits</span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-lg shadow-xl border border-stone-700 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ======================================================== */}
        {/* VIEW 1: STUDIO (Split Layout: Live Canvas + Quick Controls) */}
        {/* ======================================================== */}
        {activeView === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Canvas Stage & Dimension Info */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Visual Canvas Stage Frame */}
              <div className="w-full flex flex-col items-center bg-[#EBE7DD]/60 rounded-xl p-6 sm:p-10 border border-stone-300 shadow-inner">
                {/* Meta indicator & Hardcover Quick Toggle Bar above cover */}
                <div className="w-full max-w-[420px] flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-600 font-mono text-[11px]">
                    <span className="font-semibold">{LAYOUT_ARCHETYPES.find((a) => a.id === theme.archetypeId)?.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{theme.coverAspectRatio === 'kdp_1_6' ? '1:1.6' : '3:4'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Foil Shimmer Selector */}
                    <div className="flex items-center bg-white/90 rounded-md border border-stone-300 p-0.5 shadow-2xs">
                      <span className="text-[10px] text-stone-500 font-medium px-1.5 hidden sm:inline">Foil:</span>
                      <button
                        type="button"
                        onClick={() => setTheme((prev) => ({ ...prev, foilEffect: 'none' }))}
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-medium transition-colors ${
                          !theme.foilEffect || theme.foilEffect === 'none'
                            ? 'bg-stone-800 text-white'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                        title="Standard Ink"
                      >
                        Ink
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme((prev) => ({ ...prev, foilEffect: 'gold' }))}
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-medium transition-colors flex items-center gap-0.5 ${
                          theme.foilEffect === 'gold'
                            ? 'bg-amber-600 text-white shadow-2xs font-bold'
                            : 'text-amber-700 hover:text-amber-900'
                        }`}
                        title="Hot-Stamped Gold Foil"
                      >
                        <span>Gold</span>
                        <span className="text-[9px]">✦</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme((prev) => ({ ...prev, foilEffect: 'silver' }))}
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-medium transition-colors flex items-center gap-0.5 ${
                          theme.foilEffect === 'silver'
                            ? 'bg-slate-600 text-white shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Hot-Stamped Silver Foil"
                      >
                        <span>Silver</span>
                        <span className="text-[9px]">✦</span>
                      </button>
                    </div>

                    {/* Quick Photo Scrim Exposure Selector (For Cinematic Bleed) */}
                    {theme.archetypeId === 'cinematic_bleed' && (
                      <div className="flex items-center bg-white/90 rounded-md border border-stone-300 p-0.5 shadow-2xs">
                        <span className="text-[10px] text-stone-500 font-medium px-1.5 hidden sm:inline">Photo:</span>
                        {[
                          { id: 'vibrant', label: 'Radiant', title: 'Bright & Luminous (Clear Face)' },
                          { id: 'balanced', label: 'Cinema', title: 'Balanced Contrast (Recommended)' },
                          { id: 'moody', label: 'Moody', title: 'Film Noir Shadows' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setTheme((prev) => ({ ...prev, cinematicScrim: m.id as any }))}
                            className={`px-1.5 py-0.5 rounded-xs text-[10px] font-medium transition-colors ${
                              (theme.cinematicScrim || 'balanced') === m.id
                                ? 'bg-amber-800 text-white font-semibold shadow-2xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                            title={m.title}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 1-Click Hardcover Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setTheme((prev) => ({
                          ...prev,
                          hardcover: {
                            enabled: !prev.hardcover?.enabled,
                            spineVisible: prev.hardcover?.spineVisible ?? true,
                            spineWidthPx: prev.hardcover?.spineWidthPx ?? 12,
                            textureStyle: prev.hardcover?.textureStyle ?? 'buckram_cloth',
                            sheenIntensity: prev.hardcover?.sheenIntensity ?? 0.25,
                            creaseDepth: prev.hardcover?.creaseDepth ?? 0.4,
                            showPageEdge: prev.hardcover?.showPageEdge ?? true,
                          },
                        }))
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        theme.hardcover?.enabled
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Hardcover</span>
                      <span className="text-[9px] opacity-80 uppercase font-mono">
                        {theme.hardcover?.enabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Hardcover Quick Material & Spine Tuning Selector (when active) */}
                {theme.hardcover?.enabled && (
                  <div className="w-full max-w-[420px] mb-3 bg-white/90 backdrop-blur-xs p-2 rounded-md border border-stone-300/80 text-[10px] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-stone-600">Pânză:</span>
                        {[
                          { id: 'buckram_cloth', label: 'Pânză' },
                          { id: 'fine_linen', label: 'In' },
                          { id: 'leather_grain', label: 'Piele' },
                          { id: 'antique_board', label: 'Carton' },
                          { id: 'smooth', label: 'Fină' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setTheme((prev) => ({
                                ...prev,
                                hardcover: {
                                  ...(prev.hardcover as any),
                                  textureStyle: m.id as any,
                                },
                              }))
                            }
                            className={`px-1.5 py-0.5 rounded-xs transition-colors ${
                              theme.hardcover?.textureStyle === m.id
                                ? 'bg-amber-900 text-white font-medium'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTheme((prev) => ({
                            ...prev,
                            hardcover: {
                              ...(prev.hardcover as any),
                              spineVisible: !prev.hardcover?.spineVisible,
                            },
                          }))
                        }
                        className={`px-2 py-0.5 rounded-xs transition-colors font-medium ${
                          theme.hardcover?.spineVisible
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-stone-400 line-through'
                        }`}
                        title="Book Spine / Cotorul cărții vizibil pe stânga"
                      >
                        Spine (Cotor) {theme.hardcover?.spineVisible ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Fine Spine Width & Delicate Shade Controls */}
                    {theme.hardcover?.spineVisible && (
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/70 text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-stone-600">Cotor:</span>
                          {[
                            { px: 8, label: 'Ultra-fin (8px)' },
                            { px: 14, label: 'Fin (14px)' },
                            { px: 22, label: 'Clasic (22px)' },
                          ].map((s) => (
                            <button
                              key={s.px}
                              type="button"
                              onClick={() =>
                                setTheme((prev) => ({
                                  ...prev,
                                  hardcover: {
                                    ...(prev.hardcover as any),
                                    spineWidthPx: s.px,
                                  },
                                }))
                              }
                              className={`px-1.5 py-0.5 rounded-xs transition-colors ${
                                theme.hardcover?.spineWidthPx === s.px
                                  ? 'bg-amber-800 text-white font-medium'
                                  : 'hover:text-stone-900'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="font-medium text-stone-600">Umbră:</span>
                          {[
                            { val: 0.25, label: 'Discretă' },
                            { val: 0.45, label: 'Medie' },
                          ].map((sh) => (
                            <button
                              key={sh.val}
                              type="button"
                              onClick={() =>
                                setTheme((prev) => ({
                                  ...prev,
                                  hardcover: {
                                    ...(prev.hardcover as any),
                                    creaseDepth: sh.val,
                                  },
                                }))
                              }
                              className={`px-1.5 py-0.5 rounded-xs transition-colors ${
                                Math.abs((theme.hardcover?.creaseDepth ?? 0.45) - sh.val) < 0.1
                                  ? 'bg-amber-800 text-white font-medium'
                                  : 'hover:text-stone-900'
                              }`}
                            >
                              {sh.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* The Master Cover Canvas */}
                <CoverCanvas
                  ref={coverRef}
                  book={metadata}
                  portrait={portrait}
                  theme={theme}
                  className="shadow-2xl"
                />

                {/* Quick actions directly beneath cover */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveView('gallery')}
                    className="px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    <span>Browse 8 Layout Choices</span>
                  </button>

                  <button
                    onClick={() => setActiveView('3d')}
                    className="px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>View in 3D & E-Reader</span>
                  </button>

                  <button
                    onClick={() => setActiveView('wrap')}
                    className="px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Full Dust Jacket Wrap</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Quick Tuning Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Paste Book JSON Card */}
              <div className="bg-white border-2 border-amber-600/30 rounded-lg p-5 shadow-sm transition-all hover:border-amber-600/50">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                    <Braces className="w-4 h-4 text-amber-700" />
                    <span>Paste Book JSON</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleLoadCurrentIntoSidebarJson}
                      className="px-2 py-0.5 text-[10px] font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                      title="Load current book cover values as JSON"
                    >
                      Current Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsJsonModalOpen(true)}
                      className="px-2 py-0.5 text-[10px] font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1"
                      title="Open full-screen JSON editor with templates"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Full Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSidebarJsonOpen(!isSidebarJsonOpen)}
                      className="text-stone-500 hover:text-stone-800 text-xs px-1"
                      title={isSidebarJsonOpen ? 'Minimize' : 'Expand'}
                    >
                      {isSidebarJsonOpen ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isSidebarJsonOpen ? (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-[11px] text-stone-500 leading-tight">
                      Paste or edit any book JSON below to instantly update the cover title, author, series, dates, and cover art:
                    </p>

                    <div className="relative">
                      <textarea
                        value={sidebarJsonText}
                        onChange={(e) => {
                          setSidebarJsonText(e.target.value);
                          if (!e.target.value.trim()) {
                            setSidebarJsonError(null);
                          } else {
                            try {
                              JSON.parse(e.target.value);
                              setSidebarJsonError(null);
                            } catch (err: any) {
                              setSidebarJsonError(err.message || 'Invalid JSON syntax');
                            }
                          }
                        }}
                        placeholder='{\n  "title": "Your Title",\n  "author": "Author Name",\n  "subtitle": "Subtitle",\n  "publisher": "Publisher",\n  "date": "1925"\n}'
                        rows={8}
                        className="w-full font-mono text-[11px] p-2.5 bg-stone-900 text-amber-100 rounded-md border border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 selection:bg-amber-800 leading-relaxed shadow-inner"
                        spellCheck={false}
                      />
                    </div>

                    {sidebarJsonError ? (
                      <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-1.5 font-mono">
                        ⚠ {sidebarJsonError}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Valid JSON ready to apply</span>
                        </span>
                        <span className="font-mono text-stone-400">
                          {sidebarJsonText.length} chars
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSidebarJsonText(
                              JSON.stringify(
                                {
                                  title: 'The Great Gatsby',
                                  subtitle: 'A Story of the Jazz Age',
                                  author: 'F. Scott Fitzgerald',
                                  publisher: "Charles Scribner's Sons",
                                  pubPlace: 'New York',
                                  date: '1925',
                                  series: 'Modern Classic Library',
                                  volume: 'VOL. I',
                                  taglineQuote: 'So we beat on, boats against the current, borne back ceaselessly into the past.',
                                },
                                null,
                                2
                              )
                            );
                            setSidebarJsonError(null);
                          }}
                          className="text-[10px] text-stone-500 hover:text-stone-800 underline"
                        >
                          Sample
                        </button>
                        <span className="text-stone-300 text-[10px]">·</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSidebarJsonText('{}');
                            setSidebarJsonError(null);
                          }}
                          className="text-[10px] text-stone-500 hover:text-stone-800 underline"
                        >
                          Clear
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplySidebarJson}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-md transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-200" />
                        <span>Apply JSON to Cover</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSidebarJsonOpen(true)}
                    className="w-full text-left text-[11px] text-stone-500 hover:text-stone-800 pt-1 flex items-center justify-between"
                  >
                    <span>Click to paste or modify raw book JSON...</span>
                    <span className="text-amber-800 font-semibold text-xs">Expand</span>
                  </button>
                )}
              </div>

              {/* Quick Layout Archetype Selector */}
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    <span>Layout Style Archetypes</span>
                  </div>
                  <button
                    onClick={() => setActiveView('gallery')}
                    className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center"
                  >
                    <span>All Choices</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_ARCHETYPES.map((arch) => {
                    const isSelected = theme.archetypeId === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => handleSelectLayout(arch.id)}
                        className={`p-2.5 rounded-md border text-left transition-all ${
                          isSelected
                            ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-600/30'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-stone-900 line-clamp-1">
                          {arch.name}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                          {arch.category} · {arch.defaultFont}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Author Portrait Quick Card */}
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span>Author Face & Portrait</span>
                  </div>
                  <button
                    onClick={() => setActiveView('portrait')}
                    className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center"
                  >
                    <span>Search Internet</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-md border border-stone-200">
                  <img
                    src={portrait.url}
                    alt={portrait.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-cover rounded-xs border border-stone-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-stone-900 truncate">
                      {portrait.title || metadata.author}
                    </div>
                    <div className="text-[10px] text-stone-500 capitalize font-mono mt-0.5">
                      Source: {portrait.source} · {portrait.treatment}
                    </div>
                    <button
                      onClick={() => setActiveView('portrait')}
                      className="mt-1 text-[11px] text-amber-700 font-medium hover:underline block"
                    >
                      Change or tune filter →
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardcover & Spine Effect Tuning Card (Apple Books Style) */}
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>Hardcover & Spine (Apple Books Style)</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.hardcover?.enabled}
                      onChange={(e) =>
                        setTheme((prev) => ({
                          ...prev,
                          hardcover: {
                            ...(prev.hardcover as any),
                            enabled: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-700" />
                    <span className="ml-2 text-xs font-medium text-stone-700">
                      {theme.hardcover?.enabled ? 'Active' : 'Off'}
                    </span>
                  </label>
                </div>

                {theme.hardcover?.enabled && (
                  <div className="space-y-3 pt-1">
                    {/* Spine visibility checkbox */}
                    <div className="flex items-center justify-between p-2 bg-stone-50 rounded-md border border-stone-200 text-xs">
                      <div>
                        <span className="font-medium text-stone-800 block">Cotorul cărții vizibil pe stânga</span>
                        <span className="text-[10px] text-stone-500">Cylindrical binding hinge & deep joint groove</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={theme.hardcover?.spineVisible}
                        onChange={(e) =>
                          setTheme((prev) => ({
                            ...prev,
                            hardcover: {
                              ...(prev.hardcover as any),
                              spineVisible: e.target.checked,
                            },
                          }))
                        }
                        className="rounded-xs text-amber-700 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Material Texture selector */}
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5 font-medium">
                        Tactile Cloth & Material Grain
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'buckram_cloth', label: 'Cloth' },
                          { id: 'fine_linen', label: 'Linen' },
                          { id: 'leather_grain', label: 'Leather' },
                          { id: 'antique_board', label: 'Board' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setTheme((prev) => ({
                                ...prev,
                                hardcover: {
                                  ...(prev.hardcover as any),
                                  textureStyle: m.id as any,
                                },
                              }))
                            }
                            className={`py-1 text-[11px] rounded-md font-medium text-center transition-colors ${
                              theme.hardcover?.textureStyle === m.id
                                ? 'bg-amber-900 text-white shadow-2xs'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spine Width, Shade Depth & Sheen sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                          <span>Spine (Cotor)</span>
                          <span>{theme.hardcover?.spineWidthPx}px</span>
                        </div>
                        <input
                          type="range"
                          min="6"
                          max="40"
                          step="1"
                          value={theme.hardcover?.spineWidthPx || 12}
                          onChange={(e) =>
                            setTheme((prev) => ({
                              ...prev,
                              hardcover: {
                                ...(prev.hardcover as any),
                                spineWidthPx: parseInt(e.target.value, 10),
                              },
                            }))
                          }
                          className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                          <span>Shade Depth</span>
                          <span>{Math.round(((theme.hardcover?.creaseDepth ?? 0.4) * 100))}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={theme.hardcover?.creaseDepth ?? 0.4}
                          onChange={(e) =>
                            setTheme((prev) => ({
                              ...prev,
                              hardcover: {
                                ...(prev.hardcover as any),
                                creaseDepth: parseFloat(e.target.value),
                              },
                            }))
                          }
                          className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                          <span>Apple Sheen</span>
                          <span>{Math.round((theme.hardcover?.sheenIntensity || 0.25) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.8"
                          step="0.05"
                          value={theme.hardcover?.sheenIntensity || 0.25}
                          onChange={(e) =>
                            setTheme((prev) => ({
                              ...prev,
                              hardcover: {
                                ...(prev.hardcover as any),
                                sheenIntensity: parseFloat(e.target.value),
                              },
                            }))
                          }
                          className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                        />
                      </div>
                    </div>

                    {/* Embossed Title Foil Stamping Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-stone-800">
                            Embossed Title (Ștanțare Cotor)
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-800 font-mono font-medium">
                            Foil Deboss
                          </span>
                        </div>
                        <div className="text-[9px] text-stone-500">
                          Adds letter-spacing and hot-foil deboss drop-shadow to spine typography
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={theme.hardcover?.embossedTitle ?? true}
                        onChange={(e) =>
                          setTheme((prev) => ({
                            ...prev,
                            hardcover: {
                              ...(prev.hardcover as any),
                              embossedTitle: e.target.checked,
                            },
                          }))
                        }
                        className="rounded text-amber-700 w-4 h-4 cursor-pointer accent-amber-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Metallic Foil Shimmer Card */}
              <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Title Metallic Foil Shimmer</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-mono">Hot-stamped</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'none', label: 'Ink', sub: 'Standard' },
                    { id: 'gold', label: 'Gold ✦', sub: '24K Foil' },
                    { id: 'silver', label: 'Silver ✦', sub: 'Platinum' },
                    { id: 'rose_gold', label: 'Rose ✦', sub: 'Antique' },
                  ].map((f) => {
                    const active = (theme.foilEffect || 'none') === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTheme((prev) => ({ ...prev, foilEffect: f.id as any }))}
                        className={`py-1.5 px-2 rounded-md border text-center transition-all ${
                          active
                            ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-500/30 font-bold text-stone-900'
                            : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50/50'
                        }`}
                      >
                        <div className="text-[11px] leading-tight">{f.label}</div>
                        <div className="text-[9px] opacity-75 font-mono">{f.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Exposure & Scrim Depth Card (When Cinematic Bleed layout is active) */}
              {theme.archetypeId === 'cinematic_bleed' && (
                <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                      <SunMedium className="w-3.5 h-3.5 text-amber-600" />
                      <span>Photo Exposure & Scrim Depth</span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-mono">Cinematic</span>
                  </div>
                  <div className="text-[10px] text-stone-500 leading-tight">
                    Controls background shadow depth. Keeps the author's face illuminated and clear.
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'vibrant', label: 'Radiant', sub: 'Bright Face' },
                      { id: 'balanced', label: 'Cinema', sub: 'Balanced' },
                      { id: 'moody', label: 'Moody', sub: 'Film Noir' },
                    ].map((m) => {
                      const active = (theme.cinematicScrim || 'balanced') === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setTheme((prev) => ({ ...prev, cinematicScrim: m.id as any }))}
                          className={`py-1.5 px-2 rounded-md border text-center transition-all ${
                            active
                              ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-500/30 font-bold text-stone-900'
                              : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50/50'
                          }`}
                        >
                          <div className="text-[11px] leading-tight">{m.label}</div>
                          <div className="text-[9px] opacity-75 font-mono">{m.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bibliographic TEI Data Card */}
              <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <FileCode className="w-3.5 h-3.5 text-amber-700" />
                    <span>TEI XML Bibliographic Elements</span>
                  </div>
                  <button
                    onClick={() => setIsTeiModalOpen(true)}
                    className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center"
                  >
                    <span>Edit TEI XML</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-500 uppercase tracking-wider block">
                      Title
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 uppercase tracking-wider block">
                      Author
                    </label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-wider block">
                        Publisher
                      </label>
                      <input
                        type="text"
                        value={metadata.publisher}
                        onChange={(e) => setMetadata({ ...metadata, publisher: e.target.value })}
                        className="w-full px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase tracking-wider block">
                        Publication Year
                      </label>
                      <input
                        type="text"
                        value={metadata.date}
                        onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                        className="w-full px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Options Card */}
              <div className="bg-stone-900 text-stone-100 rounded-lg p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
                    Publisher Ready Export
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">300 DPI</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('png')}
                    disabled={isExporting}
                    className="p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleExport('svg')}
                    disabled={isExporting}
                    className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <span>Vector SVG</span>
                  </button>
                </div>

                <button
                  onClick={() => handleExport('tei')}
                  className="w-full py-2 bg-stone-800/80 hover:bg-stone-800 text-stone-300 rounded-md text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors border border-stone-700"
                >
                  <FileCode className="w-3 h-3 text-amber-400" />
                  <span>Download TEI XML with Metadata</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: AUTOMATIC LAYOUT CHOICES GALLERY */}
        {/* ======================================================== */}
        {activeView === 'gallery' && (
          <div className="space-y-6">
            <LayoutGallery
              book={metadata}
              portrait={portrait}
              currentTheme={theme}
              onSelectLayout={(id) => {
                handleSelectLayout(id);
                setActiveView('studio');
              }}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: AUTHOR PORTRAIT STUDIO */}
        {/* ======================================================== */}
        {activeView === 'portrait' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Author Face & Portrait Sourcing
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Search Wikipedia and Wikimedia Commons archives for authentic author portraits, or upload a custom image.
              </p>
            </div>

            <AuthorPortraitPicker
              authorName={metadata.author}
              portrait={portrait}
              onChange={setPortrait}
              accentColor={theme.palette.accent}
            />

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveView('studio')}
                className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
              >
                Back to Studio →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: TYPOGRAPHY & PALETTE STYLES */}
        {/* ======================================================== */}
        {activeView === 'styles' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Typography, Palettes & Emblems
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Curated historical paper palettes, classical typeface pairings, and authentic publisher marks.
              </p>
            </div>

            <StyleCustomizer theme={theme} onChange={setTheme} genre={metadata.genre} />

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveView('studio')}
                className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
              >
                Apply & Return to Studio →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: DUST JACKET WRAP (Back + Spine + Front) */}
        {/* ======================================================== */}
        {activeView === 'wrap' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-serif font-medium text-stone-900">
                  Full Dust Jacket & Wrap-around Cover
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Complete print wrap including back cover blurb, scannable QR code, barcode with ISBN, spine title, and front cover.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1-Click 'Add QR Code' Toggle Button */}
                <button
                  type="button"
                  onClick={() =>
                    setTheme((prev) => ({
                      ...prev,
                      showQrCode: !prev.showQrCode,
                    }))
                  }
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all border shadow-2xs ${
                    theme.showQrCode
                      ? 'bg-amber-800 text-white border-amber-900 ring-2 ring-amber-500/20'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
                  }`}
                  title="Toggle scannable QR code on the back cover"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Add QR Code</span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                      theme.showQrCode ? 'bg-amber-950/40 text-amber-100' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {theme.showQrCode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => handleExport('png')}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Wrap PNG</span>
                </button>
              </div>
            </div>

            {/* QR Code Target Metadata URL Customizer Panel (when QR Code is active) */}
            {theme.showQrCode && (
              <div className="bg-amber-50/60 border border-amber-200/90 rounded-lg p-3.5 text-xs space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                      <QrCode className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900 block leading-tight">
                        QR Code Destination: Book Metadata & eBook Page
                      </span>
                      <span className="text-[11px] text-stone-600">
                        Readers scan the physical back cover to access digital editions, Gutenberg text, or scholarly notes.
                      </span>
                    </div>
                  </div>

                  <a
                    href={resolveBookMetadataUrl(metadata, theme.qrCodeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 bg-white/80 px-2.5 py-1 rounded-md border border-amber-300 transition-colors shrink-0 shadow-2xs"
                    title="Test destination URL in new tab"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Target URL Input & Quick Presets */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={theme.qrCodeUrl ?? resolveBookMetadataUrl(metadata)}
                      onChange={(e) =>
                        setTheme((prev) => ({
                          ...prev,
                          qrCodeUrl: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setTheme((prev) => ({
                          ...prev,
                          qrCodeUrl: getGutenbergUrl(metadata.title),
                        }))
                      }
                      className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-stone-50 border border-stone-300 rounded-md text-stone-700 transition-colors"
                      title="Point to Project Gutenberg free eBook"
                    >
                      Gutenberg eBook
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTheme((prev) => ({
                          ...prev,
                          qrCodeUrl: getWikipediaUrl(metadata.title),
                        }))
                      }
                      className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-stone-50 border border-stone-300 rounded-md text-stone-700 transition-colors"
                      title="Point to Wikipedia scholarly article"
                    >
                      Wikipedia
                    </button>
                    {metadata.isbn && (
                      <button
                        type="button"
                        onClick={() =>
                          setTheme((prev) => ({
                            ...prev,
                            qrCodeUrl: getOpenLibraryUrl(metadata.isbn, metadata.title),
                          }))
                        }
                        className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-stone-50 border border-stone-300 rounded-md text-stone-700 transition-colors"
                        title="Point to Open Library record by ISBN"
                      >
                        OpenLibrary ISBN
                      </button>
                    )}
                  </div>
                </div>

                {/* Center Publisher Logo in QR Code */}
                <div className="pt-2 border-t border-amber-200/80">
                  <QrLogoCustomizer
                    theme={theme}
                    onChange={setTheme}
                    previewUrl={resolveBookMetadataUrl(metadata, theme.qrCodeUrl)}
                  />
                </div>
              </div>
            )}

            <div className="overflow-x-auto py-4">
              <WrapView ref={wrapRef} book={metadata} portrait={portrait} theme={theme} />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: 3D REALISTIC HARDCOVER & KINDLE MOCKUP */}
        {/* ======================================================== */}
        {activeView === '3d' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Photorealistic 3D & Device Preview
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Preview your eBook cover as a hardbound monograph with realistic binding grooves or on an e-reader screen.
              </p>
            </div>

            <Mockup3D book={metadata} portrait={portrait} theme={theme} />
          </div>
        )}
      </main>

      {/* TEI XML Import & Editor Modal */}
      <TeiImportModal
        isOpen={isTeiModalOpen}
        onClose={() => setIsTeiModalOpen(false)}
        metadata={metadata}
        onUpdateMetadata={setMetadata}
        onSelectSampleBook={handleSelectSample}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onAiRecommendations={(data) => {
          if (data.recommendedLayoutId) {
            handleSelectLayout(data.recommendedLayoutId);
          }
          if (data.tagline) {
            setMetadata((prev) => ({ ...prev, taglineQuote: data.tagline, genre: data.genre || prev.genre }));
          }
          showNotice('AI Art Direction applied: Evocative tagline & layout synced.');
        }}
      />

      {/* Custom JSON Book Data & Cover Graphic Importer Modal */}
      <JsonImportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentMetadata={metadata}
        currentPortrait={portrait}
        currentTheme={theme}
        onApplyJsonData={handleApplyJsonData}
        onShowNotice={showNotice}
      />
    </div>
  );
}
