import { ArrowRight, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLab } from '../../context/LabContext';
import { MODULE_MAP } from '../../data/modules';
import { FormulaText } from '../ui/FormulaText';
import { AnatomyBottomPanel } from './AnatomyBottomPanel';
import { CircuitBottomPanel } from './CircuitBottomPanel';
import { GeometryBottomPanel } from './GeometryBottomPanel';
import { InclinedBottomPanel } from './InclinedBottomPanel';
import { PlantCellBottomPanel } from './PlantCellBottomPanel';

export function PersistentBottomBar() {
  const {
    view,
    setView,
    activeModuleId,
    paramsMap,
    updateModuleParams,
    computedResult,
    sendCopilotMessage,
    isCopilotLoading,
    hasGeminiKey,
    records,
  } = useLab();

  const [query, setQuery] = useState('');
  const mod = MODULE_MAP[activeModuleId];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setQuery('');
    await sendCopilotMessage(trimmed);
    if (view !== 'analysis') {
      setView('analysis');
    }
  };

  // Pada Tahap 1 & 2 (Beranda & Pemilihan Materi/Modul): AI Co-Pilot tidak ditampilkan
  if (view === 'landing' || view === 'catalog') {
    return null;
  }

  // Pada Tahap 3 (3D Lab Workspace): Bar Dock 2 Kolom Data Rumus + AI Co-Pilot
  // Khusus Biologi Anatomi: diganti dengan Panel Penjelasan Komponen Anatomi Real-Time
  if (view === 'workspace') {
    if (activeModuleId === 'physics-inclined') {
      return (
        <InclinedBottomPanel
          params={paramsMap['physics-inclined']}
          onOpenAnalysis={() => setView('analysis')}
        />
      );
    }

    if (activeModuleId === 'physics-circuit') {
      return (
        <CircuitBottomPanel
          params={paramsMap['physics-circuit']}
          onOpenAnalysis={() => setView('analysis')}
        />
      );
    }

    if (activeModuleId === 'biology-anatomy') {
      return (
        <AnatomyBottomPanel
          params={paramsMap['biology-anatomy']}
          onSelectStructure={(selectedStructureId) =>
            updateModuleParams('biology-anatomy', { selectedStructureId })
          }
          onOpenAnalysis={() => setView('analysis')}
        />
      );
    }

    if (activeModuleId === 'biology-cell') {
      return (
        <PlantCellBottomPanel
          params={paramsMap['biology-cell']}
          onSelectOrganelle={(focusOrganelle) =>
            updateModuleParams('biology-cell', { focusOrganelle })
          }
          onOpenAnalysis={() => setView('analysis')}
        />
      );
    }

    if (activeModuleId === 'math-geometry3d') {
      return (
        <GeometryBottomPanel
          params={paramsMap['math-geometry3d']}
          onOpenAnalysis={() => setView('analysis')}
        />
      );
    }

    return (
      <section
        aria-label="Bar Data Rumus dan AI Co-Pilot"
        className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-stretch gap-6 rounded-3xl p-5 lg:flex-row lg:p-6"
      >
        {/* Kiri: Data & Rumus Real-Time */}
        <div className="flex w-full flex-col justify-between gap-3 lg:w-1/2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              {computedResult.equationTitle}
            </span>
            <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#0E5A63]">
              {computedResult.equationBadge}
            </span>
          </div>

          <div className="tactile-inset flex items-center overflow-x-auto rounded-xl px-4 py-3">
            <FormulaText
              latex={computedResult.primaryLatex}
              text={computedResult.primaryEquation}
              className="whitespace-nowrap text-sm font-semibold text-[#23272A] sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {computedResult.metrics.slice(0, 2).map((m) => (
              <div
                key={m.label}
                className="tactile-inset flex items-center justify-between rounded-xl px-3.5 py-2"
              >
                <span className="text-xs text-[#5C6064]">{m.label}:</span>
                <span className="font-code text-xs font-semibold text-[#23272A]">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pemisah lembut */}
        <div className="hidden w-px bg-[#E3DED2] lg:block" />

        {/* Kanan: AI Co-Pilot Observasi & Input */}
        <div className="flex w-full flex-col justify-between gap-3 lg:w-1/2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
              <span className="text-xs font-semibold tracking-wider text-[#23272A] uppercase">
                AI Co-Pilot Laboratorium
              </span>
            </div>
            <button
              type="button"
              onClick={() => setView('analysis')}
              className="flex cursor-pointer items-center gap-1 font-code text-[11px] font-semibold text-[#0E5A63] hover:underline"
            >
              <span>Buka Analisis & Dialog</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-[#23272A] sm:text-sm">
            {computedResult.copilotInsight}
          </p>

          <form
            onSubmit={handleSubmit}
            className="tactile-inset flex items-center justify-between gap-2 rounded-full p-1 pl-4"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Tanya AI Co-Pilot mengenai ${mod.shortTitle}...`}
              className="w-full border-0 bg-transparent py-1.5 text-xs text-[#23272A] placeholder:text-[#5C6064] focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              aria-label="Kirim pertanyaan ke AI Co-Pilot"
              disabled={isCopilotLoading}
              className="tactile-pill-cta flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </section>
    );
  }

  // Pada Tahap 4: Footer Status Ringkas (panel penuh AI Co-Pilot ada di body utama)
  if (view === 'analysis') {
    return (
      <footer className="no-print mx-auto mt-6 flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[#5C6064] sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
          <span className="font-code">
            {mod.title} •{' '}
            {activeModuleId === 'physics-inclined'
              ? 'Mode Rumus & Analisis Kinematika'
              : hasGeminiKey
                ? 'Gemini Flash Aktif'
                : 'Mode Analisis Lokal'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setView('worksheet')}
          className="cursor-pointer font-semibold text-[#0E5A63] hover:underline"
        >
          Lanjut ke Lembar Kerja ({records.length} data) →
        </button>
      </footer>
    );
  }

  // Pada Tahap 5 (Lembar Kerja): Ringkasan Status Bersih tanpa AI Co-Pilot
  const anatomyRecords = records.filter(
    (r) => r.recordKind === 'anatomy' || r.moduleId === 'biology-anatomy',
  );
  const cellRecords = records.filter((r) => r.moduleId === 'biology-cell');
  const numericRecords = records.filter(
    (r) =>
      r.recordKind !== 'anatomy' &&
      r.moduleId !== 'biology-anatomy' &&
      r.moduleId !== 'biology-cell',
  );
  const isAnatomySummary =
    (activeModuleId === 'biology-anatomy' && records.length === 0) ||
    (records.length > 0 && anatomyRecords.length === records.length);
  const isPlantCellSummary =
    (activeModuleId === 'biology-cell' && records.length === 0) ||
    (records.length > 0 && cellRecords.length === records.length);

  const uniqueModules = Array.from(new Set(numericRecords.map((r) => r.moduleId)));
  const isUniformNumeric = numericRecords.length > 0 && uniqueModules.length === 1;
  const avgPrimary = isUniformNumeric
    ? (
        numericRecords.reduce((acc, r) => acc + r.primaryNumericValue, 0) /
        numericRecords.length
      ).toFixed(2)
    : '0.00';
  const unitLabel = isUniformNumeric ? (numericRecords[0]?.primaryUnit ?? '') : '';

  const summaryHeadline = isAnatomySummary
    ? records.length > 0
      ? `Tercatat ${anatomyRecords.length} Observasi Struktur Anatomi`
      : `${computedResult.calloutPrimary} · ${computedResult.calloutSecondary}`
    : isPlantCellSummary
      ? records.length > 0
        ? `Tercatat ${cellRecords.length} Observasi Organel Sel Tumbuhan`
        : `${computedResult.calloutPrimary} · ${computedResult.calloutSecondary}`
      : records.length > 0
        ? isUniformNumeric
          ? `Rata-rata Nilai Utama = ${avgPrimary} ${unitLabel}`
          : `${records.length} Data Percobaan Lintas Modul Tersimpan`
        : computedResult.primaryEquation;

  return (
    <section
      aria-label="Ringkasan Data Lembar Kerja"
      className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-6xl flex-col items-start justify-between gap-3 rounded-3xl p-5 sm:flex-row sm:items-center"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0E5A63]" />
          <span className="font-code text-sm font-bold text-[#23272A]">
            {summaryHeadline}
          </span>
        </div>
        <span className="tactile-inset w-fit rounded-full px-3 py-0.5 font-code text-xs text-[#5C6064]">
          {records.length}{' '}
          {isAnatomySummary
            ? 'Observasi Anatomi'
            : isPlantCellSummary
              ? 'Observasi Sel Tumbuhan'
              : 'Percobaan Terkalibrasi'}{' '}
          • SMA Kelas XI
        </span>
      </div>

      <button
        type="button"
        onClick={() => setView('workspace')}
        className="tactile-raised tactile-raised-interactive cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-[#0E5A63]"
      >
        ← Kembali Eksplorasi 3D
      </button>
    </section>
  );
}
