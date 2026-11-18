import { ArrowLeft, BookOpen, Check, Layers, SlidersHorizontal } from 'lucide-react';
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
          className="tactile-raised tactile-raised-interactive inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#0E5A63]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span>Kembali ke Kanvas 3D</span>
        </button>
      </div>

      {/* Main 2-Column Layout: 48% Left (Detailing Rumus tanpa Grafik) + 52% Right (AI Co-Pilot) */}
      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        {/* KOLOM KIRI: Detailing Rumus & Langkah Perhitungan KaTeX */}
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
                {isTransform
                  ? 'Detailing Matriks Transformasi & Luas'
                  : 'Detailing Rumus & Unsur Lingkaran'}
              </h1>
              <p className="mt-0.5 text-xs text-[#5C6064]">
                Penjabaran perhitungan eksak langkah demi langkah mengikuti parameter aktif di kanvas 3D.
              </p>
            </div>

            {/* Live Formula Summary Box */}
            <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
                  {computedResult.equationTitle}
                </span>
                <span className="rounded-full bg-[#F6F3EC] px-2.5 py-0.5 font-code text-[11px] font-medium text-[#0E5A63]">
                  {computedResult.equationBadge}
                </span>
              </div>

              <div className="overflow-x-auto py-1 text-sm font-semibold text-[#0E5A63] sm:text-base">
                <FormulaText
                  latex={computedResult.primaryLatex}
                  text={computedResult.primaryEquation}
                />
              </div>

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

            {/* Panel Detailing Rumus & Langkah Perhitungan (Menggantikan Grafik) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
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

                    <p className="text-[11.5px] leading-relaxed text-[#5C6064]">
                      {step.simpleExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teorema Kunci Ringkas */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-xs font-bold tracking-wider text-[#23272A] uppercase">
                  Rumus Acuan Materi
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {details.concepts.map((item) => (
                  <div
                    key={item.id}
                    className="tactile-inset flex flex-col gap-1.5 rounded-2xl p-3"
                  >
                    <span className="text-[11px] font-bold text-[#23272A]">
                      {item.title}
                    </span>
                    <div className="overflow-x-auto rounded-lg bg-[#F6F3EC] px-2.5 py-1.5">
                      <FormulaText
                        latex={item.latex}
                        text={item.plainText}
                        className="text-xs text-[#0E5A63]"
                      />
                    </div>
                    <p className="text-[11px] text-[#5C6064]">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 font-code text-[11px] text-[#5C6064]">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{mod.categoryLabel}</span>
            </div>
            <span className="font-semibold text-[#0E5A63]">Status: Valid</span>
          </div>
        </TactileCard>

        {/* KOLOM KANAN: Asisten Cerdas Kontekstual Transformasi Geometri & Lingkaran */}
        <CopilotChatPanel
          mod={mod}
          computedResult={computedResult}
          chatMessages={chatMessages}
          isCopilotLoading={isCopilotLoading}
          hasGeminiKey={hasGeminiKey}
          onSendMessage={onSendMessage}
          placeholder="Tanya Asisten Cerdas tentang matriks transformasi, determinan luas, busur, sudut keliling, atau garis singgung..."
          className="min-h-[420px] w-full lg:min-h-[600px] lg:w-[52%]"
        />
      </div>
    </div>
  );
}
