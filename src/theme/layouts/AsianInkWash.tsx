import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../../types';
import { PortraitCanvas } from '../PortraitCanvas';
import { PublisherMark } from '../BookDecorations';
import { getFoilTitleStyle } from '../foilStyles';
import { getTitleScaleStyle, getAuthorScaleStyle } from '../typographyScale';

interface LayoutProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const AsianInkWash: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  // Clean volume specification without duplicated "VOL."
  const formatVolume = (vol?: string) => {
    if (!vol) return 'VOL. I';
    const trimmed = vol.trim();
    if (/^vol(\.|\b)/i.test(trimmed) || /^volume\b/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
    return `VOL. ${trimmed.toUpperCase()}`;
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden text-stone-100"
      style={{ backgroundColor: palette.bg || '#15181C' }}
    >
      {/* ================= BACKGROUND GRAPHIC ART: SUMI-E INK WASH & MIST ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Full-bleed Portrait with Natural / Authentic Detail */}
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            borderStyle: 'none',
            treatment: portrait.treatment,
            panY: portrait.panY !== 0 ? portrait.panY : -8,
          }}
          className="w-full h-full opacity-100 object-cover"
          shadow={false}
        />

        {/* Traditional Watoji (Japanese 4-Hole Bookbinding) Visual Stitch Along Left Edge */}
        <div className="absolute top-0 bottom-0 left-2.5 w-4 pointer-events-none flex flex-col justify-around py-8 opacity-45">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-200/60 shadow-xs" />
              <div className="w-0.5 h-6 bg-amber-400/40 my-0.5" />
            </div>
          ))}
        </div>

        {/* Subtle Japanese Wave (Seigaiha) Gold Motif in Background Corner */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-15 pointer-events-none">
          <svg className="w-full h-full text-amber-300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="50" cy="50" r="40" />
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="20" />
            <circle cx="50" cy="50" r="10" />
          </svg>
        </div>
      </div>

      {/* ================= TOP BAR: SERIES (TOP LEFT) & VOLUME SPECIFICATION (TOP RIGHT) ================= */}
      <div className="relative z-10 flex flex-col gap-1.5 pl-3 pr-2 pt-1">
        <div className="flex items-center justify-between w-full">
          {/* Top Left: Series Only */}
          <div className="bg-amber-100/90 text-stone-900 px-2.5 py-1 rounded-xs border border-amber-300/60 shadow-xs flex items-center gap-1.5">
            <span className="text-[9px] font-serif font-bold tracking-widest uppercase truncate max-w-[210px]">
              {book.series || 'Scriptorium Classique'}
            </span>
          </div>

          {/* Top Right: Volume Specification Aligned Right */}
          <div className="flex items-center gap-2">
            <div className="bg-stone-950/70 text-amber-200 px-2.5 py-1 rounded-xs border border-amber-400/30 backdrop-blur-xs shadow-xs">
              <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-semibold">
                {formatVolume(book.volume)}
              </span>
            </div>
            <div className="w-7 h-7 rounded-xs bg-[#B91C1C] border border-amber-300/70 shadow-md flex flex-col items-center justify-center p-0.5 select-none shrink-0">
              <span className="text-[10px] font-bold text-amber-100 leading-none">文</span>
              <span className="text-[6.5px] text-amber-200 leading-none">庫</span>
            </div>
          </div>
        </div>

        {/* Top Poetic Epigraph Quote — open on background, no card */}
        {book.taglineQuote && (
          <div className="pt-1.5 text-center max-w-[92%] mx-auto pr-2">
            <p className="text-[11px] italic text-amber-100/90 font-serif leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* ================= LOWER: TRANSLUCENT WASHI PAPER TITLE CARD ================= */}
      {/* Positioned in lower third to ensure author's eyes, nose, and face are completely visible */}
      <div className="relative z-10 mt-auto mb-2 pt-2 pl-3">
        <div
          className="relative mx-auto max-w-[96%] p-4 sm:p-5 rounded-xs backdrop-blur-xs transition-all shadow-[0_12px_28px_rgba(0,0,0,0.45)] border"
          style={{
            backgroundColor: 'rgba(14, 18, 22, 0.22)',
            borderColor: `${palette.accent || '#E2B357'}35`,
          }}
        >
          {/* Subtle Bamboo Leaf Accent */}
          <div className="flex justify-center mb-2 opacity-80">
            <svg className="w-6 h-5 text-amber-300" viewBox="0 0 24 20" fill="currentColor">
              <path d="M12 0C10 5 7 10 0 12C7 11 11 14 12 20C13 14 17 11 24 12C17 10 14 5 12 0Z" />
            </svg>
          </div>

          {/* Author Name */}
          <div
            data-cover-author="true"
            className="text-center text-xs sm:text-[13px] uppercase tracking-[0.35em] font-medium text-amber-200/90 mb-2"
            style={{
              fontFamily: fontAuthor,
              ...getAuthorScaleStyle(theme.authorFontSize, 0.85),
            }}
          >
            {book.author || 'Author Name'}
          </div>

          {/* Serene Poetic Title */}
          <h1
            data-cover-title="true"
            className="text-center text-sm sm:text-base lg:text-lg font-normal leading-snug tracking-[0.06em] text-white mb-1.5 text-balance"
            style={{
              fontFamily: fontTitle,
              ...getTitleScaleStyle(theme.titleFontSize, 1.15),
              ...getFoilTitleStyle(theme.foilEffect, '#FDFBF7'),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {/* Delicate Gold Interpunct & Hairline */}
          <div className="flex items-center justify-center my-3 gap-2 opacity-70">
            <span className="w-10 h-px bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-10 h-px bg-amber-400" />
          </div>

          {/* Subtitle */}
          <p className="text-center text-xs sm:text-[13px] italic text-stone-300 font-serif leading-relaxed max-w-[90%] mx-auto">
            {book.subtitle || 'Treasured Masterwork Edition'}
          </p>
        </div>
      </div>

      {/* ================= BOTTOM BAR: SILK ROAD COLOPHON ================= */}
      <div className="relative z-10 flex items-center justify-between text-stone-300 pt-3 border-t border-amber-400/30 pl-3">
        <div className="flex items-center gap-2.5">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle || 'urn'}
              color={palette.accent || '#E2B357'}
              size={22}
              className="opacity-95"
            />
          )}
          <div className="flex flex-col">
            <span
              className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-amber-100"
              style={{ fontFamily: fontMeta }}
            >
              {book.publisher || 'Ediții Scriptorium'}
            </span>
            <span className="text-[7.5px] tracking-widest text-stone-400 font-mono">
              {book.pubPlace || 'București'}
            </span>
          </div>
        </div>

        {/* Bottom Right: Date / Edition only (series removed to avoid repetition) */}
        <div className="text-right font-mono text-[8.5px] tracking-wider text-amber-200/80">
          <span className="text-stone-400">{book.date || 'EDITION'}</span>
        </div>
      </div>
    </div>
  );
};
