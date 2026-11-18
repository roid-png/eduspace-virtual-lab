import { ArrowRight, Box, Microscope, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { IsometricStage } from '../components/three/IsometricStage';
import { CellMicroscopeScene } from '../components/three/scenes/CellMicroscopeScene';
import { Geometry3DScene } from '../components/three/scenes/Geometry3DScene';
import { InclinedPlaneScene } from '../components/three/scenes/InclinedPlaneScene';
import { TactileCard } from '../components/ui/TactileCard';
import { useLab } from '../context/LabContext';
import { DEFAULT_MODULE_PARAMS } from '../engines';

type ShowcaseSubject = 'fisika' | 'biologi' | 'matematika';

const SHOWCASE_META: Record<
  ShowcaseSubject,
  {
    label: string;
    tag: string;
    badge: string;
    moduleId: 'physics-inclined' | 'biology-cell' | 'math-geometry3d';
  }
> = {
  fisika: {
    label: 'Fisika 3D',
    tag: 'MODUL FISIKA • GERAK PADA BIDANG MIRING',
    badge: '3D Isometrik',
    moduleId: 'physics-inclined',
  },
  biologi: {
    label: 'Biologi 3D',
    tag: 'MODUL BIOLOGI • STRUKTUR SEL TUMBUHAN',
    badge: 'Model Organel 3D',
    moduleId: 'biology-cell',
  },
  matematika: {
    label: 'Matematika 3D',
    tag: 'MODUL MATEMATIKA • TRANSFORMASI GEOMETRI',
    badge: 'Matriks 2×2 · 3D',
    moduleId: 'math-geometry3d',
  },
};

export function LandingPage() {
  const { setView, selectModule } = useLab();
  const [activeSubject, setActiveSubject] = useState<ShowcaseSubject>('fisika');
  const [resetTick, setResetTick] = useState(0);

  const meta = SHOWCASE_META[activeSubject];

  const handleSelectSubject = (subject: ShowcaseSubject) => {
    setActiveSubject(subject);
    setResetTick((t) => t + 1);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid w-full grid-cols-1 items-center gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        {/* Kolom Kiri: Tipografi Utama & CTA */}
        <div className="flex flex-col items-start lg:col-span-6 lg:pr-4">
          <span className="tactile-inset mb-4 inline-flex flex-wrap items-center gap-2 rounded-full px-3.5 py-1.5 font-code text-[11px] font-medium text-[#0E5A63] sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#0E5A63]" />
            <span>Jenjang Sekolah Menengah Atas · Kurikulum Merdeka</span>
          </span>

          <h1 className="hero-title-fluid font-bold tracking-tight text-[#23272A]">
            LABORATORIUM SAINS DAN MATEMATIKA 3D MODEL
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#5C6064] sm:mt-5 sm:text-lg">
            Pahami konsep Fisika, Biologi, dan Matematika lewat simulasi 3D
            interaktif yang terintegrasi langsung ke Asisten Cerdas.
          </p>

          <button
            type="button"
            onClick={() => setView('catalog')}
            className="tactile-pill-cta mt-7 inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold sm:mt-8 sm:px-8 sm:py-3.5 sm:text-base"
          >
            <span>Mulai Belajar</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Kolom Kanan: Showcase Apparatus 3D Interaktif (Fisika, Biologi, Matematika) */}
        <div className="flex items-center justify-center lg:col-span-6">
          <TactileCard
            variant="raised-lg"
            className="w-full max-w-lg rounded-3xl p-4 sm:p-6"
          >
            {/* Pemilih Simbol Modul 3D (Fisika / Biologi / Matematika) */}
            <div
              role="tablist"
              aria-label="Pilih Simbol Modul 3D Interaktif"
              className="tactile-inset mb-3.5 grid grid-cols-3 gap-1.5 rounded-2xl p-1.5"
            >
              {(
                [
                  {
                    id: 'fisika',
                    label: 'Fisika 3D',
                    icon: <TrendingUp className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />,
                  },
                  {
                    id: 'biologi',
                    label: 'Biologi 3D',
                    icon: <Microscope className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />,
                  },
                  {
                    id: 'matematika',
                    label: 'Matematika 3D',
                    icon: <Box className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />,
                  },
                ] as const
              ).map((tab) => {
                const active = activeSubject === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleSelectSubject(tab.id)}
                    className={`flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-all sm:text-xs ${
                      active
                        ? 'bg-[#0E5A63] text-white shadow-[2px_2px_6px_rgba(14,90,99,0.25)]'
                        : 'text-[#5C6064] hover:text-[#23272A]'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <TactileCard
              variant="inset"
              className="relative h-[270px] w-full overflow-hidden rounded-2xl sm:h-[360px]"
            >
              <IsometricStage
                zoom={activeSubject === 'matematika' ? 40 : 44}
                resetTick={resetTick}
                showFloorGrid={activeSubject === 'matematika'}
              >
                {activeSubject === 'fisika' ? (
                  <InclinedPlaneScene
                    params={{
                      objectType: 'barang',
                      theta: 30,
                      mass: 5.0,
                      mu: 0.2,
                      rampLengthMeters: 6.0,
                    }}
                    showVectors
                    isSimRunning={false}
                  />
                ) : null}

                {activeSubject === 'biologi' ? (
                  <CellMicroscopeScene
                    params={{
                      focusOrganelle: 'semua',
                      lightCondition: 'terang',
                    }}
                    showVectors
                    isSimRunning={false}
                  />
                ) : null}

                {activeSubject === 'matematika' ? (
                  <Geometry3DScene
                    params={DEFAULT_MODULE_PARAMS['math-geometry3d']}
                    showVectors
                  />
                ) : null}
              </IsometricStage>
            </TactileCard>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="font-code text-[10px] font-medium tracking-wider text-[#5C6064] uppercase sm:text-[11px]">
                {meta.tag}
              </span>
              <button
                type="button"
                onClick={() => selectModule(meta.moduleId, true)}
                className="cursor-pointer font-code text-[11px] font-semibold text-[#0E5A63] hover:underline"
              >
                {meta.badge} →
              </button>
            </div>
          </TactileCard>
        </div>
      </div>
    </section>
  );
}
