import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../../types';
import { PublisherMark, BookQrCode } from '../BookDecorations';
import { getFoilTitleStyle } from '../foilStyles';
import { getTitleScaleStyle, getAuthorScaleStyle } from '../typographyScale';

interface LayoutProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig; // Intentionally unused: Pure Typographic theme has NO imagery of any kind
  theme: CoverThemeConfig;
}

/**
 * Classical Aldine / Bodoni decorative printer's fleuron vignette.
 * Pure vector typography ornamentation inspired by 16th-18th century fine press printers.
 */
const AldineFleuron: React.FC<{ color: string; size?: number; className?: string }> = ({
  color,
  size = 44,
  className = '',
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.45)}
    viewBox="0 0 64 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Left filigree wing */}
    <path
      d="M2 14H20M6 11C12 11 16 14 18 14M6 17C12 17 16 14 18 14"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.65"
    />
    {/* Right filigree wing */}
    <path
      d="M62 14H44M58 11C52 11 48 14 46 14M58 17C52 17 48 14 46 14"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.65"
    />
    {/* Central Aldine ivy leaf & diamond rosette */}
    <circle cx="23" cy="14" r="1.5" fill={color} opacity="0.8" />
    <circle cx="41" cy="14" r="1.5" fill={color} opacity="0.8" />
    <path
      d="M32 4C28 10 26 12 26 14.5C26 17.8 28.7 20.5 32 20.5C35.3 20.5 38 17.8 38 14.5C38 12 36 10 32 4Z"
      fill={color}
      opacity="0.85"
    />
    <path
      d="M32 14.5V23M28 20C30 20 32 21 32 23M36 20C34 20 32 21 32 23"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.75"
    />
  </svg>
);

/**
 * Delicate French corner fillet with floral dot.
 */
const CornerFleuron: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
}> = ({ position, color }) => {
  const transform =
    position === 'top-right'
      ? 'rotate(90deg)'
      : position === 'bottom-right'
      ? 'rotate(180deg)'
      : position === 'bottom-left'
      ? 'rotate(270deg)'
      : 'none';

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform }}
      className="pointer-events-none select-none"
      aria-hidden="true"
    >
      <path d="M2 2H18M2 2V18" stroke={color} strokeWidth="1.2" strokeLinecap="square" opacity="0.8" />
      <path d="M5 5H14M5 5V14" stroke={color} strokeWidth="0.8" strokeLinecap="square" opacity="0.6" />
      <circle cx="8" cy="8" r="1.2" fill={color} opacity="0.9" />
    </svg>
  );
};

export const PureTypographic: React.FC<LayoutProps> = ({ book, theme }) => {
  const {
    palette,
    fontTitle,
    fontAuthor,
    fontMeta,
    showPublisherMark,
    publisherMarkStyle,
    showBorder = true,
    showOrnaments = true,
  } = theme;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-7 sm:p-9 select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* Subtle fine-press chain-laid paper watermark effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${palette.text} 0px, ${palette.text} 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, ${palette.text} 0px, ${palette.text} 0.5px, transparent 0.5px, transparent 4px)`,
        }}
      />

      {/* Classical French Double-Fillet Border */}
      {showBorder && (
        <>
          {/* Outer hairline rule */}
          <div
            className="absolute inset-3.5 pointer-events-none transition-colors duration-300"
            style={{ border: `1.5px solid ${palette.border}` }}
          />
          {/* Inner hairline rule */}
          <div
            className="absolute inset-5 pointer-events-none transition-colors duration-300"
            style={{ border: `0.75px solid ${palette.border}88` }}
          />

          {/* Corner fleurons */}
          {showOrnaments && (
            <>
              <div className="absolute top-4 left-4">
                <CornerFleuron position="top-left" color={palette.accent || palette.secondary} />
              </div>
              <div className="absolute top-4 right-4">
                <CornerFleuron position="top-right" color={palette.accent || palette.secondary} />
              </div>
              <div className="absolute bottom-4 left-4">
                <CornerFleuron position="bottom-left" color={palette.accent || palette.secondary} />
              </div>
              <div className="absolute bottom-4 right-4">
                <CornerFleuron position="bottom-right" color={palette.accent || palette.secondary} />
              </div>
            </>
          )}
        </>
      )}

      {/* ==================================================================== */}
      {/* 1. TOP HEADER: Bibliographic Collection & Volume Docket             */}
      {/* ==================================================================== */}
      <div className="relative z-10 text-center pt-2 shrink-0">
        <div className="inline-flex items-center justify-center gap-2 max-w-[85%]">
          {showOrnaments && (
            <span className="text-[9px] opacity-70" style={{ color: palette.accent }}>
              ✦
            </span>
          )}
          <span
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-medium opacity-90 truncate"
            style={{
              fontFamily: fontMeta,
              color: palette.secondary || palette.accent,
            }}
          >
            {book.series || 'Scriptorium Classique'}
          </span>
          {showOrnaments && (
            <span className="text-[9px] opacity-70" style={{ color: palette.accent }}>
              ✦
            </span>
          )}
        </div>

        {book.volume && (
          <div
            className="text-[8.5px] uppercase tracking-[0.25em] opacity-70 mt-1 font-mono"
            style={{ fontFamily: fontMeta }}
          >
            {book.volume}
          </div>
        )}

        {/* Top subtle dividing hairline */}
        <div
          className="w-14 h-[1px] mx-auto mt-2.5 opacity-40 transition-colors duration-300"
          style={{ backgroundColor: palette.accent || palette.border }}
        />
      </div>

      {/* ==================================================================== */}
      {/* 2. CENTER TYPOGRAPHIC MASTERWORK: Author, Fleuron, Title, Subtitle   */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 my-auto min-h-0 py-4">
        {/* Author Name */}
        <div
          data-cover-author="true"
          className="text-xs sm:text-sm uppercase tracking-[0.26em] font-medium opacity-95 mb-2 leading-relaxed"
          style={{
            fontFamily: fontAuthor,
            color: palette.secondary || palette.accent,
            ...getAuthorScaleStyle(theme.authorFontSize, 0.9),
          }}
        >
          {book.author || 'Author Name'}
        </div>

        {/* Optional Editor or Translator note */}
        {(book.translator || book.editor) && (
          <div
            className="text-[9.5px] italic opacity-75 mb-3 tracking-wide"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {book.translator ? `Traduit par ${book.translator}` : `Édition établie par ${book.editor}`}
          </div>
        )}

        {/* Classical Aldine / Bodoni Typographic Fleuron Vignette */}
        {showOrnaments && (
          <div className="my-2.5 flex items-center justify-center opacity-85">
            <AldineFleuron color={palette.accent || palette.secondary} size={48} />
          </div>
        )}

        {/* Magnificent Display Title */}
        <h1
          data-cover-title="true"
          className="text-2xl sm:text-3xl lg:text-[2.1rem] font-normal leading-[1.08] tracking-wide px-2 max-w-[95%] text-balance my-2"
          style={{
            fontFamily: fontTitle,
            color: palette.text,
            ...getTitleScaleStyle(theme.titleFontSize, 1.6),
            ...getFoilTitleStyle(theme.foilEffect, palette.text),
          }}
        >
          {book.title || 'Book Title'}
        </h1>

        {/* Subtitle */}
        {book.subtitle && (
          <p
            className="text-xs sm:text-sm italic opacity-85 mt-2 max-w-[85%] leading-relaxed"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              color: palette.secondary || palette.accent,
            }}
          >
            {book.subtitle}
          </p>
        )}

        {/* Decorative thin flourish line */}
        <div className="flex items-center justify-center gap-2 my-3 opacity-50 w-full max-w-[140px]">
          <div className="flex-1 h-[0.75px]" style={{ backgroundColor: palette.accent || palette.border }} />
          <span className="text-[8px]" style={{ color: palette.accent }}>❦</span>
          <div className="flex-1 h-[0.75px]" style={{ backgroundColor: palette.accent || palette.border }} />
        </div>

        {/* Tagline quote / Epigraph block */}
        {book.taglineQuote && (
          <div className="px-5 max-w-[88%] mt-1">
            <p
              className="text-[10px] sm:text-[10.5px] italic opacity-75 line-clamp-3 leading-relaxed font-serif"
              style={{ fontFamily: 'Newsreader, serif' }}
            >
              “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
            </p>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. BOTTOM COLOPHON: Publisher Mark, Place (București) & Date         */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-col items-center text-center pb-1 shrink-0">
        {/* Subtle dividing hairline */}
        <div
          className="w-12 h-[1px] opacity-40 mb-2.5 transition-colors duration-300"
          style={{ backgroundColor: palette.accent || palette.border }}
        />

        {/* Publisher Emblem / Mark */}
        {showPublisherMark && (
          <div className="mb-1.5 opacity-90 transition-opacity hover:opacity-100">
            <PublisherMark
              style={publisherMarkStyle}
              color={palette.accent || palette.text}
              size={26}
            />
          </div>
        )}

        {/* Publishing House Name */}
        <div
          className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.25em] font-semibold opacity-95"
          style={{ fontFamily: fontMeta }}
        >
          {book.publisher || 'Ediții Scriptorium'}
        </div>

        {/* City of Publication & Year */}
        <div
          className="text-[9px] uppercase tracking-[0.2em] opacity-75 mt-0.5"
          style={{ fontFamily: fontMeta }}
        >
          <span>{book.pubPlace || 'București'}</span>
          <span className="mx-1.5 opacity-50">·</span>
          <span>{book.date || new Date().getFullYear()}</span>
        </div>

        {/* Optional QR Code */}
        {theme.showQrCode && theme.qrCodeUrl && (
          <div className="mt-2">
            <BookQrCode
              url={theme.qrCodeUrl}
              size={36}
              darkColor={palette.text}
              lightColor="transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};
