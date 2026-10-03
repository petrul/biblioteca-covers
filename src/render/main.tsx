import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { toSvg } from 'html-to-image';
import '../index.css';
import { CoverCanvas } from '../components/CoverCanvas';
import { ResolvedCoverSpec } from '../utils/coverRequest';

declare global {
  interface Window {
    __coverReady: boolean;
    __exportSvg: () => Promise<string>;
    __coverError: string | null;
  }
}

window.__coverReady = false;
window.__coverError = null;

function decodePayload(raw: string): ResolvedCoverSpec | null {
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e: any) {
    window.__coverError = `Invalid render payload: ${e?.message || e}`;
    return null;
  }
}

function waitForAssets(): Promise<void> {
  return Promise.all([
    document.fonts.ready,
    ...Array.from(document.images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })
    ),
  ]).then(
    () =>
      // Small settle delay for late effects (gradients, async state)
      new Promise<void>((resolve) => setTimeout(resolve, 200))
  );
}

const HeadlessCover: React.FC<{ spec: ResolvedCoverSpec }> = ({ spec }) => {
  useEffect(() => {
    let cancelled = false;
    waitForAssets()
      .then(() => {
        if (!cancelled) window.__coverReady = true;
      })
      .catch((e: any) => {
        window.__coverError = `Asset loading failed: ${e?.message || e}`;
        window.__coverReady = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ width: spec.render.width }}>
      <CoverCanvas book={spec.book} portrait={spec.portrait} theme={spec.theme} />
    </div>
  );
};

const ErrorPage: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ fontFamily: 'monospace', padding: 24, color: '#b91c1c' }}>{message}</div>
);

const raw = new URLSearchParams(window.location.search).get('payload');
const spec = raw ? decodePayload(raw) : null;

if (!spec && !window.__coverError) {
  window.__coverError = 'Missing ?payload= render spec parameter';
}

window.__exportSvg = async () => {
  const node = document.getElementById('book-cover-export-node');
  if (!node) throw new Error('Cover node not found');
  return toSvg(node, { quality: 0.95 });
};

createRoot(document.getElementById('root')!).render(
  spec ? (
    <HeadlessCover spec={spec} />
  ) : (
    <ErrorPage message={window.__coverError || 'Unknown render error'} />
  )
);
