import { ArrowLeft, BookOpen, Check, CheckCircle2, Compass, Gauge, Layers } from 'lucide-react';
import { useMemo } from 'react';
import {
  DEFAULT_RAMP_LENGTH_M,
  GRAVITY,
  buildInclinedAnalysisDetails,
} from '../../engines/physicsInclined';
import type {
  ChatMessage,
  ComputedModuleResult,
  InclinedParams,
  ModuleDefinition,
} from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';
import { TactileCard } from '../ui/TactileCard';
import { AnimatedPhysicsChartSvg } from './AnimatedPhysicsChartSvg';
import { CopilotChatPanel } from './CopilotChatPanel';

interface InclinedAnalysisViewProps {
  mod: ModuleDefinition;
  params: InclinedParams;
  computedResult: ComputedModuleResult;
  activeGuidedStep: 1 | 2 | 3 | 4;
  onSelectGuidedStep: (step: 1 | 2 | 3 | 4) => void;
  onUpdateParams: (patch: Partial<InclinedParams>) => void;
  onBackToWorkspace: () => void;
  chatMessages: ChatMessage[];
  isCopilotLoading: boolean;
  hasGeminiKey: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
}

export function InclinedAnalysisView({
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
}: InclinedAnalysisViewProps) {
  const details = useMemo(() => buildInclinedAnalysisDetails(params), [params]);
  const v = details.values;
  const L = params.rampLengthMeters || DEFAULT_RAMP_LENGTH_M;
  const activeStepDef = mod.guidedSteps.find((s) => s.step === activeGuidedStep);
  const isMobil = params.objectType === 'mobil';

  const summaryLatex = v.isMoving
    ? `a = ${GRAVITY.toFixed(2)}\\,(\\sin ${params.theta}^\\circ - ${params.mu.toFixed(2)}\\cos ${params.theta}^\\circ) = ${v.acceleration.toFixed(2)}\\text{ m/s}^2`
    : `\\sum F_x = 0\\text{ N}\\;\\Rightarrow\\; a = 0.00\\text{ m/s}^2`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tactile-inset flex items-center gap-2 rounded-full px-3.5 py-1.5 font-code text-xs text-[#5C6064]">
          <span>Lab 3D</span>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[#0E5A63]">
            Analisis Rumus, Grafik &amp; Hukum II Newton
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

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        {/* KOLOM KIRI: Analisis Persamaan, Penjabaran Langkah, dan Grafik Animasi */}
        <section className="flex flex-col gap-5">
          <TactileCard className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold text-[#23272A] sm:text-xl">
                  Analisis Persamaan &amp; Penjabaran Data
                </h1>
                <p className="mt-0.5 text-xs text-[#5C6064]">
                  Perhitungan eksak langkah demi langkah untuk{' '}
                  <span className="font-semibold text-[#0E5A63]">
                    {isMobil ? 'Mobil di Lereng Bukit' : 'Peti Barang'}
                  </span>{' '}
                  (θ = {params.theta}°, h = {v.rampHeightMeters.toFixed(2)} m, m ={' '}
                  {params.mass.toFixed(1)} kg, μ = {params.mu.toFixed(2)}).
                </p>
              </div>
              <span className="tactile-inset rounded-full px-3 py-1 font-code text-[11px] font-semibold text-[#0E5A63]">
                g = {GRAVITY.toFixed(2)} m/s² · L = {L.toFixed(1)} m
              </span>
            </div>

            {/* Persamaan Utama KaTeX */}
            <div className="tactile-inset flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
                  Persamaan Percepatan Utama
                </span>
                <span className="rounded-full bg-[#0E5A63] px-2.5 py-0.5 font-code text-[10.5px] font-semibold text-[#F6F3EC]">
                  {v.isMoving ? 'Sedang Meluncur' : 'Diam (Statis)'}
                </span>
              </div>

              <div className="overflow-x-auto py-1">
                <FormulaText
                  latex={summaryLatex}
                  text={`a = ${v.acceleration.toFixed(2)} m/s^2`}
                  className="text-base text-[#0E5A63] sm:text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">Berat (W)</span>
                  <span className="font-code text-xs font-bold text-[#23272A]">
                    {v.weight.toFixed(1)} N
                  </span>
                </div>
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">Dorong (W·sin θ)</span>
                  <span className="font-code text-xs font-bold text-[#23272A]">
                    {v.drivingForce.toFixed(1)} N
                  </span>
                </div>
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">Gesek (f)</span>
                  <span className="font-code text-xs font-bold text-[#23272A]">
                    {v.frictionForce.toFixed(1)} N
                  </span>
                </div>
                <div className="tactile-raised flex flex-col gap-0.5 rounded-xl px-3 py-2">
                  <span className="text-[10.5px] text-[#5C6064]">Resultan (ΣF)</span>
                  <span className="font-code text-xs font-bold text-[#0E5A63]">
                    {v.netForce.toFixed(1)} N
                  </span>
                </div>
              </div>
            </div>

            {/* Penjabaran 4 Tahap Perhitungan (Font Matematika KaTeX + Bahasa Sederhana) */}
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

            {/* Grafik Animasi Multi-Variasi */}
            <AnimatedPhysicsChartSvg variants={details.chartVariants} />
          </TactileCard>
        </section>

        {/* KOLOM KANAN: Rumus Lengkap, Penjelasan Simulasi & Hukum II Newton (Pengganti AI Co-Pilot) */}
        <section className="flex flex-col gap-5">
          {/* Kartu 1: Penjelasan Simulasi Objek & Lingkungan 3D */}
          <TactileCard className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-sm font-bold text-[#23272A]">
                  Penjelasan Simulasi 3D Saat Ini
                </h2>
              </div>

              <div className="tactile-inset flex items-center gap-1 rounded-full p-1">
                {(
                  [
                    { id: 'barang', label: 'Peti Barang' },
                    { id: 'mobil', label: 'Mobil & Bukit' },
                  ] as const
                ).map((item) => {
                  const active = params.objectType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateParams({ objectType: item.id })}
                      className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                        active
                          ? 'bg-[#0E5A63] text-[#F6F3EC]'
                          : 'text-[#5C6064] hover:text-[#23272A]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tactile-inset flex flex-col gap-2.5 rounded-2xl p-4 text-xs leading-relaxed text-[#23272A]">
              <p>
                {isMobil ? (
                  <>
                    Kamu sedang mensimulasikan <strong className="text-[#0E5A63]">Mobil Menuruni Jalan Perbukitan</strong> sepanjang{' '}
                    <span className="font-code font-semibold">{L.toFixed(1)} m</span> dengan ketinggian puncak bukit{' '}
                    <span className="font-code font-semibold">h = {v.rampHeightMeters.toFixed(2)} m</span> dan sudut lereng{' '}
                    <span className="font-code font-semibold">θ = {params.theta}°</span>. Saat mobil bergerak, keempat roda berputar sebanding dengan perpindahan tempuh dan ban berinteraksi dengan tekstur permukaan aspal/kerikil sesuai{' '}
                    <span className="font-code font-semibold">μ = {params.mu.toFixed(2)}</span>.
                  </>
                ) : (
                  <>
                    Kamu sedang mensimulasikan <strong className="text-[#0E5A63]">Peti Barang di Atas Bidang Miring</strong> sepanjang{' '}
                    <span className="font-code font-semibold">{L.toFixed(1)} m</span> pada ketinggian{' '}
                    <span className="font-code font-semibold">h = {v.rampHeightMeters.toFixed(2)} m</span> dan sudut{' '}
                    <span className="font-code font-semibold">θ = {params.theta}°</span>. Permukaan papan lereng menyesuaikan tingkat kekasaran{' '}
                    <span className="font-code font-semibold">μ = {params.mu.toFixed(2)}</span> dan memunculkan partikel debu gesekan saat peti meluncur ke bumper bawah.
                  </>
                )}
              </p>

              <div className="grid grid-cols-3 gap-2 border-t border-[#5C6064]/15 pt-2.5 text-center">
                <div className="rounded-xl bg-[#EFECE4] px-2 py-1.5">
                  <div className="text-[10px] text-[#5C6064]">Tinggi (h)</div>
                  <div className="font-code text-xs font-bold text-[#0E5A63]">
                    {v.rampHeightMeters.toFixed(2)} m
                  </div>
                </div>
                <div className="rounded-xl bg-[#EFECE4] px-2 py-1.5">
                  <div className="text-[10px] text-[#5C6064]">Sudut Kritis (θ_c)</div>
                  <div className="font-code text-xs font-bold text-[#23272A]">
                    {v.criticalAngleDeg.toFixed(1)}°
                  </div>
                </div>
                <div className="rounded-xl bg-[#EFECE4] px-2 py-1.5">
                  <div className="text-[10px] text-[#5C6064]">Laju di Dasar (v)</div>
                  <div className="font-code text-xs font-bold text-[#0E5A63]">
                    {v.endSpeedMs.toFixed(2)} m/s
                  </div>
                </div>
              </div>
            </div>
          </TactileCard>

          {/* Kartu 2: Penjelasan Hukum II Newton */}
          <TactileCard className="flex flex-col gap-3.5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
                <h2 className="text-sm font-bold text-[#23272A]">
                  Hukum II Newton pada Bidang Miring
                </h2>
              </div>
              <span className="tactile-inset rounded-full px-2.5 py-0.5 font-code text-[10.5px] font-semibold text-[#0E5A63]">
                ΣF = m · a
              </span>
            </div>

            <div className="tactile-inset flex flex-col gap-2 rounded-2xl p-3.5">
              <div className="overflow-x-auto">
                <FormulaText
                  latex={`\\sum F_x = m\\cdot a \\;\\Longrightarrow\\; a = \\frac{W\\sin\\theta - f_{\\text{gesek}}}{m}`}
                  text="Sigma F_x = m * a => a = (W*sin(theta) - f_gesek) / m"
                  className="text-sm text-[#0E5A63]"
                />
              </div>
              <p className="text-xs leading-relaxed text-[#23272A]">
                Hukum II Newton menyatakan bahwa <strong>percepatan benda sebanding lurus dengan resultan gaya searah gerak dan berbanding terbalik dengan massanya</strong>. Pada bidang miring, gravitasi dibagi dua: menarik ke bawah lereng (<span className="font-code">W·sin θ</span>) dan menekan permukaan (<span className="font-code">W·cos θ</span>).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div
                className={`rounded-2xl border p-3 text-xs leading-relaxed ${
                  !v.isMoving
                    ? 'border-[#0E5A63]/40 bg-[#0E5A63]/8 text-[#23272A]'
                    : 'tactile-inset border-transparent text-[#5C6064]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-bold text-[#23272A]">
                  <span>1. Kondisi Diam</span>
                  {!v.isMoving ? (
                    <span className="rounded-full bg-[#0E5A63] px-2 py-0.5 font-code text-[9.5px] text-[#F6F3EC]">
                      Aktif
                    </span>
                  ) : null}
                </div>
                <p>
                  Terjadi jika <span className="font-code">W·sin θ ≤ μ·N</span>. Gaya gesek statis menahan benda tepat seimbang sehingga <span className="font-code">ΣF = 0</span> dan <span className="font-code">a = 0</span>.
                </p>
              </div>

              <div
                className={`rounded-2xl border p-3 text-xs leading-relaxed ${
                  v.isMoving
                    ? 'border-[#0E5A63]/40 bg-[#0E5A63]/8 text-[#23272A]'
                    : 'tactile-inset border-transparent text-[#5C6064]'
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-bold text-[#23272A]">
                  <span>2. Kondisi Meluncur</span>
                  {v.isMoving ? (
                    <span className="rounded-full bg-[#0E5A63] px-2 py-0.5 font-code text-[9.5px] text-[#F6F3EC]">
                      Aktif
                    </span>
                  ) : null}
                </div>
                <p>
                  Terjadi jika <span className="font-code">W·sin θ &gt; μ·N</span>. Resultan <span className="font-code">ΣF &gt; 0</span> mempercepat gerak benda menuruni bidang (GLBB).
                </p>
              </div>
            </div>
          </TactileCard>

          {/* Kartu 3: Daftar Rumus Lengkap Fisika Bidang Miring */}
          <TactileCard className="flex flex-col gap-3.5 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
              <h2 className="text-sm font-bold text-[#23272A]">
                Daftar Rumus yang Digunakan pada Simulasi
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {details.formulaReference.map((item) => (
                <div
                  key={item.id}
                  className="tactile-inset flex flex-col justify-between gap-1.5 rounded-2xl p-3"
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
                  <p className="text-[11px] leading-snug text-[#5C6064]">
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>
          </TactileCard>
        </section>
      </div>

      {/* Tambahan Fitur AI Co-Pilot Laboratorium untuk Halaman Analisis & Rumus */}
      <CopilotChatPanel
        mod={mod}
        computedResult={computedResult}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={onSendMessage}
        placeholder="Tanya AI Co-Pilot mengenai gaya bidang miring, tinggi h, berat W, gesekan μ, atau Hukum II Newton..."
        className="min-h-[440px] w-full"
      />
    </div>
  );
}
