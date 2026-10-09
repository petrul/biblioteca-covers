import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../../types';
import { PortraitCanvas } from '../PortraitCanvas';
import { PublisherMark } from '../BookDecorations';
import { getFoilTitleStyle } from '../foilStyles';

interface LayoutProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const AdventurePulp: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden text-stone-100"
      style={{ backgroundColor: palette.bg || '#1E2522' }}
    >
      {/* ================= BACKGROUND GRAPHIC ART: EXPEDITION VOYAGE & FIELD TOPOGRAPHY ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Full-bleed Portrait with Natural / Authentic Detail or optional vintage filter */}
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            borderStyle: 'none',
            treatment: portrait.applyVintageFilter ? (portrait.treatment === 'natural' ? 'sepia' : portrait.treatment) : 'natural',
            panY: portrait.panY !== 0 ? portrait.panY : -8,
          }}
          className="w-full h-full opacity-100 object-cover"
          shadow={false}
        />

        {/* Faint Nautical Topography Contour Lines Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#EAB308_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Brass Nautical Compass Rose Windrose Engraving in Background */}
        <div className="absolute top-10 right-4 w-32 h-32 opacity-25 pointer-events-none">
          <svg className="w-full h-full text-amber-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="45" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="35" strokeWidth="1" />
            <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="1.2" />
            <path d="M50 15 L53 47 L85 50 L53 53 L50 85 L47 53 L15 50 L47 47 Z" fill="none" strokeWidth="0.8" />
            <text x="50" y="14" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace">N</text>
            <text x="50" y="93" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace">S</text>
            <text x="91" y="52" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace">E</text>
            <text x="9" y="52" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace">W</text>
          </svg>
        </div>
      </div>

      {/* ================= TOP BAR: COLLECTION / SERIES HEADER & QUOTATION ================= */}
      <div className="relative z-10 flex flex-col gap-1.5 border-b border-amber-500/40 pb-2">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-semibold text-stone-100">
              {book.series || 'The Adventure Classics Collection'}
            </span>
          </div>
          <span className="text-stone-300 text-[8px] tracking-widest font-mono">
            {book.volume
              ? (/^vol\.?\s*/i.test(book.volume.trim()) ? book.volume.trim().toUpperCase() : `VOL. ${book.volume}`)
              : (book.date || 'EDITION')}
          </span>
        </div>

        {/* Evocative Epigraph Quotation at top of the book — completely open, with no card around */}
        {book.taglineQuote && (
          <div className="pt-0.5 text-center max-w-[94%] mx-auto">
            <p className="text-[11.5px] sm:text-xs italic text-amber-100 font-serif leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* ================= LOWER: TRANSLUCENT EXPEDITION SLATE WITH BRASS RIVETS ================= */}
      {/* Positioned in lower third to ensure author's eyes, nose, and face are completely visible */}
      <div className="relative z-10 mt-auto mb-2 pt-2">
        <div
          className="relative mx-auto max-w-[96%] p-4 sm:p-5 rounded-xs backdrop-blur-md transition-all shadow-[0_16px_36px_rgba(0,0,0,0.7)] border-2"
          style={{
            backgroundColor: 'rgba(16, 20, 18, 0.48)',
            borderColor: `${palette.accent || '#EAB308'}ee`,
          }}
        >
          {/* Authentic Brass Corner Rivets */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-xs" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-xs" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-xs" />
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-xs" />

          {/* Author Name */}
          <div
            className="text-xs sm:text-[13px] uppercase tracking-[0.25em] font-medium text-amber-200 mb-2 drop-shadow-sm"
            style={{ fontFamily: fontAuthor }}
          >
            {book.author || 'Author Name'}
          </div>

          {/* High Adventure Title with Impact (reduced 50%) */}
          <h1
            className="text-sm sm:text-base lg:text-lg font-black leading-snug tracking-tight text-white mb-1.5 text-balance drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, '#FFFEE8'),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] italic text-stone-200 font-serif leading-relaxed mt-1 max-w-[95%]">
            {book.subtitle || 'An Illustrated Adventure Edition'}
          </p>
        </div>
      </div>

      {/* ================= BOTTOM BAR: EXPEDITION PRESS COLOPHON ================= */}
      <div className="relative z-10 flex items-center justify-between text-stone-300 pt-3 border-t border-amber-500/40">
        <div className="flex items-center gap-2.5">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle || 'oxford'}
              color={palette.accent || '#EAB308'}
              size={22}
              className="opacity-95"
            />
          )}
          <div className="flex flex-col">
            <span
              className="text-[9.5px] uppercase tracking-[0.22em] font-medium text-amber-100"
              style={{ fontFamily: fontMeta }}
            >
              {book.publisher || 'Publishing House'}
            </span>
            <span className="text-[7.5px] tracking-widest text-stone-400 font-mono">
              {book.pubPlace || 'LONDON & VALPARAÍSO'}
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-[8px] tracking-wider text-amber-300/90">
          <span className="block font-semibold">{book.series || 'EXPEDITION PRESS'}</span>
          <span className="text-stone-400">{book.date || 'Est. 1888'}</span>
        </div>
      </div>
    </div>
  );
};
