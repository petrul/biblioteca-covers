import React, { forwardRef } from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig } from '../types';
import { ArchivalMonograph } from '../theme/layouts/ArchivalMonograph';
import { CriterionMinimal } from '../theme/layouts/CriterionMinimal';
import { FolioHeritage } from '../theme/layouts/FolioHeritage';
import { CinematicBleed } from '../theme/layouts/CinematicBleed';
import { SwissModernist } from '../theme/layouts/SwissModernist';
import { WoodcutBroadside } from '../theme/layouts/WoodcutBroadside';
import { FaberPoetry } from '../theme/layouts/FaberPoetry';
import { Constructivist } from '../theme/layouts/Constructivist';
import { StorybookWhimsy } from '../theme/layouts/StorybookWhimsy';
import { ClassicalGraecoRoman } from '../theme/layouts/ClassicalGraecoRoman';
import { HistoricalAnnals } from '../theme/layouts/HistoricalAnnals';
import { SlavonicConstruct } from '../theme/layouts/SlavonicConstruct';
import { AsianInkWash } from '../theme/layouts/AsianInkWash';
import { AdventurePulp } from '../theme/layouts/AdventurePulp';
import { HardcoverOverlay } from './HardcoverOverlay';

interface CoverCanvasProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  theme: CoverThemeConfig;
  className?: string;
  isExporting?: boolean;
}

export const CoverCanvas = forwardRef<HTMLDivElement, CoverCanvasProps>(
  ({ book, portrait, theme, className = '' }, ref) => {
    // Determine aspect ratio class / style
    const getAspectStyle = (): { aspectRatio: string; minHeight?: string } => {
      switch (theme.coverAspectRatio) {
        case 'standard_3_4':
          return { aspectRatio: '3 / 4' };
        case 'print_6_9':
          return { aspectRatio: '1 / 1.5' };
        case 'kdp_1_6':
        default:
          return { aspectRatio: '1 / 1.6' };
      }
    };

    const renderLayout = () => {
      switch (theme.archetypeId) {
        case 'criterion_minimal':
          return <CriterionMinimal book={book} portrait={portrait} theme={theme} />;
        case 'folio_heritage':
          return <FolioHeritage book={book} portrait={portrait} theme={theme} />;
        case 'cinematic_bleed':
          return <CinematicBleed book={book} portrait={portrait} theme={theme} />;
        case 'swiss_modernist':
          return <SwissModernist book={book} portrait={portrait} theme={theme} />;
        case 'woodcut_broadside':
          return <WoodcutBroadside book={book} portrait={portrait} theme={theme} />;
        case 'faber_poetry':
          return <FaberPoetry book={book} portrait={portrait} theme={theme} />;
        case 'constructivist':
          return <Constructivist book={book} portrait={portrait} theme={theme} />;
        case 'storybook_whimsy':
          return <StorybookWhimsy book={book} portrait={portrait} theme={theme} />;
        case 'classical_graeco_roman':
          return <ClassicalGraecoRoman book={book} portrait={portrait} theme={theme} />;
        case 'historical_annals':
          return <HistoricalAnnals book={book} portrait={portrait} theme={theme} />;
        case 'slavonic_construct':
          return <SlavonicConstruct book={book} portrait={portrait} theme={theme} />;
        case 'asian_inkwash':
          return <AsianInkWash book={book} portrait={portrait} theme={theme} />;
        case 'adventure_pulp':
          return <AdventurePulp book={book} portrait={portrait} theme={theme} />;
        case 'archival_monograph':
        default:
          return <ArchivalMonograph book={book} portrait={portrait} theme={theme} />;
      }
    };

    return (
      <div
        ref={ref}
        id="book-cover-export-node"
        className={`relative w-full max-w-[420px] rounded-sm shadow-xl overflow-hidden transition-all duration-300 ${className}`}
        style={{
          ...getAspectStyle(),
        }}
      >
        {renderLayout()}

        {/* Optional Apple Books-style Hardcover Effect (cotorul cărții vizibil, textură pânză & canelură) */}
        {theme.hardcover && <HardcoverOverlay config={theme.hardcover} bgColor={theme.palette.bg} />}
      </div>
    );
  }
);

CoverCanvas.displayName = 'CoverCanvas';
