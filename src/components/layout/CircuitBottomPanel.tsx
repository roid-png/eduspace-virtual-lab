import { ArrowRight, BookOpen, Zap } from 'lucide-react';
import { useMemo } from 'react';
import {
  LAMP_SPECS,
  calculateCircuitPhysics,
  getModeLabel,
} from '../../engines/physicsCircuit';
import type { CircuitParams } from '../../types/lab';
import { FormulaText } from '../ui/FormulaText';

interface CircuitBottomPanelProps {
  params: CircuitParams;
  onOpenAnalysis: () => void;
}

export function CircuitBottomPanel({
  params,
  onOpenAnalysis,
}: CircuitBottomPanelProps) {
  const c = useMemo(() => calculateCircuitPhysics(params), [params]);
  const modeLabel = getModeLabel(params.mode);

  const primaryLatex = c.isCircuitClosed
    ? `I_{\\text{tot}} = \\frac{V}{R_{\\text{tot}}} = \\frac{${params.voltage.toFixed(1)}\\,\\text{V}}{${c.rTotal.toFixed(2)}\\,\\Omega} = ${c.iTotal.toFixed(2)}\\,\\text{A}`
    : `\\text{Saklar OFF (Terbuka)}\\;\\Longrightarrow\\; I_{\\text{tot}} = 0.00\\,\\text{A},\\; R_{\\text{ekiv}} = ${c.rTotal.toFixed(2)}\\,\\Omega`;

  const resistanceLatex =
    params.mode === 'seri'
      ? `R_{\\text{tot}} = R_1 + R_2${params.hasLamp ? '+R_L' : ''} = ${c.rTotal.toFixed(2)}\\,\\Omega`
      : params.mode === 'paralel'
        ? `R_{\\text{tot}} = ${c.rTotal.toFixed(2)}\\,\\Omega\\;(\\text{Paralel})`
        : `R_{\\text{par}} = ${c.rParallel.toFixed(2)}\\,\\Omega,\\; R_{\\text{tot}} = ${c.rTotal.toFixed(2)}\\,\\Omega`;

  const distributionLatex = !c.isCircuitClosed
    ? `V_1 = 0\\,\\text{V},\\; I_{\\text{cabang}} = 0\\,\\text{A}`
    : params.mode === 'seri'
      ? `V_1 = ${c.v1.toFixed(1)}\\,\\text{V},\\; V_2 = ${c.v2.toFixed(1)}\\,\\text{V}`
      : params.mode === 'paralel'
        ? `I_1 = ${c.i1.toFixed(2)}\\,\\text{A},\\; I_2 = ${c.i2.toFixed(2)}\\,\\text{A}`
        : `I_2 = ${c.i2.toFixed(2)}\\,\\text{A},\\; I_3 = ${c.i3.toFixed(2)}\\,\\text{A}`;

  return (
    <section
      aria-label="Panel Rumus dan Hukum Rangkaian Listrik"
      className="no-print tactile-raised mx-auto mt-6 flex w-full max-w-[1440px] flex-col items-stretch gap-5 rounded-3xl p-5 lg:flex-row lg:p-6"
    >
      {/* Kiri: Rumus Aktif & Kalkulasi Real-Time */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[52%]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wider text-[#5C6064] uppercase">
              Rumus Rangkaian {modeLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#0E5A63]">
              {params.hasSwitch
                ? params.switchClosed
                  ? 'Saklar: ON'
                  : 'Saklar: OFF'
                : 'Tanpa Saklar'}
            </span>
            {params.hasLamp ? (
              <span className="tactile-inset rounded-lg px-2.5 py-0.5 font-code text-[11px] font-semibold text-[#23272A]">
                {LAMP_SPECS[params.lampType].shortLabel} · {c.powerLamp.toFixed(2)} W
              </span>
            ) : null}
          </div>
        </div>

        <div className="tactile-inset flex items-center overflow-x-auto rounded-xl px-4 py-2.5">
          <FormulaText
            latex={primaryLatex}
            text={`I_tot = ${c.iTotal.toFixed(2)} A`}
            className="text-sm text-[#0E5A63] sm:text-base"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
              Hambatan Ekivalen
            </span>
            <FormulaText
              latex={resistanceLatex}
              text={`R_tot = ${c.rTotal.toFixed(2)} Ω`}
              className="text-xs text-[#23272A]"
            />
          </div>

          <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
              {params.mode === 'seri' ? 'Pembagian Tegangan' : 'Pembagian Arus'}
            </span>
            <FormulaText
              latex={distributionLatex}
              text="Distribusi Rangkaian"
              className="text-xs text-[#23272A]"
            />
          </div>

          <div className="tactile-inset flex flex-col gap-0.5 rounded-xl px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#5C6064] uppercase">
              Daya Listrik (P = V·I)
            </span>
            <FormulaText
              latex={`P_{\\text{tot}} = ${c.powerTotal.toFixed(2)}\\,\\text{W}${params.hasLamp ? `\\; (P_L = ${c.powerLamp.toFixed(2)}\\,\\text{W})` : ''}`}
              text={`P_tot = ${c.powerTotal.toFixed(2)} W`}
              className="text-xs text-[#0E5A63]"
            />
          </div>
        </div>
      </div>

      {/* Kanan: Penjelasan Hukum Fisika yang Bekerja (Tanpa AI Co-Pilot di Simulasi 3D) */}
      <div className="flex w-full flex-col justify-between gap-3 lg:w-[48%] lg:border-l lg:border-[#5C6064]/15 lg:pl-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-[#0E5A63]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wider text-[#23272A] uppercase">
              Hukum yang Berlaku pada Rangkaian Ini
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
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            <div className="rounded-xl bg-[#EFECE4] px-2.5 py-2">
              <div className="font-bold text-[#0E5A63]">Hukum Ohm</div>
              <div className="text-[11px] text-[#5C6064]">
                <span className="font-code font-semibold text-[#23272A]">V = I·R</span>: Arus berbanding lurus dengan tegangan &amp; berbanding terbalik terhadap hambatan total.
              </div>
            </div>

            <div className="rounded-xl bg-[#EFECE4] px-2.5 py-2">
              <div className="font-bold text-[#0E5A63]">Hukum I Kirchhoff</div>
              <div className="text-[11px] text-[#5C6064]">
                {params.mode === 'seri'
                  ? 'Pada seri tanpa cabang, arus sama di setiap titik (I₁ = I₂ = I_tot).'
                  : `ΣI_masuk = ΣI_keluar (${c.iTotal.toFixed(2)} A terbagi ke cabang paralel).`}
              </div>
            </div>

            <div className="rounded-xl bg-[#EFECE4] px-2.5 py-2">
              <div className="font-bold text-[#0E5A63]">Hukum II Kirchhoff</div>
              <div className="text-[11px] text-[#5C6064]">
                Dalam satu lup tertutup, <span className="font-code font-semibold text-[#23272A]">Σε − ΣIR = 0</span> (total tegangan beban = V sumber).
              </div>
            </div>
          </div>

          <p className="border-t border-[#5C6064]/15 pt-1.5 text-[11px] text-[#5C6064]">
            {!c.isCircuitClosed
              ? 'Status Terbuka (OFF): Rangkaian terputus pada saklar sehingga arus berhenti mengalir dan lampu padam. Klik saklar di model 3D untuk menutup jalur!'
              : params.hasLamp
                ? `Lampu ${LAMP_SPECS[params.lampType].shortLabel} menyerap daya ${c.powerLamp.toFixed(2)} W (${c.lampBrightness > 0.75 ? 'menyala terang' : c.lampBrightness > 0.3 ? 'menyala sedang' : 'menyala redup'}). Ubah susunan atau penempatan lampu untuk membandingkan nyalanya!`
                : 'Tips: Aktifkan Saklar atau Lampu pada panel kiri untuk menguji rangkaian terbuka vs nyala beban lampu 3D.'}
          </p>
        </div>
      </div>
    </section>
  );
}
