import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../../types';
import { PortraitCanvas } from '../PortraitCanvas';
import { Sparkles, Star, Smile, Heart } from 'lucide-react';
import { getFoilTitleStyle } from '../foilStyles';

interface LayoutProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const StorybookWhimsy: React.FC<LayoutProps> = ({ book, portrait, theme }) => {
  const { palette } = theme;

  // Cartoonish, bouncy, naive font stacks
  const cartoonTitleFont = "'Sniglet', 'Bubblegum Sans', 'Fredoka', cursive, sans-serif";
  const cartoonAuthorFont = "'Patrick Hand', 'Sniglet', cursive, sans-serif";
  const cartoonBodyFont = "'Fredoka', 'Sniglet', sans-serif";

  // Dynamic vibrant colors from palette with cheerful defaults
  const primaryColor = palette.primary || '#F43F5E'; // Bubblegum / Coral Red
  const secondaryColor = palette.secondary || '#8B5CF6'; // Playful Purple
  const accentColor = palette.accent || '#FBBF24'; // Sunny Yellow
  const textColor = palette.text || '#FFFFFF';

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 sm:p-7 select-none overflow-hidden transition-colors duration-300"
      style={{
        fontFamily: cartoonBodyFont,
      }}
    >
      {/* ================= BACKGROUND: FULL-BLEED COVER ART WITH PLAYFUL SCRIM ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <PortraitCanvas
          portrait={{
            ...portrait,
            cropShape: 'full_bleed',
            treatment: portrait.applyVintageFilter ? (portrait.treatment === 'etching' ? 'cartoon_pop' : portrait.treatment) : 'natural',
          }}
          className="w-full h-full object-cover"
          shadow={false}
        />

        {/* Soft colorful gradient scrims so cartoon typography leaps out with crisp readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/15 to-stone-950/80 pointer-events-none" />

        {/* Cheerful subtle rainbow radial glow in the bottom center */}
        <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* ================= PLAYFUL DOODLES & CONFETTI (NO DOTTED LINES) ================= */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Colorful floating pastel confetti dots */}
        <div className="absolute top-5 left-12 w-4 h-4 rounded-full bg-rose-400 opacity-90 shadow-sm animate-bounce" />
        <div className="absolute top-16 right-10 w-3 h-3 rounded-full bg-amber-300 opacity-90 shadow-sm" />
        <div className="absolute top-44 left-5 w-4 h-4 rounded-full bg-sky-300 opacity-80 shadow-sm" />
        <div className="absolute bottom-40 right-6 w-4 h-4 rounded-full bg-emerald-400 opacity-80 shadow-sm" />

        {/* Playful smiling sunshine in top corner */}
        <div className="absolute -top-3 -left-3 w-16 h-16 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-lg">
          <Smile className="w-8 h-8 text-amber-950 ml-2 mt-2" />
        </div>

        {/* Cute hand-drawn rainbow doodle in top right */}
        <div className="absolute top-3 right-4 opacity-90 drop-shadow-md">
          <svg className="w-14 h-9" viewBox="0 0 60 40" fill="none">
            <path d="M5 35 A25 25 0 0 1 55 35" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 35 A18 18 0 0 1 48 35" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <path d="M19 35 A11 11 0 0 1 41 35" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Little smiling floating stars & sparkles */}
        <div className="absolute top-24 right-5 text-amber-300 opacity-95 animate-pulse drop-shadow-md">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute bottom-36 left-4 text-rose-400 opacity-90 drop-shadow-md">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute bottom-48 right-5 text-amber-300 opacity-90 drop-shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* ================= TOP HEADER: COLLECTION / SERIES CANDY BADGE ================= */}
      <div className="relative z-20 text-center pt-1 flex flex-col items-center">
        {/* Solid colorful candy pill for Collection / Series (clean solid border, no dots) */}
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg border-2 border-white -rotate-1 transition-transform hover:rotate-0"
          style={{
            backgroundColor: primaryColor,
            color: '#FFFFFF',
            fontFamily: cartoonTitleFont,
          }}
        >
          <span className="text-amber-200">★</span>
          <span>{book.series || 'The Whimsical Storybook Collection'}</span>
          <span className="text-amber-200">★</span>
        </div>

        {/* Cute Reading Age / Volume Badge */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span
            className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/95 text-stone-900 border border-stone-200 shadow-sm"
            style={{ fontFamily: cartoonBodyFont }}
          >
            {book.volume ? `BOOK Nº ${book.volume}` : 'READ-ALOUD FAVORITE 🎈'}
          </span>
        </div>
      </div>

      {/* ================= LOWER: PROMINENT LARGE CARTOON TITLE & AUTHOR ================= */}
      <div className="relative z-20 mt-auto mb-2 flex flex-col items-center text-center">
        {/* Playful Epigraph Speech Bubble (if present) positioned above author */}
        {book.taglineQuote && (
          <div className="relative mb-3 max-w-[90%] mx-auto drop-shadow-md">
            <div
              className="relative px-4 py-2 rounded-2xl border-2 border-white text-left"
              style={{
                backgroundColor: '#FFFFFF',
              }}
            >
              <p
                className="text-[11px] italic leading-snug line-clamp-2 text-stone-800"
                style={{
                  fontFamily: cartoonAuthorFont,
                }}
              >
                “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
              </p>
              {/* Little speech bubble pointer tail */}
              <div
                className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b-2 border-r-2 border-white rotate-45"
              />
            </div>
          </div>
        )}

        {/* Author Byline with naive, friendly script & playful squiggly underline */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-stone-900 shadow-md border-2 border-amber-300 -rotate-1 hover:rotate-0 transition-transform">
            <span>🎨</span>
            <span className="text-xs text-stone-600 font-medium">Story by</span>
            <span
              className="text-base sm:text-lg font-bold tracking-wide"
              style={{
                fontFamily: cartoonAuthorFont,
                color: secondaryColor,
              }}
            >
              {book.author || 'Author Name'}
            </span>
          </div>
        </div>

        {/* Big, Bold, Chunky LARGER Cartoon Title */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-normal px-2 max-w-[96%] text-balance my-1 transition-all"
          style={{
            fontFamily: cartoonTitleFont,
            color: '#FFFFFF',
            textShadow:
              theme.foilEffect && theme.foilEffect !== 'none'
                ? undefined
                : `3px 4px 0px ${primaryColor}, 4px 6px 0px rgba(0,0,0,0.85)`,
            ...getFoilTitleStyle(theme.foilEffect, '#FFFFFF'),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        {/* Subtitle in a solid puffy white cloud banner */}
        <div
          className="mt-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md border-2 border-white max-w-[94%] transition-transform hover:scale-102"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#1C1917',
            fontFamily: cartoonBodyFont,
          }}
        >
          <span className="text-amber-500 mr-1.5">✨</span>
          <span>{book.subtitle || 'A Wonderfully Silly & Joyful Story!'}</span>
          <span className="text-amber-500 ml-1.5">✨</span>
        </div>
      </div>

      {/* ================= BOTTOM FOOTER: CHEERFUL PUBLISHER COLOPHON ================= */}
      <div className="relative z-20 flex items-center justify-between pt-3 border-t-2 border-white/30 text-white">
        <div className="flex items-center gap-2">
          {/* Cheerful Publisher Emblem */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white text-white font-black text-xs"
            style={{ backgroundColor: primaryColor }}
          >
            ★
          </div>
          <div className="flex flex-col text-left">
            <span
              className="text-[11px] font-bold tracking-wide leading-tight drop-shadow-sm"
              style={{
                fontFamily: cartoonTitleFont,
                color: '#FFFFFF',
              }}
            >
              {book.publisher || 'Storytime Press'}
            </span>
            <span
              className="text-[8.5px] text-amber-200/90 tracking-wider font-medium"
              style={{ fontFamily: cartoonBodyFont }}
            >
              {book.pubPlace ? `${book.pubPlace} · ` : ''}
              {book.date ? `Anno ${book.date}` : 'First Edition'}
            </span>
          </div>
        </div>

        {/* Fun Sticker Seal on bottom right */}
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[9px] shadow-lg border-2 border-white rotate-2 hover:rotate-0 transition-transform"
          style={{ fontFamily: cartoonTitleFont }}
        >
          <span>🎈</span>
          <span>100% GIGGLES</span>
        </div>
      </div>
    </div>
  );
};
