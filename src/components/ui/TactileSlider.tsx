import { useId } from 'react';
import type { CSSProperties } from 'react';

interface TactileSliderProps {
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  precision?: number;
  hint?: string;
  minLabel?: string;
  maxLabel?: string;
  onChange: (nextValue: number) => void;
}

export function TactileSlider({
  label,
  symbol,
  value,
  min,
  max,
  step,
  unit = '',
  precision = 0,
  hint,
  minLabel,
  maxLabel,
  onChange,
}: TactileSliderProps) {
  const sliderId = useId();
  const formattedValue = `${value.toFixed(precision)}${unit ? ` ${unit}` : ''}`.trim();
  const midValue = Number(((min + max) / 2).toFixed(precision));

  const cssVars = {
    '--attr-min': min,
    '--attr-max': max,
    '--control-value': value,
  } as CSSProperties;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={sliderId}
          className="flex items-center gap-1.5 text-sm font-medium text-[#23272A]"
          title={hint}
        >
          <span>{label}</span>
          {symbol ? (
            <span className="font-code text-xs text-[#5C6064]">({symbol})</span>
          ) : null}
        </label>
        <span className="tactile-inset rounded-full px-3 py-0.5 font-code text-xs font-semibold text-[#23272A]">
          {formattedValue}
        </span>
      </div>

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={formattedValue}
        style={cssVars}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="tactile-range"
      />

      <div className="flex justify-between px-0.5 font-code text-[11px] text-[#5C6064]">
        <span>{minLabel ?? `${min.toFixed(precision)}${unit ? ` ${unit}` : ''}`}</span>
        <span>{`${midValue}${unit ? ` ${unit}` : ''}`}</span>
        <span>{maxLabel ?? `${max.toFixed(precision)}${unit ? ` ${unit}` : ''}`}</span>
      </div>
    </div>
  );
}
