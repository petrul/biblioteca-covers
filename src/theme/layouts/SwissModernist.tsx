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
      {/* Upper Section: Full-Width Top Cover Art extending all the way down to the text */}
      <div className="relative w-full flex-1 min-h-[46%] overflow-hidden border-b-2 border-black">
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
          <div className="absolute top-3 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
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

      {/* Lower Section: Typography, Subtitle, Tagline, & Colophon directly below the image */}
      <div className="relative z-10 shrink-0 px-5 sm:px-6 pt-2.5 pb-3.5 sm:pb-4 flex flex-col justify-between">
        <div className="flex flex-col justify-start">
          {/* Author placed directly below the image dividing border */}
          <div className="mb-1 shrink-0">
            <div
              data-cover-author="true"
              className="text-xs sm:text-sm font-black uppercase tracking-wider leading-none truncate"
              style={{
                fontFamily: fontAuthor,
                color: palette.secondary || palette.text,
                ...getAuthorScaleStyle(theme.authorFontSize, 0.9),
              }}
            >
              {book.author}
            </div>
          </div>

          {/* Title in strong modernist display */}
          <h1
            data-cover-title="true"
            className="text-xl sm:text-2xl lg:text-[1.75rem] font-black uppercase tracking-tight leading-[0.98] text-balance mb-1 line-clamp-3"
            style={{
              fontFamily: fontTitle,
              ...getTitleScaleStyle(theme.titleFontSize, 1.5),
              ...getFoilTitleStyle(theme.foilEffect, palette.text),
            }}
          >
            {book.title || 'Book Title'}
          </h1>

          {book.subtitle && (
            <p
              className="text-[10.5px] sm:text-xs uppercase tracking-wider font-mono opacity-80 mt-0.5 font-medium line-clamp-1 shrink-0"
              style={{ color: palette.secondary }}
            >
              {book.subtitle}
            </p>
          )}

          {book.taglineQuote && (
            <p className="text-[9px] sm:text-[10px] font-serif italic opacity-75 mt-1 line-clamp-2 max-w-[95%] shrink-0">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          )}
        </div>

        {/* Bottom Colophon: Publisher on left & City Name (București) taking the place of ISBN on right */}
        <div className="flex items-center justify-between pt-2 border-t border-black/15 shrink-0 mt-2.5">
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
              {book.publisher || 'Ediții Scriptorium'}
            </span>
          </div>

          {/* City name (București) taking the place of the bottom-right ISBN */}
          <span
            className="text-[9px] uppercase font-mono tracking-wider font-bold opacity-80"
            style={{ fontFamily: fontMeta }}
          >
            {book.pubPlace || 'București'}
          </span>
        </div>
      </div>
    </div>
  );
};
