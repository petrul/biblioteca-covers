import React, { useState, useEffect } from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig, LayoutArchetypeId } from '../types';
import { LAYOUT_ARCHETYPES, COLOR_PALETTES } from '../utils/themePresets';
import {
  Braces,
  Upload,
  Check,
  X,
  AlertCircle,
  Copy,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export interface CustomBookJsonPayload {
  title?: string;
  subtitle?: string;
  author?: string;
  editor?: string;
  translator?: string;
  publisher?: string;
  pubPlace?: string;
  date?: string | number;
  isbn?: string;
  series?: string;
  volume?: string;
  taglineQuote?: string;
  genre?: string;
  editionNotice?: string;
  language?: string;

  // Cover Art Graphic URL & settings
  coverArtUrl?: string;
  imageUrl?: string;
  graphicUrl?: string;
  portraitUrl?: string;
  portraitTreatment?: 'natural' | 'etching' | 'monochrome' | 'sepia' | 'duotone' | 'high_contrast' | 'cartoon_pop';
  cropShape?: 'oval_cameo' | 'circle_medallion' | 'arch' | 'square_frame' | 'classic_shield' | 'cloud_bubble' | 'full_bleed';

  // Layout & Theme Preferences
  layout?: string;
  archetypeId?: string;
  paletteId?: string;
  foilEffect?: 'none' | 'gold' | 'silver' | 'rose_gold';
}

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMetadata: BookMetadata;
  currentPortrait: AuthorPortraitConfig;
  currentTheme: CoverThemeConfig;
  onApplyJsonData: (payload: {
    metadata: BookMetadata;
    portrait: AuthorPortraitConfig;
    themeUpdates?: Partial<CoverThemeConfig>;
  }) => void;
  onShowNotice?: (msg: string) => void;
}

const SAMPLE_TEMPLATES: Record<string, { name: string; icon: string; data: CustomBookJsonPayload }> = {
  modernist_scifi: {
    name: 'Constructivist Sci-Fi',
    icon: '🚀',
    data: {
      title: 'SOLARIS',
      subtitle: 'A Psychological Inquiry into Oceanic Consciousness',
      author: 'Stanisław Lem',
      publisher: 'Faber & Faber',
      pubPlace: 'Warsaw & London',
      date: '1961',
      isbn: '978-0-571-08920-5',
      series: 'Cosmic Phenomenology',
      volume: 'VOL. 01',
      taglineQuote: 'We have no need of other worlds. We need mirrors. We don’t know what to do with other worlds.',
      genre: 'Speculative Fiction',
      layout: 'constructivist',
      coverArtUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      portraitTreatment: 'high_contrast',
      foilEffect: 'gold',
    },
  },
  poetry_classic: {
    name: 'Faber Poetry Classic',
    icon: '🪶',
    data: {
      title: 'Four Quartets',
      subtitle: 'Burnt Norton · East Coker · The Dry Salvages · Little Gidding',
      author: 'T. S. Eliot',
      publisher: 'Faber and Faber Limited',
      pubPlace: 'London',
      date: '1943',
      isbn: '978-0-571-05708-2',
      series: 'The Faber Library of Poetry',
      volume: 'NO. 42',
      taglineQuote: 'Time present and time past / Are both perhaps present in time future, / And time future contained in time past.',
      genre: 'Poetry',
      layout: 'faber_poetry',
      coverArtUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop',
      portraitTreatment: 'monochrome',
      cropShape: 'circle_medallion',
    },
  },
  swiss_editorial: {
    name: 'Swiss Grid Architecture',
    icon: '📐',
    data: {
      title: 'Grid Systems in Graphic Design',
      subtitle: 'A Visual Communication Manual for Graphic Designers, Typographers and Three-Dimensional Designers',
      author: 'Josef Müller-Brockmann',
      publisher: 'Arthur Niggli Ltd.',
      pubPlace: 'Zürich & Teufen',
      date: '1981',
      isbn: '978-3-7212-0145-2',
      series: 'Visual Communication Library',
      volume: 'BAND 03',
      taglineQuote: 'The use of the grid system implies the will to systematize, to clarify, to penetrate to the essentials.',
      genre: 'Design & Architecture',
      layout: 'swiss_modernist',
      coverArtUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
      portraitTreatment: 'high_contrast',
      cropShape: 'full_bleed',
    },
  },
  classical_antiquity: {
    name: 'Graeco-Roman Antiquity',
    icon: '🏛️',
    data: {
      title: 'MEDITATIONS',
      subtitle: 'The Emperor’s Private Philosophy on the Stoic Life',
      author: 'Marcus Aurelius Antoninus',
      publisher: 'Officina Aldina',
      pubPlace: 'Venice & Rome',
      date: '167 AD',
      isbn: '978-0-19-957330-1',
      series: 'Monumenta Philosophiae Antiquae',
      volume: 'LIBER XII',
      taglineQuote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
      genre: 'Philosophy',
      layout: 'classical_graeco_roman',
      coverArtUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
      portraitTreatment: 'etching',
      foilEffect: 'gold',
    },
  },
};

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  currentMetadata,
  currentPortrait,
  currentTheme,
  onApplyJsonData,
  onShowNotice,
}) => {
  const [jsonString, setJsonString] = useState<string>('');
  const [parsedData, setParsedData] = useState<CustomBookJsonPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Initialize with sample on first load
  useEffect(() => {
    if (isOpen && !jsonString) {
      // Default to the constructivist sci-fi or current book data
      const currentAsJson: CustomBookJsonPayload = {
        title: currentMetadata.title,
        subtitle: currentMetadata.subtitle,
        author: currentMetadata.author,
        publisher: currentMetadata.publisher,
        pubPlace: currentMetadata.pubPlace,
        date: currentMetadata.date,
        isbn: currentMetadata.isbn,
        series: currentMetadata.series,
        volume: currentMetadata.volume,
        taglineQuote: currentMetadata.taglineQuote,
        genre: currentMetadata.genre,
        coverArtUrl: currentPortrait.url,
        layout: currentTheme.archetypeId,
        foilEffect: currentTheme.foilEffect,
      };
      setJsonString(JSON.stringify(currentAsJson, null, 2));
    }
  }, [isOpen]);

  // Live validation on JSON string changes
  useEffect(() => {
    if (!jsonString.trim()) {
      setParsedData(null);
      setParseError(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setParseError('JSON must be an object with key-value pairs (e.g. { "title": "..." })');
        setParsedData(null);
      } else {
        setParsedData(parsed);
        setParseError(null);
        setImagePreviewError(false);
      }
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON syntax');
      setParsedData(null);
    }
  }, [jsonString]);

  if (!isOpen) return null;

  // Extracted cover graphic URL (supporting multiple alias keys)
  const extractedCoverUrl =
    parsedData?.coverArtUrl ||
    parsedData?.imageUrl ||
    parsedData?.graphicUrl ||
    parsedData?.portraitUrl ||
    '';

  const handleApplyTemplate = (key: string) => {
    const template = SAMPLE_TEMPLATES[key];
    if (template) {
      setJsonString(JSON.stringify(template.data, null, 2));
      setActiveTab('editor');
    }
  };

  const handleExportCurrent = () => {
    const currentJson: CustomBookJsonPayload = {
      title: currentMetadata.title,
      subtitle: currentMetadata.subtitle,
      author: currentMetadata.author,
      editor: currentMetadata.editor,
      translator: currentMetadata.translator,
      publisher: currentMetadata.publisher,
      pubPlace: currentMetadata.pubPlace,
      date: currentMetadata.date,
      isbn: currentMetadata.isbn,
      series: currentMetadata.series,
      volume: currentMetadata.volume,
      taglineQuote: currentMetadata.taglineQuote,
      genre: currentMetadata.genre,
      coverArtUrl: currentPortrait.url,
      portraitTreatment: currentPortrait.treatment,
      cropShape: currentPortrait.cropShape,
      layout: currentTheme.archetypeId,
      paletteId: currentTheme.palette.id,
      foilEffect: currentTheme.foilEffect,
    };
    setJsonString(JSON.stringify(currentJson, null, 2));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonString(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    if (onShowNotice) onShowNotice('Copied JSON to clipboard');
  };

  const handleGenerateCover = () => {
    if (!parsedData) return;

    // Normalizing metadata
    const newMetadata: BookMetadata = {
      title: parsedData.title || currentMetadata.title || 'Untitled Book',
      subtitle: parsedData.subtitle !== undefined ? parsedData.subtitle : currentMetadata.subtitle,
      author: parsedData.author || currentMetadata.author || 'Author Name',
      editor: parsedData.editor || currentMetadata.editor,
      translator: parsedData.translator || currentMetadata.translator,
      publisher: parsedData.publisher || currentMetadata.publisher || 'Publishing House',
      pubPlace: parsedData.pubPlace || currentMetadata.pubPlace,
      date: parsedData.date ? String(parsedData.date) : currentMetadata.date || '2026',
      isbn: parsedData.isbn || currentMetadata.isbn,
      series: parsedData.series || currentMetadata.series,
      volume: parsedData.volume || currentMetadata.volume,
      taglineQuote: parsedData.taglineQuote || currentMetadata.taglineQuote,
      genre: parsedData.genre || currentMetadata.genre,
      editionNotice: parsedData.editionNotice || currentMetadata.editionNotice,
      language: parsedData.language || currentMetadata.language,
      rawTei: currentMetadata.rawTei,
    };

    // Normalizing portrait / cover art config
    const targetCoverUrl = extractedCoverUrl || currentPortrait.url;
    const newPortrait: AuthorPortraitConfig = {
      ...currentPortrait,
      url: targetCoverUrl,
      title: parsedData.author || parsedData.title || currentPortrait.title,
      source: 'upload',
      treatment: parsedData.portraitTreatment || currentPortrait.treatment,
      cropShape: parsedData.cropShape || currentPortrait.cropShape,
    };

    // Resolving Layout Archetype
    let targetArchetypeId: LayoutArchetypeId = currentTheme.archetypeId;
    const rawLayout = (parsedData.layout || parsedData.archetypeId || '').toLowerCase().trim();
    if (rawLayout) {
      const found = LAYOUT_ARCHETYPES.find(
        (a) =>
          a.id.toLowerCase() === rawLayout ||
          a.name.toLowerCase().includes(rawLayout) ||
          rawLayout.includes(a.id.replace('_', ''))
      );
      if (found) {
        targetArchetypeId = found.id;
      } else if (rawLayout.includes('faber') || rawLayout.includes('poetry')) {
        targetArchetypeId = 'faber_poetry';
      } else if (rawLayout.includes('constructivist') || rawLayout.includes('bauhaus')) {
        targetArchetypeId = 'constructivist';
      } else if (rawLayout.includes('swiss') || rawLayout.includes('grid')) {
        targetArchetypeId = 'swiss_modernist';
      } else if (rawLayout.includes('roman') || rawLayout.includes('graeco') || rawLayout.includes('classical')) {
        targetArchetypeId = 'classical_graeco_roman';
      } else if (rawLayout.includes('folio') || rawLayout.includes('heritage')) {
        targetArchetypeId = 'folio_heritage';
      } else if (rawLayout.includes('woodcut') || rawLayout.includes('broadside')) {
        targetArchetypeId = 'woodcut_broadside';
      } else if (rawLayout.includes('cinematic') || rawLayout.includes('bleed')) {
        targetArchetypeId = 'cinematic_bleed';
      }
    }

    // Resolving Palette
    const themeUpdates: Partial<CoverThemeConfig> = {};
    if (targetArchetypeId !== currentTheme.archetypeId) {
      themeUpdates.archetypeId = targetArchetypeId;
      const archMeta = LAYOUT_ARCHETYPES.find((a) => a.id === targetArchetypeId);
      if (archMeta) {
        themeUpdates.fontTitle = archMeta.defaultFont;
        const suggestedPalette = COLOR_PALETTES.find((p) => p.id === archMeta.suggestedPaletteId);
        if (suggestedPalette) {
          themeUpdates.palette = suggestedPalette;
        }
      }
    }

    if (parsedData.paletteId) {
      const specifiedPalette = COLOR_PALETTES.find((p) => p.id === parsedData.paletteId);
      if (specifiedPalette) {
        themeUpdates.palette = specifiedPalette;
      }
    }

    if (parsedData.foilEffect) {
      themeUpdates.foilEffect = parsedData.foilEffect;
    }

    onApplyJsonData({
      metadata: newMetadata,
      portrait: newPortrait,
      themeUpdates,
    });

    if (onShowNotice) {
      onShowNotice(`Generated cover from JSON: "${newMetadata.title}"`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-4xl max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <Braces className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">
                Custom JSON Book & Graphic Importer
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Paste your book metadata JSON and cover art graphic URL to generate an authentic cover.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="bg-stone-100/90 border-b border-stone-200/80 px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 font-medium shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Load Preset:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {Object.entries(SAMPLE_TEMPLATES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => handleApplyTemplate(key)}
                className="px-2.5 py-1 text-xs bg-white hover:bg-amber-50 hover:text-amber-900 border border-stone-300 rounded-md transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}

            <button
              onClick={handleExportCurrent}
              className="px-2.5 py-1 text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md transition-all font-mono"
            >
              Current Book JSON
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="cursor-pointer px-2.5 py-1 text-xs bg-white hover:bg-stone-50 border border-stone-300 rounded-md transition-all flex items-center gap-1 text-stone-700 shadow-2xs">
              <Upload className="w-3 h-3 text-stone-500" />
              <span>Upload .json</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Code Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold uppercase text-stone-700 flex items-center gap-1.5">
                <Braces className="w-3.5 h-3.5 text-amber-700" />
                Book Data JSON Structure
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 px-2 py-0.5 rounded-sm hover:bg-stone-200 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative flex-1 min-h-[300px] flex flex-col">
              <textarea
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
                placeholder='{\n  "title": "Book Title",\n  "author": "Author Name",\n  "coverArtUrl": "https://..."\n}'
                className="w-full flex-1 min-h-[320px] p-4 bg-stone-900 text-stone-100 font-mono text-xs rounded-lg border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-none shadow-inner"
                spellCheck={false}
              />

              {/* Status Banner */}
              <div className="mt-2">
                {parseError ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">JSON Syntax Error:</span>
                      <span className="font-mono text-[11px]">{parseError}</span>
                    </div>
                  </div>
                ) : parsedData ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Valid JSON: <strong className="font-serif">"{parsedData.title || 'Untitled'}"</strong> by{' '}
                        <strong>{parsedData.author || 'Unknown'}</strong>
                      </span>
                    </div>
                    {extractedCoverUrl && (
                      <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                        Graphic Linked
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column: Live Data & Cover Graphic Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-xs font-mono font-semibold uppercase text-stone-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              Parsed Fields & Graphic Check
            </span>

            {/* Cover Graphic Image Preview Box */}
            <div className="bg-white border border-stone-300 rounded-lg p-3 shadow-xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                  Cover Art Graphic URL
                </span>
                {extractedCoverUrl ? (
                  <span className="text-[10px] text-emerald-600 font-medium font-mono">Found in JSON</span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-medium font-mono">Missing URL</span>
                )}
              </div>

              {extractedCoverUrl ? (
                <div className="relative w-full h-44 rounded-md overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                  {!imagePreviewError ? (
                    <img
                      src={extractedCoverUrl}
                      alt="Cover Art Preview"
                      referrerPolicy="no-referrer"
                      onError={() => setImagePreviewError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-3 text-stone-400">
                      <AlertCircle className="w-6 h-6 text-amber-500 mb-1" />
                      <span className="text-xs text-stone-600 font-medium">Image preview failed</span>
                      <span className="text-[10px] text-stone-400 mt-1 max-w-[200px] truncate font-mono">
                        {extractedCoverUrl}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    Preview
                  </div>
                </div>
              ) : (
                <div className="w-full h-36 rounded-md border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center text-center p-3 text-stone-400">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-xs font-medium text-stone-500">No coverArtUrl specified in JSON</span>
                  <span className="text-[10px] text-stone-400 mt-1 max-w-[220px]">
                    Add <code>"coverArtUrl": "https://..."</code> to provide custom cover artwork or portrait.
                  </span>
                </div>
              )}
            </div>

            {/* Parsed Fields Summary */}
            <div className="bg-white border border-stone-300 rounded-lg p-3.5 shadow-xs flex-1 text-xs">
              <div className="font-semibold text-stone-800 mb-2 border-b border-stone-100 pb-1.5">
                Summary of Detected Attributes:
              </div>

              <div className="space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span className="font-mono text-stone-400">Title:</span>
                  <span className="font-bold text-stone-900 truncate max-w-[65%] text-right font-serif">
                    {parsedData?.title || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-stone-400">Author:</span>
                  <span className="font-medium text-stone-800 truncate max-w-[65%] text-right">
                    {parsedData?.author || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-stone-400">Publisher:</span>
                  <span className="truncate max-w-[65%] text-right">
                    {parsedData?.publisher || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-stone-400">Date/Year:</span>
                  <span className="font-mono">{parsedData?.date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-stone-400">Series:</span>
                  <span className="truncate max-w-[65%] text-right">{parsedData?.series || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-stone-400">Layout Archetype:</span>
                  <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                    {parsedData?.layout || currentTheme.archetypeId}
                  </span>
                </div>
                {parsedData?.taglineQuote && (
                  <div className="pt-1.5 border-t border-stone-100">
                    <span className="font-mono text-stone-400 block text-[10px] mb-0.5">Quote / Epigraph:</span>
                    <p className="italic font-serif text-[11px] text-stone-700 line-clamp-2">
                      “{parsedData.taglineQuote}”
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="text-[11px] text-stone-500 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-lg flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Tip: You can use any direct image link from Unsplash, Wikimedia Commons, or your own image host for{' '}
                <code>coverArtUrl</code>.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerateCover}
            disabled={!parsedData || !!parseError}
            className="px-5 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            <span>Generate Book Cover</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
