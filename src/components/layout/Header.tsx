import {
  ArrowLeft,
  Box,
  NotebookPen,
  RotateCcw,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { MODULE_MAP } from '../../data/modules';

export function Header() {
  const {
    view,
    setView,
    activeModuleId,
    resetActiveModule,
    recordCurrentExperiment,
    records,
  } = useLab();

  const activeModule = MODULE_MAP[activeModuleId];
  const isLabFlow = view === 'workspace' || view === 'analysis' || view === 'worksheet';

  return (
    <header className="no-print fixed top-0 left-0 right-0 z-50 bg-[#EFECE4]/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl shadow-[0_1px_10px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        {/* Left: Brand & Contextual Breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {view !== 'landing' ? (
            <button
              type="button"
              aria-label="Kembali"
              onClick={() => {
                if (view === 'catalog') setView('landing');
                else if (view === 'workspace') setView('catalog');
                else setView('workspace');
              }}
              className="tactile-raised tactile-raised-interactive flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#23272A] md:hidden"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setView('landing')}
            className="flex min-h-[40px] cursor-pointer items-center gap-1.5 sm:gap-2 focus-visible:outline-2 focus-visible:outline-[#0E5A63]"
          >
            <div className="tactile-inset flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#0E5A63] sm:h-9 sm:w-9">
              <Box className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            </div>
            <span className="text-base font-bold tracking-tight text-[#0E5A63] sm:text-lg">
              EDUSPACE
            </span>
          </button>

          {isLabFlow ? (
            <div className="hidden items-center gap-2 font-code text-xs text-[#5C6064] md:flex">
              <span className="opacity-40">/</span>
              <button
                type="button"
                onClick={() => setView('catalog')}
                className="cursor-pointer transition-colors hover:text-[#23272A]"
              >
                Pilih Materi
              </button>
              <span className="opacity-40">/</span>
              <span className="truncate font-semibold text-[#0E5A63]">
                {activeModule.shortTitle}
              </span>
            </div>
          ) : null}
        </div>

        {/* Center: Stage Navigation Pill (Tahap 3-5 Desktop) */}
        {isLabFlow ? (
          <nav
            aria-label="Navigasi Tahap Praktikum"
            className="tactile-inset hidden items-center gap-1 rounded-full p-1 lg:flex"
          >
            {(
              [
                { id: 'workspace', label: 'Simulasi 3D' },
                {
                  id: 'analysis',
                  label:
                    activeModuleId === 'physics-inclined'
                      ? 'Analisis & Rumus'
                      : 'Analisis & Asisten',
                },
                { id: 'worksheet', label: `Lembar Kerja (${records.length})` },
              ] as const
            ).map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                      : 'text-[#5C6064] hover:text-[#23272A]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : null}

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {view === 'landing' ? (
            <>
              <span className="tactile-inset hidden rounded-full px-3 py-1 font-code text-xs text-[#5C6064] md:inline-flex">
                Jenjang Sekolah Menengah Atas
              </span>
              <button
                type="button"
                onClick={() => setView('catalog')}
                className="tactile-pill-cta min-h-[38px] shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap sm:px-5"
              >
                Masuk Lab
              </button>
            </>
          ) : null}

          {isLabFlow ? (
            <>
              <button
                type="button"
                onClick={recordCurrentExperiment}
                className="tactile-raised tactile-raised-interactive flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-[#23272A] sm:px-3.5"
              >
                <NotebookPen className="h-3.5 w-3.5 text-[#0E5A63] sm:h-4 sm:w-4" strokeWidth={2} />
                <span className="hidden sm:inline">Catat Data</span>
                <span className="tactile-inset rounded-full px-1.5 py-0.5 font-code text-[11px] text-[#0E5A63]">
                  {records.length}
                </span>
              </button>

              {view === 'workspace' ? (
                <button
                  type="button"
                  aria-label="Reset Simulasi"
                  title="Reset Parameter Simulasi"
                  onClick={resetActiveModule}
                  className="tactile-raised tactile-raised-interactive flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#5C6064] hover:text-[#23272A]"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {/* Compact Mobile Stage Switcher for Tahap 3-5 */}
      {isLabFlow ? (
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-3 pb-2.5 sm:px-4 lg:hidden">
          {(
            [
              { id: 'workspace', label: 'Simulasi 3D' },
              {
                id: 'analysis',
                label:
                  activeModuleId === 'physics-inclined'
                    ? 'Analisis'
                    : 'Asisten & AI',
              },
              { id: 'worksheet', label: `Kerja (${records.length})` },
            ] as const
          ).map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`min-h-[34px] flex-1 cursor-pointer rounded-full px-2 py-1.5 text-center text-[11px] font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                    : 'tactile-inset text-[#5C6064]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
