import React from 'react';
import { Download, FileCode, Braces } from 'lucide-react';

interface HeaderProps {
  activeView: 'studio' | 'gallery' | 'portrait' | 'styles' | 'wrap' | '3d';
  onSelectView: (view: 'studio' | 'gallery' | 'portrait' | 'styles' | 'wrap' | '3d') => void;
  onOpenTeiModal: () => void;
  onOpenJsonModal?: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  onOpenTeiModal,
  onOpenJsonModal,
  onExport,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-stone-200">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectView('studio');
        }}
        className="text-lg font-bold tracking-tight text-stone-900 font-serif select-none"
      >
        FolioCraft
      </a>

      {/* Zone 2: 4–6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
        <button
          onClick={() => onSelectView('studio')}
          className={`transition-colors hover:text-stone-900 ${
            activeView === 'studio' ? 'text-amber-800 font-semibold' : ''
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => onSelectView('gallery')}
          className={`transition-colors hover:text-stone-900 ${
            activeView === 'gallery' ? 'text-amber-800 font-semibold' : ''
          }`}
        >
          Layout Choices
        </button>
        <button
          onClick={() => onSelectView('portrait')}
          className={`transition-colors hover:text-stone-900 ${
            activeView === 'portrait' ? 'text-amber-800 font-semibold' : ''
          }`}
        >
          Author Portrait
        </button>
        <button
          onClick={() => onSelectView('styles')}
          className={`transition-colors hover:text-stone-900 ${
            activeView === 'styles' ? 'text-amber-800 font-semibold' : ''
          }`}
        >
          Typography & Palette
        </button>
        <button
          onClick={() => onSelectView('wrap')}
          className={`transition-colors hover:text-stone-900 ${
            activeView === 'wrap' ? 'text-amber-800 font-semibold' : ''
          }`}
        >
          Dust Jacket Wrap
        </button>
        <button
          onClick={() => onSelectView('3d')}
          className={`transition-colors hover:text-stone-900 ${
            activeView === '3d' ? 'text-amber-800 font-semibold' : ''
          }`}
        >
          3D Mockups
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5">
        {onOpenJsonModal && (
          <button
            onClick={onOpenJsonModal}
            className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-400/80 rounded-md transition-all flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            title="Paste & Import custom book data via JSON"
          >
            <Braces className="w-3.5 h-3.5 text-amber-800" />
            <span>Paste JSON</span>
          </button>
        )}

        <button
          onClick={onOpenTeiModal}
          className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <FileCode className="w-3.5 h-3.5 text-stone-600" />
          <span>TEI XML Data</span>
        </button>

        <button
          onClick={onExport}
          disabled={isExporting}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Exporting...' : 'Export Cover'}</span>
        </button>
      </div>
    </header>
  );
};

