import React, { useEffect, useRef } from 'react';
import type { BookMetadata, CoverThemeConfig } from '../../types';
import { folioDesignFor, folioInput } from '../folioStudioDesigns';

export const FolioStudioCanvas: React.FC<{ book: BookMetadata; theme: CoverThemeConfig }> = ({ book, theme }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const width = 1200;
    const height = 1800;
    canvas.width = width;
    canvas.height = height;
    const design = folioDesignFor(theme.archetypeId);
    if (!design) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    design.render(ctx, width, height, folioInput(book, theme.palette.id));
  }, [book, theme]);
  return <canvas ref={ref} aria-label="Generated book cover" style={{ display: 'block', width: '100%', height: 'auto' }} />;
};
