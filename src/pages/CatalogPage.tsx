import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Box,
  Cpu,
  Microscope,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { TactileCard } from '../components/ui/TactileCard';
import { useLab } from '../context/LabContext';
import { MODULES } from '../data/modules';
import type { CatalogFilter, ModuleId } from '../types/lab';

function getModuleIcon(id: ModuleId): ReactNode {
  switch (id) {
    case 'physics-inclined':
      return <TrendingUp className="h-6 w-6" strokeWidth={2} />;
    case 'physics-circuit':
      return <Cpu className="h-6 w-6" strokeWidth={2} />;
    case 'biology-anatomy':
      return <Activity className="h-6 w-6" strokeWidth={2} />;
    case 'biology-cell':
      return <Microscope className="h-6 w-6" strokeWidth={2} />;
    case 'math-geometry3d':
      return <Box className="h-6 w-6" strokeWidth={2} />;
  }
}

export function CatalogPage() {
  const { setView, selectModule } = useLab();
  const [filter, setFilter] = useState<CatalogFilter>('semua');

  const filteredModules =
    filter === 'semua'
      ? MODULES
      : MODULES.filter((m) => m.subject === filter);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Context & Metadata Bar */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 font-code text-xs text-[#5C6064] sm:text-sm">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#0E5A63]" />
          <span className="font-medium text-[#23272A]">
            Kurikulum Merdeka / Sekolah Menengah Atas
          </span>
        </div>

        <button
          type="button"
          onClick={() => setView('landing')}
          className="tactile-raised tactile-raised-interactive inline-flex min-h-[38px] w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#23272A]"
        >
          <ArrowLeft className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
          <span>Beranda Lab</span>
        </button>
      </section>

      {/* Page Header & Subject Filter Tabs */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#23272A] sm:text-3xl">
              Pilih Modul Praktikum 3D
            </h1>
            <p className="mt-1 text-sm text-[#5C6064] sm:text-base">
              Eksplorasi konsep sains dan matematika jenjang Sekolah Menengah Atas dengan
              simulasi spasial interaktif.
            </p>
          </div>

          <div className="tactile-inset hidden items-center gap-2 rounded-full px-4 py-1.5 font-code text-xs text-[#5C6064] sm:inline-flex">
            <Box className="h-4 w-4 text-[#0E5A63]" strokeWidth={2} />
            <span>{MODULES.length} Modul Terkalibrasi</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <nav aria-label="Kategori Modul" className="overflow-x-auto pb-1 no-scrollbar">
          <div className="inline-flex items-center gap-5 sm:gap-6">
            {(
              [
                { id: 'semua', label: 'Semua Modul' },
                { id: 'fisika', label: 'Fisika' },
                { id: 'biologi', label: 'Biologi' },
                { id: 'matematika', label: 'Matematika' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`relative min-h-[40px] cursor-pointer pb-2 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#0E5A63] sm:text-lg ${
                    active
                      ? 'font-semibold text-[#0E5A63]'
                      : 'font-medium text-[#5C6064] hover:text-[#23272A]'
                  }`}
                >
                  {tab.label}
                  {active ? (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#0E5A63]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Grid Kartu Topik */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((mod) => (
          <TactileCard
            key={mod.id}
            variant="raised"
            className="tactile-raised-interactive flex h-full flex-col justify-between rounded-3xl p-5 sm:p-6"
          >
            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="tactile-inset flex h-12 w-12 items-center justify-center rounded-2xl text-[#0E5A63] sm:h-14 sm:w-14">
                {getModuleIcon(mod.id)}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-code text-[11px] font-semibold tracking-wider text-[#0E5A63] uppercase sm:text-xs">
                  {mod.categoryLabel}
                </span>
                <h2 className="text-base font-bold text-[#23272A] sm:text-lg">
                  {mod.title}
                </h2>
                <p className="text-xs leading-relaxed text-[#5C6064] sm:text-sm">
                  {mod.description}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 pt-2">
              <span className="min-w-0 truncate font-code text-[11px] text-[#5C6064] sm:text-xs">
                {mod.previewBadge}
              </span>
              <button
                type="button"
                onClick={() => selectModule(mod.id, true)}
                className="tactile-pill-cta inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap"
              >
                <span>Buka Simulasi</span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
              </button>
            </div>
          </TactileCard>
        ))}
      </div>
    </div>
  );
}
