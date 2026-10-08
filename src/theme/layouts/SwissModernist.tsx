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
      {/* Upper Section: Full-Width Top-Aligned Cover Art (Extended lower by half the previous gap) */}
      <div className="relative w-full h-[61%] sm:h-[64%] min-h-[300px] sm:min-h-[330px] overflow-hidden shrink-0 border-b-2 border-black">
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

        {/* Top Header Grid Bar (only common schema elements) */}
        {(book.date || book.series || book.volume) && (
          <div className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              {book.date && (
                <span
                  className="text-xs font-bold tracking-tight px-1.5 py-0.5 text-white bg-black shadow-md"
                  style={{ fontFamily: fontMeta }}
                >
                  {book.date}
                </span>
              )}
              {book.series && (
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-white bg-black/75 px-2 py-0.5 backdrop-blur-xs shadow-md">
                  {book.series}
                </span>
              )}
            </div>
            {book.volume && (
              <div className="text-[10px] font-mono font-bold text-white bg-black/75 px-2 py-0.5 backdrop-blur-xs shadow-md">
                {book.volume}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lower Section: Typography, Subtitle, Tagline, & Colophon bottom-aligned */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 sm:px-7 pt-3 pb-5 sm:pb-6 min-h-0">
        <div className="mt-auto mb-3 sm:mb-3.5">
          {/* Author just above the title */}
          <div className="mb-2">
            <div
              className="text-base sm:text-lg font-black uppercase tracking-wider leading-none"
              style={{
                fontFamily: fontAuthor,
                color: palette.secondary || palette.text,
              }}
            >
              {book.author}
            </div>
            {book.pubPlace && (
              <span className="text-[9px] uppercase font-mono tracking-widest opacity-60 block mt-1">
                {book.pubPlace}
              </span>
            )}
          </div>

          {/* Title in strong modernist display */}
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
            <p className="text-[10px] sm:text-[11px] font-serif italic opacity-75 mt-2.5 line-clamp-2 max-w-[95%]">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          )}
        </div>

        {/* Bottom Colophon & ISBN Footer Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-black/15 shrink-0">
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

          {book.isbn && (
            <span className="text-[8px] font-mono opacity-60">
              {book.isbn}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
