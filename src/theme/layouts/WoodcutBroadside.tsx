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

export const WoodcutBroadside: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Ornate Multi-rule Victorian Woodblock Frame */}
      <div
        className="absolute inset-2.5 pointer-events-none"
        style={{ border: `3px solid ${palette.border}` }}
      />
      <div
        className="absolute inset-4 pointer-events-none"
        style={{ border: `1px solid ${palette.border}` }}
      />
      <div
        className="absolute inset-5 pointer-events-none"
        style={{ border: `1px dashed ${palette.border}99` }}
      />

      {/* Top Fleuron and Broadside Headline */}
      <div className="relative z-10 text-center pt-2">
        <div className="flex items-center justify-center gap-2 text-stone-600 opacity-80">
          <span>❧</span>
          <span
            className="text-[9px] uppercase tracking-[0.3em] font-semibold"
            style={{ fontFamily: fontMeta }}
          >
            {book.series || 'Standard Bibliographic Press'}
          </span>
          <span>❧</span>
        </div>
        <div
          className="text-xs uppercase tracking-[0.2em] font-serif font-bold mt-1"
          style={{ color: palette.secondary }}
        >
          {book.editionNotice || 'Authorized Edition'}
        </div>
      </div>

      {/* Center Layout: Ornate Oval Cameo + Traditional Type Stacking */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        <div className="mb-3">
          <PortraitCanvas
            portrait={{
              ...portrait,
              treatment: 'etching',
              cropShape: 'oval_cameo',
              borderStyle: 'ornate_woodcut',
            }}
            className="w-48 h-60 sm:w-56 sm:h-70 shadow-2xl"
            borderColor={palette.border}
            accentColor={palette.accent}
          />
        </div>

        <div className="text-[11px] uppercase tracking-[0.3em] font-medium opacity-85 mb-1">
          By the Celebrated Hand of
        </div>
        <div
          className="text-base sm:text-lg uppercase tracking-[0.2em] font-serif font-semibold mb-3"
          style={{
            fontFamily: fontAuthor,
            color: palette.primary,
          }}
        >
          {book.author}
        </div>

        <div className="w-20 h-[1.5px] mx-auto mb-3" style={{ backgroundColor: palette.accent }} />

        <h1
          className="text-2xl sm:text-3xl font-serif font-normal leading-tight tracking-wide px-3 max-w-[95%] text-balance"
          style={{
            fontFamily: fontTitle,
            ...getFoilTitleStyle(theme.foilEffect, palette.text),
          }}
        >
          {book.title}
        </h1>

        {book.subtitle && (
          <p
            className="text-xs font-serif italic mt-2 opacity-85 max-w-[85%]"
          >
            {book.subtitle}
          </p>
        )}

        {book.taglineQuote && (
          <div className="mt-4 px-4 max-w-[85%] border-t border-b py-2" style={{ borderColor: `${palette.border}66` }}>
            <p className="text-[10px] italic font-serif opacity-80 line-clamp-2">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Colophon */}
      <div className="relative z-10 flex flex-col items-center text-center pb-2">
        {showPublisherMark && (
          <PublisherMark
            style={publisherMarkStyle}
            color={palette.accent}
            size={24}
            className="mb-1"
          />
        )}
        <div
          className="text-[9px] uppercase tracking-[0.25em] font-bold"
          style={{ fontFamily: fontMeta }}
        >
          {book.publisher}
        </div>
        {(book.pubPlace || book.date) && (
          <div className="text-[8px] font-mono tracking-widest opacity-60 mt-0.5">
            {book.pubPlace ? `${book.pubPlace}` : ''}
            {book.pubPlace && book.date ? ' · ' : ''}
            {book.date || ''}
          </div>
        )}
      </div>
    </div>
  );
};
