import { ArrowRight, BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import {
  DEFAULT_RAMP_LENGTH_M,
  calculateInclinedPhysics,
} from '../../engines/physicsInclined';
import type { InclinedParams } from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';

interface InclinedBottomPanelProps {
  params: InclinedParams;
  onOpenAnalysis: () => void;
}

export function InclinedBottomPanel({
  params,
  onOpenAnalysis,
}: InclinedBottomPanelProps) {
  const v = useMemo(() => calculateInclinedPhysics(params), [params]);
  const L = params.rampLengthMeters || DEFAULT_RAMP_LENGTH_M;
  const objectName = params.objectType === 'mobil' ? 'mobil di lereng bukit' : 'peti barang';

  const primaryLatex = v.isMoving
    ? `a = \\frac{\\sum F_x}{m} = g(\\sin ${params.theta}^\\circ - ${params.mu.toFixed(2)}\\cos ${params.theta}^\\circ) = ${v.acceleration.toFixed(2)}\\text{ m/s}^2`
    : `\\sum F_x = 0\\; (\\text{Diam: } W\\sin ${params.theta}^\\circ = ${v.drivingForce.toFixed(1)}\\text{ N} \\le f_{s,\\text{maks}} = ${v.maxStaticFriction.toFixed(1)}\\text{ N})`;

  return (
    <section
      aria-label="Panel Rumus dan Penjelasan Hukum II Newton"
      className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-stretch gap-5 rounded-3xl p-5 lg:flex-row lg:p-6"
    >
      {/* Kiri: Rumus Lengkap & Kalkulasi Real-Time */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[54%]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              Rumus &amp; Persamaan Bidang Miring
            </span>
          </div>
          <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#0E5A63]">
            {params.objectType === 'mobil' ? 'Mobil & Bukit' : 'Peti Barang'} · L = {L.toFixed(1)} m · h = {v.rampHeightMeters.toFixed(2)} m
          </span>
        </div>

        <div className="tactile-inset flex items-center overflow-x-auto rounded-xl px-4 py-2.5">
          <FormulaText
            latex={primaryLatex}
            text={`a = ${v.acceleration.toFixed(2)} m/s^2`}
            className="text-sm text-[#0E5A63] sm:text-base"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
              Berat &amp; Tinggi
            </span>
            <FormulaText
              latex={`W = mg = ${v.weight.toFixed(1)}\\text{ N}`}
              text={`W = ${v.weight.toFixed(1)} N`}
              className="text-xs text-[#23272A]"
            />
            <FormulaText
              latex={`h = L\\sin\\theta = ${v.rampHeightMeters.toFixed(2)}\\text{ m}`}
              text={`h = ${v.rampHeightMeters.toFixed(2)} m`}
              className="text-[11px] text-[#0E5A63]"
            />
          </div>

          <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
              Komponen Gaya
            </span>
            <FormulaText
              latex={`N = W\\cos\\theta = ${v.normalForce.toFixed(1)}\\text{ N}`}
              text={`N = ${v.normalForce.toFixed(1)} N`}
              className="text-xs text-[#23272A]"
            />
            <FormulaText
              latex={`W_x = W\\sin\\theta = ${v.drivingForce.toFixed(1)}\\text{ N}`}
              text={`W_x = ${v.drivingForce.toFixed(1)} N`}
              className="text-[11px] text-[#0E5A63]"
            />
          </div>

          <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
              Gesekan &amp; Resultan
            </span>
            <FormulaText
              latex={`f_{\\text{gesek}} = ${v.frictionForce.toFixed(1)}\\text{ N}`}
              text={`f = ${v.frictionForce.toFixed(1)} N`}
              className="text-xs text-[#23272A]"
            />
            <FormulaText
              latex={`F_{\\text{net}} = W_x - f = ${v.netForce.toFixed(1)}\\text{ N}`}
              text={`F_net = ${v.netForce.toFixed(1)} N`}
              className="text-[11px] text-[#0E5A63]"
            />
          </div>
        </div>
      </div>

      {/* Kanan: Penjelasan Hukum II Newton & Kondisi Simulasi (Tanpa AI Co-Pilot) */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[46%] lg:border-l lg:border-[#5C6064]/15 lg:pl-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0E5A63]" />
            <span className="text-xs font-semibold tracking-wider text-[#23272A] uppercase">
              Hukum II Newton &amp; Penjelasan Simulasi
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-[#0E5A63] hover:underline focus-visible:outline-2 focus-visible:outline-[#0E5A63]"
          >
            <span>Buka Analisis &amp; Rumus</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="tactile-inset flex flex-col gap-2 rounded-2xl px-4 py-3 text-xs leading-relaxed text-[#23272A]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#0E5A63] px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#F6F3EC]">
              {v.isMoving ? 'STATUS: MELUNCUR' : 'STATUS: DIAM (STATIS)'}
            </span>
            <span className="font-code text-[11px] text-[#5C6064]">
              Sudut Kritis θ_c = {v.criticalAngleDeg.toFixed(1)}°
            </span>
          </div>

          <p className="text-xs text-[#23272A]">
            {v.isMoving ? (
              <>
                Gaya dorong gravitasi sejajar lereng (<span className="font-code font-semibold">{v.drivingForce.toFixed(1)} N</span>) lebih besar daripada hambatan gesek (<span className="font-code font-semibold">{v.frictionForce.toFixed(1)} N</span>). Sesuai <strong className="text-[#0E5A63]">Hukum II Newton (ΣF = m·a)</strong>, {objectName} mengalami percepatan <span className="font-code font-semibold text-[#0E5A63]">{v.acceleration.toFixed(2)} m/s²</span> menuruni lereng.
              </>
            ) : (
              <>
                Gaya penggerak (<span className="font-code font-semibold">{v.drivingForce.toFixed(1)} N</span>) belum cukup mengalahkan batas gesekan statis maksimum (<span className="font-code font-semibold">{v.maxStaticFriction.toFixed(1)} N</span>). Karena resultan gaya sejajar bidang <span className="font-code font-semibold">ΣF = 0 N</span>, {objectName} tetap diam (<span className="font-code font-semibold">a = 0.00 m/s²</span>). Naikkan θ &gt; {v.criticalAngleDeg.toFixed(1)}° agar bergerak.
              </>
            )}
          </p>

          <p className="border-t border-[#5C6064]/15 pt-1.5 text-[11px] text-[#5C6064]">
            Catatan Siswa: Percepatan <span className="font-code">a = g(sin θ − μ cos θ)</span> bergantung pada kemiringan (<span className="font-code">θ</span> / <span className="font-code">h</span>) dan kekasaran (<span className="font-code">μ</span>), bukan pada besar massa saat mulai meluncur.
          </p>
        </div>
      </div>
    </section>
  );
}
