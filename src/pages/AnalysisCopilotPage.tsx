import { ArrowLeft, Check, SlidersHorizontal } from 'lucide-react';
import { AnatomyAnalysisPanel } from '../components/analysis/AnatomyAnalysisPanel';
import { CircuitAnalysisView } from '../components/analysis/CircuitAnalysisView';
import { CopilotChatPanel } from '../components/analysis/CopilotChatPanel';
import { GeometryAnalysisView } from '../components/analysis/GeometryAnalysisView';
import { InclinedAnalysisView } from '../components/analysis/InclinedAnalysisView';
import { PlantCellAnalysisView } from '../components/analysis/PlantCellAnalysisView';
import { FormulaText } from '../components/ui/FormulaText';
import { ResponseChartSvg } from '../components/ui/ResponseChartSvg';
import { TactileCard } from '../components/ui/TactileCard';
import { useLab } from '../context/LabContext';
import { MODULE_MAP } from '../data/modules';

export function AnalysisCopilotPage() {
  const {
    setView,
    activeModuleId,
    paramsMap,
    updateModuleParams,
    computedResult,
    activeGuidedStep,
    setActiveGuidedStep,
    chatMessages,
    sendCopilotMessage,
    isCopilotLoading,
    hasGeminiKey,
  } = useLab();

  const mod = MODULE_MAP[activeModuleId];
  const isAnatomy = activeModuleId === 'biology-anatomy';

  if (activeModuleId === 'physics-inclined') {
    return (
      <InclinedAnalysisView
        mod={mod}
        params={paramsMap['physics-inclined']}
        computedResult={computedResult}
        activeGuidedStep={activeGuidedStep}
        onSelectGuidedStep={setActiveGuidedStep}
        onUpdateParams={(patch) => updateModuleParams('physics-inclined', patch)}
        onBackToWorkspace={() => setView('workspace')}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={sendCopilotMessage}
      />
    );
  }

  if (activeModuleId === 'physics-circuit') {
    return (
      <CircuitAnalysisView
        mod={mod}
        params={paramsMap['physics-circuit']}
        computedResult={computedResult}
        activeGuidedStep={activeGuidedStep}
        onSelectGuidedStep={setActiveGuidedStep}
        onBackToWorkspace={() => setView('workspace')}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={sendCopilotMessage}
      />
    );
  }

  if (activeModuleId === 'biology-cell') {
    return (
      <PlantCellAnalysisView
        mod={mod}
        params={paramsMap['biology-cell']}
        computedResult={computedResult}
        activeGuidedStep={activeGuidedStep}
        onSelectGuidedStep={setActiveGuidedStep}
        onUpdateParams={(patch) => updateModuleParams('biology-cell', patch)}
        onBackToWorkspace={() => setView('workspace')}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={sendCopilotMessage}
      />
    );
  }

  if (activeModuleId === 'math-geometry3d') {
    return (
      <GeometryAnalysisView
        mod={mod}
        params={paramsMap['math-geometry3d']}
        computedResult={computedResult}
        activeGuidedStep={activeGuidedStep}
        onSelectGuidedStep={setActiveGuidedStep}
        onBackToWorkspace={() => setView('workspace')}
        chatMessages={chatMessages}
        isCopilotLoading={isCopilotLoading}
        hasGeminiKey={hasGeminiKey}
        onSendMessage={sendCopilotMessage}
      />
    );
  }

  const activeStepDef = mod.guidedSteps.find((s) => s.step === activeGuidedStep);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="tactile-inset flex items-center gap-2 rounded-full px-3.5 py-1.5 font-code text-xs text-[#5C6064]">
          <span>Lab 3D</span>
          <span className="opacity-40">/</span>
          <span className="font-semibold text-[#0E5A63]">
            {isAnatomy ? 'Analisis Struktur & Co-Pilot' : 'Analisis Rumus & Co-Pilot'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setView('workspace')}
          className="tactile-raised tactile-raised-interactive inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#0E5A63]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span>Kembali ke Kanvas 3D</span>
        </button>
      </div>

      {/* Main 2-Column Layout: 45% Left (Formula & Chart) + 55% Right (Full AI Co-Pilot) */}
      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        {/* KOLOM KIRI (45%) */}
        <TactileCard
          variant="raised"
          className="flex w-full flex-col justify-between gap-5 rounded-3xl p-5 lg:w-[45%] lg:p-6"
        >
          <div className="flex flex-col gap-5">
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
                      onClick={() => setActiveGuidedStep(s.step)}
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
                {isAnatomy
                  ? 'Analisis Struktur & Alur Fisiologis'
                  : 'Analisis Persamaan & Data'}
              </h1>
              <p className="mt-0.5 text-xs text-[#5C6064]">
                {isAnatomy
                  ? `Eksplorasi fungsi bagian dalam dan alur sirkulasi pada modul ${mod.title}.`
                  : `Kalkulasi eksak untuk modul ${mod.title} berdasarkan slider saat ini.`}
              </p>
            </div>

            {isAnatomy ? (
              <AnatomyAnalysisPanel
                params={paramsMap['biology-anatomy']}
                onSelectStructure={(selectedStructureId) =>
                  updateModuleParams('biology-anatomy', { selectedStructureId })
                }
              />
            ) : (
              <>
                {/* Live Formula Recessed Box */}
                <TactileCard variant="inset" className="flex flex-col gap-3 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-code text-[11px] font-semibold tracking-wider text-[#5C6064] uppercase">
                      {computedResult.equationTitle}
                    </span>
                    <span className="rounded-full bg-[#F6F3EC] px-2.5 py-0.5 font-code text-[11px] font-medium text-[#0E5A63]">
                      {mod.constantBadge}
                    </span>
                  </div>

                  <div className="overflow-x-auto py-1 text-sm font-semibold text-[#23272A] sm:text-base">
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

                {/* Minimal Response Chart */}
                <ResponseChartSvg {...computedResult.chart} />
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 font-code text-[11px] text-[#5C6064]">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{mod.categoryLabel}</span>
            </div>
            <span className="font-semibold text-[#0E5A63]">Status: Valid</span>
          </div>
        </TactileCard>

        {/* KOLOM KANAN (55%): Panel Dialog Penuh AI Co-Pilot */}
        <CopilotChatPanel
          mod={mod}
          computedResult={computedResult}
          chatMessages={chatMessages}
          isCopilotLoading={isCopilotLoading}
          hasGeminiKey={hasGeminiKey}
          onSendMessage={sendCopilotMessage}
          isAnatomy={isAnatomy}
        />
      </div>
    </div>
  );
}
