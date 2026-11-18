import { ArrowRight } from 'lucide-react';
import { IsometricStage } from '../components/three/IsometricStage';
import { InclinedPlaneScene } from '../components/three/scenes/InclinedPlaneScene';
import { TactileCard } from '../components/ui/TactileCard';
import { useLab } from '../context/LabContext';

export function LandingPage() {
  const { setView } = useLab();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full grid-cols-1 items-center gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        {/* Kolom Kiri: Tipografi Utama & CTA */}
        <div className="flex flex-col items-start lg:col-span-6 lg:pr-6">
          <span className="tactile-inset mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-code text-xs font-medium text-[#0E5A63]">
            <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
            SMA Kelas XI · Kurikulum Merdeka
          </span>

          <h1 className="text-3xl leading-tight font-bold tracking-tight text-[#23272A] sm:text-5xl">
            Laboratorium 3D Interaktif untuk SMA
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#5C6064] sm:text-lg">
            Pahami konsep Fisika, Biologi, dan Matematika lewat simulasi isometrik
            dan bimbingan AI Co-Pilot.
          </p>

          <button
            type="button"
            onClick={() => setView('catalog')}
            className="tactile-pill-cta mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold sm:text-base"
          >
            <span>Mulai Belajar</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Kolom Kanan: Showcase Apparatus 3D Isometrik */}
        <div className="flex items-center justify-center lg:col-span-6">
          <TactileCard
            variant="raised-lg"
            className="w-full max-w-lg rounded-3xl p-5 sm:p-6"
          >
            <TactileCard
              variant="inset"
              className="relative h-[340px] w-full overflow-hidden rounded-2xl sm:h-[380px]"
            >
              <IsometricStage zoom={44} showFloorGrid={false}>
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
              </IsometricStage>
            </TactileCard>

            <div className="mt-4 flex items-center justify-between px-1">
              <span className="font-code text-[11px] font-medium tracking-wider text-[#5C6064] uppercase">
                MODUL FISIKA • GERAK PADA BIDANG MIRING
              </span>
              <span className="font-code text-[11px] font-semibold text-[#0E5A63]">
                3D Isometrik
              </span>
            </div>
          </TactileCard>
        </div>
      </div>
    </section>
  );
}
