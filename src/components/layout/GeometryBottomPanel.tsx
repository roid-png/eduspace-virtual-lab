import { ArrowRight, BookOpen, Compass } from 'lucide-react';
import { useMemo } from 'react';
import {
  calculateCircleGeometry,
  calculateTransformationGeometry,
} from '../../engines/mathGeometry3d';
import type { Geometry3DParams } from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';

interface GeometryBottomPanelProps {
  params: Geometry3DParams;
  onOpenAnalysis: () => void;
}

export function GeometryBottomPanel({
  params,
  onOpenAnalysis,
}: GeometryBottomPanelProps) {
  const tVal = useMemo(() => calculateTransformationGeometry(params), [params]);
  const cVal = useMemo(() => calculateCircleGeometry(params), [params]);
  const isTransform = params.subMode === 'transformasi';

  return (
    <section
      aria-label="Panel Rumus dan Penjelasan Sifat Geometri"
      className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-stretch gap-5 rounded-3xl p-5 lg:flex-row lg:p-6"
    >
      {/* Kiri: Rumus Ringkas Aktif */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[52%]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              {isTransform
                ? `Rumus ${tVal.transformTitle}`
                : `Rumus Lingkaran (r = ${cVal.radius.toFixed(1)} cm, θ = ${cVal.centralAngleDeg}°)`}
            </span>
          </div>
          <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#0E5A63]">
            {isTransform ? tVal.natureLabel : 'Kelas XI · Lingkaran'}
          </span>
        </div>

        <div className="tactile-inset flex items-center overflow-x-auto rounded-xl px-4 py-2.5">
          <FormulaText
            latex={isTransform ? tVal.primaryLatex : cVal.primaryLatex}
            text={isTransform ? tVal.primaryEquation : cVal.primaryEquation}
            className="text-sm text-[#0E5A63] sm:text-base"
          />
        </div>

        {isTransform ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
                Titik Uji A → A'
              </span>
              <span className="font-code text-xs font-bold text-[#23272A]">
                {tVal.primaryEquation}
              </span>
            </div>
            <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
                Determinan |det(M)|
              </span>
              <FormulaText
                latex={`|\\det(M)| = ${tVal.absDeterminant.toFixed(2)}`}
                text={`|det(M)| = ${tVal.absDeterminant.toFixed(2)}`}
                className="text-xs text-[#23272A]"
              />
            </div>
            <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
                Luas Awal → Bayangan
              </span>
              <span className="font-code text-xs font-bold text-[#0E5A63]">
                {tVal.initialArea.toFixed(1)} → {tVal.imageArea.toFixed(2)} sat²
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
                Sudut Keliling (θ/2)
              </span>
              <FormulaText
                latex={`\\alpha = \\frac{${cVal.centralAngleDeg}^{\\circ}}{2} = ${cVal.inscribedAngleDeg.toFixed(1)}^{\\circ}`}
                text={`Sudut keliling = ${cVal.inscribedAngleDeg.toFixed(1)}°`}
                className="text-xs text-[#23272A]"
              />
            </div>
            <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
                Tali Busur AB
              </span>
              <FormulaText
                latex={`c = 2r\\sin\\!\\left(\\frac{\\theta}{2}\\right) = ${cVal.chordLength.toFixed(2)}\\,\\text{cm}`}
                text={`c = ${cVal.chordLength.toFixed(2)} cm`}
                className="text-xs text-[#23272A]"
              />
            </div>
            <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
              <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
                Garis Singgung PT
              </span>
              <FormulaText
                latex={`PT = \\sqrt{OP^2 - r^2} = ${cVal.tangentLength.toFixed(2)}\\,\\text{cm}`}
                text={`PT = ${cVal.tangentLength.toFixed(2)} cm`}
                className="text-xs text-[#0E5A63]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Kanan: Penjelasan Sifat & Komponen Geometri Real-Time (Tanpa AI Co-Pilot) */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[48%] lg:border-l lg:border-[#5C6064]/15 lg:pl-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wider text-[#23272A] uppercase">
              Penjelasan Sifat &amp; Komponen Geometri
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-[#0E5A63] hover:underline focus-visible:outline-2 focus-visible:outline-[#0E5A63]"
          >
            <span>Buka Analisis &amp; AI</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="tactile-inset flex flex-col gap-2 rounded-2xl px-4 py-3 text-xs leading-relaxed text-[#23272A]">
          <p>{isTransform ? tVal.propertySummary : cVal.propertySummary}</p>

          <p className="border-t border-[#5C6064]/15 pt-1.5 text-[11px] text-[#5C6064]">
            {isTransform
              ? 'Objek berwarna krem-abu merupakan bangun awal ABC, sedangkan bangun berwarna teal (#0E5A63) adalah hasil bayangan A\'B\'C\'.'
              : `Luas total lingkaran = ${cVal.circleArea.toFixed(2)} cm² dan keliling penuh = ${cVal.circumference.toFixed(2)} cm.`}
          </p>
        </div>
      </div>
    </section>
  );
}
