import { useId } from 'react';

interface TactileSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TactileSwitch({
  label,
  description,
  checked,
  onChange,
}: TactileSwitchProps) {
  const switchId = useId();

  return (
    <div className="tactile-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <label htmlFor={switchId} className="flex cursor-pointer flex-col">
        <span className="text-sm font-medium text-[#23272A]">{label}</span>
        {description ? (
          <span className="text-xs text-[#5C6064]">{description}</span>
        ) : null}
      </label>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A63] ${
          checked ? 'justify-end bg-[#0E5A63]' : 'justify-start bg-[#EFECE4]'
        }`}
        style={{
          boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.12)',
        }}
      >
        <span className="tactile-raised flex h-5 w-5 items-center justify-center rounded-full">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              checked ? 'bg-[#0E5A63]' : 'bg-[#5C6064]/50'
            }`}
          />
        </span>
      </button>
    </div>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface TactileSegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (next: T) => void;
}

export function TactileSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: TactileSegmentedProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#23272A]">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="tactile-inset grid gap-1.5 rounded-2xl p-1.5"
        style={{
          gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={`cursor-pointer rounded-xl px-2.5 py-2 text-center text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#0E5A63] ${
                active
                  ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                  : 'text-[#5C6064] hover:text-[#23272A]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
