import { ArrowRight, HeartPulse, Layers } from 'lucide-react';
import { useMemo } from 'react';
import {
  ANATOMY_STRUCTURES,
  NORMAL_PHYSIOLOGY_REFERENCE,
} from '../../data/anatomyData';
import { resolveAnatomyExploration } from '../../engines/biologyAnatomy';
import type { AnatomyParams } from '../../types/lab';

interface AnatomyBottomPanelProps {
  params: AnatomyParams;
  onSelectStructure: (structureId: string) => void;
  onOpenAnalysis: () => void;
}

export function AnatomyBottomPanel({
  params,
  onSelectStructure,
  onOpenAnalysis,
}: AnatomyBottomPanelProps) {
  const exploration = useMemo(() => resolveAnatomyExploration(params), [params]);
  const active = exploration.activeStructure;

  return (
    <section
      aria-label="Panel Penjelasan Komponen Anatomi Real-Time"
      className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-stretch gap-5 rounded-3xl p-5 lg:flex-row lg:p-6"
    >
      {/* Kiri: Identitas Struktur & Pemilih Sub-komponen */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[46%]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              Penjelasan Komponen Anatomi Real-Time
            </span>
          </div>
          <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#0E5A63]">
            {exploration.organLabel} · {exploration.activeSubModeLabel}
          </span>
        </div>

        <div className="tactile-inset flex flex-col gap-1 rounded-2xl px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-[#23272A] sm:text-base">
              {active.name}
            </h2>
            {active.latinName ? (
              <span className="font-code text-[11px] italic text-[#0E5A63]">
                {active.latinName}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-[#5C6064]">
            <span className="font-semibold text-[#23272A]">Letak: </span>
            {active.location}
          </p>
        </div>

        {/* Pemilih Cepat Sub-komponen sesuai organ & mode */}
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 font-code text-[11px] font-medium text-[#5C6064]">
            <Layers className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span>
              {params.focusOrgan === 'paru' && params.lungVariant === 'transparan'
                ? 'Objek Bernama di Dalam Paru:'
                : params.focusOrgan === 'jantung'
                  ? 'Ruang & Katup Jantung:'
                  : params.inspectionMode === 'belah'
                    ? 'Inspeksi Bagian Dalam:'
                    : 'Pilih Bagian Organ:'}
            </span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {exploration.availableStructureIds.map((id) => {
              const item = ANATOMY_STRUCTURES[id];
              if (!item) return null;
              const isSelected = active.id === id;
              const shortTitle = item.shortLabel ?? item.name.split(' (')[0];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectStructure(id)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[#0E5A63] ${
                    isSelected
                      ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                      : 'tactile-inset text-[#23272A] hover:text-[#0E5A63]'
                  }`}
                >
                  {shortTitle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pemisah lembut */}
      <div className="hidden w-px bg-[#E3DED2] lg:block" />

      {/* Kanan: Fungsi Fisiologis & Info Normal Pelengkap */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[54%]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wider text-[#23272A] uppercase">
            Fungsi &amp; Mekanisme Fisiologis
          </span>
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="flex cursor-pointer items-center gap-1 font-code text-[11px] font-semibold text-[#0E5A63] hover:underline"
          >
            <span>Buka Alur Sirkulasi &amp; Asisten Cerdas</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="tactile-inset flex flex-col gap-2 rounded-2xl p-4">
          <p className="text-xs leading-relaxed text-[#23272A] sm:text-sm">
            {active.functionSummary}
          </p>
          <p className="text-xs leading-relaxed text-[#5C6064]">
            {active.physiologicalMechanism}
          </p>
        </div>

        {/* Info Angka Fisiologis Normal (Pelengkap Kecil) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="tactile-inset flex flex-wrap items-center gap-2 rounded-full px-3 py-1.5 font-code text-[11px] text-[#5C6064]">
            <HeartPulse className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span>
              Info Normal: HR {NORMAL_PHYSIOLOGY_REFERENCE.heartRate.split(' ')[0]} bpm · CO{' '}
              {NORMAL_PHYSIOLOGY_REFERENCE.cardiacOutput} · RR{' '}
              {NORMAL_PHYSIOLOGY_REFERENCE.respiratoryRate}
            </span>
          </div>
          <span className="font-code text-[11px] text-[#5C6064]">
            Klik organ di kanvas 3D untuk memisah atau memfokuskan
          </span>
        </div>
      </div>
    </section>
  );
}
