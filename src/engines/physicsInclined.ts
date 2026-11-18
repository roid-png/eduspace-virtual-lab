import type { ComputedModuleResult, InclinedParams } from '../types/lab';

export const GRAVITY = 9.8;
export const DEFAULT_RAMP_LENGTH_M = 6.0;

export interface InclinedBreakdownStep {
  step: number;
  title: string;
  latex: string;
  plainText: string;
  simpleExplanation: string;
}

export interface InclinedFormulaItem {
  id: string;
  title: string;
  latex: string;
  plainText: string;
  meaning: string;
}

export interface InclinedChartSeries {
  id: 'a-theta' | 'forces-theta' | 'a-mu';
  tabLabel: string;
  title: string;
  subtitle: string;
  xLabel: string;
  yLabel: string;
  primaryLabel: string;
  primaryPoints: Array<{ x: number; y: number }>;
  secondaryLabel?: string;
  secondaryPoints?: Array<{ x: number; y: number }>;
  activeX: number;
  activeY: number;
  criticalX?: number;
  criticalLabel?: string;
  simpleTakeaway: string;
}

export interface InclinedPhysicsValues {
  weight: number;
  normalForce: number;
  drivingForce: number;
  maxStaticFriction: number;
  frictionForce: number;
  netForce: number;
  acceleration: number;
  isMoving: boolean;
  rampHeightMeters: number;
  baseRunMeters: number;
  criticalAngleDeg: number;
  endSpeedMs: number;
}

export function calculateInclinedPhysics(params: InclinedParams): InclinedPhysicsValues {
  const rad = (params.theta * Math.PI) / 180;
  const L = params.rampLengthMeters || DEFAULT_RAMP_LENGTH_M;
  const weight = params.mass * GRAVITY;
  const normalForce = weight * Math.cos(rad);
  const drivingForce = weight * Math.sin(rad);
  const maxStaticFriction = params.mu * normalForce;

  const isMoving = params.theta > 0 && drivingForce > maxStaticFriction + 1e-6;
  const frictionForce = isMoving ? maxStaticFriction : drivingForce;
  const netForce = isMoving ? drivingForce - frictionForce : 0;
  const acceleration = isMoving ? netForce / params.mass : 0;

  const rampHeightMeters = L * Math.sin(rad);
  const baseRunMeters = L * Math.cos(rad);
  const criticalAngleDeg = (Math.atan(params.mu) * 180) / Math.PI;
  const endSpeedMs = isMoving ? Math.sqrt(2 * acceleration * L) : 0;

  return {
    weight,
    normalForce,
    drivingForce,
    maxStaticFriction,
    frictionForce,
    netForce,
    acceleration,
    isMoving,
    rampHeightMeters,
    baseRunMeters,
    criticalAngleDeg,
    endSpeedMs,
  };
}

export function buildInclinedAnalysisDetails(params: InclinedParams): {
  values: InclinedPhysicsValues;
  breakdownSteps: InclinedBreakdownStep[];
  formulaReference: InclinedFormulaItem[];
  chartVariants: InclinedChartSeries[];
} {
  const v = calculateInclinedPhysics(params);
  const thetaRounded = Math.round(params.theta);
  const L = params.rampLengthMeters || DEFAULT_RAMP_LENGTH_M;
  const objectNoun = params.objectType === 'mobil' ? 'mobil di lereng bukit' : 'peti barang';

  const breakdownSteps: InclinedBreakdownStep[] = [
    {
      step: 1,
      title: 'Hitung Gaya Berat (W) & Tinggi Bukit (h)',
      latex: `W = ${params.mass.toFixed(1)}\\,\\text{kg} \\times 9.80\\,\\text{m/s}^2 = ${v.weight.toFixed(1)}\\,\\text{N}, \\quad h = ${L.toFixed(1)} \\cdot \\sin ${thetaRounded}^{\\circ} = ${v.rampHeightMeters.toFixed(2)}\\,\\text{m}`,
      plainText: `W = ${v.weight.toFixed(1)} N, h = ${v.rampHeightMeters.toFixed(2)} m`,
      simpleExplanation: `Bumi menarik ${objectNoun} lurus ke bawah sebesar ${v.weight.toFixed(1)} N, sedangkan puncak lintasan berada setinggi ${v.rampHeightMeters.toFixed(2)} m dari dasar.`,
    },
    {
      step: 2,
      title: 'Urai Gaya Berat ke Arah Bidang (W·sin θ) & Tegak Lurus (N)',
      latex: `W_x = ${v.weight.toFixed(1)}\\sin ${thetaRounded}^{\\circ} = ${v.drivingForce.toFixed(1)}\\,\\text{N}, \\quad N = ${v.weight.toFixed(1)}\\cos ${thetaRounded}^{\\circ} = ${v.normalForce.toFixed(1)}\\,\\text{N}`,
      plainText: `W_x = ${v.drivingForce.toFixed(1)} N, N = ${v.normalForce.toFixed(1)} N`,
      simpleExplanation: `Sebagian gaya berat (${v.drivingForce.toFixed(1)} N) menarik ${objectNoun} turun sejajar lereng, sementara ${v.normalForce.toFixed(1)} N menekan permukaan dan ditahan oleh gaya normal N.`,
    },
    {
      step: 3,
      title: 'Cek Tahanan Gaya Gesek Permukaan (f)',
      latex: `f_{\\text{maks}} = \\mu \\cdot N = ${params.mu.toFixed(2)} \\times ${v.normalForce.toFixed(1)} = ${v.maxStaticFriction.toFixed(1)}\\,\\text{N}`,
      plainText: `f_maks = ${v.maxStaticFriction.toFixed(1)} N`,
      simpleExplanation: v.isMoving
        ? `Tarikan ke bawah (${v.drivingForce.toFixed(1)} N) lebih kuat daripada gesekan (${v.maxStaticFriction.toFixed(1)} N), jadi ${objectNoun} mulai meluncur.`
        : `Gesekan permukaan sanggup menahan tarikan ke bawah (${v.drivingForce.toFixed(1)} N ≤ ${v.maxStaticFriction.toFixed(1)} N), sehingga ${objectNoun} tetap diam setimbang.`,
    },
    {
      step: 4,
      title: 'Hitung Percepatan Gerak (Hukum II Newton)',
      latex: v.isMoving
        ? `a = \\frac{\\Sigma F}{m} = \\frac{${v.drivingForce.toFixed(1)} - ${v.frictionForce.toFixed(1)}}{${params.mass.toFixed(1)}} = ${v.acceleration.toFixed(2)}\\,\\text{m/s}^2`
        : `\\Sigma F = 0\\,\\text{N} \\Rightarrow a = 0.00\\,\\text{m/s}^2`,
      plainText: `a = ${v.acceleration.toFixed(2)} m/s²`,
      simpleExplanation: v.isMoving
        ? `Sisa gaya dorong sebesar ${v.netForce.toFixed(1)} N dibagi massa ${params.mass.toFixed(1)} kg menghasilkan percepatan ${v.acceleration.toFixed(2)} m/s² menuruni lereng.`
        : `Karena resultan gaya sejajar bidang bernilai nol, percepatannya nol dan ${objectNoun} tidak bergerak.`,
    },
  ];

  const formulaReference: InclinedFormulaItem[] = [
    {
      id: 'weight',
      title: 'Gaya Berat (Gravitasi)',
      latex: 'W = m \\cdot g',
      plainText: 'W = m · g',
      meaning: 'Tarikan gravitasi bumi ke arah pusat bumi (tegak lurus ke bawah).',
    },
    {
      id: 'wx',
      title: 'Gaya Penggerak Sejajar Bidang',
      latex: 'W_x = W \\sin\\theta = m g \\sin\\theta',
      plainText: 'W_x = W sin θ',
      meaning: 'Komponen gaya berat yang menarik benda menuruni bidang miring/bukit.',
    },
    {
      id: 'normal',
      title: 'Gaya Normal Permukaan',
      latex: 'N = W \\cos\\theta = m g \\cos\\theta',
      plainText: 'N = W cos θ',
      meaning: 'Gaya tekan balik permukaan yang selalu tegak lurus terhadap bidang miring.',
    },
    {
      id: 'friction',
      title: 'Gaya Gesek Maksimum / Kinetis',
      latex: 'f = \\mu \\cdot N = \\mu m g \\cos\\theta',
      plainText: 'f = μ · N',
      meaning: 'Gaya hambatan akibat kekasaran permukaan (μ) yang melawan arah kecenderungan gerak.',
    },
    {
      id: 'newton2',
      title: 'Hukum II Newton pada Bidang Miring',
      latex: 'a = \\frac{\\Sigma F}{m} = \\frac{W\\sin\\theta - f_k}{m} = g(\\sin\\theta - \\mu\\cos\\theta)',
      plainText: 'a = (W sin θ − f_k) / m',
      meaning: 'Percepatan sebanding dengan resultan gaya total dan berbanding terbalik dengan massa benda.',
    },
    {
      id: 'height',
      title: 'Relasi Geometri Ketinggian Bukit',
      latex: 'h = L \\sin\\theta \\iff \\theta = \\arcsin\\!\\left(\\frac{h}{L}\\right)',
      plainText: 'h = L sin θ',
      meaning: `Menghubungkan sudut kemiringan θ dengan tinggi vertikal bukit h untuk panjang lintasan L = ${L.toFixed(1)} m.`,
    },
  ];

  // Variasi Kurva 1: Percepatan a(θ)
  const aThetaPoints: Array<{ x: number; y: number }> = [];
  for (let deg = 0; deg <= 60; deg += 2) {
    const val = calculateInclinedPhysics({ ...params, theta: deg });
    aThetaPoints.push({ x: deg, y: Number(val.acceleration.toFixed(3)) });
  }

  // Variasi Kurva 2: Perbandingan Gaya W·sin(θ) vs f_maks(θ)
  const wxPoints: Array<{ x: number; y: number }> = [];
  const fmaxPoints: Array<{ x: number; y: number }> = [];
  for (let deg = 0; deg <= 60; deg += 2) {
    const val = calculateInclinedPhysics({ ...params, theta: deg });
    wxPoints.push({ x: deg, y: Number(val.drivingForce.toFixed(2)) });
    fmaxPoints.push({ x: deg, y: Number(val.maxStaticFriction.toFixed(2)) });
  }

  // Variasi Kurva 3: Percepatan a(μ)
  const aMuPoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 20; i += 1) {
    const mu = Number((i * 0.05).toFixed(2));
    const val = calculateInclinedPhysics({ ...params, mu });
    aMuPoints.push({ x: mu, y: Number(val.acceleration.toFixed(3)) });
  }
  const criticalMu = Math.min(1, Math.tan((params.theta * Math.PI) / 180));

  const chartVariants: InclinedChartSeries[] = [
    {
      id: 'a-theta',
      tabLabel: 'Percepatan vs Sudut',
      title: 'Kurva Percepatan (a) terhadap Sudut Kemiringan (θ)',
      subtitle: `μ = ${params.mu.toFixed(2)} · θ kritis = ${v.criticalAngleDeg.toFixed(1)}°`,
      xLabel: 'Sudut θ (°)',
      yLabel: 'Percepatan a (m/s²)',
      primaryLabel: 'a (m/s²)',
      primaryPoints: aThetaPoints,
      activeX: params.theta,
      activeY: Number(v.acceleration.toFixed(2)),
      criticalX: Number(v.criticalAngleDeg.toFixed(1)),
      criticalLabel: `Mulai gerak: θ > ${v.criticalAngleDeg.toFixed(1)}°`,
      simpleTakeaway:
        params.mu <= 0.01
          ? 'Karena bidang sangat licin (μ ≈ 0), begitu sudut θ > 0° benda langsung meluncur dan makin curam bukitnya, percepatan a makin besar.'
          : `Selama sudut θ masih di bawah ${v.criticalAngleDeg.toFixed(1)}°, garis datar di nol menandakan benda masih diam. Setelah melewati sudut kritis tersebut, percepatan naik tajam.`,
    },
    {
      id: 'forces-theta',
      tabLabel: 'Gaya Tarik vs Gesekan',
      title: 'Pertarungan Gaya Penggerak (W·sin θ) vs Gesek Maks (μN)',
      subtitle: `m = ${params.mass.toFixed(1)} kg (W = ${v.weight.toFixed(1)} N)`,
      xLabel: 'Sudut θ (°)',
      yLabel: 'Gaya (Newton)',
      primaryLabel: 'Gaya Tarik W·sin θ',
      primaryPoints: wxPoints,
      secondaryLabel: 'Gesekan Maks μN',
      secondaryPoints: fmaxPoints,
      activeX: params.theta,
      activeY: Number(v.drivingForce.toFixed(1)),
      criticalX: Number(v.criticalAngleDeg.toFixed(1)),
      criticalLabel: `Titik impas: ${v.criticalAngleDeg.toFixed(1)}°`,
      simpleTakeaway:
        'Garis teal (W·sin θ) terus naik saat bukit makin curam, sedangkan garis abu-abu putus-putus (μN) justru menurun. Saat garis teal berada di atas garis abu-abu, benda pasti meluncur!',
    },
    {
      id: 'a-mu',
      tabLabel: 'Percepatan vs Gesekan',
      title: 'Pengaruh Koefisien Gesek (μ) terhadap Percepatan (a)',
      subtitle: `θ = ${thetaRounded}° · Batas diam μ ≥ ${criticalMu.toFixed(2)}`,
      xLabel: 'Koefisien Gesek μ',
      yLabel: 'Percepatan a (m/s²)',
      primaryLabel: 'a (m/s²)',
      primaryPoints: aMuPoints,
      activeX: params.mu,
      activeY: Number(v.acceleration.toFixed(2)),
      criticalX: Number(criticalMu.toFixed(2)),
      criticalLabel: `Berhenti di μ = ${criticalMu.toFixed(2)}`,
      simpleTakeaway: `Pada kemiringan ${thetaRounded}°, memperbesar kekasaran permukaan (μ) menurunkan percepatan secara lurus hingga benda berhenti total pada μ ≥ ${criticalMu.toFixed(2)}.`,
    },
  ];

  return {
    values: v,
    breakdownSteps,
    formulaReference,
    chartVariants,
  };
}

export function computeInclinedResult(params: InclinedParams): ComputedModuleResult {
  const v = calculateInclinedPhysics(params);
  const thetaRounded = Math.round(params.theta);

  const points: Array<{ x: number; y: number }> = [];
  for (let deg = 0; deg <= 60; deg += 3) {
    const val = calculateInclinedPhysics({ ...params, theta: deg });
    points.push({ x: deg, y: Number(val.acceleration.toFixed(3)) });
  }

  const objLabel = params.objectType === 'mobil' ? 'Mobil di lereng bukit' : 'Peti barang';
  const insight =
    thetaRounded === 0
      ? `Lintasan datar (θ = 0°, h = 0.00 m). Gaya penggerak sejajar bidang nol sehingga ${objLabel.toLowerCase()} diam setimbang.`
      : v.isMoving
        ? `${objLabel} meluncur! Gaya penggerak (${v.drivingForce.toFixed(1)} N) melebihi gaya gesek (${v.frictionForce.toFixed(1)} N), menghasilkan F_net = ${v.netForce.toFixed(1)} N dan percepatan a = ${v.acceleration.toFixed(2)} m/s².`
        : `${objLabel} diam tertahan gesekan. Gaya penggerak (${v.drivingForce.toFixed(1)} N) belum melampaui gesek statis maksimum (${v.maxStaticFriction.toFixed(1)} N).`;

  return {
    equationTitle: 'Persamaan Percepatan Dinamis (Hukum II Newton)',
    equationBadge: params.objectType === 'mobil' ? 'Bukit & Mobil' : 'Peti & Bidang',
    primaryEquation: `a = 9.80 · (sin ${thetaRounded}° − ${params.mu.toFixed(2)} · cos ${thetaRounded}°) = ${v.acceleration.toFixed(2)} m/s²`,
    primaryLatex: `a = 9.80 \\cdot (\\sin ${thetaRounded}^{\\circ} - ${params.mu.toFixed(2)} \\cdot \\cos ${thetaRounded}^{\\circ}) = ${v.acceleration.toFixed(2)}\\,\\text{m/s}^2`,
    calloutPrimary: `F_net = ${v.netForce.toFixed(1)} N`,
    calloutSecondary: `a = ${v.acceleration.toFixed(2)} m/s² · h = ${v.rampHeightMeters.toFixed(2)} m`,
    metrics: [
      { label: 'Gaya Penggerak W·sin θ', value: `${v.drivingForce.toFixed(1)} N` },
      { label: 'Gaya Gesek f', value: `${v.frictionForce.toFixed(1)} N` },
      { label: 'Resultan F_net', value: `${v.netForce.toFixed(1)} N`, highlight: true },
    ],
    copilotInsight: insight,
    chart: {
      title: 'Kurva Respon: Percepatan (a) vs Sudut (θ)',
      subtitle: `μ = ${params.mu.toFixed(2)}`,
      xLabel: 'θ (°)',
      yLabel: 'a (m/s²)',
      points,
      activePoint: { x: params.theta, y: Number(v.acceleration.toFixed(3)) },
      activeTooltipText: `θ = ${thetaRounded}° | a = ${v.acceleration.toFixed(2)} m/s²`,
    },
    summaryInputText: `${params.objectType === 'mobil' ? 'Mobil' : 'Barang'}, θ = ${thetaRounded}°, h = ${v.rampHeightMeters.toFixed(2)} m, m = ${params.mass.toFixed(1)} kg (W = ${v.weight.toFixed(1)} N), μ = ${params.mu.toFixed(2)}`,
    summaryOutputText: `a = ${v.acceleration.toFixed(2)} m/s², F_net = ${v.netForce.toFixed(1)} N`,
    rawNumbers: {
      objectType: params.objectType,
      theta: thetaRounded,
      h: Number(v.rampHeightMeters.toFixed(2)),
      mass: Number(params.mass.toFixed(1)),
      mu: Number(params.mu.toFixed(2)),
      W: Number(v.weight.toFixed(2)),
      N: Number(v.normalForce.toFixed(2)),
      Fx: Number(v.drivingForce.toFixed(2)),
      fk: Number(v.frictionForce.toFixed(2)),
      Fnet: Number(v.netForce.toFixed(2)),
      a: Number(v.acceleration.toFixed(2)),
      primaryValue: Number(v.acceleration.toFixed(2)),
      primaryUnit: 'm/s²',
    },
  };
}
