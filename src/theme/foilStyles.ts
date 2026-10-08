import React from 'react';
import { FoilEffectStyle } from '../types';

/**
 * Returns CSS properties to render hot-stamped gold or silver foil text.
 * Especially magnificent on dark book covers (Folio Society, Navy, Obsidian, Crimson).
 */
export function getFoilTitleStyle(
  foilEffect?: FoilEffectStyle,
  fallbackColor?: string
): React.CSSProperties {
  if (!foilEffect || foilEffect === 'none') {
    return fallbackColor ? { color: fallbackColor } : {};
  }

  switch (foilEffect) {
    case 'gold':
      return {
        backgroundImage:
          'linear-gradient(135deg, #FFF5C0 0%, #E5B834 20%, #FFF9D8 40%, #A57316 65%, #F7DC84 82%, #855903 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: '#E5B834',
        filter:
          'drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 3px rgba(245, 220, 132, 0.4))',
        letterSpacing: '0.04em',
      };

    case 'silver':
      return {
        backgroundImage:
          'linear-gradient(135deg, #FFFFFF 0%, #D4D8DC 20%, #FFFFFF 40%, #878C94 65%, #EAEDF2 82%, #5D636B 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: '#D4D8DC',
        filter:
          'drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.45))',
        letterSpacing: '0.04em',
      };

    case 'rose_gold':
      return {
        backgroundImage:
          'linear-gradient(135deg, #FFF0F0 0%, #E8A294 20%, #FFF6F5 40%, #A8594E 65%, #FCD5CD 82%, #7B3A31 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: '#E8A294',
        filter:
          'drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 3px rgba(232, 162, 148, 0.4))',
        letterSpacing: '0.04em',
      };

    default:
      return fallbackColor ? { color: fallbackColor } : {};
  }
}
