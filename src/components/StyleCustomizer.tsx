import React, { useState } from 'react';
import { CoverThemeConfig, ColorPalette } from '../types';
import { COLOR_PALETTES } from '../utils/themePresets';
import { PublisherMark } from './BookDecorations';
import { Palette, Type, Stamp, Shield, Check, BookOpen, Sparkles, SunMedium, QrCode, Dices } from 'lucide-react';
import { pickSurprisePalette, SurpriseResult } from '../utils/genrePalettePicker';
import { QrLogoCustomizer } from './QrLogoCustomizer';

interface StyleCustomizerProps {
  theme: CoverThemeConfig;
  onChange: (updated: CoverThemeConfig) => void;
  genre?: string;
}

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({ theme, onChange, genre }) => {
  const [lastSurprise, setLastSurprise] = useState<SurpriseResult | null>(null);

  const handleSurpriseMe = () => {
    const result = pickSurprisePalette(genre, theme.palette.id);
    onChange({
      ...theme,
      palette: result.palette,
    });
    setLastSurprise(result);
  };

  const hardcover = theme.hardcover || {
    enabled: true,
    spineVisible: true,
    spineWidthPx: 12,
    textureStyle: 'buckram_cloth',
    sheenIntensity: 0.35,
    creaseDepth: 0.65,
    showPageEdge: true,
  };

  const updateHardcover = (partial: Partial<typeof hardcover>) => {
    onChange({
      ...theme,
      hardcover: {
        ...hardcover,
        ...partial,
      },
    });
  };
  const fontFamilies = [
    { id: 'Cormorant Garamond', label: 'Cormorant Garamond (Classical Serif)' },
    { id: 'Cinzel', label: 'Cinzel (Roman Majuscule)' },
    { id: 'Bodoni Moda', label: 'Bodoni Moda (Didone High-Contrast)' },
    { id: 'Newsreader', label: 'Newsreader (Literary Editorial)' },
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modernist Geometric)' },
  ];

  const publisherStyles: Array<'oxford' | 'folio' | 'classical_owl' | 'penguin' | 'urn' | 'monogram'> = [
    'oxford',
    'folio',
    'classical_owl',
    'penguin',
    'urn',
    'monogram',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Color Palettes */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
            <Palette className="w-3.5 h-3.5 text-amber-700" />
            <span>Historical & Curatorial Color Palettes</span>
          </div>

          <button
            type="button"
            onClick={handleSurpriseMe}
            className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/90 rounded-md flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto"
            title={`Randomly pick a high-contrast palette tailored for ${genre || 'this book genre'}`}
          >
            <Dices className="w-3.5 h-3.5 text-amber-700" />
            <span>Surprise Me</span>
            {genre && (
              <span className="text-[10px] text-amber-800/80 font-mono hidden sm:inline">
                ({genre.split(',')[0].trim()})
              </span>
            )}
          </button>
        </div>

        {/* Surprise feedback card */}
        {lastSurprise && (
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200/90 rounded-lg text-xs flex items-start justify-between gap-2 shadow-2xs animate-fadeIn">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900">
                    Surprise Pick: {lastSurprise.palette.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    {lastSurprise.contrastRatio}:1 Contrast
                  </span>
                  <span className="text-[9.5px] font-mono text-stone-500 uppercase tracking-wider">
                    Genre: {lastSurprise.genreCategory}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                  {lastSurprise.reason}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLastSurprise(null)}
              className="text-stone-400 hover:text-stone-600 text-sm leading-none p-0.5"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLOR_PALETTES.map((p) => {
            const isSelected = theme.palette.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ...theme, palette: p })}
                className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-xs bg-white'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center gap-1 mb-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: p.bg }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: p.accent }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: p.primary }}
                  />
                  {isSelected && <Check className="w-3 h-3 ml-auto text-amber-700" />}
                </div>
                <span className="text-[11px] font-medium text-stone-800 line-clamp-1">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Typography Pairings */}
      <div className="pt-2 border-t border-stone-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 mb-2">
          <Type className="w-3.5 h-3.5 text-amber-700" />
          <span>Title & Author Typography</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-stone-600 block mb-1">
              Title Font Family
            </label>
            <select
              value={theme.fontTitle}
              onChange={(e) =>
                onChange({ ...theme, fontTitle: e.target.value as any })
              }
              className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
            >
              {fontFamilies.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-stone-600 block mb-1">
              Author Byline Font
            </label>
            <select
              value={theme.fontAuthor}
              onChange={(e) =>
                onChange({ ...theme, fontAuthor: e.target.value as any })
              }
              className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
            >
              {fontFamilies.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hot-Stamped Gold & Silver Foil Effect */}
        <div className="mt-3.5 p-3 bg-amber-50/40 border border-amber-200/80 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Metallic Foil Title Shimmer</span>
            </div>
            <span className="text-[10px] text-amber-800/80 font-medium">
              Hot-stamped deboss for dark covers
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              {
                id: 'none',
                label: 'Standard',
                sub: 'Cover Palette',
                bg: 'bg-stone-100 text-stone-700',
              },
              {
                id: 'gold',
                label: 'Gold Foil',
                sub: '24K Luminous',
                gradient: 'from-amber-200 via-amber-400 to-yellow-600',
                textClass: 'text-amber-950 font-bold',
              },
              {
                id: 'silver',
                label: 'Silver Foil',
                sub: 'Platinum Sheen',
                gradient: 'from-slate-100 via-slate-300 to-zinc-500',
                textClass: 'text-slate-900 font-bold',
              },
              {
                id: 'rose_gold',
                label: 'Rose Gold',
                sub: 'Warm Antique',
                gradient: 'from-rose-100 via-rose-300 to-amber-700',
                textClass: 'text-rose-950 font-bold',
              },
            ].map((f) => {
              const active = (theme.foilEffect || 'none') === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ ...theme, foilEffect: f.id as any })}
                  className={`p-2 rounded-md border text-left transition-all ${
                    active
                      ? 'border-amber-600 ring-2 ring-amber-500/30 shadow-xs bg-white'
                      : 'border-stone-200 hover:border-stone-300 bg-white/70'
                  }`}
                >
                  {f.gradient ? (
                    <div className={`h-2.5 w-full rounded-xs bg-gradient-to-r ${f.gradient} mb-1.5 shadow-2xs border border-black/10`} />
                  ) : (
                    <div className="h-2.5 w-full rounded-xs bg-stone-300 mb-1.5 opacity-60" />
                  )}
                  <div className="text-[11px] font-medium text-stone-900 leading-tight">
                    {f.label}
                  </div>
                  <div className="text-[9px] text-stone-500 truncate mt-0.5">
                    {f.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Publisher Mark & Colophon Stamps */}
      <div className="pt-2 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
            <Stamp className="w-3.5 h-3.5 text-amber-700" />
            <span>Publisher Colophon Emblem</span>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showPublisherMark}
              onChange={(e) =>
                onChange({ ...theme, showPublisherMark: e.target.checked })
              }
              className="rounded-xs text-amber-700"
            />
            <span>Show on Cover</span>
          </label>
        </div>

        {theme.showPublisherMark && (
          <div className="grid grid-cols-6 gap-2">
            {publisherStyles.map((style) => {
              const isSelected = theme.publisherMarkStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChange({ ...theme, publisherMarkStyle: style })}
                  className={`p-2 rounded-md border flex flex-col items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <PublisherMark style={style} color="#78350F" size={22} />
                  <span className="text-[9px] uppercase tracking-wider text-stone-600 mt-1 capitalize font-mono">
                    {style.replace('classical_', '')}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dust Jacket Back Cover QR Code Toggle */}
        <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-xs font-medium text-stone-800">
                Dust Jacket Scannable QR Code
              </span>
            </div>
            <span className="text-[10px] text-stone-500 block">
              Generates a scannable QR code on the back cover linking to eBook & scholarly metadata
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showQrCode ?? true}
              onChange={(e) => onChange({ ...theme, showQrCode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-700" />
          </label>
        </div>

        {/* Centered Publisher Logo Customizer */}
        {(theme.showQrCode ?? true) && (
          <div className="mt-2.5">
            <QrLogoCustomizer
              theme={theme}
              onChange={onChange}
              previewUrl={theme.qrCodeUrl || 'https://www.gutenberg.org'}
            />
          </div>
        )}
      </div>

      {/* Cinematic Bleed Photo Exposure & Scrim Control */}
      <div className="pt-2 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
            <SunMedium className="w-3.5 h-3.5 text-amber-700" />
            <span>Cinematic Bleed Photo Exposure & Scrim</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono">
            {theme.archetypeId === 'cinematic_bleed' ? 'Active Layout' : 'Cinematic Bleed'}
          </span>
        </div>

        <p className="text-[11px] text-stone-600 mb-2.5">
          Controls the darkening gradient over full-bleed author photographs. Preserves clear, unblackened illumination across faces and eyes while ensuring text readability.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'vibrant',
              label: 'Radiant (Luminous)',
              desc: 'Minimal scrim. Maximum face illumination & bright natural portrait tones.',
            },
            {
              id: 'balanced',
              label: 'Cinema (Balanced)',
              desc: 'Clear face with feathered bottom gradient for high contrast title legibility.',
            },
            {
              id: 'moody',
              label: 'Moody (Film Noir)',
              desc: 'Deep shadows and dramatic chiaroscuro for moody, atmospheric portraits.',
            },
          ].map((mode) => {
            const isSelected = (theme.cinematicScrim || 'balanced') === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange({ ...theme, cinematicScrim: mode.id as any })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-500/30'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold text-stone-900 mb-0.5">
                  {mode.label}
                </div>
                <div className="text-[9px] text-stone-500 leading-tight">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Apple Books Hardcover & Visible Spine Effect ("Cotorul cărții vizibil") */}
      <div className="pt-2 border-t border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Hardcover & Spine Effect (Apple Books Style)</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hardcover.enabled}
              onChange={(e) => updateHardcover({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-700" />
            <span className="ml-2 text-xs font-medium text-stone-700">
              {hardcover.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {hardcover.enabled && (
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-3.5">
            {/* Spine & Hinge Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-stone-900">
                  Visible Spine Edge (Cotorul Cărții)
                </div>
                <div className="text-[10px] text-stone-500">
                  Cylindrical rounded left binding with realistic hinge crease groove
                </div>
              </div>

              <input
                type="checkbox"
                checked={hardcover.spineVisible}
                onChange={(e) => updateHardcover({ spineVisible: e.target.checked })}
                className="rounded-xs text-amber-700 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Material Texture Options */}
            <div>
              <label className="text-[11px] text-stone-600 block mb-1.5 font-medium">
                Hardcover Material Texture
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'buckram_cloth', label: 'Buckram Cloth' },
                  { id: 'fine_linen', label: 'Fine Linen' },
                  { id: 'leather_grain', label: 'Leather Grain' },
                  { id: 'antique_board', label: 'Archival Board' },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => updateHardcover({ textureStyle: mat.id as any })}
                    className={`px-2 py-1.5 text-[11px] rounded-md text-center transition-colors ${
                      hardcover.textureStyle === mat.id
                        ? 'bg-amber-900 text-white font-medium shadow-2xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {mat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Spine Width & Crease Shadow Depth & Cylindrical Sheen Intensity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Spine Width (Cotor)</span>
                  <span>{hardcover.spineWidthPx}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="40"
                  step="1"
                  value={hardcover.spineWidthPx}
                  onChange={(e) => updateHardcover({ spineWidthPx: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Hinge Shade Depth</span>
                  <span>{Math.round((hardcover.creaseDepth ?? 0.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={hardcover.creaseDepth ?? 0.5}
                  onChange={(e) => updateHardcover({ creaseDepth: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Sheen Highlight</span>
                  <span>{Math.round(hardcover.sheenIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={hardcover.sheenIntensity}
                  onChange={(e) => updateHardcover({ sheenIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                />
              </div>
            </div>

            {/* Embossed Title Foil Stamping Checkbox */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200/80">
              <div>
                <span className="text-[11px] font-medium text-stone-800 block">
                  Embossed Title (Ștanțare Cotor)
                </span>
                <span className="text-[9px] text-stone-500 block">
                  Hot-foil deboss shadow & expanded letter spacing on spine
                </span>
              </div>
              <input
                type="checkbox"
                checked={hardcover.embossedTitle ?? true}
                onChange={(e) => updateHardcover({ embossedTitle: e.target.checked })}
                className="rounded-xs text-amber-700 w-3.5 h-3.5 cursor-pointer accent-amber-700"
              />
            </div>

            {/* Page Block Trim Checkbox */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200/80">
              <span className="text-[11px] text-stone-700">
                Show Right Edge Paper Thickness (Cantul paginilor)
              </span>
              <input
                type="checkbox"
                checked={hardcover.showPageEdge}
                onChange={(e) => updateHardcover({ showPageEdge: e.target.checked })}
                className="rounded-xs text-amber-700 w-3.5 h-3.5 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Aspect Ratio & Dimensions */}
      <div className="pt-2 border-t border-stone-200">
        <label className="text-[11px] font-semibold text-stone-900 block mb-2">
          eBook / Print Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'kdp_1_6', label: 'Amazon Kindle / EPUB (1:1.6)', sub: '1600 × 2560 px' },
            { id: 'standard_3_4', label: 'Standard Tablet (3:4)', sub: '1800 × 2400 px' },
            { id: 'print_6_9', label: 'Trade Paperback (6" × 9")', sub: '1800 × 2700 px' },
          ].map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => onChange({ ...theme, coverAspectRatio: ar.id as any })}
              className={`p-2 rounded-md border text-left transition-colors ${
                theme.coverAspectRatio === ar.id
                  ? 'border-amber-600 bg-amber-50/40 text-stone-900'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}
            >
              <div className="text-[11px] font-medium leading-tight">{ar.label}</div>
              <div className="text-[9px] font-mono opacity-70 mt-0.5">{ar.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
