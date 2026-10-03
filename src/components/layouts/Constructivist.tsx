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
        <span className="bg-black px-2 py-0.5 font-bold">{book.date || 'VOL. 01'}</span>
        <span className="text-black font-bold tracking-[0.2em] bg-white/90 px-2 py-0.5">
          {book.series || 'SERIES INTERNATIONAL'}
        </span>
      </div>

      {/* Upper Avant-Garde Section: Cover Art Left & Top Aligned, vertically filling all space with no empty space underneath */}
      <div className="relative z-10 flex-1 flex items-stretch justify-start gap-4 pt-2.5 pb-0 min-h-0 mb-2">
        {/* Maximum Vertical Cover Art - Left aligned, extends vertically right to the bottom section */}
        <div className="relative z-20 shrink-0 h-full flex">
          <PortraitCanvas
            portrait={{
              ...portrait,
              treatment: 'high_contrast',
              cropShape: 'square_frame',
              borderStyle: 'none',
            }}
            className="w-48 sm:w-56 md:w-60 h-full border-4 border-black shadow-[0_16px_36px_rgba(0,0,0,0.8)]"
            shadow={false}
          />
        </div>

        {/* Author Block with Bauhaus Typography - Top Aligned alongside cover art */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div
              className="text-[9.5px] uppercase font-mono tracking-[0.25em] text-neutral-300 block mb-1 font-bold"
            >
              TEXT BY
            </div>
            <div
              className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight leading-[0.92] text-white drop-shadow-lg"
              style={{ fontFamily: fontAuthor }}
            >
              {book.author || 'Author Name'}
            </div>

            {book.volume && (
              <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-200 mt-3 bg-black px-2 py-1 inline-block border-l-2 border-red-500 w-fit">
                EXP · {book.volume}
              </div>
            )}
          </div>

          <div className="pt-2">
            <span className="text-[8.5px] font-mono uppercase tracking-widest text-neutral-400 block">
              DESSAU ARCHIV · 1928
            </span>
            {book.pubPlace && (
              <span className="text-[8.5px] font-mono uppercase tracking-widest text-neutral-400 block mt-0.5">
                LOC · {book.pubPlace}
              </span>
            )}
            <div className="w-10 h-[2px] bg-white mt-1.5" />
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

        {/* Bottom Publishing House Section */}
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

          <span className="text-[8px] font-mono text-neutral-300 tracking-wider">
            {book.isbn || 'ISBN 978'}
          </span>
        </div>
      </div>
    </div>
  );
};
