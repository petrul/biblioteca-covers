import React, { useState } from 'react';
import { AuthorPortraitConfig, PortraitTreatment, CropShape } from '../types';
import { searchAuthorPortraits, PortraitSearchResult } from '../utils/portraitSearch';
import { SAMPLE_BOOKS } from '../utils/sampleTei';
import { Search, Upload, RefreshCw, Sliders, Image as ImageIcon, Check, BookMarked } from 'lucide-react';
import { PortraitCanvas } from './PortraitCanvas';

interface AuthorPortraitPickerProps {
  authorName: string;
  portrait: AuthorPortraitConfig;
  onChange: (updated: AuthorPortraitConfig) => void;
  accentColor?: string;
}

export const AuthorPortraitPicker: React.FC<AuthorPortraitPickerProps> = ({
  authorName,
  portrait,
  onChange,
  accentColor = '#B45309',
}) => {
  const [searchQuery, setSearchQuery] = useState(authorName);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PortraitSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const results = await searchAuthorPortraits(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Portrait search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange({
          ...portrait,
          url: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          source: 'upload',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const treatments: { id: PortraitTreatment; label: string }[] = [
    { id: 'cartoon_pop', label: 'Cartoon & Comic' },
    { id: 'natural', label: 'Natural Color' },
    { id: 'etching', label: 'Vintage Etching' },
    { id: 'sepia', label: 'Parchment Sepia' },
    { id: 'monochrome', label: 'Charcoal B&W' },
    { id: 'high_contrast', label: 'Modernist Ink' },
    { id: 'duotone', label: 'Two-Tone Tint' },
  ];

  const shapes: { id: CropShape; label: string }[] = [
    { id: 'cloud_bubble', label: 'Storybook Cloud' },
    { id: 'circle_medallion', label: 'Circle Medallion' },
    { id: 'oval_cameo', label: 'Oval Cameo' },
    { id: 'arch', label: 'Roman Arch' },
    { id: 'square_frame', label: 'Square Frame' },
    { id: 'classic_shield', label: 'Shield' },
    { id: 'full_bleed', label: 'Full Bleed' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search author name (e.g. Mary Shelley, Franz Kafka)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-3.5 py-2 text-xs font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>Search Internet</span>
        </button>
      </form>

      {/* Curated Historical Author Portraits Tray */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span className="flex items-center gap-1.5 font-medium text-stone-800">
            <BookMarked className="w-3.5 h-3.5 text-amber-700" />
            <span>Curated Historical Author Portraits</span>
          </span>
          <span className="text-[10px] text-stone-500 font-mono">Museum Archival</span>
        </div>

        <div className="grid grid-cols-5 gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
          {SAMPLE_BOOKS.map((b) => {
            const isSelected = portrait.url === b.portrait.url;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange(b.portrait)}
                className={`relative group rounded-md overflow-hidden aspect-3/4 border-2 transition-all text-left flex flex-col justify-end p-1.5 ${
                  isSelected
                    ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-transparent hover:border-stone-400'
                }`}
              >
                <img
                  src={b.portrait.url}
                  alt={b.author}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="relative z-10 text-[10px] text-white font-medium line-clamp-1 leading-tight">
                  {b.author}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full p-0.5 shadow-sm z-20">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Online Portrait Results Gallery */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Historical Portraits from Wikipedia / Wikimedia ({searchResults.length})</span>
            <span className="text-[10px] text-stone-600 font-mono">1-click to select</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1.5 bg-stone-50 border border-stone-200 rounded-lg">
            {searchResults.map((item, idx) => {
              const isSelected = portrait.url === item.url;
              return (
                <div
                  key={idx}
                  onClick={() =>
                    onChange({
                      ...portrait,
                      url: item.url,
                      title: item.title,
                      source: item.source,
                    })
                  }
                  className={`group relative rounded-md overflow-hidden aspect-3/4 cursor-pointer border-2 transition-all ${
                    isSelected
                      ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                      : 'border-transparent hover:border-stone-400'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                    <span className="text-[10px] text-white line-clamp-1 leading-tight font-sans">
                      {item.title}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full p-0.5 shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasSearched && searchResults.length === 0 && !searching && (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-center text-xs text-stone-500">
          No portraits found for "{searchQuery}". You can try alternate spelling, or upload a custom image below.
        </div>
      )}

      {/* Currently Selected Portrait & Controls */}
      <div className="p-4 bg-white border border-stone-200 rounded-lg space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PortraitCanvas
              portrait={portrait}
              className="w-14 h-16 rounded-xs"
              borderColor={accentColor}
              accentColor={accentColor}
              shadow={false}
            />
            <div>
              <div className="text-xs font-semibold text-stone-900 line-clamp-1">
                {portrait.title || 'Selected Portrait'}
              </div>
              <div className="text-[10px] text-stone-600 capitalize">
                {portrait.treatment} · {portrait.cropShape.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-2.5 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md flex items-center gap-1.5 transition-colors">
              <Upload className="w-3 h-3" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowAdjustments(!showAdjustments)}
              className={`px-2.5 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
                showAdjustments
                  ? 'bg-amber-100 text-amber-900 font-medium'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Tune Effect</span>
            </button>
          </div>
        </div>

        {/* Detailed Fine-Tuning Controls */}
        {showAdjustments && (
          <div className="pt-4 border-t border-stone-100 space-y-4">
            {/* Treatment Selector */}
            <div>
              <label className="text-[11px] font-medium text-stone-700 block mb-1.5">
                Portrait Style / Photographic Filter
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {treatments.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange({ ...portrait, treatment: t.id })}
                    className={`px-2 py-1.5 text-[11px] rounded-md text-left transition-colors ${
                      portrait.treatment === t.id
                        ? 'bg-stone-900 text-white font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Framing */}
            <div>
              <label className="text-[11px] font-medium text-stone-700 block mb-1.5">
                Cameo Framing Shape
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {shapes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChange({ ...portrait, cropShape: s.id })}
                    className={`px-2 py-1.5 text-[11px] rounded-md text-left transition-colors ${
                      portrait.cropShape === s.id
                        ? 'bg-stone-900 text-white font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom & Positioning Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Zoom Scale</span>
                  <span>{portrait.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.05"
                  value={portrait.zoom}
                  onChange={(e) =>
                    onChange({ ...portrait, zoom: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Pan Vertical</span>
                  <span>{portrait.panY}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="2"
                  value={portrait.panY}
                  onChange={(e) =>
                    onChange({ ...portrait, panY: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Border Accent</span>
                  <span className="capitalize">{portrait.borderStyle.replace('_', ' ')}</span>
                </div>
                <select
                  value={portrait.borderStyle}
                  onChange={(e) =>
                    onChange({
                      ...portrait,
                      borderStyle: e.target.value as any,
                    })
                  }
                  className="w-full text-xs p-1 bg-stone-100 border border-stone-300 rounded-md"
                >
                  <option value="none">No Border</option>
                  <option value="thin_gold">Thin Gold Rim</option>
                  <option value="double_hairline">Double Hairline</option>
                  <option value="ornate_woodcut">Ornate Woodcut</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
