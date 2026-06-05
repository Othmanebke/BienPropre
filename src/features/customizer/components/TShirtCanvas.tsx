import type { TextLayer, ImageLayer } from '@/types/shop.types';

// ─── SVG coordinate system ───────────────────────────────────────
// ViewBox: 0 0 300 340
// T-shirt silhouette path (front view, includes collar curve)
const TSHIRT_PATH =
  'M55,65 L5,98 L32,128 L78,108 L78,315 L222,315 L222,108 ' +
  'L268,128 L295,98 L245,65 C220,48 180,42 150,42 C120,42 80,48 55,65 Z';

const SVG_W = 300;
const SVG_H = 340;

// Print zone inside the body (centred, fraction of body area)
const PZ = { x: 108, y: 118, w: 84, h: 108 } as const;

// ─── Helpers ─────────────────────────────────────────────────────
function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 145;
}

// ─── Component ───────────────────────────────────────────────────
interface TShirtCanvasProps {
  color: string;
  textLayer: TextLayer | null;
  imageLayer: ImageLayer | null;
}

export function TShirtCanvas({ color, textLayer, imageLayer }: TShirtCanvasProps) {
  const light = isLightColor(color);
  const dashStroke = light ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.28)';
  const creaseStroke = light ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.055)';

  // Map 0-100% store positions → absolute SVG coordinates within print zone
  const textX = PZ.x + ((textLayer?.x ?? 50) / 100) * PZ.w;
  const textY = PZ.y + ((textLayer?.y ?? 50) / 100) * PZ.h;

  const imgX = PZ.x + ((imageLayer?.x ?? 50) / 100) * PZ.w;
  const imgY = PZ.y + ((imageLayer?.y ?? 50) / 100) * PZ.h;
  // Base image display size = 50 SVG units, modified by scale factor
  const imgSize = 50 * (imageLayer?.scale ?? 1);

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${SVG_W} / ${SVG_H}` }}
      aria-label="Aperçu du t-shirt personnalisé"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft drop-shadow for the shirt body */}
          <filter id="shirt-shadow" x="-12%" y="-6%" width="124%" height="118%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="10"
              floodColor="#000000"
              floodOpacity="0.14"
            />
          </filter>

          {/* Clip path that constrains text/image to the print zone */}
          <clipPath id="print-zone-clip">
            <rect x={PZ.x} y={PZ.y} width={PZ.w} height={PZ.h} />
          </clipPath>
        </defs>

        {/* ── T-shirt body ── */}
        <path
          d={TSHIRT_PATH}
          fill={color}
          filter="url(#shirt-shadow)"
          style={{ transition: 'fill 220ms ease' }}
        />

        {/* ── Subtle centre-fold crease ── */}
        <line
          x1="150"
          y1="95"
          x2="150"
          y2="305"
          stroke={creaseStroke}
          strokeWidth="11"
        />

        {/* ── Uploaded image layer (clipped to print zone) ── */}
        {imageLayer !== null && (
          <image
            href={imageLayer.previewUrl}
            x={imgX - imgSize / 2}
            y={imgY - imgSize / 2}
            width={imgSize}
            height={imgSize}
            clipPath="url(#print-zone-clip)"
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* ── Custom text layer (clipped to print zone) ── */}
        {textLayer !== null && textLayer.text.trim() !== '' && (
          <text
            x={textX}
            y={textY}
            fill={textLayer.color}
            fontSize={textLayer.fontSize}
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
            clipPath="url(#print-zone-clip)"
            style={{ userSelect: 'none' }}
          >
            {textLayer.text}
          </text>
        )}

        {/* ── Print zone dashed border ── */}
        <rect
          x={PZ.x}
          y={PZ.y}
          width={PZ.w}
          height={PZ.h}
          fill="none"
          stroke={dashStroke}
          strokeWidth="1.5"
          strokeDasharray="5 3"
          rx="2"
        />

        {/* ── "Zone d'impression" label below the dashed rect ── */}
        <text
          x={PZ.x + PZ.w / 2}
          y={PZ.y + PZ.h + 10}
          fill={dashStroke}
          fontSize="7"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
        >
          zone d&apos;impression
        </text>
      </svg>
    </div>
  );
}
