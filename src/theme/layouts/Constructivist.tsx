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

export const Constructivist: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-7 select-none overflow-hidden bg-neutral-900 text-neutral-100">
      {/* Stark Geometric Diagonal Slashes (Constructivist / Bauhaus) */}
      <div
        className="absolute top-0 right-0 w-2/3 h-full pointer-events-none transform skew-x-12 origin-top-right opacity-90"
        style={{ backgroundColor: palette.primary || '#DC2626' }}
      />
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-black pointer-events-none" />

      {/* Top Meta Info (Collection Name Section) */}
      <div className="relative z-10 flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-neutral-200 pb-2 border-b border-white/20">
        <div className="flex items-center gap-1.5">
          {book.date && (
            <span className="bg-black px-2 py-0.5 font-bold">{book.date}</span>
          )}
          {book.volume && (
            <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 text-[9px]">
              VOL. {book.volume}
            </span>
          )}
        </div>
        <span className="text-black font-bold tracking-[0.2em] bg-white/90 px-2 py-0.5">
          {book.series || 'SERIES INTERNATIONAL'}
        </span>
      </div>

      {/* Upper Section: Cover Art occupies 100% width with transparent Author overlay */}
      <div className="relative z-10 flex-1 w-full pt-2.5 pb-0 min-h-0 mb-2.5 flex flex-col">
        <div className="relative w-full h-full overflow-hidden border-4 border-black shadow-[0_16px_36px_rgba(0,0,0,0.8)]">
          {/* 100% Width Cover Art */}
          <PortraitCanvas
            portrait={{
              ...portrait,
              treatment: portrait.applyVintageFilter ? (portrait.treatment === 'natural' ? 'high_contrast' : portrait.treatment) : 'natural',
              cropShape: 'square_frame',
              borderStyle: 'none',
            }}
            className="w-full h-full object-cover"
            shadow={false}
          />

          {/* Subtle bottom shadow overlay to ensure author legibility */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          {/* Overlaid Author Name at bottom of cover art — transparent, no card, no 'TEXT BY' */}
          <div className="absolute bottom-3 left-3.5 right-3.5 z-30 pointer-events-none">
            <div
              className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-[0.92] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
              style={{
                fontFamily: fontAuthor,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 16px rgba(0, 0, 0, 0.8)',
              }}
            >
              {book.author || 'Author Name'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Zone: Quotation above Title, Title bottom-aligned directly above publishing house */}
      <div className="relative z-10 mt-auto pt-0">
        {/* Quotation directly above the title */}
        {book.taglineQuote && (
          <div className="mb-2 px-1">
            <p className="text-[10px] sm:text-[11px] font-mono text-neutral-200 leading-snug border-l-2 border-red-500 pl-2.5 line-clamp-2 bg-black/40 py-1">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}

        {/* Diagonal Headline Block - Bottom Aligned */}
        <div className="bg-black text-white p-3.5 border-l-4 border-white shadow-2xl mb-2.5">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-none"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, '#FFFFFF'),
            }}
          >
            {book.title || 'Book Title'}
          </h1>
          {book.subtitle && (
            <p className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-neutral-300 mt-1.5 font-bold">
              {book.subtitle}
            </p>
          )}
        </div>

        {/* Bottom Publishing House Section (with place & ISBN in small print) */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-black text-white">
          <div className="flex items-center gap-2">
            {showPublisherMark && (
              <PublisherMark
                style={publisherMarkStyle}
                color="#FFFFFF"
                size={18}
              />
            )}
            <span
              className="text-[9px] uppercase tracking-[0.2em] font-mono font-bold"
              style={{ fontFamily: fontMeta }}
            >
              {book.publisher || 'Publishing House'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[8px] font-mono text-neutral-300 tracking-wider">
            {book.pubPlace && (
              <span className="text-neutral-400 uppercase font-semibold">{book.pubPlace} ·</span>
            )}
            <span>{book.isbn || 'ISBN 978'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
