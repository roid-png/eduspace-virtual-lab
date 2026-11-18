import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  LAMP_SPECS,
  buildCircuitAnalysisDetails,
  getModeLabel,
} from '../../engines/physicsCircuit';
import type {
  ChatMessage,
  CircuitMode,
  CircuitParams,
  ComputedModuleResult,
  ModuleDefinition,
} from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';
import { TactileCard } from '../ui/TactileCard';
import { AnimatedCircuitChartSvg } from './AnimatedCircuitChartSvg';
import { CopilotChatPanel } from './CopilotChatPanel';

interface CircuitAnalysisViewProps {
  mod: ModuleDefinition;
  params: CircuitParams;
  computedResult: ComputedModuleResult;
  activeGuidedStep: 1 | 2 | 3 | 4;
  onSelectGuidedStep: (step: 1 | 2 | 3 | 4) => void;
  onBackToWorkspace: () => void;
  chatMessages: ChatMessage[];
  isCopilotLoading: boolean;
  hasGeminiKey: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
}

export function CircuitAnalysisView({
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
}: CircuitAnalysisViewProps) {
  const details = useMemo(() => buildCircuitAnalysisDetails(params), [params]);
  const [selectedGuideMode, setSelectedGuideMode] = useState<CircuitMode>(
    params.mode,
  );
  const c = details.values;
  const activeStepDef = mod.guidedSteps.find(
    (s) => s.step === activeGuidedStep,
  );
  const modeLabel = getModeLabel(params.mode);

  const activeGuide =
    details.topologyGuides.find((g) => g.mode === selectedGuideMode) ??
    details.topologyGuides[0];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tactile-inset flex items-center gap-2 rounded-full px-3.5 py-1.5 font-code text-xs text-[#5C6064]">
          <span>Lab 3D</span>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[#0E5A63]">
            Analisis Rangkaian, Rumus &amp; AI Co-Pilot
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

      {/* 4-Step Guided Experiment Tracker */}
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
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs transition-all ${
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
                    {isCompleted ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      step.step
                    )}
                  </span>
                  <span className="truncate">{step.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {activeStepDef ? (
            <div className="tactile-inset flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs text-[#23272A]">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-[#0E5A63]"
                strokeWidth={2}
              />
              <span>
                <strong className="text-[#0E5A63]">
                  Panduan Langkah {activeStepDef.step}:
                </strong>{' '}
                {activeStepDef.instruction}
              </span>
            </div>
          ) : null}
        </div>
      </TactileCard>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        {/* KOLOM KIRI: Persamaan, Penjabaran 4 Langkah, Grafik Animasi */}
        <section className="flex flex-col gap-5">
          <TactileCard className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold text-[#23272A] sm:text-xl">
                  Analisis Persamaan &amp; Data Rangkaian
                </h1>
                <p className="mt-0.5 text-xs text-[#5C6064]">
                  Mode{' '}
                  <span className="font-semibold text-[#0E5A63]">
                    {modeLabel}
                  </span>{' '}
                  · {computedResult.summaryInputText}
                </p>
              </div>
              <span className="tactile-inset rounded-full px-3 py-1 font-code text-[11px] font-semibold text-[#0E5A63]">
                {c.isCircuitClosed ? 'Jalur Tertutup (ON)' : 'Jalur Terbuka (OFF)'}
              </span>
            </div>

            {/* Persamaan Utama + Metrik Cabang */}
            <div className="tactile-inset flex flex-col gap-3 rounded-2xl p-4">
              <div className="overflow-x-auto py-1">
                <FormulaText
                  latex={computedResult.primaryLatex}
                  text={computedResult.primaryEquation}
                  className="text-base text-[#0E5A63] sm:text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">R_tot</span>
                  <span className="font-code text-xs font-bold text-[#23272A]">
                    {c.rTotal.toFixed(2)} Ω
                  </span>
                </div>
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">Arus Total</span>
                  <span className="font-code text-xs font-bold text-[#0E5A63]">
                    {c.iTotal.toFixed(2)} A
                  </span>
                </div>
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">
                    {params.mode === 'campuran'
                      ? 'I₂ / I₃'
                      : params.mode === 'paralel'
                        ? 'I₁ / I₂'
                        : 'V₁ / V₂'}
                  </span>
                  <span className="font-code text-xs font-bold text-[#23272A]">
                    {params.mode === 'campuran'
                      ? `${c.i2.toFixed(2)} / ${c.i3.toFixed(2)} A`
                      : params.mode === 'paralel'
                        ? `${c.i1.toFixed(2)} / ${c.i2.toFixed(2)} A`
                        : `${c.v1.toFixed(1)} / ${c.v2.toFixed(1)} V`}
                  </span>
                </div>
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">
                    {params.hasLamp ? 'Daya Lampu' : 'Daya Total'}
                  </span>
                  <span className="font-code text-xs font-bold text-[#0E5A63]">
                    {params.hasLamp
                      ? `${c.powerLamp.toFixed(2)} W`
                      : `${c.powerTotal.toFixed(2)} W`}
                  </span>
                </div>
              </div>
            </div>

            {/* Penjabaran 4 Tahap Kalkulasi KaTeX */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-xs font-bold tracking-wider text-[#23272A] uppercase">
                  Penjabaran Kalkulasi 4 Langkah
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

            {/* Grafik Animasi Multi-Variasi + Cara Membaca */}
            <AnimatedCircuitChartSvg variants={details.chartVariants} />
          </TactileCard>
        </section>

        {/* KOLOM KANAN: Penjelasan Hukum Dasar & Keterangan Rumus Lengkap per Rangkaian */}
        <section className="flex flex-col gap-5">
          {/* Kartu 1: Hukum Dasar yang Berlaku */}
          <TactileCard className="flex flex-col gap-3.5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-sm font-bold text-[#23272A]">
                  Hukum Ohm &amp; Hukum Kirchhoff pada Rangkaian
                </h2>
              </div>
              {params.hasLamp ? (
                <span className="tactile-inset rounded-full px-2.5 py-0.5 font-code text-[10.5px] font-semibold text-[#0E5A63]">
                  {LAMP_SPECS[params.lampType].shortLabel}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2.5">
              {details.circuitLaws.map((law) => (
                <div
                  key={law.id}
                  className="tactile-inset flex flex-col gap-1.5 rounded-2xl p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#23272A]">
                      {law.title}
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-xl bg-[#F6F3EC] px-3 py-1.5">
                    <FormulaText
                      latex={law.latex}
                      text={law.plainText}
                      className="text-xs text-[#0E5A63] sm:text-sm"
                    />
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-[#5C6064]">
                    {law.description}
                  </p>
                  <div className="rounded-xl bg-[#EFECE4] px-2.5 py-1.5 font-code text-[11px] font-medium text-[#0E5A63]">
                    Bukti pada simulasi: {law.currentCheck}
                  </div>
                </div>
              ))}
            </div>
          </TactileCard>

          {/* Kartu 2: Keterangan Rumus Lengkap per Rangkaian (Seri, Paralel, Campuran) */}
          <TactileCard className="flex flex-col gap-3.5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-sm font-bold text-[#23272A]">
                  Keterangan Rumus per Susunan Rangkaian
                </h2>
              </div>

              <div className="tactile-inset flex items-center gap-1 rounded-full p-1">
                {details.topologyGuides.map((guide) => {
                  const isSelected = guide.mode === activeGuide.mode;
                  const isCurrentSim = guide.mode === params.mode;
                  return (
                    <button
                      key={guide.mode}
                      type="button"
                      onClick={() => setSelectedGuideMode(guide.mode)}
                      className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#0E5A63] text-[#F6F3EC]'
                          : 'text-[#5C6064] hover:text-[#23272A]'
                      }`}
                    >
                      {guide.mode === 'seri'
                        ? 'Seri'
                        : guide.mode === 'paralel'
                          ? 'Paralel'
                          : 'Campuran'}
                      {isCurrentSim ? ' •' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tactile-inset flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[#0E5A63]">
                    {activeGuide.title}
                  </h3>
                  <p className="text-[11px] text-[#5C6064]">
                    {activeGuide.subtitle}
                  </p>
                </div>
                {activeGuide.mode === params.mode ? (
                  <span className="rounded-full bg-[#0E5A63] px-2.5 py-0.5 font-code text-[10px] font-semibold text-[#F6F3EC]">
                    Sedang Disimulasikan
                  </span>
                ) : null}
              </div>

              <p className="text-xs leading-relaxed text-[#23272A]">
                {activeGuide.characteristic}
              </p>

              <div className="flex flex-col gap-2">
                {activeGuide.formulas.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl bg-[#EFECE4] p-2.5"
                  >
                    <div className="mb-1 text-[11px] font-bold text-[#23272A]">
                      {f.label}
                    </div>
                    <div className="overflow-x-auto rounded-lg bg-[#F6F3EC] px-2.5 py-1.5">
                      <FormulaText
                        latex={f.latex}
                        text={f.plainText}
                        className="text-xs text-[#0E5A63]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#5C6064]">
                      {f.meaning}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#5C6064]/15 pt-2 text-[11px] leading-relaxed text-[#5C6064]">
                <strong className="text-[#23272A]">Keterangan Simbol:</strong>{' '}
                <span className="font-code">V</span> = Tegangan (Volt, V) ·{' '}
                <span className="font-code">I</span> = Kuat Arus (Ampere, A) ·{' '}
                <span className="font-code">R</span> = Hambatan (Ohm, Ω) ·{' '}
                <span className="font-code">P = V·I</span> = Daya (Watt, W).
              </div>
            </div>
          </TactileCard>
        </section>
      </div>

      {/* AI Co-Pilot Laboratorium Terhubung Penuh ke Konteks Modul Rangkaian Listrik */}
      <CopilotChatPanel
        mod={mod}
        computedResult={computedResult}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={onSendMessage}
        placeholder="Tanya AI Co-Pilot tentang rangkaian campuran, Hukum Ohm, Kirchhoff I & II, efek saklar ON/OFF, atau kecerahan lampu..."
        className="min-h-[440px] w-full"
      />
    </div>
  );
}
