import React from 'react';
import { BookMetadata, AuthorPortraitConfig, CoverThemeConfig, LayoutArchetypeId } from '../types';
import { LAYOUT_ARCHETYPES, COLOR_PALETTES } from '../utils/themePresets';
import { CoverCanvas } from './CoverCanvas';
import { Check } from 'lucide-react';

interface LayoutGalleryProps {
  book: BookMetadata;
  portrait: AuthorPortraitConfig;
  currentTheme: CoverThemeConfig;
  onSelectLayout: (layoutId: LayoutArchetypeId) => void;
}

export const LayoutGallery: React.FC<LayoutGalleryProps> = ({
  book,
  portrait,
  currentTheme,
  onSelectLayout,
}) => {
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-lg font-serif font-medium text-stone-900">
            Automated Layout Choices
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Generated automatically from your TEI XML metadata and author portrait. Click any edition to select it.
          </p>
        </div>
        <div className="text-xs text-stone-500 font-mono mt-2 sm:mt-0">
          {LAYOUT_ARCHETYPES.length} Curated Archetypes
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {LAYOUT_ARCHETYPES.map((arch) => {
          const isSelected = currentTheme.archetypeId === arch.id;
          const defaultPalette =
            COLOR_PALETTES.find((p) => p.id === arch.suggestedPaletteId) || currentTheme.palette;

          // Virtual theme for the preview thumbnail
          const previewTheme: CoverThemeConfig = {
            ...currentTheme,
            archetypeId: arch.id,
            palette: isSelected ? currentTheme.palette : defaultPalette,
            fontTitle: arch.defaultFont,
          };

          return (
            <div
              key={arch.id}
              onClick={() => onSelectLayout(arch.id)}
              className={`group relative flex flex-col bg-white rounded-lg p-3 transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-lg'
              }`}
            >
              {/* Scaled-down Cover Canvas */}
              <div className="relative w-full overflow-hidden rounded-xs bg-stone-100 mb-3 flex items-center justify-center p-1">
                <div className="w-full pointer-events-none transform transition-transform duration-300 group-hover:scale-[1.02]">
                  <CoverCanvas
                    book={book}
                    portrait={portrait}
                    theme={previewTheme}
                    className="w-full !max-w-none shadow-md"
                  />
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 bg-amber-600 text-white rounded-full p-1 shadow-md z-30">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Archetype Description */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="text-xs font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {arch.name}
                    </h3>
                    <span className="text-[10px] font-mono uppercase text-stone-500">
                      {arch.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">
                    {arch.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-600">
                    {arch.defaultFont}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLayout(arch.id);
                    }}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-sm transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-stone-600 group-hover:text-stone-900'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
