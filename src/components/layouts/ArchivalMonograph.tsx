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

export const ArchivalMonograph: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-8 select-none transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Outer & Inner Classical Hairline Borders */}
      <div
        className="absolute inset-4 pointer-events-none"
        style={{ border: `1px solid ${palette.border}` }}
      />
      <div
        className="absolute inset-5 pointer-events-none"
        style={{ border: `1.5px solid ${palette.border}88` }}
      />

      {/* Top Header: Series / Volume / Archive ID */}
      <div className="relative z-10 text-center pt-3">
        <div
          className="text-[11px] uppercase tracking-[0.25em] opacity-80"
          style={{ fontFamily: fontMeta }}
        >
          {book.series || 'Scriptorum Classicorum Bibliotheca'}
        </div>
        {book.volume && (
          <div
            className="text-[9px] uppercase tracking-[0.18em] opacity-60 mt-1"
            style={{ fontFamily: fontMeta }}
          >
            {book.volume}
          </div>
        )}
        <div
          className="w-12 h-[1px] mx-auto mt-2 opacity-50"
          style={{ backgroundColor: palette.accent }}
        />
      </div>

      {/* Middle Center: Author Cameo + Titles */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        {/* Author Portrait Cameo Egg - Enlarged */}
        <div className="relative mb-4 flex items-center justify-center">
          {/* Subtle Outer Hairline Cameo Guard Ring */}
          <div
            className="absolute -inset-2 rounded-[50%/60%_60%_40%_40%] pointer-events-none opacity-50"
            style={{ border: `1px solid ${palette.accent}` }}
          />

          <PortraitCanvas
            portrait={{
              ...portrait,
              cropShape: 'oval_cameo',
              borderStyle: 'thin_gold',
            }}
            className="w-44 h-56 sm:w-48 sm:h-62 shadow-xl"
            borderColor={palette.border}
            accentColor={palette.accent}
          />
        </div>

        {/* Author Name */}
        <div
          className="text-sm uppercase tracking-[0.22em] font-medium opacity-90 mb-2"
          style={{
            fontFamily: fontAuthor,
            color: palette.secondary || palette.accent,
          }}
        >
          {book.author}
        </div>

        {/* Main Title */}
        <h1
          className="text-2xl sm:text-3xl font-semibold leading-tight tracking-wide px-4 max-w-[90%] text-balance"
          style={{
            fontFamily: fontTitle,
            ...getFoilTitleStyle(theme.foilEffect, palette.text),
          }}
        >
          {book.title}
        </h1>

        {/* Subtitle */}
        {book.subtitle && (
          <p
            className="text-xs italic opacity-75 mt-2 max-w-[80%] leading-relaxed"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {book.subtitle}
          </p>
        )}

        {/* Epigraph / Tagline quote if present */}
        {book.taglineQuote && (
          <div className="mt-4 px-6 max-w-[85%]">
            <p
              className="text-[10px] italic opacity-70 line-clamp-2 leading-relaxed"
              style={{ fontFamily: 'Newsreader, serif' }}
            >
              {book.taglineQuote}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer: Publisher & Date */}
      <div className="relative z-10 flex flex-col items-center text-center pb-2">
        <div
          className="w-8 h-[1px] opacity-40 mb-3"
          style={{ backgroundColor: palette.border }}
        />
        {showPublisherMark && (
          <PublisherMark
            style={publisherMarkStyle}
            color={palette.accent}
            size={28}
            className="mb-1 opacity-90"
          />
        )}
        <div
          className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-85"
          style={{ fontFamily: fontMeta }}
        >
          {book.publisher}
        </div>
        <div
          className="text-[9px] tracking-widest opacity-60 mt-0.5"
          style={{ fontFamily: fontMeta }}
        >
          {book.pubPlace ? `${book.pubPlace} · ` : ''}
          {book.date}
        </div>
      </div>
    </div>
  );
};
