import { ArrowLeft, Check, Layers, Microscope, Moon, Sun } from 'lucide-react';
import { useMemo } from 'react';
import {
  PLANT_CELL_LIGHT_EFFECTS,
  PLANT_CELL_ORGANELLE_LIST,
} from '../../data/plantCellData';
import { resolvePlantCellObservation } from '../../engines/biologyCell';
import type {
  CellParams,
  ChatMessage,
  ComputedModuleResult,
  ModuleDefinition,
  PlantCellLightCondition,
} from '../../types/lab';
import { TactileCard } from '../ui/TactileCard';
import { CopilotChatPanel } from './CopilotChatPanel';

interface PlantCellAnalysisViewProps {
  mod: ModuleDefinition;
  params: CellParams;
  computedResult: ComputedModuleResult;
  activeGuidedStep: 1 | 2 | 3 | 4;
  onSelectGuidedStep: (step: 1 | 2 | 3 | 4) => void;
  onUpdateParams: (patch: Partial<CellParams>) => void;
  onBackToWorkspace: () => void;
  chatMessages: ChatMessage[];
  isCopilotLoading: boolean;
  hasGeminiKey: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
}

export function PlantCellAnalysisView({
  mod,
  params,
  computedResult,
  activeGuidedStep,
  onSelectGuidedStep,
  onUpdateParams,
  onBackToWorkspace,
  chatMessages,
  isCopilotLoading,
  hasGeminiKey,
  onSendMessage,
}: PlantCellAnalysisViewProps) {
  const obs = useMemo(() => resolvePlantCellObservation(params), [params]);
  const activeOrg = obs.organelle;
  const activeStepDef = mod.guidedSteps.find((s) => s.step === activeGuidedStep);
  const isLight = params.lightCondition === 'terang';

  const dynamicQuickActions = useMemo(() => {
    if (params.focusOrganelle === 'semua') {
      return [
        '🌿 Ciri khas utama Sel Tumbuhan',
        '☀️ Efek terkena cahaya vs gelap pada sel',
        '🔋 Peran Kloroplas & Mitokondria bersama',
        '📝 Uji pemahaman organel sel tumbuhan',
      ];
    }
    return [
      `🔍 Detail struktur & fungsi ${activeOrg.shortLabel}`,
      `☀️ Pengaruh cahaya (${isLight ? 'Terang' : 'Gelap'}) pada ${activeOrg.shortLabel}`,
      '🔗 Hubungan antar-organel di sel tumbuhan',
      '📝 Beri kuis singkat tentang sel tumbuhan',
    ];
  }, [params.focusOrganelle, activeOrg.shortLabel, isLight]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tactile-inset flex items-center gap-2 rounded-full px-3.5 py-1.5 font-code text-xs text-[#5C6064]">
          <span>Lab 3D</span>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[#0E5A63]">
            Pengamatan Organel Sel Tumbuhan &amp; Asisten Cerdas
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          className="tactile-raised tactile-raised-interactive inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#0E5A63]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span>Kembali ke Model 3D</span>
        </button>
      </div>

      {/* Main 2-Column Layout: 48% Left (Pure Observation & Detailed Organelle Info) + 52% Right (AI Co-Pilot Real-Time) */}
      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        {/* KOLOM KIRI: Murni Hasil Pengamatan & Penjelasan Rinci Tiap Organel (Tanpa Grafik / Perhitungan) */}
        <TactileCard
          variant="raised"
          className="flex w-full flex-col justify-between gap-5 rounded-3xl p-5 lg:w-[48%] lg:p-6"
        >
          <div className="flex flex-col gap-4">
            {/* 4-Step Guided Task Tracker */}
            <div className="flex flex-col gap-2">
              <div className="relative flex items-center justify-between px-1">
                <div className="absolute right-6 left-6 top-4 z-0 h-[2px] bg-[#E3DED2]" />
                {mod.guidedSteps.map((s) => {
                  const isDone = s.step < activeGuidedStep;
                  const isActive = s.step === activeGuidedStep;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => onSelectGuidedStep(s.step)}
                      className="relative z-10 flex cursor-pointer flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#0E5A63]"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          isActive
                            ? 'bg-[#0E5A63] text-white shadow-[3px_3px_8px_rgba(14,90,99,0.3)]'
                            : isDone
                              ? 'tactile-inset text-[#0E5A63]'
                              : 'tactile-raised text-[#5C6064]'
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <span className="font-code text-xs font-bold">{s.step}</span>
                        )}
                      </div>
                      <span
                        className={`text-center text-[11px] ${
                          isActive
                            ? 'font-bold text-[#0E5A63]'
                            : 'font-medium text-[#5C6064]'
                        }`}
                      >
                        {s.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeStepDef ? (
                <div className="tactile-inset rounded-xl px-3.5 py-2 text-xs text-[#23272A]">
                  <span className="font-semibold text-[#0E5A63]">
                    Panduan Langkah {activeStepDef.step}:{' '}
                  </span>
                  {activeStepDef.instruction}
                </div>
              ) : null}
            </div>

            {/* Section Heading */}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#23272A]">
                Hasil Pengamatan &amp; Penjelasan Organel Sel
              </h1>
              <p className="mt-0.5 text-xs text-[#5C6064]">
                Uraian struktur, fungsi fisiologis, dan pengaruh cahaya pada Sel Tumbuhan (tanpa grafik maupun perhitungan).
              </p>
            </div>

            {/* 1. Detail Organel yang Sedang Diamati */}
            <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-code text-[10.5px] font-semibold tracking-wider text-[#0E5A63] uppercase">
                    Fokus Pengamatan 3D · {activeOrg.category}
                  </span>
                  <h2 className="mt-0.5 text-base font-bold text-[#23272A]">
                    {activeOrg.name}
                  </h2>
                  <span className="font-code text-[11px] italic text-[#5C6064]">
                    {activeOrg.latinName}
                  </span>
                </div>
                <span className="rounded-full bg-[#F6F3EC] px-3 py-1 font-code text-[11px] font-semibold text-[#0E5A63]">
                  {isLight ? 'Terkena Cahaya' : 'Tanpa Cahaya'}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs leading-relaxed text-[#23272A]">
                <div className="rounded-xl bg-[#F6F3EC] p-3">
                  <div className="mb-1 text-[11px] font-bold text-[#0E5A63]">
                    Letak &amp; Ultrastruktur
                  </div>
                  <p className="text-[#23272A]">
                    <strong>Letak:</strong> {activeOrg.location}. {activeOrg.structureDetail}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F6F3EC] p-3">
                  <div className="mb-1 text-[11px] font-bold text-[#0E5A63]">
                    Fungsi Biologis Utama
                  </div>
                  <p className="text-[#23272A]">{activeOrg.mainFunction}</p>
                </div>

                {/* Perbandingan Respon Organel Terpilih pada Terang vs Gelap */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div
                    className={`rounded-xl p-3 text-[11.5px] leading-relaxed ${
                      isLight
                        ? 'bg-[#0E5A63]/10 ring-1 ring-[#0E5A63]/40 text-[#23272A]'
                        : 'bg-[#F6F3EC] text-[#5C6064]'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 font-bold text-[#23272A]">
                      <Sun className="h-3.5 w-3.5 text-[#B86B2B]" strokeWidth={2.2} />
                      <span>Saat Terkena Cahaya</span>
                    </div>
                    <p>{activeOrg.lightResponse}</p>
                  </div>

                  <div
                    className={`rounded-xl p-3 text-[11.5px] leading-relaxed ${
                      !isLight
                        ? 'bg-[#0E5A63]/10 ring-1 ring-[#0E5A63]/40 text-[#23272A]'
                        : 'bg-[#F6F3EC] text-[#5C6064]'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 font-bold text-[#23272A]">
                      <Moon className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2.2} />
                      <span>Saat Tidak Terkena Cahaya</span>
                    </div>
                    <p>{activeOrg.darkResponse}</p>
                  </div>
                </div>
              </div>
            </TactileCard>

            {/* 2. Dampak Keseluruhan Kondisi Cahaya pada Sel Tumbuhan */}
            <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
                  Efek Kondisi Cahaya pada Sel Tumbuhan
                </span>
                <div className="tactile-raised flex items-center gap-1 rounded-full p-1">
                  {(['terang', 'gelap'] as PlantCellLightCondition[]).map((cond) => {
                    const active = params.lightCondition === cond;
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => onUpdateParams({ lightCondition: cond })}
                        className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                          active
                            ? 'bg-[#0E5A63] text-[#F6F3EC]'
                            : 'text-[#5C6064] hover:text-[#23272A]'
                        }`}
                      >
                        {cond === 'terang' ? 'Terang' : 'Gelap'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-[#F6F3EC] p-3 text-xs leading-relaxed text-[#23272A]">
                <div className="mb-1 font-bold text-[#0E5A63]">
                  {PLANT_CELL_LIGHT_EFFECTS[params.lightCondition].title}
                </div>
                <p className="mb-2 text-[#23272A]">
                  {PLANT_CELL_LIGHT_EFFECTS[params.lightCondition].overallEffect}
                </p>
                <ul className="list-disc space-y-1 pl-4 text-[11.5px] text-[#5C6064]">
                  {PLANT_CELL_LIGHT_EFFECTS[params.lightCondition].keyProcesses.map(
                    (proc) => (
                      <li key={proc}>{proc}</li>
                    ),
                  )}
                </ul>
              </div>
            </TactileCard>

            {/* 3. Pemilih Cepat Semua 13 Organel Sel Tumbuhan */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-code text-[11px] font-semibold text-[#5C6064] uppercase">
                <Layers className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
                <span>Daftar Lengkap Struktur Sel Tumbuhan</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PLANT_CELL_ORGANELLE_LIST.map((org) => {
                  const selected = params.focusOrganelle === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => onUpdateParams({ focusOrganelle: org.id })}
                      className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                        selected
                          ? 'bg-[#0E5A63] text-[#F6F3EC]'
                          : 'tactile-inset text-[#5C6064] hover:text-[#23272A]'
                      }`}
                    >
                      {org.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 font-code text-[11px] text-[#5C6064]">
            <div className="flex items-center gap-1.5">
              <Microscope className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{mod.categoryLabel}</span>
            </div>
            <span className="font-semibold text-[#0E5A63]">Observasi Kualitatif</span>
          </div>
        </TactileCard>

        {/* KOLOM KANAN: Asisten Cerdas Khusus Sel Tumbuhan Real-Time */}
        <CopilotChatPanel
          mod={mod}
          computedResult={computedResult}
          chatMessages={chatMessages}
          isCopilotLoading={isCopilotLoading}
          hasGeminiKey={hasGeminiKey}
          onSendMessage={onSendMessage}
          isAnatomy
          quickActionsOverride={dynamicQuickActions}
          placeholder="Tanya Asisten Cerdas tentang nukleus, kloroplas, vakuola, efek cahaya gelap/terang, atau bagian sel lain..."
          className="min-h-[420px] w-full lg:min-h-[600px] lg:w-[52%]"
        />
      </div>
    </div>
  );
}
