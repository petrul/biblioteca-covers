import React, { useState } from 'react';
import { AuthorPortraitConfig } from '../types';
import { getProxiedImageUrl } from '../utils/portraitSearch';
import { User } from 'lucide-react';

interface PortraitCanvasProps {
  portrait: AuthorPortraitConfig;
  className?: string;
  borderColor?: string;
  accentColor?: string;
  shadow?: boolean;
}

export const PortraitCanvas: React.FC<PortraitCanvasProps> = ({
  portrait,
  className = '',
  borderColor = 'rgba(212, 175, 55, 0.6)',
  accentColor = '#D4AF37',
  shadow = true,
}) => {
  const [loadError, setLoadError] = useState(false);

  // Compute CSS filter based on treatment (Optional vintage aging / B&W filter — by default OFF)
  const getFilterStyle = (): React.CSSProperties => {
    // By default OFF: preserve authentic, full natural colors of original picture
    if (!portrait.applyVintageFilter || portrait.treatment === 'natural') {
      return {
        filter: 'contrast(102%) brightness(100%)',
      };
    }

    switch (portrait.treatment) {
      case 'etching':
        return {
          filter: 'grayscale(100%) contrast(145%) brightness(95%) sepia(25%)',
        };
      case 'sepia':
        return {
          filter: 'sepia(85%) contrast(115%) brightness(92%) saturate(90%)',
        };
      case 'monochrome':
        return {
          filter: 'grayscale(100%) contrast(125%) brightness(98%)',
        };
      case 'high_contrast':
        return {
          filter: 'grayscale(100%) contrast(190%) brightness(105%)',
        };
      case 'cartoon_pop':
        return {
          filter: 'saturate(165%) contrast(120%) brightness(104%)',
        };
      case 'duotone':
        return {
          filter: 'grayscale(100%) contrast(140%) brightness(90%)',
          mixBlendMode: 'luminosity',
        };
      default:
        return {
          filter: 'contrast(102%) brightness(100%)',
        };
    }
  };

  // Compute clipping / border radius based on crop shape
  const getShapeStyle = (): { borderRadius?: string; clipPath?: string } => {
    switch (portrait.cropShape) {
      case 'oval_cameo':
        return { borderRadius: '50% / 60% 60% 40% 40%' };
      case 'circle_medallion':
        return { borderRadius: '50%' };
      case 'arch':
        return { borderRadius: '999px 999px 0 0' };
      case 'classic_shield':
        return {
          clipPath: 'polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)',
        };
      case 'cloud_bubble':
        return { borderRadius: '28px 28px 28px 10px' };
      case 'square_frame':
        return { borderRadius: '2px' };
      case 'full_bleed':
        return { borderRadius: '0px' };
      default:
        return { borderRadius: '50%' };
    }
  };

  const proxiedUrl = getProxiedImageUrl(portrait.url);

  if (loadError || !portrait.url) {
    return (
      <div
        className={`relative flex items-center justify-center bg-stone-200/40 text-stone-400 overflow-hidden ${className}`}
        style={{
          ...getShapeStyle(),
          border: portrait.borderStyle !== 'none' ? `2px solid ${borderColor}` : undefined,
        }}
      >
        <div className="flex flex-col items-center justify-center p-3 text-center">
          <User className="w-8 h-8 mb-1 opacity-50" />
          <span className="text-[10px] uppercase tracking-wider font-mono opacity-70">
            {portrait.title || 'Author'}
          </span>
        </div>
      </div>
    );
  }

  const borderStyles: React.CSSProperties = {};
  if (portrait.borderStyle === 'thin_gold') {
    borderStyles.border = `2px solid ${borderColor}`;
    borderStyles.outline = `1px solid ${borderColor}55`;
    borderStyles.outlineOffset = '4px';
  } else if (portrait.borderStyle === 'double_hairline') {
    borderStyles.border = `1px solid ${borderColor}`;
    borderStyles.outline = `1px solid ${borderColor}`;
    borderStyles.outlineOffset = '3px';
  } else if (portrait.borderStyle === 'ornate_woodcut') {
    borderStyles.border = `3px double ${borderColor}`;
    borderStyles.outline = `2px solid ${borderColor}88`;
    borderStyles.outlineOffset = '4px';
  }

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${shadow ? 'shadow-md' : ''} ${className}`}
      style={{
        ...getShapeStyle(),
        ...borderStyles,
      }}
    >
      {/* Optional duotone colored background backdrop (only when vintage filter active) */}
      {portrait.applyVintageFilter && portrait.treatment === 'duotone' && (
        <div
          className="absolute inset-0 z-10 pointer-events-none mix-blend-color"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Author image with pan & zoom transforms */}
      <img
        src={proxiedUrl}
        alt={portrait.title || 'Author portrait'}
        referrerPolicy="no-referrer"
        onError={() => setLoadError(true)}
        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-200"
        style={{
          ...getFilterStyle(),
          objectPosition: portrait.cropShape === 'full_bleed' ? '50% 15%' : 'center center',
          transform: `scale(${portrait.zoom || 1}) translate(${portrait.panX || 0}%, ${portrait.panY || 0}%)`,
        }}
      />

      {/* Subtle vignette shade for depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-black/10" />
    </div>
  );
};
