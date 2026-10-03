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

export const CinematicBleed: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle } = theme;
  const scrimMode = theme.cinematicScrim || 'balanced';

  // Configurable scrim depth that leaves author's face illuminated and radiant
  const getScrimStyles = () => {
    switch (scrimMode) {
      case 'vibrant':
        return {
          topScrim: 'h-20 bg-gradient-to-b from-black/45 via-black/15 to-transparent',
          bottomScrim: 'h-[48%] bg-gradient-to-t from-black/90 via-black/40 via-50% to-transparent',
          portraitOpacity: 'opacity-100',
        };
      case 'moody':
        return {
          topScrim: 'h-28 bg-gradient-to-b from-black/70 via-black/25 to-transparent',
          bottomScrim: 'h-[64%] bg-gradient-to-t from-black/95 via-black/65 via-45% to-transparent',
          portraitOpacity: 'opacity-95',
        };
      case 'balanced':
      default:
        return {
          topScrim: 'h-24 bg-gradient-to-b from-black/55 via-black/15 to-transparent',
          bottomScrim: 'h-[56%] bg-gradient-to-t from-black/95 via-black/50 via-40% to-transparent',
          portraitOpacity: 'opacity-100',
        };
    }
  };

  const { topScrim, bottomScrim, portraitOpacity } = getScrimStyles();

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-7 select-none overflow-hidden bg-black text-stone-100">
      {/* Full-bleed Portrait Backdrop - Vivid & Luminous */}
      <div className="absolute inset-0 z-0">
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            borderStyle: 'none',
            panY: portrait.panY !== 0 ? portrait.panY : -8,
          }}
          className={`w-full h-full ${portraitOpacity} transition-opacity duration-300`}
          shadow={false}
        />
        {/* Targeted Scrims: Top header shade + bottom text gradient (leaves face & subject crystal clear) */}
        <div className={`absolute top-0 inset-x-0 ${topScrim} pointer-events-none transition-all duration-300`} />
        <div className={`absolute bottom-0 inset-x-0 ${bottomScrim} pointer-events-none transition-all duration-300`} />
      </div>

      {/* Top Bar: Genre / Series & Volume */}
      <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[0.25em] uppercase font-mono text-stone-200 pt-2 drop-shadow-sm">
        <span>{book.series || book.genre || 'Cinematic Masterwork Collection'}</span>
        <span>{book.volume ? `VOL. ${book.volume}` : (book.date || 'EDITION')}</span>
      </div>

      {/* Center / Bottom: Expressive Display Title & Epigraph */}
      <div className="relative z-10 mt-auto mb-4">
        {/* Author Byline */}
        <div
          className="text-xs uppercase tracking-[0.3em] font-medium mb-3 drop-shadow-md"
          style={{
            fontFamily: fontAuthor,
            color: palette.accent || '#F3E5AB',
          }}
        >
          {book.author || 'Author Name'}
        </div>

        {/* Large Cinematic Title */}
        <h1
          className="text-3xl sm:text-4xl font-normal leading-tight tracking-tight text-white mb-2 max-w-[95%] text-balance drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
          style={{
            fontFamily: fontTitle,
            ...getFoilTitleStyle(theme.foilEffect, '#FFFFFF'),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        {/* Subtitle */}
        <p className="text-sm italic text-stone-200 max-w-[90%] font-serif leading-snug drop-shadow-md">
          {book.subtitle || 'An Unabridged Illustrated Edition'}
        </p>

        {/* Evocative Epigraph Quote */}
        {book.taglineQuote && (
          <div className="mt-4 border-l-2 border-amber-500/80 pl-3 max-w-[90%] backdrop-blur-[0.5px]">
            <p className="text-[11px] italic text-stone-200 leading-relaxed font-serif line-clamp-2 drop-shadow-sm">
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/20 text-stone-300 drop-shadow-sm">
        <div className="flex items-center gap-2">
          {showPublisherMark && (
            <PublisherMark
              style={publisherMarkStyle}
              color="#F3E5AB"
              size={20}
              className="opacity-90"
            />
          )}
          <span
            className="text-[9px] uppercase tracking-[0.2em] font-medium"
            style={{ fontFamily: fontMeta }}
          >
            {book.publisher || 'Publishing House'}
          </span>
        </div>

        <div className="text-[8px] uppercase tracking-widest font-mono opacity-70">
          {book.series || 'Definitive Edition'}
        </div>
      </div>
    </div>
  );
};
