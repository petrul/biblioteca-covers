import React from 'react';
import { HardcoverEffectConfig } from '../types';

interface HardcoverOverlayProps {
  config?: HardcoverEffectConfig;
  bgColor?: string;
  className?: string;
}

/**
 * Calculates perceived luminance of a hex color (0 = black, 1 = white)
 */
function getLuminance(hex?: string): number {
  if (!hex) return 0.5;
  const clean = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255;
    g = parseInt(clean[1] + clean[1], 16) / 255;
    b = parseInt(clean[2] + clean[2], 16) / 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16) / 255;
    g = parseInt(clean.slice(2, 4), 16) / 255;
    b = parseInt(clean.slice(4, 6), 16) / 255;
  }
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export const HardcoverOverlay: React.FC<HardcoverOverlayProps> = ({
  config,
  bgColor = '#F9F7F2',
  className = '',
}) => {
  if (!config || !config.enabled) return null;

  const isLight = getLuminance(bgColor) > 0.45;
  // Allow ultra-fine spine width down to 6px (default: 12px)
  const spineWidth = config.spineWidthPx ?? 12;
  const creaseOpacity = config.creaseDepth ?? 0.5;
  const sheenOpacity = config.sheenIntensity ?? 0.3;

  // Ultra-fine groove sizing proportional to spine width
  const grooveWidth = spineWidth < 14 ? 1.5 : spineWidth < 22 ? 2.5 : 3.5;
  const falloffWidth = spineWidth < 14 ? 6 : spineWidth < 22 ? 9 : 14;

  // Adaptive textures for light vs dark book covers
  const getTextureStyle = (): React.CSSProperties => {
    switch (config.textureStyle) {
      case 'buckram_cloth':
        return isLight
          ? {
              backgroundImage: `radial-gradient(rgba(70, 50, 30, 0.09) 15%, transparent 16%), radial-gradient(rgba(255, 255, 255, 0.4) 15%, transparent 16%)`,
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 2px 2px',
              mixBlendMode: 'multiply',
              opacity: 0.35,
            }
          : {
              backgroundImage: `radial-gradient(rgba(0,0,0,0.22) 15%, transparent 16%), radial-gradient(rgba(255,255,255,0.15) 15%, transparent 16%)`,
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 2px 2px',
              mixBlendMode: 'overlay',
              opacity: 0.45,
            };
      case 'fine_linen':
        return isLight
          ? {
              backgroundImage: `repeating-linear-gradient(0deg, rgba(80, 55, 30, 0.05) 0, rgba(80, 55, 30, 0.05) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(80, 55, 30, 0.05) 0, rgba(80, 55, 30, 0.05) 1px, transparent 1px, transparent 3px)`,
              mixBlendMode: 'multiply',
              opacity: 0.4,
            }
          : {
              backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)`,
              mixBlendMode: 'overlay',
              opacity: 0.4,
            };
      case 'leather_grain':
        return {
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)`,
          backgroundSize: '6px 6px',
          mixBlendMode: isLight ? 'multiply' : 'overlay',
          opacity: 0.35,
        };
      case 'antique_board':
        return {
          backgroundImage: `radial-gradient(rgba(140, 70, 20, 0.08) 1px, transparent 1px)`,
          backgroundSize: '5px 5px',
          mixBlendMode: 'multiply',
          opacity: 0.25,
        };
      case 'smooth':
      default:
        return { display: 'none' };
    }
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-30 select-none overflow-hidden rounded-r-xs ${className}`}
      style={{
        boxShadow: isLight
          ? 'inset 0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7), inset -1px 0 2px rgba(0, 0, 0, 0.08)'
          : 'inset 0 0 0 1px rgba(255, 255, 255, 0.15), inset -1px 0 2px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* 1. Tactile Cloth / Material Texture Overlay */}
      {config.textureStyle !== 'smooth' && (
        <div className="absolute inset-0 pointer-events-none" style={getTextureStyle()} />
      )}

      {/* 2. Apple Books Cylindrical Surface Sheen (Delicate, whisper-soft on light covers) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLight
            ? `linear-gradient(
                to right,
                rgba(60, 40, 20, 0.05) 0%,
                rgba(255, 255, 255, 0.45) ${spineWidth * 0.45}px,
                rgba(60, 40, 20, 0.03) ${spineWidth - 2}px,
                rgba(50, 35, 20, 0.08) ${spineWidth}px,
                rgba(255, 255, 255, 0.6) ${spineWidth + 2}px,
                rgba(255, 255, 255, 0.2) ${spineWidth + 8}px,
                transparent ${spineWidth + 24}px,
                rgba(255, 255, 255, 0.15) 75%,
                rgba(60, 40, 20, 0.03) 98%,
                rgba(50, 30, 10, 0.06) 100%
              )`
            : `linear-gradient(
                to right,
                rgba(0, 0, 0, 0.4) 0%,
                rgba(255, 255, 255, 0.25) ${spineWidth * 0.45}px,
                rgba(0, 0, 0, 0.15) ${spineWidth - 4}px,
                rgba(0, 0, 0, 0.4) ${spineWidth}px,
                rgba(255, 255, 255, 0.28) ${spineWidth + 3}px,
                rgba(255, 255, 255, 0.08) ${spineWidth + 14}px,
                transparent ${spineWidth + 50}px,
                rgba(255, 255, 255, 0.04) 75%,
                rgba(0, 0, 0, 0.22) 99%,
                rgba(0, 0, 0, 0.45) 100%
              )`,
          opacity: sheenOpacity,
          mixBlendMode: isLight ? 'soft-light' : 'screen',
        }}
      />

      {/* 3. "Cotorul Cărții Vizibil" (Left Book Spine / Hinge Joint) */}
      {config.spineVisible && (
        <>
          {/* A. Spine Cylinder Curvature (Very delicate warm shading on light paper) */}
          <div
            className="absolute top-0 bottom-0 left-0 pointer-events-none"
            style={{
              width: `${spineWidth}px`,
              background: isLight
                ? `linear-gradient(
                    to right,
                    rgba(60, 40, 20, 0.12) 0%,
                    rgba(60, 40, 20, 0.04) 22%,
                    rgba(255, 255, 255, 0.45) 50%,
                    rgba(70, 45, 20, 0.04) 80%,
                    rgba(60, 35, 15, 0.12) 100%
                  )`
                : `linear-gradient(
                    to right,
                    rgba(0, 0, 0, 0.5) 0%,
                    rgba(0, 0, 0, 0.25) 15%,
                    rgba(255, 255, 255, 0.2) 35%,
                    rgba(255, 255, 255, 0.05) 60%,
                    rgba(0, 0, 0, 0.15) 85%,
                    rgba(0, 0, 0, 0.35) 100%
                  )`,
              mixBlendMode: isLight ? 'multiply' : 'normal',
              boxShadow: isLight
                ? 'inset 1px 0 0 rgba(255, 255, 255, 0.5)'
                : 'inset 1px 0 0 rgba(255, 255, 255, 0.2)',
            }}
          />

          {/* B. Deep Hinge Joint Crease Groove (Șanțul coperții / Book Joint) */}
          {/* Finer width & gentle warm occlusion on light backgrounds */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${spineWidth}px`,
              width: `${grooveWidth}px`,
              background: isLight
                ? `linear-gradient(
                    to right,
                    rgba(45, 30, 15, ${0.45 * creaseOpacity}) 0%,
                    rgba(45, 30, 15, ${0.25 * creaseOpacity}) 30%,
                    rgba(255, 255, 255, ${0.85 * creaseOpacity}) 55%,
                    rgba(255, 255, 255, ${0.3 * creaseOpacity}) 100%
                  )`
                : `linear-gradient(
                    to right,
                    rgba(0, 0, 0, ${0.75 * creaseOpacity}) 0%,
                    rgba(0, 0, 0, ${0.5 * creaseOpacity}) 35%,
                    rgba(255, 255, 255, ${0.45 * creaseOpacity}) 55%,
                    rgba(255, 255, 255, ${0.1 * creaseOpacity}) 100%
                  )`,
              mixBlendMode: isLight ? 'multiply' : 'normal',
              boxShadow: isLight
                ? `0 0 1px rgba(45, 30, 15, ${0.25 * creaseOpacity})`
                : `0 0 2px rgba(0, 0, 0, ${0.4 * creaseOpacity})`,
            }}
          />

          {/* C. Right-lip Embossed Catch-light hairline */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${spineWidth + grooveWidth - 0.5}px`,
              width: '1px',
              background: isLight
                ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5))`
                : `linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))`,
              mixBlendMode: isLight ? 'overlay' : 'screen',
            }}
          />

          {/* D. Ambient Occlusion Falloff (Whisper-soft, very faint on light paper) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${spineWidth + grooveWidth + 0.5}px`,
              width: `${falloffWidth}px`,
              background: isLight
                ? `linear-gradient(to right, rgba(55, 35, 15, ${0.06 * creaseOpacity}), transparent)`
                : `linear-gradient(to right, rgba(0, 0, 0, ${0.2 * creaseOpacity}), transparent)`,
              mixBlendMode: isLight ? 'multiply' : 'normal',
            }}
          />

          {/* E. Spine Outer Fold Hairline Shadow on far-left edge */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[1.5px] pointer-events-none"
            style={{
              background: isLight
                ? 'linear-gradient(to right, rgba(40, 25, 10, 0.18), transparent)'
                : 'linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent)',
              mixBlendMode: isLight ? 'multiply' : 'normal',
            }}
          />
        </>
      )}

      {/* 4. Hardcover Cardboard Edge Bevel (Top & Bottom Rim) */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: isLight
            ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.7), transparent)'
            : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.35), transparent)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{
          background: isLight
            ? 'linear-gradient(to top, rgba(60, 40, 20, 0.12), transparent)'
            : 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
          mixBlendMode: isLight ? 'multiply' : 'normal',
        }}
      />

      {/* 5. Right Edge Page Block Overhang */}
      {config.showPageEdge && (
        <div
          className="absolute top-1 bottom-1 -right-[2.5px] w-[2.5px] pointer-events-none rounded-r-2xs"
          style={{
            background: 'repeating-linear-gradient(to bottom, #FAF7F0, #FAF7F0 1px, #E8E2D8 1px, #E8E2D8 2px)',
            boxShadow: isLight
              ? '1px 0 1px rgba(60, 40, 20, 0.1)'
              : '1px 0 2px rgba(0, 0, 0, 0.25)',
          }}
        />
      )}
    </div>
  );
};
