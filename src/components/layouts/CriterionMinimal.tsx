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

export const CriterionMinimal: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none transition-colors duration-300"
      style={{
        backgroundColor: palette.surface,
        color: palette.text,
      }}
    >
      {/* Top Bold Header Band */}
      <div
        className="w-full pt-8 pb-6 px-6 text-center shadow-xs"
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          borderBottom: `3px solid ${palette.accent}`,
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-80 mb-2"
          style={{ fontFamily: fontMeta }}
        >
          {book.series || 'Criterion Classics'}
        </div>
        <div
          className="text-base sm:text-lg uppercase tracking-[0.2em] font-medium"
          style={{
            fontFamily: fontAuthor,
            color: palette.accent,
          }}
        >
          {book.author}
        </div>
      </div>

      {/* Center Field with Prominent Portrait Medallion and Clean Title */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-3 text-center my-auto">
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer subtle halo ring */}
          <div
            className="absolute -inset-2.5 rounded-full pointer-events-none opacity-40"
            style={{ border: `1.5px solid ${palette.accent}` }}
          />
          {/* Inner delicate accent ring */}
          <div
            className="absolute -inset-1 rounded-full pointer-events-none opacity-70"
            style={{ border: `1px dashed ${palette.accent}` }}
          />

          <PortraitCanvas
            portrait={{
              ...portrait,
              cropShape: 'circle_medallion',
              borderStyle: 'thin_gold',
            }}
            className="w-52 h-52 sm:w-56 sm:h-56 shadow-2xl"
            borderColor={palette.accent}
            accentColor={palette.accent}
          />
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight px-2 max-w-[95%] text-balance text-white"
          style={{
            fontFamily: fontTitle,
            color: '#FFFFFF',
            ...getFoilTitleStyle(
              theme.foilEffect,
              '#FFFFFF'
            ),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        <p
          className="text-xs font-serif italic mt-2 text-stone-200 max-w-[85%]"
          style={{ color: '#E2E8F0' }}
        >
          {book.subtitle || 'Definitive Critical Edition'}
        </p>

        {book.taglineQuote && (
          <div className="mt-4 px-4 max-w-[85%] border-l-2 pl-3 text-left" style={{ borderColor: palette.accent }}>
            <p className="text-[10px] italic text-stone-300 line-clamp-2" style={{ fontFamily: 'Newsreader, serif' }}>
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Band */}
      <div
        className="w-full py-4 px-6 flex items-center justify-between"
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          borderTop: `1px solid ${palette.border}66`,
        }}
      >
        <div className="flex items-center gap-2">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle}
              color={palette.accent}
              size={22}
              className="opacity-90"
            />
          )}
          <span
            className="text-[10px] uppercase tracking-[0.18em] font-medium opacity-90"
            style={{ fontFamily: fontMeta }}
          >
            {book.publisher}
          </span>
        </div>

        <div className="text-[9px] uppercase tracking-widest opacity-70 font-mono">
          {book.date}
        </div>
      </div>
    </div>
  );
};
