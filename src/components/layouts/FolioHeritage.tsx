import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../../types';
import { PortraitCanvas } from '../PortraitCanvas';
import { PublisherMark, GildedCornerOrnament } from '../BookDecorations';
import { getFoilTitleStyle } from '../../utils/foilStyles';

interface LayoutProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const FolioHeritage: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-8 select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Subtle cloth weave background effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(${palette.accent} 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Gilded Double Border & Ornaments */}
      <div
        className="absolute inset-3 pointer-events-none"
        style={{ border: `2px solid ${palette.secondary}` }}
      />
      <div
        className="absolute inset-4.5 pointer-events-none"
        style={{ border: `1px dashed ${palette.accent}88` }}
      />

      <div className="absolute top-4 left-4 pointer-events-none">
        <GildedCornerOrnament position="top-left" color={palette.accent} size={28} />
      </div>
      <div className="absolute top-4 right-4 pointer-events-none">
        <GildedCornerOrnament position="top-right" color={palette.accent} size={28} />
      </div>
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <GildedCornerOrnament position="bottom-left" color={palette.accent} size={28} />
      </div>
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <GildedCornerOrnament position="bottom-right" color={palette.accent} size={28} />
      </div>

      {/* Top Header */}
      <div className="relative z-10 text-center pt-3">
        <div
          className="text-[9px] uppercase tracking-[0.3em] font-medium"
          style={{
            fontFamily: fontMeta,
            color: palette.accent,
          }}
        >
          {book.series || 'The Folio Heritage Collection'}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1 opacity-70">
          <span className="text-xs" style={{ color: palette.accent }}>✦</span>
          <span className="text-[10px] tracking-widest uppercase font-mono">{book.volume || 'Special Edition'}</span>
          <span className="text-xs" style={{ color: palette.accent }}>✦</span>
        </div>
      </div>

      {/* Center Layout: Cameo with Gilded Accent + Classical Roman Serif Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto pt-0 pb-2">
        {/* Majestic Enlarged Oval Cameo Egg with Gilded Guard Cartouche */}
        <div className="relative -mt-2.5 sm:-mt-3 mb-6 sm:mb-7 flex items-center justify-center">
          {/* Outer Gilded Oval Cartouche Guard */}
          <div
            className="absolute -inset-2.5 rounded-[50%/60%_60%_40%_40%] pointer-events-none"
            style={{
              border: `2px solid ${palette.accent}`,
              boxShadow: `0 0 12px ${palette.accent}33, inset 0 0 8px ${palette.accent}22`,
            }}
          />
          {/* Inner Delicate Hairline Oval Guard */}
          <div
            className="absolute -inset-1 rounded-[50%/60%_60%_40%_40%] pointer-events-none"
            style={{
              border: `1px solid ${palette.accent}88`,
            }}
          />

          <PortraitCanvas
            portrait={{
              ...portrait,
              cropShape: 'oval_cameo',
              borderStyle: 'thin_gold',
            }}
            className="w-44 h-56 sm:w-48 sm:h-62 shadow-2xl"
            borderColor={palette.accent}
            accentColor={palette.accent}
          />
        </div>

        <div
          className="text-xs uppercase tracking-[0.25em] font-semibold mb-2"
          style={{
            fontFamily: fontAuthor,
            color: palette.secondary,
          }}
        >
          {book.author || 'Author Name'}
        </div>

        <h1
          className="text-2xl sm:text-3xl font-normal leading-tight tracking-wide px-3 max-w-[92%] text-balance"
          style={{
            fontFamily: fontTitle,
            color: palette.text,
            textShadow: theme.foilEffect && theme.foilEffect !== 'none' ? undefined : '0 1px 3px rgba(0,0,0,0.4)',
            ...getFoilTitleStyle(theme.foilEffect, palette.text),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        <p
          className="text-xs italic opacity-85 mt-1.5 max-w-[85%]"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            color: palette.secondary,
          }}
        >
          {book.subtitle || 'An Illustrated Definitive Edition'}
        </p>

        {book.taglineQuote && (
          <div className="mt-3 px-6 max-w-[80%]">
            <p className="text-[10px] italic opacity-80 line-clamp-2 leading-relaxed font-serif">
              {book.taglineQuote}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 flex flex-col items-center text-center pb-2">
        {showPublisherMark && (
          <PublisherMark
            style={publisherMarkStyle}
            color={palette.accent}
            size={26}
            className="mb-1"
          />
        )}
        <div
          className="text-[9px] uppercase tracking-[0.25em] font-medium"
          style={{
            fontFamily: fontMeta,
            color: palette.secondary,
          }}
        >
          {book.publisher}
        </div>
        <div className="text-[8px] tracking-widest opacity-60 mt-0.5 font-mono">
          {book.pubPlace ? `${book.pubPlace} · ` : ''}{book.date}
        </div>
      </div>
    </div>
  );
};
