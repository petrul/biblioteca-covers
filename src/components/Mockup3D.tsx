import React, { useState } from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../types';
import { CoverCanvas } from './CoverCanvas';
import { Tablet, BookOpen, Layers } from 'lucide-react';
import { getFoilTitleStyle } from '../utils/foilStyles';

interface Mockup3DProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
}

export const Mockup3D: React.FC<Mockup3DProps> = ({ book, portrait, theme }) => {
  const [mockupType, setMockupType] = useState<'hardcover' | 'ereader' | 'floating'>('hardcover');

  return (
    <div className="flex flex-col items-center justify-center w-full py-6 select-none">
      {/* Segmented control for mockup mode */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg mb-8 shadow-inner">
        <button
          onClick={() => setMockupType('hardcover')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mockupType === 'hardcover'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>3D Hardcover Book</span>
        </button>

        <button
          onClick={() => setMockupType('ereader')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mockupType === 'ereader'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>eReader / Kindle</span>
        </button>

        <button
          onClick={() => setMockupType('floating')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mockupType === 'floating'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dramatic Depth</span>
        </button>
      </div>

      {/* ============ HARDCOVER 3D MOCKUP ============ */}
      {mockupType === 'hardcover' && (
        <div className="relative py-12 px-8 flex items-center justify-center">
          <div
            className="relative transition-transform duration-500 ease-out hover:scale-105"
            style={{
              perspective: '1400px',
            }}
          >
            {/* The 3D Book Container */}
            <div
              className="relative shadow-2xl rounded-r-md transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-24deg) rotateX(6deg) rotateZ(1deg)',
              }}
            >
              {/* Spine edge illusion with optional embossed foil spine text */}
              <div
                className="absolute top-0 bottom-0 -left-6 w-6 rounded-l-xs origin-right flex flex-col items-center justify-between py-6 overflow-hidden select-none"
                style={{
                  backgroundColor: theme.palette.bg,
                  filter: 'brightness(0.85)',
                  transform: 'rotateY(-90deg)',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  className="text-[7px] uppercase font-bold text-center opacity-80"
                  style={{
                    fontFamily: theme.fontAuthor,
                    color: theme.palette.accent,
                    letterSpacing: theme.hardcover?.embossedTitle ? '0.25em' : '0.15em',
                    filter: theme.hardcover?.embossedTitle ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))' : undefined,
                  }}
                >
                  {book.author.split(' ').pop()}
                </div>

                <div
                  className="text-[8px] uppercase font-semibold whitespace-nowrap opacity-95 my-auto"
                  style={{
                    fontFamily: theme.fontTitle,
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    letterSpacing: theme.hardcover?.embossedTitle ? '0.35em' : '0.2em',
                    filter: theme.hardcover?.embossedTitle
                      ? 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.9)) drop-shadow(0 -0.5px 0.5px rgba(255,255,255,0.4))'
                      : undefined,
                    ...getFoilTitleStyle(theme.foilEffect, theme.palette.text),
                  }}
                >
                  {book.title}
                </div>

                <div className="text-[7px] font-mono opacity-65">
                  {book.date}
                </div>
              </div>

              {/* Book Pages thickness on right */}
              <div
                className="absolute top-1 bottom-1 -right-7 w-7 rounded-r-xs origin-left"
                style={{
                  background: 'repeating-linear-gradient(to right, #FAF7F0, #FAF7F0 1px, #EBE6DF 2px, #EBE6DF 3px)',
                  transform: 'rotateY(90deg)',
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)',
                }}
              />

              {/* Book Pages thickness on bottom */}
              <div
                className="absolute -bottom-6 left-0 right-0 h-6 origin-top"
                style={{
                  background: 'repeating-linear-gradient(to bottom, #FAF7F0, #FAF7F0 1px, #EBE6DF 2px, #EBE6DF 3px)',
                  transform: 'rotateX(-90deg)',
                  boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4)',
                }}
              />

              {/* Front Cover with Hinge Crease Line */}
              <div className="relative overflow-hidden rounded-r-sm w-[340px] sm:w-[380px]">
                <CoverCanvas book={book} portrait={portrait} theme={theme} />

                {/* Book Hinge / Joint Dent Effect (classic hardcover book groove) */}
                <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-black/35 pointer-events-none shadow-sm" />
                <div className="absolute top-0 bottom-0 left-6.5 w-[2px] bg-white/20 pointer-events-none" />

                {/* Subtle lighting sheen across the cover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Dynamic Floor Shadow */}
            <div
              className="absolute -bottom-10 left-10 right-0 h-10 bg-black/35 blur-xl rounded-full"
              style={{
                transform: 'rotateX(80deg) scale(0.9)',
              }}
            />
          </div>
        </div>
      )}

      {/* ============ E-READER / KINDLE MOCKUP ============ */}
      {mockupType === 'ereader' && (
        <div className="relative py-6 flex items-center justify-center">
          {/* E-Reader Hardware Chassis */}
          <div className="relative bg-stone-900 p-5 rounded-2xl shadow-2xl border-4 border-stone-800 w-[360px] sm:w-[410px]">
            {/* Top Bezel Status Indicator */}
            <div className="flex items-center justify-between pb-3 px-2 text-[9px] font-mono text-stone-400">
              <span className="tracking-widest uppercase">Kindle Oasis Edition</span>
              <div className="flex items-center gap-2">
                <span>100%</span>
                <div className="w-3 h-2 border border-stone-400 rounded-xs flex items-center p-0.5">
                  <div className="w-full h-full bg-stone-400" />
                </div>
              </div>
            </div>

            {/* E-ink Screen Frame */}
            <div className="relative rounded-sm overflow-hidden bg-stone-100 shadow-inner">
              <CoverCanvas book={book} portrait={portrait} theme={theme} className="w-full" />
            </div>

            {/* Bottom Bezel with brand mark */}
            <div className="pt-4 text-center">
              <span className="text-[10px] tracking-[0.25em] font-sans font-bold text-stone-500 uppercase">
                Folio Reader
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============ FLOATING DRAMATIC DEPTH ============ */}
      {mockupType === 'floating' && (
        <div className="relative py-12 flex items-center justify-center">
          <div className="relative group transition-transform duration-500 hover:-translate-y-2">
            <div className="relative shadow-2xl w-[340px] sm:w-[380px] rounded-xs overflow-hidden border border-white/20">
              <CoverCanvas book={book} portrait={portrait} theme={theme} />
            </div>
            {/* Ambient multi-level glow */}
            <div
              className="absolute -inset-4 rounded-xl blur-2xl opacity-40 -z-10 transition-opacity duration-300 group-hover:opacity-60"
              style={{ backgroundColor: theme.palette.accent }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
