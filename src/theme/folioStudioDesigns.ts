import type { BookMetadata, LayoutArchetypeId } from '../types';

/**
 * The six designs from abstract_book_cover_studio.html, expressed through one
 * renderer contract.  Keeping the contract here means the headless API and
 * the in-browser studio can add a design without adding another rendering
 * protocol or another request shape.
 */
export interface FolioStudioDesignInput {
  book: BookMetadata;
  seed: number;
  paletteIndex: number;
}

export interface FolioStudioDesign {
  id: LayoutArchetypeId;
  name: string;
  tag: string;
  render(ctx: CanvasRenderingContext2D, width: number, height: number, input: FolioStudioDesignInput): void;
}

type Rng = () => number;

const mulberry32 = (seed: number): Rng => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
};

const rgba = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  const n = Number.parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return `rgba(${(n >>> 16) & 255}, ${(n >>> 8) & 255}, ${n & 255}, ${alpha})`;
};

const text = (ctx: CanvasRenderingContext2D, value: string | undefined, x: number, y: number, maxWidth: number,
  size: number, minSize: number, family: string, weight: string, color: string, align: CanvasTextAlign = 'left', maxLines = 3,
  lineHeight = 1.16): number => {
  const clean = (value || '').trim();
  if (!clean) return 0;
  const words = clean.split(/\s+/);
  let currentSize = size;
  let lines: string[] = [];
  while (currentSize >= minSize) {
    ctx.font = `${weight} ${currentSize}px ${family}`;
    lines = [];
    let line = words[0] || '';
    for (const word of words.slice(1)) {
      const candidate = `${line} ${word}`;
      if (ctx.measureText(candidate).width <= maxWidth || !line) line = candidate;
      else { lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines) break;
    currentSize -= 2;
  }
  ctx.save();
  ctx.font = `${weight} ${currentSize}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const lineHeightPx = currentSize * lineHeight;
  lines.slice(0, maxLines).forEach((line, index) => ctx.fillText(line, x, y + index * lineHeightPx));
  ctx.restore();
  return Math.min(lines.length, maxLines) * lineHeightPx;
};

const grain = (ctx: CanvasRenderingContext2D, seed: number, alpha: number): void => {
  const rng = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 900; i++) {
    const x = rng() * ctx.canvas.width;
    const y = rng() * ctx.canvas.height;
    const shade = Math.floor(rng() * 255);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
};

const fonts = {
  title: '700 76px "Space Grotesk", Arial, sans-serif',
  subtitle: '400 28px Inter, Arial, sans-serif',
  author: '600 30px "Space Grotesk", Arial, sans-serif',
};

const bauhaus = (ctx: CanvasRenderingContext2D, w: number, h: number, { book, seed, paletteIndex }: FolioStudioDesignInput): void => {
  const p = [
    { bg: '#F3EFE6', primary: '#D63A2F', secondary: '#1D4E89', accent: '#E8A838', ink: '#18181B', muted: '#D8D0C1' },
    { bg: '#EAE4D7', primary: '#C84B31', secondary: '#2D4263', accent: '#ECDBBA', ink: '#191919', muted: '#CFC6B4' },
    { bg: '#F5F2EB', primary: '#E05A47', secondary: '#26547C', accent: '#FFD166', ink: '#141414', muted: '#DCD5C7' },
    { bg: '#EFECE6', primary: '#1B4965', secondary: '#D95D39', accent: '#F0A202', ink: '#121316', muted: '#D5CFC3' },
  ][paletteIndex % 4];
  const rng = mulberry32(seed + 11);
  ctx.fillStyle = p.bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.07)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(w * .1, 0); ctx.lineTo(w * .1, h); ctx.moveTo(w * .9, 0); ctx.lineTo(w * .9, h); ctx.moveTo(0, h * .34); ctx.lineTo(w, h * .34); ctx.stroke();
  const top = h * .36; const ah = h * .56; const variant = Math.floor(rng() * 3);
  ctx.save(); ctx.beginPath(); ctx.rect(w * .1, top, w * .8, ah); ctx.clip(); ctx.fillStyle = p.muted; ctx.fillRect(w * .1, top, w * .8, ah);
  if (variant === 0) {
    ctx.fillStyle = p.secondary; ctx.beginPath(); ctx.arc(w * .62, top + ah * .38, w * .34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.primary; ctx.beginPath(); ctx.arc(w * .35, top + ah * .58, w * .28, Math.PI, 0); ctx.fill();
    ctx.fillStyle = p.accent; ctx.fillRect(w * .1, top + ah * .58, w * .8, h * .12);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = p.primary; ctx.beginPath(); ctx.arc(w * .5, top + ah * .32, w * .18, 0, Math.PI * 2); ctx.fill();
  } else if (variant === 1) {
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(w * .68, top + ah * .26, w * .22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.primary; ctx.beginPath(); ctx.moveTo(w * .1, top + ah * .88); ctx.lineTo(w * .55, top + ah * .15); ctx.lineTo(w * .9, top + ah * .88); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = p.secondary; ctx.fillRect(w * .1, top + ah * .48, w * .52, ah * .42);
  } else {
    ctx.fillStyle = p.primary; ctx.fillRect(w * .1, top, w * .38, ah * .9);
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(w * .65, top + ah * .45, w * .32, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = p.secondary; ctx.beginPath(); ctx.arc(w * .48, top + ah * .45, w * .24, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = p.ink; ctx.fillRect(w * .1, h * .075, w * .8, 10);
  text(ctx, book.author.toUpperCase(), w * .1, h * .095, w * .8, 32, 22, fonts.author.slice(fonts.author.indexOf('"') + 1, fonts.author.lastIndexOf('"')), '600', p.ink, 'left', 1);
  const titleH = text(ctx, book.title.toUpperCase(), w * .1, h * .145, w * .8, 76, 42, 'Space Grotesk, Arial, sans-serif', '700', p.ink, 'left', 3, 1.08);
  text(ctx, book.subtitle, w * .1, h * .145 + titleH + 22, w * .75, 28, 20, 'Inter, Arial, sans-serif', '400', rgba(p.ink, .72), 'left', 2, 1.3);
  text(ctx, `SERIES // ${String(seed % 1000).padStart(3, '0')}`, w * .1, h * .945, w * .8, 20, 16, 'Space Mono, monospace', '600', p.ink, 'left', 1);
  grain(ctx, seed, .07);
};

const ethereal = (ctx: CanvasRenderingContext2D, w: number, h: number, { book, seed, paletteIndex }: FolioStudioDesignInput): void => {
  const p = [
    { bg: '#171321', c1: '#FF6B6B', c2: '#845EC2', c3: '#FFC75F', c4: '#4D8076', text: '#FFFDF9', sub: 'rgba(255,253,249,.78)' },
    { bg: '#0F1C2E', c1: '#38BDF8', c2: '#818CF8', c3: '#F472B6', c4: '#2DD4BF', text: '#F8FAFC', sub: 'rgba(248,250,252,.78)' },
    { bg: '#23141B', c1: '#FB7185', c2: '#F59E0B', c3: '#C084FC', c4: '#FB923C', text: '#FFFBEB', sub: 'rgba(255,251,235,.8)' },
    { bg: '#10211B', c1: '#34D399', c2: '#60A5FA', c3: '#FBBF24', c4: '#A78BFA', text: '#F0FDF4', sub: 'rgba(240,253,244,.8)' },
  ][paletteIndex % 4];
  const rng = mulberry32(seed + 22); ctx.fillStyle = p.bg; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const [color, x, y, r] of [[p.c1, .3, .27, .75], [p.c2, .55, .66, .85], [p.c3, .68, .78, .7], [p.c4, .42, .38, .65]] as const) {
    const gx = w * (.1 + rng() * .8), gy = h * (y - .1 + rng() * .2), gr = w * r;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr); grad.addColorStop(0, color); grad.addColorStop(.5, rgba(color, .45)); grad.addColorStop(1, rgba(color, 0)); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
  const vig = ctx.createRadialGradient(w * .5, h * .5, w * .25, w * .5, h * .5, h * .75); vig.addColorStop(0, 'rgba(0,0,0,.05)'); vig.addColorStop(1, 'rgba(0,0,0,.48)'); ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.strokeRect(w * .08, h * .06, w * .84, h * .88);
  text(ctx, book.author.toUpperCase(), w * .5, h * .11, w * .74, 28, 20, 'Space Grotesk, Arial, sans-serif', '600', p.sub, 'center', 1);
  ctx.fillStyle = p.text; ctx.beginPath(); ctx.moveTo(w * .5, h * .165); ctx.lineTo(w * .5 + 8, h * .165 + 8); ctx.lineTo(w * .5, h * .165 + 16); ctx.lineTo(w * .5 - 8, h * .165 + 8); ctx.closePath(); ctx.fill();
  const titleH = text(ctx, book.title, w * .5, h * .38, w * .76, 82, 44, 'Playfair Display, Georgia, serif', '700', p.text, 'center', 4, 1.15);
  text(ctx, book.subtitle, w * .5, h * .38 + titleH + 34, w * .68, 30, 20, 'Inter, Arial, sans-serif', '400', p.sub, 'center', 3, 1.35);
  grain(ctx, seed + 5, .055);
};

const topographic = (ctx: CanvasRenderingContext2D, w: number, h: number, { book, seed, paletteIndex }: FolioStudioDesignInput): void => {
  const p = [
    { top: '#0B3954', bottom: '#087E8B', line: '#BFD7EA', accent: '#FF5A5F', text: '#F4F9F9' },
    { top: '#2B193D', bottom: '#482673', line: '#F6AE2D', accent: '#F26419', text: '#FFF8F0' },
    { top: '#1B3B2B', bottom: '#2E5A44', line: '#D8E2DC', accent: '#E07A5F', text: '#F4F1DE' },
    { top: '#3D1E26', bottom: '#7A3045', line: '#F4ACB7', accent: '#FFE5D9', text: '#FFF5F7' },
  ][paletteIndex % 4];
  const rng = mulberry32(seed + 33); const bg = ctx.createLinearGradient(0, 0, w * .4, h); bg.addColorStop(0, p.top); bg.addColorStop(1, p.bottom); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  const f1 = .0022 + rng() * .0025, f2 = .0045 + rng() * .003, ph1 = rng() * Math.PI * 2, ph2 = rng() * Math.PI * 2, a1 = 95 + rng() * 80, a2 = 40 + rng() * 45;
  for (let i = 0; i < 46; i++) { const progress = i / 46, base = h * .28 + progress * h * .78; ctx.beginPath(); ctx.strokeStyle = i % 7 === 0 ? p.accent : rgba(p.line, .22 + progress * .35); ctx.lineWidth = i % 7 === 0 ? 3.5 : 1.8; for (let x = -20; x <= w + 20; x += 14) { const y = base + Math.sin(x * f1 + ph1 + i * .14) * a1 + Math.cos(x * f2 + ph2 - i * .09) * a2; if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
  const scrim = ctx.createLinearGradient(0, 0, 0, h * .48); scrim.addColorStop(0, rgba(p.top, .96)); scrim.addColorStop(.65, rgba(p.top, .78)); scrim.addColorStop(1, rgba(p.top, 0)); ctx.fillStyle = scrim; ctx.fillRect(0, 0, w, h * .48);
  ctx.fillStyle = p.accent; ctx.fillRect(w * .09, h * .08, 72, 8);
  const titleH = text(ctx, book.title, w * .09, h * .11, w * .82, 76, 42, 'Space Grotesk, Arial, sans-serif', '700', p.text, 'left', 3, 1.1);
  text(ctx, book.subtitle, w * .09, h * .11 + titleH + 24, w * .76, 28, 20, 'Inter, Arial, sans-serif', '400', rgba(p.text, .82), 'left', 2, 1.3);
  ctx.fillStyle = rgba(p.top, .88); ctx.fillRect(w * .09, h * .875, w * .82, 74); ctx.strokeStyle = rgba(p.line, .35); ctx.lineWidth = 2; ctx.strokeRect(w * .09, h * .875, w * .82, 74);
  text(ctx, book.author.toUpperCase(), w * .12, h * .892, w * .76, 30, 20, 'Space Grotesk, Arial, sans-serif', '600', p.text, 'left', 1);
  grain(ctx, seed + 9, .05);
};

const brutalist = (ctx: CanvasRenderingContext2D, w: number, h: number, { book, seed, paletteIndex }: FolioStudioDesignInput): void => {
  const p = [
    { bg: '#F4F4F0', ink: '#111111', g1: '#FF3B00', g2: '#FF9E00', grid: 'rgba(17,17,17,.14)' },
    { bg: '#111111', ink: '#F5F5F0', g1: '#00F5D4', g2: '#00BBF9', grid: 'rgba(245,245,240,.16)' },
    { bg: '#EAEAEA', ink: '#0A0A0A', g1: '#3A0CA3', g2: '#F72585', grid: 'rgba(10,10,10,.14)' },
    { bg: '#F8F5EE', ink: '#141414', g1: '#16A34A', g2: '#EAB308', grid: 'rgba(20,20,20,.14)' },
  ][paletteIndex % 4];
  const rng = mulberry32(seed + 44); ctx.fillStyle = p.bg; ctx.fillRect(0, 0, w, h); const m = w * .07, iw = w - m * 2, ih = h - m * 2;
  ctx.strokeStyle = p.grid; ctx.lineWidth = 2; for (let c = 0; c <= 4; c++) { const x = m + iw / 4 * c; ctx.beginPath(); ctx.moveTo(x, m); ctx.lineTo(x, h - m); ctx.stroke(); } for (let r = 0; r <= 6; r++) { const y = m + ih / 6 * r; ctx.beginPath(); ctx.moveTo(m, y); ctx.lineTo(w - m, y); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(m, m, iw, ih); ctx.clip(); const slash = ctx.createLinearGradient(0, h * .2, w, h * .85); slash.addColorStop(0, p.g1); slash.addColorStop(1, p.g2); const off = (rng() - .5) * 140; ctx.fillStyle = slash; ctx.beginPath(); ctx.moveTo(m - 50, h * .62 + off); ctx.lineTo(w - m + 50, h * .34 + off); ctx.lineTo(w - m + 50, h * .56 + off); ctx.lineTo(m - 50, h * .84 + off); ctx.closePath(); ctx.fill(); ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(w * .76, h * .76, 86, 0, Math.PI * 2); ctx.fill(); text(ctx, 'FIRST\nEDITION', w * .76, h * .737, 150, 22, 18, 'Space Mono, monospace', '700', p.bg, 'center', 2, 1.2); ctx.restore();
  ctx.fillStyle = p.ink; ctx.fillRect(m, m, iw, 14); const titleH = text(ctx, book.title.toUpperCase(), m, m + 36, iw * .92, 84, 44, 'Space Grotesk, Arial, sans-serif', '700', p.ink, 'left', 3, 1.02); text(ctx, book.subtitle, m, m + 36 + titleH + 24, iw * .68, 28, 20, 'Inter, Arial, sans-serif', '500', p.ink, 'left', 2, 1.25); ctx.fillRect(m, h - m - 95, iw * .62, 4); text(ctx, book.author.toUpperCase(), m, h - m - 72, iw * .62, 36, 22, 'Space Grotesk, Arial, sans-serif', '600', p.ink, 'left', 2);
  grain(ctx, seed + 14, .045);
};

const nocturne = (ctx: CanvasRenderingContext2D, w: number, h: number, { book, seed, paletteIndex }: FolioStudioDesignInput): void => {
  const p = [
    { bg: '#07080D', s1: '#6366F1', s2: '#EC4899', s3: '#06B6D4', glow: 'rgba(99,102,241,.35)', text: '#F8FAFC' },
    { bg: '#06090B', s1: '#10B981', s2: '#3B82F6', s3: '#A855F7', glow: 'rgba(16,185,129,.32)', text: '#F0FDF4' },
    { bg: '#0A0608', s1: '#F43F5E', s2: '#F59E0B', s3: '#8B5CF6', glow: 'rgba(244,63,94,.35)', text: '#FFF1F2' },
    { bg: '#06070C', s1: '#38BDF8', s2: '#FACC15', s3: '#F472B6', glow: 'rgba(56,189,248,.32)', text: '#F8FAFC' },
  ][paletteIndex % 4];
  const rng = mulberry32(seed + 55); ctx.fillStyle = p.bg; ctx.fillRect(0, 0, w, h); const ambient = ctx.createRadialGradient(w * .5, h * .48, 20, w * .5, h * .48, w * .75); ambient.addColorStop(0, p.glow); ambient.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = ambient; ctx.fillRect(0, 0, w, h);
  const colors = [p.s1, p.s2, p.s3]; for (let i = 0; i < 6; i++) { const cx = w * (.25 + rng() * .5), cy = h * (.34 + rng() * .36), size = 180 + rng() * 240, angle = rng() * Math.PI * 2; ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(0, -size * .85); ctx.lineTo(size * .65, size * .35); ctx.lineTo(-size * .15, size * .75); ctx.lineTo(-size * .7, -size * .1); ctx.closePath(); const g = ctx.createLinearGradient(-size * .6, -size * .6, size * .6, size * .6); g.addColorStop(0, rgba(colors[i % 3], .34)); g.addColorStop(.5, rgba(colors[(i + 1) % 3], .16)); g.addColorStop(1, 'rgba(255,255,255,.03)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  text(ctx, book.author.toUpperCase(), w * .5, h * .09, w * .8, 28, 20, 'Space Grotesk, Arial, sans-serif', '600', rgba(p.text, .65), 'center', 1); const divider = ctx.createLinearGradient(w * .3, 0, w * .7, 0); divider.addColorStop(0, 'rgba(255,255,255,0)'); divider.addColorStop(.5, p.s1); divider.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = divider; ctx.fillRect(w * .3, h * .135, w * .4, 3); const titleH = text(ctx, book.title, w * .5, h * .68, w * .82, 74, 40, 'Playfair Display, Georgia, serif', '700', p.text, 'center', 3, 1.12); text(ctx, book.subtitle, w * .5, h * .68 + titleH + 24, w * .74, 28, 19, 'Inter, Arial, sans-serif', '400', rgba(p.text, .72), 'center', 2, 1.3); grain(ctx, seed + 19, .05);
};

const botanical = (ctx: CanvasRenderingContext2D, w: number, h: number, { book, seed, paletteIndex }: FolioStudioDesignInput): void => {
  const p = [
    { skyTop: '#E8C5A5', skyBot: '#D98A6C', dune1: '#B85D43', dune2: '#8C3B2B', sun: '#FDF0D5', frame: '#FDF0D5', text: '#2A1510' },
    { skyTop: '#D8E2DC', skyBot: '#A3B18A', dune1: '#588157', dune2: '#3A5A40', sun: '#FEFAE0', frame: '#FEFAE0', text: '#1B2A1E' },
    { skyTop: '#F2D5B8', skyBot: '#E09F7D', dune1: '#9E4738', dune2: '#5C2626', sun: '#FFF8EB', frame: '#FFF8EB', text: '#2B1212' },
    { skyTop: '#E6CCB2', skyBot: '#DDB892', dune1: '#B08968', dune2: '#7F5539', sun: '#EDE0D4', frame: '#EDE0D4', text: '#2C1D13' },
  ][paletteIndex % 4];
  const rng = mulberry32(seed + 66); ctx.fillStyle = p.frame; ctx.fillRect(0, 0, w, h); const padX = w * .11, padTop = h * .08, winW = w - padX * 2, winH = h * .56;
  ctx.save(); ctx.beginPath(); const radius = winW / 2; ctx.arc(w / 2, padTop + radius, radius, Math.PI, 0); ctx.lineTo(padX + winW, padTop + winH); ctx.lineTo(padX, padTop + winH); ctx.closePath(); ctx.clip(); const sky = ctx.createLinearGradient(0, padTop, 0, padTop + winH); sky.addColorStop(0, p.skyTop); sky.addColorStop(1, p.skyBot); ctx.fillStyle = sky; ctx.fillRect(padX, padTop, winW, winH); const sunX = w * (.35 + rng() * .3), sunY = padTop + winH * (.34 + rng() * .14); ctx.fillStyle = p.sun; ctx.beginPath(); ctx.arc(sunX, sunY, 96, 0, Math.PI * 2); ctx.fill(); const shift = (rng() - .5) * 90; ctx.fillStyle = p.dune1; ctx.beginPath(); ctx.moveTo(padX, padTop + winH); ctx.lineTo(padX, padTop + winH * .64); ctx.quadraticCurveTo(w * .45 + shift, padTop + winH * .52, padX + winW, padTop + winH * .68); ctx.lineTo(padX + winW, padTop + winH); ctx.closePath(); ctx.fill(); ctx.fillStyle = p.dune2; ctx.beginPath(); ctx.moveTo(padX, padTop + winH); ctx.lineTo(padX, padTop + winH * .78); ctx.quadraticCurveTo(w * .6 - shift, padTop + winH * .64, padX + winW, padTop + winH * .76); ctx.lineTo(padX + winW, padTop + winH); ctx.closePath(); ctx.fill(); ctx.restore();
  const start = padTop + winH + 54; const titleH = text(ctx, book.title, w * .5, start, w * .78, 66, 38, 'Playfair Display, Georgia, serif', '700', p.text, 'center', 3, 1.12); text(ctx, book.subtitle, w * .5, start + titleH + 20, w * .72, 26, 18, 'Inter, Arial, sans-serif', '400', rgba(p.text, .72), 'center', 2, 1.3); ctx.fillStyle = rgba(p.text, .35); ctx.fillRect(w * .44, h * .895, w * .12, 2); text(ctx, book.author.toUpperCase(), w * .5, h * .912, w * .76, 26, 18, 'Space Grotesk, Arial, sans-serif', '600', p.text, 'center', 1); grain(ctx, seed + 25, .06);
};

export const FOLIO_STUDIO_DESIGNS: readonly FolioStudioDesign[] = [
  { id: 'folio_bauhaus', name: 'Bauhaus Geometry', tag: 'Modernist Constructivism', render: bauhaus },
  { id: 'folio_ethereal', name: 'Ethereal Mesh', tag: 'Fluid Chromatic Blur', render: ethereal },
  { id: 'folio_topographic', name: 'Topographic Flow', tag: 'Procedural Contours', render: topographic },
  { id: 'folio_brutalist', name: 'Brutalist Swiss', tag: 'International Typographic', render: brutalist },
  { id: 'folio_nocturne', name: 'Nocturne Prism', tag: 'Obsidian Light Refraction', render: nocturne },
  { id: 'folio_botanical', name: 'Botanical Horizon', tag: 'Sunlit Terracotta Minimal', render: botanical },
];

export function folioDesignFor(id: LayoutArchetypeId): FolioStudioDesign | undefined {
  return FOLIO_STUDIO_DESIGNS.find(design => design.id === id);
}

export function folioInput(book: BookMetadata, paletteId: string): FolioStudioDesignInput {
  return { book, seed: hash(`${book.author}\0${book.title}`), paletteIndex: hash(paletteId) };
}
