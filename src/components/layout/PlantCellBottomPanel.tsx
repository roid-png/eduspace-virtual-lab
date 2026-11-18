import { ArrowRight, Layers, Moon, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { PLANT_CELL_ORGANELLES } from '../../data/plantCellData';
import { resolvePlantCellObservation } from '../../engines/biologyCell';
import type { CellParams, PlantCellOrganelleId } from '../../types/lab';

const QUICK_ORGANELLE_IDS: PlantCellOrganelleId[] = [
  'semua',
  'nucleus',
  'chloroplast',
  'vacuole',
  'mitochondria',
  'rough-er',
  'golgi',
  'cell-wall',
];

interface PlantCellBottomPanelProps {
  params: CellParams;
  onSelectOrganelle: (organelleId: PlantCellOrganelleId) => void;
  onOpenAnalysis: () => void;
}

export function PlantCellBottomPanel({
  params,
  onSelectOrganelle,
  onOpenAnalysis,
}: PlantCellBottomPanelProps) {
  const obs = useMemo(() => resolvePlantCellObservation(params), [params]);
  const org = obs.organelle;
  const isLight = params.lightCondition === 'terang';

  return (
    <section
      aria-label="Penjelasan Singkat Organel Sel Tumbuhan"
      className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-stretch gap-5 rounded-3xl p-5 lg:flex-row lg:p-6"
    >
      {/* Kiri: Identitas Organel & Pemilih Cepat Auto-Zoom */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[46%]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              Penjelasan Singkat Sel Tumbuhan
            </span>
          </div>
          <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#0E5A63]">
            {org.category}
          </span>
        </div>

        <div className="tactile-inset flex flex-col gap-1 rounded-2xl px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-[#23272A] sm:text-base">
              {org.name}
            </h2>
            <span className="font-code text-[11px] italic text-[#0E5A63]">
              {org.latinName}
            </span>
          </div>
          <p className="text-xs text-[#5C6064]">
            <span className="font-semibold text-[#23272A]">Letak: </span>
            {org.location}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 font-code text-[11px] font-medium text-[#5C6064]">
            <Layers className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span>Auto-Zoom Cepat ke Organel:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ORGANELLE_IDS.map((id) => {
              const item = PLANT_CELL_ORGANELLES[id];
              const isSelected = params.focusOrganelle === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectOrganelle(id)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#0E5A63] ${
                    isSelected
                      ? 'bg-[#0E5A63] text-[#F6F3EC] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]'
                      : 'tactile-raised text-[#5C6064] hover:text-[#23272A]'
                  }`}
                >
                  {item.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanan: Fungsi Organel & Efek Kondisi Cahaya (Tanpa Perhitungan / AI Co-Pilot) */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[54%] lg:border-l lg:border-[#5C6064]/15 lg:pl-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isLight ? (
              <Sun className="h-3.5 w-3.5 text-[#B86B2B]" strokeWidth={2.2} />
            ) : (
              <Moon className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2.2} />
            )}
            <span className="text-xs font-semibold tracking-wider text-[#23272A] uppercase">
              Fungsi &amp; Pengaruh Cahaya ({isLight ? 'Terang' : 'Gelap'})
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-[#0E5A63] hover:underline focus-visible:outline-2 focus-visible:outline-[#0E5A63]"
          >
            <span>Buka Analisis &amp; AI</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="tactile-inset flex flex-col gap-2 rounded-2xl px-4 py-3 text-xs leading-relaxed text-[#23272A]">
          <p>{org.mainFunction}</p>

          <div className="rounded-xl bg-[#EFECE4] px-3 py-2 text-[11.5px] text-[#23272A]">
            <span className="font-semibold text-[#0E5A63]">
              Efek {obs.conditionLabel}:{' '}
            </span>
            {obs.activeOrganelleResponse}
          </div>
        </div>
      </div>
    </section>
  );
}
