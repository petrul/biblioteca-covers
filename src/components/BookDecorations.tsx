import React from 'react';
import QRCode from 'qrcode';
import { QrLogoConfig } from '../types';

export const PublisherMark: React.FC<{
  style: 'oxford' | 'folio' | 'penguin' | 'monogram' | 'classical_owl' | 'urn';
  color?: string;
  size?: number;
  className?: string;
}> = ({ style, color = 'currentColor', size = 32, className = '' }) => {
  switch (style) {
    case 'oxford':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <rect x="8" y="6" width="32" height="36" rx="2" stroke={color} strokeWidth="1.5" />
          <path d="M14 12H34M14 18H34M14 24H28M14 30H34" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M24 6V42" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="24" cy="36" r="3" fill={color} fillOpacity="0.8" />
        </svg>
      );
    case 'folio':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="16.5" stroke={color} strokeWidth="0.8" strokeDasharray="3 2" />
          <path
            d="M17 31V17H25C27.5 17 29 18.5 29 20.5C29 22.5 27.5 24 25 24H17M23 24H17"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M22 28L31 31" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'classical_owl':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <ellipse cx="24" cy="26" rx="14" ry="16" stroke={color} strokeWidth="1.4" />
          <circle cx="19" cy="20" r="4.5" stroke={color} strokeWidth="1.2" />
          <circle cx="29" cy="20" r="4.5" stroke={color} strokeWidth="1.2" />
          <circle cx="19" cy="20" r="1.5" fill={color} />
          <circle cx="29" cy="20" r="1.5" fill={color} />
          <path d="M24 23L22 27H26L24 23Z" fill={color} />
          <path d="M12 14L18 17M36 14L30 17" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M19 42L24 38L29 42" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    case 'penguin':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <ellipse cx="24" cy="24" rx="16" ry="20" stroke={color} strokeWidth="1.5" />
          <path
            d="M24 8C19 8 16 13 16 20C16 28 18 38 24 38C30 38 32 28 32 20C32 13 29 8 24 8Z"
            fill={color}
            fillOpacity="0.15"
            stroke={color}
            strokeWidth="1.2"
          />
          <circle cx="22" cy="14" r="1.5" fill={color} />
          <path d="M18 16L12 18L18 20" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    case 'urn':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M16 12C16 12 18 8 24 8C30 8 32 12 32 12M12 14H36M15 14L17 26C17 31 20 35 24 35C28 35 31 31 31 26L33 14M20 35V40H28V35M14 40H34"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'monogram':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <rect x="8" y="8" width="32" height="32" transform="rotate(45 24 24)" stroke={color} strokeWidth="1.4" />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fill={color}
            fontFamily="Cinzel, Georgia, serif"
            fontSize="14"
            fontWeight="bold"
            letterSpacing="1"
          >
            FC
          </text>
        </svg>
      );
  }
};

export const GildedCornerOrnament: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
  size?: number;
}> = ({ position, color = '#D4AF37', size = 36 }) => {
  const rotation =
    position === 'top-right'
      ? 'rotate(90deg)'
      : position === 'bottom-right'
      ? 'rotate(180deg)'
      : position === 'bottom-left'
      ? 'rotate(270deg)'
      : 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: rotation }}
    >
      <path d="M4 4H28M4 4V28" stroke={color} strokeWidth="1.8" strokeLinecap="square" />
      <path d="M8 8H22M8 8V22" stroke={color} strokeWidth="1" strokeLinecap="square" />
      <path d="M12 12C16 12 20 16 20 20" stroke={color} strokeWidth="1" strokeDasharray="1.5 1.5" />
      <circle cx="16" cy="16" r="2" fill={color} />
      <path d="M4 4L14 14" stroke={color} strokeWidth="0.8" />
    </svg>
  );
};

export const BarcodeSvg: React.FC<{
  isbn: string;
  price?: string;
  className?: string;
  color?: string;
}> = ({ isbn, price = '$19.99 US', className = '', color = '#1C1917' }) => {
  return (
    <div className={`flex flex-col items-center bg-white p-2 border border-stone-300 rounded-xs shadow-xs ${className}`}>
      <svg width="150" height="48" viewBox="0 0 150 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Synthetic barcode stripes based on digits */}
        {[
          2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2,
          1, 4, 2, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 2, 4, 1, 3, 2, 1,
        ].map((w, idx) => {
          const x = 8 + idx * 3;
          return <rect key={idx} x={x} y="4" width={w > 2 ? 2.2 : 1} height="36" fill={color} />;
        })}
      </svg>
      <div className="flex justify-between w-full text-[9px] font-mono tracking-tighter text-stone-700 px-1 mt-0.5">
        <span>ISBN {isbn || '978-0-14-143947-1'}</span>
        <span>{price}</span>
      </div>
    </div>
  );
};

export const BookQrCode: React.FC<{
  url: string;
  label?: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  logo?: QrLogoConfig;
}> = ({
  url,
  label = 'Scan for eBook',
  size = 50,
  className = '',
  darkColor = '#1C1917',
  lightColor = '#FFFFFF',
  logo,
}) => {
  const [dataUrl, setDataUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: size * 3,
      margin: 1,
      errorCorrectionLevel: 'H', // High (30% recovery) to support centered publisher logos
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [url, size, darkColor, lightColor]);

  // Center logo size calculation (20% - 28% of QR size for perfect readability)
  const logoPercent = Math.min(Math.max(logo?.sizePercent ?? 24, 18), 30);
  const badgeSize = Math.round(size * (logoPercent / 100));

  return (
    <div
      className={`flex flex-col items-center bg-white p-1.5 border border-stone-300 rounded-xs shadow-xs text-stone-900 select-none ${className}`}
      title={`Scannable QR: ${url}`}
    >
      <div className="relative inline-block" style={{ width: `${size}px`, height: `${size}px` }}>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`Scan to open ${url}`}
            width={size}
            height={size}
            className="select-none block w-full h-full"
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        ) : (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="bg-stone-100 flex items-center justify-center text-[8px] text-stone-400 font-mono"
          >
            QR
          </div>
        )}

        {/* Centered Publisher Logo Overlay */}
        {logo && logo.enabled && (logo.url || logo.presetStyle) && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden pointer-events-none ${
              logo.shape === 'circle'
                ? 'rounded-full'
                : logo.shape === 'square'
                ? 'rounded-none'
                : 'rounded-xs'
            }`}
            style={{
              width: `${badgeSize}px`,
              height: `${badgeSize}px`,
              backgroundColor: lightColor,
              boxShadow: `0 0 0 1.5px ${lightColor}, 0 1px 3px rgba(0,0,0,0.35)`,
              padding: badgeSize < 16 ? '1px' : '2px',
            }}
          >
            {logo.url ? (
              <img
                src={logo.url}
                alt="Publisher Mark"
                className="w-full h-full object-contain"
              />
            ) : logo.presetStyle ? (
              <PublisherMark
                style={logo.presetStyle}
                color={darkColor}
                size={Math.max(Math.round(badgeSize * 0.82), 8)}
              />
            ) : null}
          </div>
        )}
      </div>

      {label && (
        <span className="text-[7px] uppercase tracking-wider text-stone-700 font-mono mt-1 text-center font-semibold leading-tight max-w-[65px]">
          {label}
        </span>
      )}
    </div>
  );
};

