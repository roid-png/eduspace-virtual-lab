import { ArrowRight, HeartPulse, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ANATOMY_STRUCTURES,
  NORMAL_PHYSIOLOGY_REFERENCE,
  getAdaptiveFlowForOrgan,
} from '../../data/anatomyData';
import { resolveAnatomyExploration } from '../../engines/biologyAnatomy';
import type { AnatomyParams } from '../../types/lab';
import { TactileCard } from '../ui/TactileCard';

interface AnatomyAnalysisPanelProps {
  params: AnatomyParams;
  onSelectStructure?: (structureId: string) => void;
}

export function AnatomyAnalysisPanel({
  params,
  onSelectStructure,
}: AnatomyAnalysisPanelProps) {
  const exploration = useMemo(() => resolveAnatomyExploration(params), [params]);
  const active = exploration.activeStructure;
  const [showFullFlowOverride, setShowFullFlowOverride] = useState(false);

  const flowOrgan = showFullFlowOverride ? 'semua' : params.focusOrgan;
  const adaptiveFlow = useMemo(
    () => getAdaptiveFlowForOrgan(flowOrgan, params.lungVariant),
    [flowOrgan, params.lungVariant],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Alur Fisiologis Adaptif sesuai Pilihan Organ di Simulasi 3D */}
      <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
            {adaptiveFlow.title}
          </span>
          <span className="rounded-full bg-[#F6F3EC] px-2.5 py-0.5 font-code text-[11px] font-medium text-[#0E5A63]">
            {adaptiveFlow.badge}
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-[#5C6064]">
          {adaptiveFlow.subtitle}
        </p>

        {params.focusOrgan !== 'semua' ? (
          <div className="flex items-center justify-between gap-2">
            <span className="font-code text-[10px] text-[#0E5A63]">
              Menyesuaikan fokus 3D: {exploration.organLabel}
            </span>
            <button
              type="button"
              onClick={() => setShowFullFlowOverride((v) => !v)}
              className="cursor-pointer font-code text-[11px] font-semibold text-[#0E5A63] hover:underline"
            >
              {showFullFlowOverride ? 'Kembali ke Fokus Aktif' : 'Lihat Alur Keseluruhan'}
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {adaptiveFlow.steps.map((stage, idx) => {
            const isHighlighted =
              params.focusOrgan === 'semua' || params.focusOrgan === stage.organKey;
            return (
              <div key={stage.step} className="flex flex-col gap-1.5">
                <div
                  className={`flex flex-col gap-1 rounded-xl px-3 py-2.5 transition-all ${
                    isHighlighted && params.focusOrgan !== 'semua'
                      ? 'tactile-raised ring-1 ring-[#0E5A63]/35'
                      : 'tactile-raised'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full font-code text-[11px] font-bold ${
                          isHighlighted
                            ? 'bg-[#0E5A63] text-white'
                            : 'tactile-inset text-[#5C6064]'
                        }`}
                      >
                        {stage.step}
                      </span>
                      <span className="text-xs font-bold text-[#23272A]">
                        {stage.title}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 font-code text-[10px] font-semibold ${
                        stage.badgeTone === 'teal'
                          ? 'bg-[#0E5A63]/12 text-[#0E5A63]'
                          : 'tactile-inset text-[#5C6064]'
                      }`}
                    >
                      {stage.badgeText}
                    </span>
                  </div>
                  <p className="pl-7 text-[11px] leading-relaxed text-[#5C6064]">
                    {stage.description}
                  </p>
                </div>

                {idx < adaptiveFlow.steps.length - 1 ? (
                  <div className="flex justify-center text-[#0E5A63]/70">
                    <ArrowRight className="h-3.5 w-3.5 rotate-90" strokeWidth={2} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </TactileCard>

      {/* 2. Rincian Komponen Bagian Dalam & Fungsinya */}
      <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
              Rincian Struktur ({exploration.organLabel})
            </span>
          </div>
          <span className="rounded-full bg-[#F6F3EC] px-2.5 py-0.5 font-code text-[11px] font-medium text-[#0E5A63]">
            {exploration.activeSubModeLabel}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {exploration.availableStructureIds.map((id) => {
            const item = ANATOMY_STRUCTURES[id];
            if (!item) return null;
            const isSelected = active.id === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectStructure?.(id)}
                className={`flex w-full cursor-pointer flex-col gap-1 rounded-xl p-3 text-left transition-all ${
                  isSelected
                    ? 'tactile-raised ring-1 ring-[#0E5A63]/40'
                    : 'bg-[#F6F3EC]/65 hover:bg-[#F6F3EC]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#0E5A63]' : 'text-[#23272A]'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.latinName ? (
                    <span className="font-code text-[10px] italic text-[#5C6064]">
                      {item.latinName}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] leading-relaxed text-[#23272A]">
                  {item.functionSummary}
                </p>
              </button>
            );
          })}
        </div>
      </TactileCard>

      {/* 3. Data Angka Fisiologis Normal (Informasi Pendukung Kecil) */}
      <TactileCard variant="inset" className="flex flex-col gap-2 rounded-2xl p-3.5">
        <div className="flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
          <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
            Referensi Fisiologis Normal (Pendukung)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="tactile-raised rounded-xl px-2.5 py-2">
            <span className="block font-code text-[10px] text-[#5C6064]">Denyut Jantung</span>
            <span className="font-code text-[11px] font-semibold text-[#23272A]">
              {NORMAL_PHYSIOLOGY_REFERENCE.heartRate}
            </span>
          </div>
          <div className="tactile-raised rounded-xl px-2.5 py-2">
            <span className="block font-code text-[10px] text-[#5C6064]">Laju Respirasi</span>
            <span className="font-code text-[11px] font-semibold text-[#23272A]">
              {NORMAL_PHYSIOLOGY_REFERENCE.respiratoryRate}
            </span>
          </div>
          <div className="tactile-raised rounded-xl px-2.5 py-2">
            <span className="block font-code text-[10px] text-[#5C6064]">Volume Sekuncup</span>
            <span className="font-code text-[11px] font-semibold text-[#23272A]">
              {NORMAL_PHYSIOLOGY_REFERENCE.strokeVolume}
            </span>
          </div>
          <div className="tactile-raised rounded-xl px-2.5 py-2">
            <span className="block font-code text-[10px] text-[#5C6064]">Curah Jantung</span>
            <span className="font-code text-[11px] font-semibold text-[#23272A]">
              {NORMAL_PHYSIOLOGY_REFERENCE.cardiacOutput}
            </span>
          </div>
        </div>
      </TactileCard>
    </div>
  );
}
