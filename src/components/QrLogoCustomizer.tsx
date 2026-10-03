import React, { useRef } from 'react';
import { CoverThemeConfig, QrLogoConfig } from '../types';
import { PublisherMark, BookQrCode } from './BookDecorations';
import { Upload, X, ShieldCheck, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface QrLogoCustomizerProps {
  theme: CoverThemeConfig;
  onChange: (updated: CoverThemeConfig) => void;
  previewUrl: string;
}

const PRESET_MARKS: Array<{
  id: 'oxford' | 'folio' | 'classical_owl' | 'penguin' | 'urn' | 'monogram';
  name: string;
}> = [
  { id: 'oxford', name: 'Oxford Book' },
  { id: 'folio', name: 'Folio Medallion' },
  { id: 'classical_owl', name: "Athena's Owl" },
  { id: 'penguin', name: 'Penguin' },
  { id: 'urn', name: 'Classical Urn' },
  { id: 'monogram', name: 'Monogram' },
];

export const QrLogoCustomizer: React.FC<QrLogoCustomizerProps> = ({
  theme,
  onChange,
  previewUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrLogo: QrLogoConfig = theme.qrLogo || {
    enabled: false,
    presetStyle: 'oxford',
    shape: 'circle',
    sizePercent: 24,
  };

  const updateQrLogo = (partial: Partial<QrLogoConfig>) => {
    onChange({
      ...theme,
      qrLogo: {
        ...qrLogo,
        ...partial,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, SVG, JPG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateQrLogo({
          enabled: true,
          url: dataUrl,
          presetStyle: undefined, // Clear preset to prioritize uploaded logo
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (styleId: 'oxford' | 'folio' | 'classical_owl' | 'penguin' | 'urn' | 'monogram') => {
    updateQrLogo({
      enabled: true,
      presetStyle: styleId,
      url: undefined, // Clear custom upload to use preset
    });
  };

  const handleClearLogo = () => {
    updateQrLogo({
      enabled: false,
      url: undefined,
      presetStyle: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasLogoActive = qrLogo.enabled && (!!qrLogo.url || !!qrLogo.presetStyle);

  return (
    <div className="bg-white/90 border border-amber-200/90 rounded-lg p-3.5 space-y-3 shadow-2xs">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-amber-100 text-amber-800">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
              <span>Center Publisher Logo in QR Code</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Level-H 30%
              </span>
            </div>
            <div className="text-[10px] text-stone-500">
              Embeds your publishing house colophon or mark directly inside the QR code
            </div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={qrLogo.enabled}
            onChange={(e) => {
              if (e.target.checked && !qrLogo.url && !qrLogo.presetStyle) {
                // Default to theme's current publisher mark or oxford
                updateQrLogo({
                  enabled: true,
                  presetStyle: theme.publisherMarkStyle || 'oxford',
                });
              } else {
                updateQrLogo({ enabled: e.target.checked });
              }
            }}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-700" />
        </label>
      </div>

      {qrLogo.enabled && (
        <div className="pt-2 border-t border-amber-200/70 space-y-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Live Interactive QR Preview */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="text-[10px] font-medium text-stone-600 mb-1">Live QR Preview</div>
              <BookQrCode
                url={previewUrl}
                label="Scan for Edition"
                size={82}
                logo={qrLogo}
                darkColor={theme.palette.primary}
              />
              <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-700 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>100% Scannable</span>
              </div>
            </div>

            {/* Logo Options */}
            <div className="flex-1 space-y-3 w-full">
              {/* Option A: Upload Custom Logo */}
              <div>
                <label className="text-[11px] font-semibold text-stone-800 block mb-1">
                  1. Upload Custom Publisher Logo (PNG / SVG / JPG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    className="hidden"
                    id="qr-logo-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>{qrLogo.url ? 'Replace Custom Image...' : 'Choose File to Upload...'}</span>
                  </button>

                  {qrLogo.url && (
                    <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded border border-stone-300 text-xs">
                      <div className="w-4 h-4 rounded overflow-hidden bg-white border border-stone-200">
                        <img src={qrLogo.url} alt="Uploaded logo" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] text-stone-600 font-mono">Custom Image</span>
                      <button
                        type="button"
                        onClick={handleClearLogo}
                        className="text-stone-400 hover:text-stone-700 p-0.5"
                        title="Remove custom logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Option B: Insert from Curated Historical Marks */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-stone-800 block">
                    2. Or Insert Curated Publisher Mark
                  </label>
                  {qrLogo.presetStyle && !qrLogo.url && (
                    <span className="text-[10px] text-amber-800 font-medium">
                      Active: {PRESET_MARKS.find((m) => m.id === qrLogo.presetStyle)?.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {PRESET_MARKS.map((mark) => {
                    const isSelected = !qrLogo.url && qrLogo.presetStyle === mark.id;
                    return (
                      <button
                        key={mark.id}
                        type="button"
                        onClick={() => handleSelectPreset(mark.id)}
                        className={`p-1.5 rounded-md border text-center flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-500/30 shadow-2xs font-semibold'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/60'
                        }`}
                        title={`Use ${mark.name}`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center mb-1">
                          <PublisherMark
                            style={mark.id}
                            color={isSelected ? '#92400E' : '#44403C'}
                            size={20}
                          />
                        </div>
                        <span className="text-[9.5px] text-stone-700 leading-tight truncate w-full">
                          {mark.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badging Customization: Shape & Size */}
              {hasLogoActive && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/50">
                  {/* Shape Selector */}
                  <div>
                    <label className="text-[10.5px] font-medium text-stone-700 block mb-1">
                      Badge Background Shape
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'circle', label: 'Circle' },
                        { id: 'rounded', label: 'Rounded' },
                        { id: 'square', label: 'Square' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateQrLogo({ shape: s.id as any })}
                          className={`py-1 text-[10.5px] rounded border transition-colors ${
                            (qrLogo.shape || 'circle') === s.id
                              ? 'bg-amber-900 text-white font-medium border-amber-900 shadow-2xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Slider */}
                  <div>
                    <div className="flex justify-between text-[10.5px] text-stone-600 mb-1">
                      <span>Logo Scale</span>
                      <span className="font-mono">{qrLogo.sizePercent ?? 24}% (Safe)</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="28"
                      step="1"
                      value={qrLogo.sizePercent ?? 24}
                      onChange={(e) => updateQrLogo({ sizePercent: parseInt(e.target.value, 10) })}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
