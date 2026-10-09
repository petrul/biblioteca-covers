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
      {/* Upper Section: Full-Width Top-Aligned Cover Art with balanced grid proportion */}
      <div className="relative w-full h-[48%] sm:h-[50%] min-h-0 overflow-hidden shrink-0 border-b-2 border-black">
        {/* Full-bleed edge-to-edge cover art */}
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            treatment: portrait.applyVintageFilter ? (portrait.treatment === 'etching' ? 'high_contrast' : portrait.treatment) : 'natural',
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

      {/* Lower Section: Typography, Subtitle, Tagline, & Colophon */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 sm:px-7 pt-4 pb-5 sm:pb-6 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-1">
          {/* Author just above the title */}
          <div className="mb-1.5 sm:mb-2 shrink-0">
            <div
              className="text-sm sm:text-base font-black uppercase tracking-wider leading-none truncate"
              style={{
                fontFamily: fontAuthor,
                color: palette.secondary || palette.text,
              }}
            >
              {book.author}
            </div>
            {book.pubPlace && (
              <span className="text-[8.5px] uppercase font-mono tracking-widest opacity-60 block mt-0.5">
                {book.pubPlace}
              </span>
            )}
          </div>

          {/* Title in strong modernist display */}
          <h1
            className="text-2xl sm:text-3xl lg:text-[2rem] font-black uppercase tracking-tight leading-[0.96] text-balance mb-1.5 line-clamp-3"
            style={{
              fontFamily: fontTitle,
              ...getFoilTitleStyle(theme.foilEffect, palette.text),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {book.subtitle && (
            <p
              className="text-[11px] sm:text-xs uppercase tracking-wider font-mono opacity-80 mt-1 font-medium line-clamp-1 shrink-0"
              style={{ color: palette.secondary }}
            >
              {book.subtitle}
            </p>
          )}

          {book.taglineQuote && (
            <p className="text-[9.5px] sm:text-[10.5px] font-serif italic opacity-75 mt-1.5 line-clamp-2 max-w-[95%] shrink-0">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          )}
        </div>

        {/* Bottom Colophon & ISBN Footer Bar */}
        <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-black/15 shrink-0 mt-auto">
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
