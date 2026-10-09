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

export const ClassicalGraecoRoman: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  // Roman Latinized author display with classical interpuncts
  const romanizedAuthor = book.author
    .toUpperCase()
    .split(' ')
    .join(' · ');

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden text-stone-100"
      style={{ backgroundColor: palette.bg || '#14171A' }}
    >
      {/* ================= BACKGROUND GRAPHIC ART: FULL BLEED WITH CLASSICAL MIST ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            borderStyle: 'none',
            panY: portrait.panY !== 0 ? portrait.panY : -8,
          }}
          className="w-full h-full opacity-100 object-cover"
          shadow={false}
        />

        {/* Classical Fluted Architectural Column Side Silhouettes (Left & Right Frieze) */}
        <div className="absolute top-0 bottom-0 left-2 w-3.5 opacity-25 pointer-events-none flex flex-col justify-between py-12">
          <div className="w-full h-2 border-b border-amber-300" />
          <div className="flex-1 border-x border-dashed border-amber-300 mx-1" />
          <div className="w-full h-2 border-t border-amber-300" />
        </div>
        <div className="absolute top-0 bottom-0 right-2 w-3.5 opacity-25 pointer-events-none flex flex-col justify-between py-12">
          <div className="w-full h-2 border-b border-amber-300" />
          <div className="flex-1 border-x border-dashed border-amber-300 mx-1" />
          <div className="w-full h-2 border-t border-amber-300" />
        </div>
      </div>

      {/* ================= TOP CLASSICAL HEADER ================= */}
      <div className="relative z-10 flex flex-col items-center pt-3">
        {/* Latin Rubrication Header */}
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] font-serif text-amber-200/90 font-medium">
          <span className="w-6 h-px bg-amber-400/40" />
          <span>{book.series || 'CLASSICA GRAECA ET LATINA'}</span>
          <span className="w-6 h-px bg-amber-400/40" />
        </div>

        {/* Series & Roman Docket */}
        <div className="text-[8px] uppercase tracking-[0.25em] text-stone-400 font-mono mt-0.5">
          {book.volume ? `TOMVS · ${book.volume}` : (book.date || 'S · P · Q · R · MONVMENTVM')}
        </div>

        {/* Top Classical Epigraph Quote — open on background, no card */}
        {book.taglineQuote && (
          <div className="pt-2 text-center max-w-[92%] mx-auto">
            <p className="text-[11.5px] italic text-amber-100/90 font-serif leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* ================= LOWER: TRANSLUCENT PARIAN MARBLE / VELLUM PLAQUE ================= */}
      {/* Positioned in lower third to ensure author's eyes, nose, and face are completely visible */}
      <div className="relative z-10 mt-auto mb-2 pt-2">
        <div
          className="relative mx-auto max-w-[96%] p-4 sm:p-5 rounded-xs backdrop-blur-xs transition-all shadow-[0_12px_28px_rgba(0,0,0,0.45)] border"
          style={{
            backgroundColor: 'rgba(10, 12, 16, 0.20)',
            borderColor: `${palette.accent || '#D4AF37'}35`,
          }}
        >
          {/* Classical Corner Accents */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400/80" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400/80" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400/80" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400/80" />

          {/* Roman Laurel Wreath Emblem */}
          <div className="flex justify-center mb-2">
            <svg className="w-7 h-7 text-amber-400/80" viewBox="0 0 36 36" fill="currentColor">
              <path d="M18 4C14 4 10 7 8 11C7 13 7 15 8 17C6 19 6 22 7 24C9 27 12 29 16 30V28C13 27 10 25 9 23C8 21 9 19 10 18C9 16 9 14 10 12C12 9 15 6 18 6V4Z" />
              <path d="M18 4C22 4 26 7 28 11C29 13 29 15 28 17C30 19 30 22 29 24C27 27 24 29 20 30V28C23 27 26 25 27 23C28 21 27 19 26 18C27 16 27 14 26 12C24 9 21 6 18 6V4Z" />
              <circle cx="18" cy="31" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Author Name in Classical Lapidary Lettering with Interpuncts */}
          <div
            className="text-center text-xs sm:text-[13px] uppercase tracking-[0.3em] font-medium mb-3 text-amber-200/90"
            style={{ fontFamily: fontAuthor }}
          >
            · {romanizedAuthor || 'AVCTOR'} ·
          </div>

          {/* Monumental Classical Title (reduced 50%) */}
          <h1
            className="text-center text-sm sm:text-base lg:text-lg font-normal uppercase leading-snug tracking-[0.08em] text-white text-balance drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, '#FAF7F2'),
            }}
          >
            {book.title || 'TITVLVS LIBRI'}
          </h1>

          {/* Classical Thin Hairline Divider */}
          <div className="flex items-center justify-center my-3 gap-2 opacity-60">
            <span className="w-8 h-px bg-amber-400" />
            <span className="w-1.5 h-1.5 rotate-45 border border-amber-300" />
            <span className="w-8 h-px bg-amber-400" />
          </div>

          {/* Subtitle / Translation Notes */}
          <p className="text-center text-xs italic text-stone-300 font-serif max-w-[90%] mx-auto leading-relaxed">
            {book.subtitle || 'Editiō Authentica Critica'}
          </p>
        </div>
      </div>

      {/* ================= BOTTOM CLASSICAL BASE & PUBLISHER COLOPHON ================= */}
      <div className="relative z-10 flex flex-col pt-2">
        {/* Greek Meander Frieze Lower Ribbon */}
        <div className="w-full max-w-[92%] mx-auto flex items-center justify-center gap-1 opacity-60 mb-2">
          <svg className="w-full h-2.5" viewBox="0 0 240 10" fill="none" preserveAspectRatio="repeat">
            <path
              d="M0 8H8V2H18V5H12V7H22V2H32V8H26V4H24M32 8H40V2H50V5H44V7H54V2H64V8H58V4H56M64 8H72V2H82V5H76V7H86V2H96V8H90V4H88M96 8H104V2H114V5H108V7H118V2H128V8H122V4H120M128 8H136V2H146V5H140V7H150V2H160V8H154V4H152M160 8H168V2H178V5H172V7H182V2H192V8H186V4H184M192 8H200V2H210V5H204V7H214V2H224V8H218V4H216M224 8H232V2H242V5H236V7H246V2H256V8H250V4H248"
              stroke={palette.accent || '#D4AF37'}
              strokeWidth="1.1"
              fill="none"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-stone-300 pt-2 border-t border-amber-400/30">
          <div className="flex items-center gap-2">
            {showPublisherMark && (
              <PublisherMark
                style={publisherMarkStyle || 'classical_owl'}
                color={palette.accent || '#D4AF37'}
                size={22}
                className="opacity-95"
              />
            )}
            <div className="flex flex-col">
              <span
                className="text-[9.5px] uppercase tracking-[0.22em] font-serif font-semibold text-amber-100"
                style={{ fontFamily: fontMeta }}
              >
                {book.publisher || 'Publishing House'}
              </span>
              <span className="text-[7.5px] tracking-widest text-stone-400 font-mono">
                {book.pubPlace || 'ATHENIS & ROMAE'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[8px] uppercase tracking-widest font-mono text-amber-200/80 block">
              {book.series || 'OPVS MONVMENTALE'}
            </span>
            <span className="text-[8px] tracking-widest text-stone-400 font-mono">
              {book.date || 'ANNO DOMINI'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
