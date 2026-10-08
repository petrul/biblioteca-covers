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
      {/* Top Faber Iconic Pattern Band */}
      <div className="w-full">
        <div
          className="h-7 w-full flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: palette.primary,
            backgroundImage: `repeating-linear-gradient(45deg, ${palette.primary} 0, ${palette.primary} 10px, ${palette.accent} 10px, ${palette.accent} 20px)`,
          }}
        />
        <div className="h-1 w-full bg-black/80" />
        {/* Collection / Series Header */}
        <div className="w-full text-center pt-2 pb-1 text-[9px] uppercase tracking-[0.28em] font-mono opacity-75">
          {book.series || 'The Poetry & Literature Collection'}
        </div>
      </div>

      {/* Main Centered Content Field */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
        {/* Enlarged Author Portrait Egg / Oval Cameo */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer subtle concentric egg accent ring */}
          <div
            className="absolute -inset-2.5 pointer-events-none opacity-40"
            style={{
              borderRadius: '50% / 60% 60% 40% 40%',
              border: `1.5px solid ${palette.primary}`,
            }}
          />
          {/* Inner hairline egg accent ring */}
          <div
            className="absolute -inset-1 pointer-events-none opacity-60"
            style={{
              borderRadius: '50% / 60% 60% 40% 40%',
              border: `1px dashed ${palette.primary}`,
            }}
          />

          <PortraitCanvas
            portrait={{
              ...portrait,
              cropShape: 'oval_cameo',
              treatment: portrait.treatment === 'etching' ? 'monochrome' : portrait.treatment,
              borderStyle: 'double_hairline',
            }}
            className="w-48 h-60 sm:w-56 sm:h-70 shadow-2xl"
            borderColor={palette.primary}
            accentColor={palette.accent}
          />
        </div>

        {/* Author Name in clean classical style */}
        <div
          className="text-xs uppercase tracking-[0.3em] font-medium opacity-85 mb-2.5"
          style={{
            fontFamily: fontAuthor,
            color: palette.secondary,
          }}
        >
          {book.author || 'Author Name'}
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl font-serif font-semibold leading-snug tracking-tight px-2 max-w-[90%] text-balance"
          style={{
            fontFamily: fontTitle,
            color: palette.text,
            ...getFoilTitleStyle(theme.foilEffect, palette.text),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        {/* Subtitle */}
        <p
          className="text-xs italic opacity-75 mt-2 max-w-[80%]"
          style={{ fontFamily: 'Newsreader, serif' }}
        >
          {book.subtitle || 'Selected Poems & Critical Verses'}
        </p>

        {book.taglineQuote && (
          <div className="mt-4 px-6 max-w-[85%]">
            <p className="text-[10px] italic font-serif opacity-70 line-clamp-2">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Band with Faber-style publisher branding in brick theme color */}
      <div
        className="w-full py-3.5 px-6 flex items-center justify-between shadow-md"
        style={{
          backgroundColor: palette.primary,
          color: '#FFFFFF',
          borderTop: '2px solid rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle}
              color="#FFFFFF"
              size={20}
            />
          )}
          <span
            className="text-[10.5px] uppercase tracking-[0.25em] font-serif font-bold text-white"
            style={{ fontFamily: fontMeta }}
          >
            {book.publisher || 'Faber & Faber'}
          </span>
        </div>

        <span className="text-[9.5px] uppercase tracking-widest font-mono text-amber-100/90 font-medium">
          {book.date || 'London'}
        </span>
      </div>
    </div>
  );
};
