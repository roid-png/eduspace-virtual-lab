import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo } from 'react';
import { buildGeometryAnalysisDetails } from '../../engines/mathGeometry3d';
import type {
  ChatMessage,
  ComputedModuleResult,
  Geometry3DParams,
  ModuleDefinition,
} from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';
import { TactileCard } from '../ui/TactileCard';
import { CopilotChatPanel } from './CopilotChatPanel';

interface GeometryAnalysisViewProps {
  mod: ModuleDefinition;
  params: Geometry3DParams;
  computedResult: ComputedModuleResult;
  activeGuidedStep: 1 | 2 | 3 | 4;
  onSelectGuidedStep: (step: 1 | 2 | 3 | 4) => void;
  onBackToWorkspace: () => void;
  chatMessages: ChatMessage[];
  isCopilotLoading: boolean;
  hasGeminiKey: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
}

export function GeometryAnalysisView({
  mod,
  params,
  computedResult,
  activeGuidedStep,
  onSelectGuidedStep,
  onBackToWorkspace,
  chatMessages,
  isCopilotLoading,
  hasGeminiKey,
  onSendMessage,
}: GeometryAnalysisViewProps) {
  const details = useMemo(() => buildGeometryAnalysisDetails(params), [params]);
  const activeStepDef = mod.guidedSteps.find((s) => s.step === activeGuidedStep);
  const isTransform = params.subMode === 'transformasi';
  const tVal = details.transformValues;
  const cVal = details.circleValues;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tactile-inset flex items-center gap-2 rounded-full px-3.5 py-1.5 font-code text-xs text-[#5C6064]">
          <span>Lab 3D</span>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[#0E5A63]">
            Detailing Rumus Geometri &amp; Asisten Cerdas
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          className="tactile-raised tactile-raised-interactive inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#0E5A63]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span>Kembali ke Kanvas 3D</span>
        </button>
      </div>

      {/* 4-Step Guided Experiment Tracker (Full-Width di Atas) */}
      <TactileCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              Alur Eksplorasi Terpandu · {mod.title}
            </span>
            <span className="font-code text-xs text-[#0E5A63]">
              Langkah {activeGuidedStep} / {mod.guidedSteps.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {mod.guidedSteps.map((step) => {
              const isCompleted = step.step < activeGuidedStep;
              const isCurrent = step.step === activeGuidedStep;
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => onSelectGuidedStep(step.step)}
                  className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs transition-all ${
                    isCurrent
                      ? 'tactile-inset font-semibold text-[#0E5A63]'
                      : isCompleted
                        ? 'tactile-raised text-[#23272A]'
                        : 'tactile-raised opacity-75 hover:opacity-100'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-code text-[11px] font-bold ${
                      isCurrent || isCompleted
                        ? 'bg-[#0E5A63] text-[#F6F3EC]'
                        : 'tactile-inset text-[#5C6064]'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3" strokeWidth={2.5} /> : step.step}
                  </span>
                  <span className="truncate">{step.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {activeStepDef ? (
            <div className="tactile-inset flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs text-[#23272A]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0E5A63]" strokeWidth={2} />
              <span>
                <strong className="text-[#0E5A63]">Panduan Langkah {activeStepDef.step}:</strong>{' '}
                {activeStepDef.instruction}
              </span>
            </div>
          ) : null}
        </div>
      </TactileCard>

      {/* Main 2-Column Layout: Kartu Detailing Matriks & Rumus Sejajar Kiri-Kanan */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        {/* KARTU KIRI: Ringkasan Rumus Utama & Langkah Perhitungan 1-4 */}
        <TactileCard
          variant="raised"
          className="flex min-w-0 flex-col justify-between gap-5 rounded-3xl p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#23272A] sm:text-xl">
                {isTransform
                  ? 'Detailing Matriks Transformasi & Luas'
                  : 'Detailing Rumus & Unsur Lingkaran'}
              </h1>
              <p className="mt-0.5 text-xs text-[#5C6064]">
                Penjabaran perhitungan eksak langkah demi langkah mengikuti parameter aktif di kanvas 3D.
              </p>
            </div>

            {/* Box Rumus Utama Aktif + Penjelasan Singkat */}
            <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
                  {computedResult.equationTitle}
                </span>
                <span className="rounded-full bg-[#F6F3EC] px-2.5 py-0.5 font-code text-[11px] font-medium text-[#0E5A63]">
                  {computedResult.equationBadge}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-[#F6F3EC] px-3 py-2 text-sm font-semibold text-[#0E5A63] sm:text-base">
                <FormulaText
                  latex={computedResult.primaryLatex}
                  text={computedResult.primaryEquation}
                />
              </div>

              <p className="text-xs leading-relaxed text-[#5C6064]">
                {details.primaryExplanation}
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {computedResult.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="tactile-raised flex flex-col gap-0.5 rounded-xl p-2.5"
                  >
                    <span className="font-code text-[10px] text-[#5C6064]">
                      {m.label}
                    </span>
                    <span
                      className={`font-code text-xs font-bold ${
                        m.highlight ? 'text-[#0E5A63]' : 'text-[#23272A]'
                      }`}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </TactileCard>

            {/* Penjabaran Langkah 1-4 */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 shrink-0 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-xs font-bold tracking-wider text-[#23272A] uppercase">
                  {isTransform
                    ? 'Langkah Perkalian Matriks 2×2 & Determinan Luas'
                    : 'Langkah Perhitungan Busur, Juring & Garis Singgung'}
                </h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {details.breakdownSteps.map((step) => (
                  <div
                    key={step.step}
                    className="tactile-inset flex flex-col gap-2 rounded-2xl p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0E5A63] font-code text-[10px] font-bold text-[#F6F3EC]">
                        {step.step}
                      </span>
                      <span className="text-xs font-bold text-[#23272A]">
                        {step.title}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl bg-[#F6F3EC] px-3 py-2">
                      <FormulaText
                        latex={step.latex}
                        text={step.plainText}
                        className="text-xs text-[#0E5A63] sm:text-sm"
                      />
                    </div>

                    <p className="text-xs leading-relaxed text-[#5C6064]">
                      {step.simpleExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TactileCard>

        {/* KARTU KANAN: Rincian Pemetaan/Unsur Aktif & Rumus Acuan Materi */}
        <TactileCard
          variant="raised"
          className="flex min-w-0 flex-col justify-between gap-5 rounded-3xl p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            {/* Sub-kartu 1: Ringkasan Pemetaan Koordinat atau Unsur Lingkaran */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 shrink-0 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-sm font-bold text-[#23272A]">
                  {isTransform
                    ? 'Rincian Pemetaan Koordinat Segitiga ABC'
                    : 'Ringkasan Unsur & Sifat Lingkaran'}
                </h2>
              </div>

              {isTransform ? (
                <div className="tactile-inset flex flex-col gap-2.5 rounded-2xl p-3.5">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {tVal.pointPairs.map((pair) => (
                      <div
                        key={pair.label}
                        className="tactile-raised flex flex-col gap-1 rounded-xl p-2.5"
                      >
                        <span className="font-code text-[10px] font-bold text-[#0E5A63] uppercase">
                          Titik {pair.label} → {pair.label}'
                        </span>
                        <span className="font-code text-xs font-semibold text-[#23272A]">
                          ({pair.origin.x}, {pair.origin.y}) → ({pair.image.x}, {pair.image.y})
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-[#5C6064]">
                    {tVal.propertySummary}
                  </p>
                </div>
              ) : (
                <div className="tactile-inset flex flex-col gap-2.5 rounded-2xl p-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="tactile-raised flex flex-col gap-0.5 rounded-xl p-2.5">
                      <span className="font-code text-[10px] text-[#5C6064]">
                        Keliling Lingkaran (2πr)
                      </span>
                      <span className="font-code text-xs font-bold text-[#23272A]">
                        {cVal.circumference.toFixed(2)} cm
                      </span>
                    </div>
                    <div className="tactile-raised flex flex-col gap-0.5 rounded-xl p-2.5">
                      <span className="font-code text-[10px] text-[#5C6064]">
                        Luas Penuh (πr²)
                      </span>
                      <span className="font-code text-xs font-bold text-[#23272A]">
                        {cVal.circleArea.toFixed(2)} cm²
                      </span>
                    </div>
                    <div className="tactile-raised flex flex-col gap-0.5 rounded-xl p-2.5">
                      <span className="font-code text-[10px] text-[#5C6064]">
                        Tali Busur AB
                      </span>
                      <span className="font-code text-xs font-bold text-[#0E5A63]">
                        {cVal.chordLength.toFixed(2)} cm
                      </span>
                    </div>
                    <div className="tactile-raised flex flex-col gap-0.5 rounded-xl p-2.5">
                      <span className="font-code text-[10px] text-[#5C6064]">
                        Garis Singgung PT
                      </span>
                      <span className="font-code text-xs font-bold text-[#0E5A63]">
                        {cVal.tangentLength.toFixed(2)} cm
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#5C6064]">
                    {cVal.propertySummary}
                  </p>
                </div>
              )}
            </div>

            {/* Sub-kartu 2: Rumus Acuan Materi (dengan kalimat pendek di tiap rumus) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-xs font-bold tracking-wider text-[#23272A] uppercase">
                  Rumus Acuan Materi &amp; Penjelasan Singkat
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {details.concepts.map((item) => (
                  <div
                    key={item.id}
                    className="tactile-inset flex flex-col gap-2 rounded-2xl p-3.5"
                  >
                    <span className="text-xs font-bold text-[#23272A]">
                      {item.title}
                    </span>
                    <div className="overflow-x-auto rounded-xl bg-[#F6F3EC] px-3 py-2">
                      <FormulaText
                        latex={item.latex}
                        text={item.plainText}
                        className="text-xs text-[#0E5A63] sm:text-sm"
                      />
                    </div>
                    <p className="text-xs leading-relaxed text-[#5C6064]">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#5C6064]/15 pt-3 font-code text-[11px] text-[#5C6064]">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{mod.categoryLabel}</span>
            </div>
            <span className="font-semibold text-[#0E5A63]">Status: Valid</span>
          </div>
        </TactileCard>
      </div>

      {/* KARTU ASISTEN CERDAS DI BAWAH (Full-Width, sejalan dengan modul Fisika) */}
      <CopilotChatPanel
        mod={mod}
        computedResult={computedResult}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={onSendMessage}
        placeholder="Tanya Asisten Cerdas tentang matriks transformasi, determinan luas, busur, sudut keliling, atau garis singgung..."
        className="min-h-[400px] w-full lg:min-h-[440px]"
      />
    </div>
  );
}
