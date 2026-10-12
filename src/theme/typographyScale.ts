import React from 'react';

/**
 * Returns dynamic scaling styles for title and author based on font size multipliers.
 * When multiplier is 1 (or undefined), it returns empty style so default layout classes dictate size.
 */
export function getTitleScaleStyle(scale?: number, baseRem: number = 1.35): React.CSSProperties {
  if (!scale || scale === 1) return {};
  return {
    fontSize: `${(baseRem * scale).toFixed(3)}rem`,
    lineHeight: 1.15,
  };
}

export function getAuthorScaleStyle(scale?: number, baseRem: number = 0.85): React.CSSProperties {
  if (!scale || scale === 1) return {};
  return {
    fontSize: `${(baseRem * scale).toFixed(3)}rem`,
  };
}
