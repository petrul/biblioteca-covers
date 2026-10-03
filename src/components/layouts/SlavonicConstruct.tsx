import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../../types';
import { PortraitCanvas } from '../PortraitCanvas';
import { PublisherMark } from '../BookDecorations';
import { getFoilTitleStyle } from '../../utils/foilStyles';

interface LayoutProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const SlavonicConstruct: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden text-stone-100"
      style={{ backgroundColor: palette.bg || '#181112' }}
    >
      {/* ================= BACKGROUND GRAPHIC ART: SLAVIC WOODCUT & CONSTRUCTIVIST RAYS ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Full-bleed Portrait with High Contrast Woodcut Treatment */}
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            borderStyle: 'none',
            treatment: 'high_contrast',
            panY: portrait.panY !== 0 ? portrait.panY : -8,
          }}
          className="w-full h-full opacity-80 object-cover"
          shadow={false}
        />

        {/* Dynamic Constructivist Diagonal Red Accent Slash */}
        <div className="absolute -top-20 -right-24 w-80 h-80 bg-red-700/30 transform rotate-45 pointer-events-none blur-xs" />

        {/* Heavy Slavic Dark Atmospheric Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140D0E] via-stone-950/45 to-stone-950/30 pointer-events-none" />

        {/* Authentic Slavic Folklore Knotwork Border (Left Vertical Braid) */}
        <div className="absolute top-0 bottom-0 left-2 w-3 opacity-30 pointer-events-none flex flex-col justify-around py-8">
          {[...Array(8)].map((_, i) => (
            <svg key={i} className="w-3 h-8 text-red-500" viewBox="0 0 12 32" fill="currentColor">
              <path d="M6 0L12 8L6 16L0 8Z M6 16L12 24L6 32L0 24Z" opacity="0.7" />
              <circle cx="6" cy="16" r="1.5" fill="#F59E0B" />
            </svg>
          ))}
        </div>
      </div>

      {/* ================= TOP HEADER: CYRILLIC LIGATURE DOCKET ================= */}
      <div className="relative z-10 flex flex-col pt-3">
        {/* Dual Cyrillic & Latin Series Header */}
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] font-mono text-stone-200 border-b border-red-700/40 pb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-red-400">
            <span className="w-2 h-2 rotate-45 bg-red-600 inline-block" />
            <span>{book.series || 'The Classics Collection'}</span>
          </div>
          <span className="text-amber-200/80">
            {book.volume ? `VOL. ${book.volume}` : (book.date ? `TOM. ${book.date.slice(-2)}` : 'TOM. 01')}
          </span>
        </div>

        {/* Top Epigraph Quotation — open on background, no card */}
        {book.taglineQuote && (
          <div className="pt-2 text-center max-w-[92%] mx-auto">
            <p className="text-[11.5px] italic text-amber-100 font-serif leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              «{book.taglineQuote.replace(/^["“«]|["”»]$/g, '')}»
            </p>
          </div>
        )}
      </div>

      {/* ================= LOWER: TRANSLUCENT SMOKED OBSIDIAN SLAB WITH CRIMSON ACCENT ================= */}
      {/* Positioned in lower third to ensure author's eyes, nose, and face are completely visible */}
      <div className="relative z-10 mt-auto mb-2 pt-2">
        <div
          className="relative mx-auto max-w-[96%] p-4 sm:p-5 rounded-xs backdrop-blur-md transition-all shadow-[0_16px_36px_rgba(0,0,0,0.65)] border-l-4 border-t border-b border-r"
          style={{
            backgroundColor: 'rgba(16, 12, 13, 0.48)',
            borderLeftColor: palette.primary || '#DC2626',
            borderTopColor: 'rgba(255, 255, 255, 0.2)',
            borderBottomColor: 'rgba(255, 255, 255, 0.2)',
            borderRightColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Author Name */}
          <div
            className="text-xs sm:text-[13px] uppercase tracking-[0.28em] font-medium text-amber-200/95 mb-2 drop-shadow-sm"
            style={{ fontFamily: fontAuthor }}
          >
            {book.author || 'Author Name'}
          </div>

          {/* Bold Monumental Title (reduced 50%) */}
          <h1
            className="text-sm sm:text-base lg:text-lg font-normal leading-snug tracking-tight text-white mb-1.5 text-balance drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, '#FFFDF8'),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] italic text-stone-300 font-serif leading-relaxed mt-1 max-w-[95%]">
            {book.subtitle || 'Scholarly Critical Edition'}
          </p>
        </div>
      </div>

      {/* ================= BOTTOM BAR: SLAVIC PRESS COLOPHON & STAR ORNAMENT ================= */}
      <div className="relative z-10 flex items-center justify-between text-stone-300 pt-3 border-t border-red-700/40">
        <div className="flex items-center gap-2.5">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle || 'monogram'}
              color={palette.accent || '#F59E0B'}
              size={22}
              className="opacity-95"
            />
          )}
          <div className="flex flex-col">
            <span
              className="text-[9.5px] uppercase tracking-[0.2em] font-medium text-stone-100"
              style={{ fontFamily: fontMeta }}
            >
              {book.publisher || 'Publishing House'}
            </span>
            <span className="text-[7.5px] tracking-widest text-red-300/80 font-mono">
              {book.pubPlace || 'PRAHA • KRAKÓW • KYIV'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slavic 8-pointed Star Rosette */}
          <svg className="w-5 h-5 text-amber-400 opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14 8L22 6L16 12L22 18L14 16L12 24L10 16L2 18L8 12L2 6L10 8Z" />
          </svg>
          <div className="text-right text-[8px] font-mono tracking-widest text-stone-400">
            <span>{book.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
