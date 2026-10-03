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

export const SwissModernist: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Upper Section: Full-Width Top-Aligned Cover Art with Overlaid Author & LOC Specs */}
      <div className="relative w-full h-[52%] sm:h-[55%] min-h-[260px] overflow-hidden shrink-0 border-b-2 border-black">
        {/* Full-bleed edge-to-edge cover art */}
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            treatment: portrait.treatment === 'etching' ? 'high_contrast' : portrait.treatment,
            borderStyle: 'none',
          }}
          className="w-full h-full object-cover"
          shadow={false}
        />

        {/* Top Header Grid Bar (Overlaid on Top of Art) */}
        <div className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold tracking-tight px-1.5 py-0.5 text-white bg-black shadow-md"
              style={{ fontFamily: fontMeta }}
            >
              {book.date || '1968'}
            </span>
            <span
              className="text-[10px] uppercase tracking-wider font-mono font-bold text-white bg-black/75 px-2 py-0.5 backdrop-blur-xs shadow-md"
            >
              {book.series || 'Series International'}
            </span>
          </div>
          <div className="text-[10px] font-mono font-bold text-white bg-black/75 px-2 py-0.5 backdrop-blur-xs shadow-md">
            {book.volume || 'VOL. 01'}
          </div>
        </div>

        {/* Author + LOC specification docket card displayed directly on top of cover art */}
        <div className="absolute bottom-4 left-6 z-20 bg-white/95 text-black p-3.5 border-2 border-black shadow-[0_12px_28px_rgba(0,0,0,0.5)] max-w-[82%]">
          <span className="text-[8.5px] uppercase tracking-[0.25em] font-mono block mb-1 font-bold text-stone-500">
            AUTHOR INDEX
          </span>
          <div
            className="text-base sm:text-lg font-black uppercase tracking-tight leading-tight"
            style={{
              fontFamily: fontAuthor,
              color: '#000000',
            }}
          >
            {book.author || 'Author Name'}
          </div>

          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-black/20 text-[9px] uppercase font-mono tracking-widest text-stone-700 font-medium">
            <span>LOC · {book.pubPlace || 'LONDON'}</span>
            <span>·</span>
            <span>ZÜRICH 12-PT</span>
          </div>
        </div>
      </div>

      {/* Lower Section: Typography, Subtitle, Tagline, & Colophon */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-7 min-h-0">
        {/* Title in strong modernist display */}
        <div className="pt-1">
          <h1
            className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] text-balance mb-2"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, palette.text),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {book.subtitle && (
            <p
              className="text-xs uppercase tracking-wider font-mono opacity-80 mt-2 font-medium"
              style={{ color: palette.secondary }}
            >
              {book.subtitle}
            </p>
          )}

          {book.taglineQuote && (
            <p
              className="text-[10px] sm:text-[11px] font-serif italic opacity-75 mt-3 line-clamp-2 max-w-[95%]"
            >
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          )}
        </div>

        {/* Bottom Colophon & ISBN Footer Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-black/15">
          <div className="flex items-center gap-2">
            {showPublisherMark && (
              <PublisherMark
                style={publisherMarkStyle}
                color={palette.text}
                size={18}
              />
            )}
            <span
              className="text-[9px] uppercase tracking-[0.2em] font-bold"
              style={{ fontFamily: fontMeta }}
            >
              {book.publisher || 'Edition Atelier'}
            </span>
          </div>

          <span className="text-[8px] font-mono opacity-60">
            {book.isbn || 'ISBN-978'}
          </span>
        </div>
      </div>
    </div>
  );
};
