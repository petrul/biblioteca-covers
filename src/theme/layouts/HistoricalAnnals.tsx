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

export const HistoricalAnnals: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden text-stone-100"
      style={{ backgroundColor: palette.bg || '#241E19' }}
    >
      {/* ================= BACKGROUND GRAPHIC ART: FULL ARCHIVAL PLATE ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Full Archival Engraving Plate */}
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            borderStyle: 'none',
            treatment: portrait.applyVintageFilter ? (portrait.treatment === 'natural' ? 'etching' : portrait.treatment) : 'natural',
            panY: portrait.panY !== 0 ? portrait.panY : 0,
          }}
          className="w-full h-full opacity-100 object-cover"
          shadow={false}
        />
        {/* Faint Antique Cartographic / Latitude Grid Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C28B53_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* ================= TOP BAR: ARCHIVAL ACCESSION NUMBER, CHRONICLE DOCKET & QUOTATION ================= */}
      <div className="relative z-10 flex flex-col gap-2 border-b border-amber-500/30 pb-2.5">
        <div className="flex items-center justify-between text-[8.5px] uppercase tracking-[0.25em] font-mono text-amber-200/90">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-amber-100">
              {book.series || 'ARCHIVUM HISTORICUM'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              {book.isbn
                ? book.isbn.slice(-4)
                : (book.volume
                  ? (/^vol\.?\s*/i.test(book.volume.trim()) ? book.volume.trim().toUpperCase() : `VOL. ${book.volume}`)
                  : '')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/50 text-[7.5px] text-amber-300">
              {book.editionNotice || 'CHRONICLE'}
            </span>
          </div>
        </div>

        {/* Top Historical Epigraph Quote — open on background, no card */}
        {book.taglineQuote && (
          <div className="pt-0.5 text-center max-w-[94%] mx-auto">
            <p className="text-[11.5px] italic text-amber-100/95 font-serif leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* ================= LOWER: TRANSLUCENT ARCHIVAL RECORD DOCKET ================= */}
      {/* Positioned in lower third to ensure author's eyes, nose, and face are completely visible */}
      <div className="relative z-10 mt-auto mb-2 pt-2">
        <div
          className="relative mx-auto max-w-[96%] p-4 sm:p-5 rounded-xs transition-all border-y-2 border-x"
          style={{
            backgroundColor: 'rgba(24, 18, 14, 0.25)',
            borderTopColor: palette.accent || '#DEB887',
            borderBottomColor: palette.accent || '#DEB887',
            borderLeftColor: `${palette.border || '#705844'}40`,
            borderRightColor: `${palette.border || '#705844'}40`,
          }}
        >
          {/* Author Name */}
          <div
            className="text-xs sm:text-sm uppercase tracking-[0.25em] font-medium text-amber-200 mb-2"
            style={{ fontFamily: fontAuthor }}
          >
            {book.author || 'Author Name'}
          </div>

          {/* Majestic Historical Chronicle Title (reduced 50%) */}
          <h1
            className="text-sm sm:text-base lg:text-lg font-normal leading-snug tracking-tight text-white mb-1.5 text-balance"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, '#FFFDF8'),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {/* Subtitle & Historical Context */}
          <p className="text-xs sm:text-[13px] italic text-stone-300 font-serif leading-relaxed mt-1 max-w-[95%]">
            {book.subtitle || 'Critical Historical Edition'}
          </p>
        </div>
      </div>

      {/* ================= BOTTOM BAR: REPOSITORY COLOPHON & OFFICIAL SEAL ================= */}
      <div className="relative z-10 flex items-center justify-between text-stone-300 pt-3 border-t border-amber-500/30">
        <div className="flex items-center gap-2.5">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle || 'folio'}
              color={palette.accent || '#DEB887'}
              size={22}
              className="opacity-95"
            />
          )}
          <div className="flex flex-col">
            <span
              className="text-[9.5px] uppercase tracking-[0.22em] font-medium text-amber-100"
              style={{ fontFamily: fontMeta }}
            >
              {book.publisher || 'Ediții Scriptorium'}
            </span>
            <span className="text-[8px] tracking-widest text-stone-400 font-mono">
              {book.series || 'Scriptorium Classique'}
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-[8px] tracking-wider text-amber-200/80">
          <span className="block font-semibold">{book.editionNotice || 'EDITIO HISTORICA'}</span>
          <span className="text-stone-400">{book.pubPlace || (book.date ? `ANNO ${book.date}` : 'București')}</span>
        </div>
      </div>
    </div>
  );
};
