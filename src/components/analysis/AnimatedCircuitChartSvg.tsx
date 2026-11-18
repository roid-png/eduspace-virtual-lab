import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CircuitChartSeries } from '../../engines/physicsCircuit';

interface AnimatedCircuitChartSvgProps {
  variants: CircuitChartSeries[];
}

function interpolateY(
  points: Array<{ x: number; y: number }>,
  targetX: number,
): number {
  if (points.length === 0) return 0;
  if (targetX <= points[0].x) return points[0].y;
  if (targetX >= points[points.length - 1].x) return points[points.length - 1].y;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (targetX >= a.x && targetX <= b.x) {
      const span = b.x - a.x || 1;
      const t = (targetX - a.x) / span;
      return a.y + (b.y - a.y) * t;
    }
  }
  return points[points.length - 1].y;
}

export function AnimatedCircuitChartSvg({
  variants,
}: AnimatedCircuitChartSvgProps) {
  const [activeTab, setActiveTab] = useState<CircuitChartSeries['id']>(
    variants[0]?.id ?? 'i-v',
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  const series = variants.find((v) => v.id === activeTab) ?? variants[0];

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let start: number | null = null;
    const cycleMs = 4200;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = (ts - start) % cycleMs;
      setScanProgress(elapsed / cycleMs);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, activeTab]);

  if (!series || series.primaryPoints.length < 2) {
    return null;
  }

  const width = 460;
  const height = 210;
  const padLeft = 48;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allPoints = [
    ...series.primaryPoints,
    ...(series.secondaryPoints ?? []),
    ...(series.tertiaryPoints ?? []),
    { x: series.activeX, y: series.activeY },
  ];

  const xs = allPoints.map((p) => p.x);
  const ys = allPoints.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(0, ...ys);
  const rawMaxY = Math.max(...ys, 0.5);
  const maxY = rawMaxY * 1.12;

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const toSvgX = (x: number) => padLeft + ((x - minX) / spanX) * plotW;
  const toSvgY = (y: number) => padTop + (1 - (y - minY) / spanY) * plotH;

  const buildPath = (pts: Array<{ x: number; y: number }>) =>
    pts
      .map(
        (pt, idx) =>
          `${idx === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(2)} ${toSvgY(pt.y).toFixed(2)}`,
      )
      .join(' ');

  const primaryPath = buildPath(series.primaryPoints);
  const secondaryPath = series.secondaryPoints
    ? buildPath(series.secondaryPoints)
    : null;
  const tertiaryPath = series.tertiaryPoints
    ? buildPath(series.tertiaryPoints)
    : null;

  const areaPath = `${primaryPath} L ${toSvgX(series.primaryPoints[series.primaryPoints.length - 1].x).toFixed(2)} ${toSvgY(0).toFixed(2)} L ${toSvgX(series.primaryPoints[0].x).toFixed(2)} ${toSvgY(0).toFixed(2)} Z`;

  const scanX = minX + scanProgress * spanX;
  const scanPrimaryY = interpolateY(series.primaryPoints, scanX);
  const scanSecondaryY = series.secondaryPoints
    ? interpolateY(series.secondaryPoints, scanX)
    : null;
  const scanTertiaryY = series.tertiaryPoints
    ? interpolateY(series.tertiaryPoints, scanX)
    : null;

  const scanSvgX = toSvgX(scanX);
  const scanSvgY = toSvgY(scanPrimaryY);
  const activeSvgX = toSvgX(series.activeX);
  const activeSvgY = toSvgY(series.activeY);

  const yTicks = [0, 0.33, 0.66, 1].map((t) => minY + spanY * t);
  const xTicks = [0, 0.33, 0.66, 1].map((t) => minX + spanX * t);

  const xUnit = series.id === 'i-r' ? ' Ω' : ' V';
  const yUnit = series.yLabel.includes('(V)') ? ' V' : ' A';

  return (
    <div className="tactile-inset flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-[#23272A]">
            {series.title}
          </span>
          <p className="text-[11px] text-[#5C6064]">{series.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="tactile-raised tactile-raised-interactive flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-[#0E5A63]"
        >
          {isPlaying ? (
            <>
              <Pause className="h-3 w-3" strokeWidth={2.2} />
              <span>Jeda Animasi</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3" strokeWidth={2.2} />
              <span>Putar Animasi</span>
            </>
          )}
        </button>
      </div>

      {/* Pilihan 3 Variasi Grafik */}
      <div className="flex flex-wrap gap-1.5">
        {variants.map((variant) => {
          const isActive = variant.id === series.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                setActiveTab(variant.id);
                setScanProgress(0);
              }}
              className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#0E5A63] text-[#F6F3EC] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]'
                  : 'tactile-raised text-[#5C6064] hover:text-[#23272A]'
              }`}
            >
              {variant.tabLabel}
            </button>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={series.title}
      >
        <defs>
          <linearGradient id="circuitAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E5A63" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0E5A63" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((val, idx) => {
          const yPos = toSvgY(val);
          return (
            <g key={`cy-${idx}`}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={width - padRight}
                y2={yPos}
                stroke="#5C6064"
                strokeOpacity="0.16"
                strokeDasharray="3 3"
              />
              <text
                x={padLeft - 6}
                y={yPos + 3}
                textAnchor="end"
                className="fill-[#5C6064] font-code text-[9.5px]"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {xTicks.map((val, idx) => {
          const xPos = toSvgX(val);
          return (
            <text
              key={`cx-${idx}`}
              x={xPos}
              y={height - 14}
              textAnchor="middle"
              className="fill-[#5C6064] font-code text-[9.5px]"
            >
              {val.toFixed(0)}
              {xUnit}
            </text>
          );
        })}

        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={height - padBottom}
          stroke="#5C6064"
          strokeOpacity="0.4"
        />
        <line
          x1={padLeft}
          y1={height - padBottom}
          x2={width - padRight}
          y2={height - padBottom}
          stroke="#5C6064"
          strokeOpacity="0.4"
        />

        <path d={areaPath} fill="url(#circuitAreaGrad)" />

        {secondaryPath ? (
          <path
            d={secondaryPath}
            fill="none"
            stroke="#B25E18"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        ) : null}

        {tertiaryPath ? (
          <path
            d={tertiaryPath}
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
        ) : null}

        <path
          d={primaryPath}
          fill="none"
          stroke="#0E5A63"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Scanner Animasi */}
        <line
          x1={scanSvgX}
          y1={padTop}
          x2={scanSvgX}
          y2={height - padBottom}
          stroke="#0E5A63"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
        {scanSecondaryY !== null ? (
          <circle
            cx={scanSvgX}
            cy={toSvgY(scanSecondaryY)}
            r="3.8"
            fill="#B25E18"
            stroke="#F6F3EC"
            strokeWidth="1.4"
          />
        ) : null}
        {scanTertiaryY !== null ? (
          <circle
            cx={scanSvgX}
            cy={toSvgY(scanTertiaryY)}
            r="3.8"
            fill="#2D6A4F"
            stroke="#F6F3EC"
            strokeWidth="1.4"
          />
        ) : null}
        <circle
          cx={scanSvgX}
          cy={scanSvgY}
          r="5"
          fill="#0E5A63"
          fillOpacity="0.24"
        />
        <circle
          cx={scanSvgX}
          cy={scanSvgY}
          r="3.5"
          fill="#0E5A63"
          stroke="#F6F3EC"
          strokeWidth="1.5"
        />

        {/* Posisi Aktif Slider Siswa */}
        <line
          x1={activeSvgX}
          y1={activeSvgY}
          x2={activeSvgX}
          y2={height - padBottom}
          stroke="#23272A"
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />
        <circle
          cx={activeSvgX}
          cy={activeSvgY}
          r="5"
          fill="#23272A"
          stroke="#F6F3EC"
          strokeWidth="2"
        />
      </svg>

      {/* Legenda Pembacaan Scanner vs Slider */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#5C6064]/15 pt-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-code text-[#0E5A63]">
            <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
            <span>
              Scanner ({series.primaryLabel}):{' '}
              {scanX.toFixed(1)}
              {xUnit} → {scanPrimaryY.toFixed(2)}
              {yUnit}
            </span>
          </span>
          {series.secondaryLabel && scanSecondaryY !== null ? (
            <span className="flex items-center gap-1.5 font-code text-[#B25E18]">
              <span className="h-2 w-2 rounded-full bg-[#B25E18]" />
              <span>
                {series.secondaryLabel}: {scanSecondaryY.toFixed(2)}
                {yUnit}
              </span>
            </span>
          ) : null}
          {series.tertiaryLabel && scanTertiaryY !== null ? (
            <span className="flex items-center gap-1.5 font-code text-[#2D6A4F]">
              <span className="h-2 w-2 rounded-full bg-[#2D6A4F]" />
              <span>
                {series.tertiaryLabel}: {scanTertiaryY.toFixed(2)}
                {yUnit}
              </span>
            </span>
          ) : null}
        </div>

        <span className="tactile-raised rounded-full px-2.5 py-0.5 font-code text-[10.5px] font-semibold text-[#23272A]">
          ● Titik Aktif: {series.activeX.toFixed(1)}
          {xUnit} | {series.activeY.toFixed(2)}
          {yUnit}
        </span>
      </div>

      {/* Cara Membaca Grafik */}
      <div className="rounded-xl bg-[#EFECE4] px-3 py-2 text-xs leading-relaxed text-[#23272A]">
        <span className="font-semibold text-[#0E5A63]">Cara Membaca Grafik: </span>
        {series.readingGuide}
      </div>
    </div>
  );
}
