import React, { forwardRef } from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../types';
import { CoverCanvas } from './CoverCanvas';
import { PublisherMark, BarcodeSvg, BookQrCode } from './BookDecorations';
import { getFoilTitleStyle } from '../utils/foilStyles';
import { resolveBookMetadataUrl } from '../utils/qrCodeHelper';

interface WrapViewProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const WrapView = forwardRef<HTMLDivElement, WrapViewProps>(
  ({ book, portrait, theme }, ref) => {
    const { palette, fontTitle, fontAuthor, fontMeta, showPublisherMark, publisherMarkStyle, showQrCode, qrCodeUrl, qrLogo } = theme;
    const resolvedQrUrl = resolveBookMetadataUrl(book, qrCodeUrl);

    return (
      <div
        ref={ref}
        id="book-wrap-export-node"
        className="relative flex items-stretch bg-stone-900 p-6 rounded-sm shadow-2xl overflow-hidden max-w-[960px] mx-auto"
        style={{ minHeight: '580px' }}
      >
        {/* ================= BACK COVER (45%) ================= */}
        <div
          className="flex-1 flex flex-col justify-between p-8 relative border-r border-black/20 shadow-inner"
          style={{
            backgroundColor: palette.bg,
            color: palette.text,
          }}
        >
          {/* Subtle frame */}
          <div
            className="absolute inset-4 pointer-events-none opacity-40"
            style={{ border: `1px solid ${palette.border}` }}
          />

          {/* Top Back Header */}
          <div className="relative z-10 text-center">
            <span
              className="text-[10px] uppercase tracking-[0.25em] font-medium opacity-75"
              style={{ fontFamily: fontMeta }}
            >
              {book.series || 'Masterwork Monograph Edition'}
            </span>
            <div className="w-10 h-[1px] mx-auto mt-2 opacity-50" style={{ backgroundColor: palette.accent }} />
          </div>

          {/* Back Content & Blurb */}
          <div className="relative z-10 my-auto py-4 space-y-4 text-center">
            {book.taglineQuote && (
              <blockquote className="border-y py-3 px-2 italic text-xs leading-relaxed max-w-[90%] mx-auto opacity-90" style={{ borderColor: `${palette.border}66`, fontFamily: 'Newsreader, serif' }}>
                “{book.taglineQuote.replace(/^["“]|["”]$/g, '')}”
              </blockquote>
            )}

            <p className="text-xs leading-relaxed opacity-85 text-balance max-w-[92%] mx-auto font-serif">
              A monumental achievement in world literature by {book.author}, preserving the authentic historical text, annotations, and scholarly apparatus.
            </p>

            <div className="text-[11px] opacity-75 italic font-serif">
              Genre: {book.genre || 'Classic Literature'} · Published Anno {book.date}
            </div>
          </div>

          {/* Bottom Barcode, QR Code & Publisher Details */}
          <div className="relative z-10 flex items-end justify-between pt-4 border-t border-black/10 gap-2">
            <div className="flex flex-col text-left">
              {showPublisherMark && (
                <PublisherMark
                  style={publisherMarkStyle}
                  color={palette.accent}
                  size={24}
                  className="mb-1"
                />
              )}
              <span className="text-[9px] uppercase tracking-wider font-bold" style={{ fontFamily: fontMeta }}>
                {book.publisher}
              </span>
              <span className="text-[8px] opacity-60 font-mono">
                {book.pubPlace || 'London & New York'}
              </span>
            </div>

            <div className="flex items-end gap-2">
              {showQrCode && (
                <BookQrCode
                  url={resolvedQrUrl}
                  label="eBook Edition"
                  size={48}
                  logo={qrLogo}
                />
              )}
              <BarcodeSvg isbn={book.isbn || '978-0-14-143947-1'} color={palette.primary} />
            </div>
          </div>
        </div>

        {/* ================= SPINE (10%) ================= */}
        <div
          className="w-14 sm:w-16 flex flex-col justify-between items-center py-6 px-1 relative select-none border-x border-black/30 shadow-md"
          style={{
            backgroundColor: palette.surface || palette.bg,
            color: palette.text,
          }}
        >
          {/* Top Spine: Author */}
          <div
            className="text-[9px] uppercase tracking-widest text-center font-bold opacity-80 transition-all"
            style={{
              fontFamily: fontAuthor,
              color: palette.accent,
              letterSpacing: theme.hardcover?.embossedTitle ? '0.3em' : '0.15em',
              filter: theme.hardcover?.embossedTitle
                ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))'
                : undefined,
            }}
          >
            {book.author.split(' ').pop()}
          </div>

          {/* Spine Title (Vertical Writing) */}
          <div className="my-auto py-4 flex items-center justify-center flex-1">
            <div
              className="text-xs uppercase font-semibold whitespace-nowrap opacity-95 transition-all"
              style={{
                fontFamily: fontTitle,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                letterSpacing: theme.hardcover?.embossedTitle ? '0.38em' : '0.22em',
                filter: theme.hardcover?.embossedTitle
                  ? 'drop-shadow(0 1.5px 1.5px rgba(0,0,0,0.9)) drop-shadow(0 -0.5px 0.5px rgba(255,255,255,0.45))'
                  : undefined,
                ...getFoilTitleStyle(theme.foilEffect, palette.text),
              }}
            >
              {book.title}
            </div>
          </div>

          {/* Bottom Spine: Volume & Colophon */}
          <div className="flex flex-col items-center gap-1.5 pt-2">
            <span className="text-[8px] font-mono opacity-70">
              {book.volume ? book.volume.slice(0, 5) : book.date}
            </span>
            {showPublisherMark && (
              <PublisherMark
                style={publisherMarkStyle}
                color={palette.accent}
                size={16}
                className="opacity-90"
              />
            )}
          </div>

          {/* Vertical crease lines representing book spine folds */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-black/40" />
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/40" />
        </div>

        {/* ================= FRONT COVER (45%) ================= */}
        <div className="flex-1 flex items-stretch">
          <div className="w-full h-full">
            <CoverCanvas book={book} portrait={portrait} theme={theme} className="!max-w-none !h-full rounded-none" />
          </div>
        </div>
      </div>
    );
  }
);

WrapView.displayName = 'WrapView';
