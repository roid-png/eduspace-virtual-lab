export interface ChartPoint {
  x: number;
  y: number;
}

interface ResponseChartSvgProps {
  title: string;
  subtitle?: string;
  xLabel: string;
  yLabel: string;
  points: ChartPoint[];
  activePoint: ChartPoint;
  referenceLineY?: number;
  referenceLabel?: string;
  activeTooltipText: string;
}

export function ResponseChartSvg({
  title,
  subtitle,
  xLabel,
  yLabel,
  points,
  activePoint,
  referenceLineY,
  referenceLabel,
  activeTooltipText,
}: ResponseChartSvgProps) {
  const width = 400;
  const height = 180;
  const padLeft = 46;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 30;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  if (referenceLineY !== undefined) ys.push(referenceLineY);
  ys.push(activePoint.y);

  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 1;
  const minYRaw = ys.length ? Math.min(...ys, 0) : 0;
  const maxYRaw = ys.length ? Math.max(...ys) : 1;
  const maxY = maxYRaw <= minYRaw ? minYRaw + 1 : maxYRaw * 1.1;
  const minY = minYRaw;

  const mapX = (x: number) =>
    padLeft + ((x - minX) / Math.max(0.0001, maxX - minX)) * plotW;
  const mapY = (y: number) =>
    padTop + plotH - ((y - minY) / Math.max(0.0001, maxY - minY)) * plotH;

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
    .join(' ');

  const activeSvgX = mapX(activePoint.x);
  const activeSvgY = mapY(activePoint.y);
  const yTicks = [0, 0.33, 0.66, 1].map((t) => minY + (maxY - minY) * t);
  const xTicks = [0, 0.33, 0.66, 1].map((t) => minX + (maxX - minX) * t);

  const formatTick = (val: number) => {
    if (Math.abs(val) >= 100) return val.toFixed(0);
    if (Math.abs(val) >= 10) return val.toFixed(1);
    return val.toFixed(2).replace(/\.00$/, '');
  };

  return (
    <div className="tactile-inset flex flex-col gap-2 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-code text-xs font-semibold text-[#23272A]">
          {title}
        </span>
        {subtitle ? (
          <span className="font-code text-[11px] text-[#5C6064]">{subtitle}</span>
        ) : null}
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-44 w-full overflow-visible"
          role="img"
          aria-label={title}
        >
          {/* Horizontal grid lines */}
          {yTicks.map((tick, idx) => {
            const y = mapY(tick);
            return (
              <g key={`y-${idx}`}>
                <line
                  x1={padLeft}
                  x2={width - padRight}
                  y1={y}
                  y2={y}
                  stroke="#5C6064"
                  strokeOpacity={idx === 0 ? 0.45 : 0.2}
                  strokeDasharray={idx === 0 ? undefined : '3 3'}
                  strokeWidth={idx === 0 ? 1.2 : 0.8}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#5C6064] font-code text-[9px]"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          {/* Vertical axis & ticks */}
          <line
            x1={padLeft}
            x2={padLeft}
            y1={padTop}
            y2={padTop + plotH}
            stroke="#5C6064"
            strokeOpacity={0.45}
            strokeWidth={1.2}
          />
          {xTicks.map((tick, idx) => {
            const x = mapX(tick);
            return (
              <g key={`x-${idx}`}>
                {idx > 0 ? (
                  <line
                    x1={x}
                    x2={x}
                    y1={padTop}
                    y2={padTop + plotH}
                    stroke="#5C6064"
                    strokeOpacity={0.16}
                    strokeDasharray="3 3"
                    strokeWidth={0.8}
                  />
                ) : null}
                <text
                  x={x}
                  y={padTop + plotH + 15}
                  textAnchor="middle"
                  className="fill-[#5C6064] font-code text-[9px]"
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

          {/* Reference asymptote line (e.g. Integral Eksak) */}
          {referenceLineY !== undefined ? (
            <g>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={mapY(referenceLineY)}
                y2={mapY(referenceLineY)}
                stroke="#23272A"
                strokeOpacity={0.55}
                strokeDasharray="5 3"
                strokeWidth={1.2}
              />
              {referenceLabel ? (
                <text
                  x={width - padRight - 2}
                  y={mapY(referenceLineY) - 5}
                  textAnchor="end"
                  className="fill-[#23272A] font-code text-[9px] font-semibold"
                >
                  {referenceLabel}
                </text>
              ) : null}
            </g>
          ) : null}

          {/* Main curve */}
          {pathD ? (
            <path
              d={pathD}
              fill="none"
              stroke="#0E5A63"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Active point marker & drop guide */}
          <line
            x1={activeSvgX}
            x2={activeSvgX}
            y1={activeSvgY}
            y2={padTop + plotH}
            stroke="#0E5A63"
            strokeOpacity={0.65}
            strokeDasharray="2 2"
            strokeWidth={1.2}
          />
          <circle
            cx={activeSvgX}
            cy={activeSvgY}
            r={5}
            fill="#0E5A63"
            stroke="#F6F3EC"
            strokeWidth={2}
          />
        </svg>

        {/* Axis summary & active tooltip pill */}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="font-code text-[10px] text-[#5C6064]">
            Sumbu: {xLabel} vs {yLabel}
          </span>
          <span className="tactile-raised inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#23272A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0E5A63]" />
            <span>{activeTooltipText}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
