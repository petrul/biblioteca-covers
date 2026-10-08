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

export const FaberPoetry: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* 100% Full-Width Photo Panel extending to the very top */}
      <div className="w-full h-[50%] sm:h-[53%] min-h-[250px] relative overflow-hidden shrink-0 border-b border-black/25 shadow-xs">
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            treatment: portrait.treatment === 'etching' ? 'monochrome' : portrait.treatment,
            borderStyle: 'none',
          }}
          className="w-full h-full object-cover"
          shadow={false}
        />

        {/* Series Header written directly on top of the photo */}
        <div className="absolute top-0 inset-x-0 pt-3.5 pb-4 px-4 z-20 flex items-center justify-center bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none">
          <span
            className="text-[9.5px] uppercase tracking-[0.3em] font-mono font-bold text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
            style={{
              fontFamily: fontMeta,
              textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)',
            }}
          >
            {book.series || "OXFORD WORLD'S CLASSICS"}
          </span>
        </div>
      </div>

      {/* Lower Section: Typography (Author, Title, Subtitle, Quote) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-0">
        {/* Author Name in clean classical style */}
        <div
          className="text-xs uppercase tracking-[0.3em] font-medium opacity-85 mb-2"
          style={{
            fontFamily: fontAuthor,
            color: palette.secondary,
          }}
        >
          {book.author || 'Author Name'}
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl font-serif font-semibold leading-snug tracking-tight px-2 max-w-[92%] text-balance"
          style={{
            fontFamily: fontTitle,
            color: palette.text,
            ...getFoilTitleStyle(theme.foilEffect, palette.text),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        {/* Subtitle */}
        {book.subtitle && (
          <p
            className="text-xs italic opacity-75 mt-2 max-w-[85%]"
            style={{ fontFamily: 'Newsreader, serif' }}
          >
            {book.subtitle}
          </p>
        )}

        {book.taglineQuote && (
          <div className="mt-3 px-4 max-w-[88%]">
            <p className="text-[10px] italic font-serif opacity-70 line-clamp-2">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Band bearing the identical diagonal bands motif */}
      <div className="w-full shadow-md shrink-0">
        <div className="h-1 w-full bg-black/80" />
        <div
          className="w-full py-3 px-6 flex items-center justify-between relative overflow-hidden"
          style={{
            backgroundColor: palette.primary,
            backgroundImage: `repeating-linear-gradient(45deg, ${palette.primary} 0, ${palette.primary} 10px, ${palette.accent} 10px, ${palette.accent} 20px)`,
            borderTop: '1px solid rgba(0,0,0,0.5)',
          }}
        >
          {/* Publisher & Imprint printed directly against the brick with diagonal stripes */}
          <div className="relative z-10 flex items-center gap-2">
            {showPublisherMark && (
              <PublisherMark
                style={publisherMarkStyle}
                color="#FFFFFF"
                size={18}
                className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
              />
            )}
            <span
              className="text-[10.5px] uppercase tracking-[0.25em] font-serif font-bold text-white"
              style={{
                fontFamily: fontMeta,
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.85), 0 0 8px rgba(0, 0, 0, 0.7)',
              }}
            >
              {book.publisher || 'Faber & Faber'}
            </span>
          </div>

          <div className="relative z-10">
            <span
              className="text-[9.5px] uppercase tracking-widest font-mono text-white font-bold"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.85), 0 0 8px rgba(0, 0, 0, 0.7)',
              }}
            >
              {book.date || 'London'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
