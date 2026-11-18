import type {
  CircuitLampType,
  CircuitMode,
  CircuitParams,
  ComputedModuleResult,
} from '../types/lab';

export interface LampSpec {
  id: CircuitLampType;
  label: string;
  shortLabel: string;
  resistance: number;
  nominalPowerW: number;
}

export const LAMP_SPECS: Record<CircuitLampType, LampSpec> = {
  'led-5': {
    id: 'led-5',
    label: 'Lampu LED Hemat (5 Ω)',
    shortLabel: 'LED 5 Ω',
    resistance: 5,
    nominalPowerW: 4.0,
  },
  'pijar-10': {
    id: 'pijar-10',
    label: 'Lampu Pijar Standar (10 Ω)',
    shortLabel: 'Pijar 10 Ω',
    resistance: 10,
    nominalPowerW: 3.6,
  },
  'halogen-20': {
    id: 'halogen-20',
    label: 'Lampu Filamen Besar (20 Ω)',
    shortLabel: 'Filamen 20 Ω',
    resistance: 20,
    nominalPowerW: 2.8,
  },
};

export interface CircuitPhysicsValues {
  rTotal: number;
  rParallel: number;
  rLamp: number;
  iTotal: number;
  i1: number;
  i2: number;
  i3: number;
  iLamp: number;
  v1: number;
  v2: number;
  v3: number;
  vLamp: number;
  powerTotal: number;
  powerLamp: number;
  lampBrightness: number;
  isCircuitClosed: boolean;
}

export interface CircuitBreakdownStep {
  step: number;
  title: string;
  latex: string;
  plainText: string;
  simpleExplanation: string;
}

export interface CircuitLawItem {
  id: string;
  title: string;
  latex: string;
  plainText: string;
  description: string;
  currentCheck: string;
}

export interface CircuitTopologyGuide {
  mode: CircuitMode;
  title: string;
  subtitle: string;
  characteristic: string;
  formulas: Array<{
    label: string;
    latex: string;
    plainText: string;
    meaning: string;
  }>;
}

export interface CircuitChartSeries {
  id: 'i-v' | 'i-r' | 'branch-compare';
  tabLabel: string;
  title: string;
  subtitle: string;
  xLabel: string;
  yLabel: string;
  primaryLabel: string;
  primaryPoints: Array<{ x: number; y: number }>;
  secondaryLabel?: string;
  secondaryPoints?: Array<{ x: number; y: number }>;
  tertiaryLabel?: string;
  tertiaryPoints?: Array<{ x: number; y: number }>;
  activeX: number;
  activeY: number;
  readingGuide: string;
}

export function getModeLabel(mode: CircuitMode): string {
  switch (mode) {
    case 'seri':
      return 'Seri';
    case 'paralel':
      return 'Paralel';
    case 'campuran':
      return 'Campuran (Seri-Paralel)';
  }
}

function computeEquivalentResistances(params: CircuitParams): {
  rLamp: number;
  lampInBranch: boolean;
  rMainExtra: number;
  rBranch1: number;
  rBranch2: number;
  rParallel: number;
  rTotal: number;
} {
  const rLamp = params.hasLamp ? LAMP_SPECS[params.lampType].resistance : 0;
  const lampInBranch =
    params.hasLamp &&
    params.mode !== 'seri' &&
    params.lampPlacement === 'cabang';

  if (params.mode === 'seri') {
    return {
      rLamp,
      lampInBranch: false,
      rMainExtra: rLamp,
      rBranch1: params.r1,
      rBranch2: params.r2,
      rParallel: 0,
      rTotal: params.r1 + params.r2 + rLamp,
    };
  }

  if (params.mode === 'paralel') {
    const rMainExtra = params.hasLamp && !lampInBranch ? rLamp : 0;
    const rBranch1 = params.r1;
    const rBranch2 = params.r2 + (lampInBranch ? rLamp : 0);
    const rParallel = (rBranch1 * rBranch2) / (rBranch1 + rBranch2);
    return {
      rLamp,
      lampInBranch,
      rMainExtra,
      rBranch1,
      rBranch2,
      rParallel,
      rTotal: rMainExtra + rParallel,
    };
  }

  // Campuran: R1 (seri) + (R2 || R3)
  const rMainExtra = params.hasLamp && !lampInBranch ? rLamp : 0;
  const rBranch2 = params.r2 + (lampInBranch ? rLamp : 0);
  const rBranch3 = params.r3;
  const rParallel = (rBranch2 * rBranch3) / (rBranch2 + rBranch3);
  return {
    rLamp,
    lampInBranch,
    rMainExtra,
    rBranch1: params.r1,
    rBranch2,
    rParallel,
    rTotal: params.r1 + rMainExtra + rParallel,
  };
}

export function calculateCircuitPhysics(params: CircuitParams): CircuitPhysicsValues {
  const isCircuitClosed = !params.hasSwitch || params.switchClosed;
  const eq = computeEquivalentResistances(params);

  if (!isCircuitClosed) {
    return {
      rTotal: eq.rTotal,
      rParallel: eq.rParallel,
      rLamp: eq.rLamp,
      iTotal: 0,
      i1: 0,
      i2: 0,
      i3: 0,
      iLamp: 0,
      v1: 0,
      v2: 0,
      v3: 0,
      vLamp: 0,
      powerTotal: 0,
      powerLamp: 0,
      lampBrightness: 0,
      isCircuitClosed: false,
    };
  }

  const { voltage, r1, r2, r3, mode } = params;
  const iTotal = voltage / eq.rTotal;

  let i1 = iTotal;
  let i2 = iTotal;
  let i3 = 0;
  let v1 = 0;
  let v2 = 0;
  let v3 = 0;

  if (mode === 'seri') {
    i1 = iTotal;
    i2 = iTotal;
    v1 = iTotal * r1;
    v2 = iTotal * r2;
  } else if (mode === 'paralel') {
    const vPar = iTotal * eq.rParallel;
    i1 = vPar / eq.rBranch1;
    i2 = vPar / eq.rBranch2;
    v1 = i1 * r1;
    v2 = i2 * r2;
  } else {
    // Campuran: R1 seri dengan (R2 || R3)
    i1 = iTotal;
    v1 = i1 * r1;
    const vPar = iTotal * eq.rParallel;
    i2 = vPar / eq.rBranch2;
    i3 = vPar / r3;
    v2 = i2 * r2;
    v3 = i3 * r3;
  }

  const iLamp = params.hasLamp ? (eq.lampInBranch ? i2 : iTotal) : 0;
  const vLamp = iLamp * eq.rLamp;
  const powerLamp = iLamp * iLamp * eq.rLamp;
  const nominal = LAMP_SPECS[params.lampType].nominalPowerW;
  const lampBrightness = params.hasLamp
    ? Math.min(1.5, Number((powerLamp / nominal).toFixed(3)))
    : 0;

  return {
    rTotal: eq.rTotal,
    rParallel: eq.rParallel,
    rLamp: eq.rLamp,
    iTotal,
    i1,
    i2,
    i3,
    iLamp,
    v1,
    v2,
    v3,
    vLamp,
    powerTotal: voltage * iTotal,
    powerLamp,
    lampBrightness,
    isCircuitClosed: true,
  };
}

export function buildCircuitAnalysisDetails(params: CircuitParams): {
  values: CircuitPhysicsValues;
  breakdownSteps: CircuitBreakdownStep[];
  circuitLaws: CircuitLawItem[];
  topologyGuides: CircuitTopologyGuide[];
  chartVariants: CircuitChartSeries[];
} {
  const c = calculateCircuitPhysics(params);
  const modeLabel = getModeLabel(params.mode);
  const lampNote = params.hasLamp
    ? ` + R_L(${c.rLamp}\\,\\Omega)`
    : '';

  // Step 1: Hambatan Total
  let step1Latex = '';
  let step1Text = '';
  let step1Explain = '';
  if (params.mode === 'seri') {
    step1Latex = `R_{\\text{tot}} = R_1 + R_2${lampNote} = ${c.rTotal.toFixed(2)}\\,\\Omega`;
    step1Text = `R_tot = ${c.rTotal.toFixed(2)} Ω`;
    step1Explain =
      'Pada susunan seri, seluruh hambatan berada di satu lintasan sehingga hambatan total merupakan penjumlahan langsung.';
  } else if (params.mode === 'paralel') {
    step1Latex = params.hasLamp
      ? params.lampPlacement === 'cabang'
        ? `R_{\\text{par}} = \\frac{R_1(R_2 + R_L)}{R_1 + R_2 + R_L} = ${c.rTotal.toFixed(2)}\\,\\Omega`
        : `R_{\\text{tot}} = R_L + \\frac{R_1 R_2}{R_1 + R_2} = ${c.rLamp} + ${c.rParallel.toFixed(2)} = ${c.rTotal.toFixed(2)}\\,\\Omega`
      : `R_{\\text{tot}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} = ${c.rTotal.toFixed(2)}\\,\\Omega`;
    step1Text = `R_tot = ${c.rTotal.toFixed(2)} Ω`;
    step1Explain =
      'Pada susunan paralel, cabang paralel memperkecil hambatan pengganti. Jika lampu dipasang di jalur utama, hambatannya ditambahkan seri di luar cabang.';
  } else {
    const r2Eff =
      params.hasLamp && params.lampPlacement === 'cabang'
        ? params.r2 + c.rLamp
        : params.r2;
    step1Latex = `R_{\\text{par}} = \\frac{${r2Eff}\\cdot${params.r3}}{${r2Eff}+${params.r3}} = ${c.rParallel.toFixed(2)}\\,\\Omega,\\; R_{\\text{tot}} = R_1${params.hasLamp && params.lampPlacement === 'utama' ? '+R_L' : ''} + R_{\\text{par}} = ${c.rTotal.toFixed(2)}\\,\\Omega`;
    step1Text = `R_par = ${c.rParallel.toFixed(2)} Ω, R_tot = ${c.rTotal.toFixed(2)} Ω`;
    step1Explain =
      'Untuk rangkaian campuran, sederhanakan terlebih dahulu cabang paralel (R₂ ∥ R₃) menjadi R_par, lalu jumlahkan secara seri dengan R₁.';
  }

  // Step 2: Arus Total & Status Saklar
  const step2Latex = c.isCircuitClosed
    ? `I_{\\text{tot}} = \\frac{V}{R_{\\text{tot}}} = \\frac{${params.voltage.toFixed(1)}\\,\\text{V}}{${c.rTotal.toFixed(2)}\\,\\Omega} = ${c.iTotal.toFixed(2)}\\,\\text{A}`
    : `\\text{Saklar OFF (Terbuka)}\\;\\Rightarrow\\; I_{\\text{tot}} = 0.00\\,\\text{A}`;
  const step2Explain = c.isCircuitClosed
    ? `Menurut Hukum Ohm, tegangan ${params.voltage.toFixed(1)} V mendorong arus sebesar ${c.iTotal.toFixed(2)} A melewati hambatan total ${c.rTotal.toFixed(2)} Ω.`
    : 'Karena saklar dalam posisi terbuka (OFF), jalur konduktor terputus sehingga arus tidak dapat mengalir meskipun baterai tetap memiliki beda potensial.';

  // Step 3: Pembagian Arus & Tegangan (Kirchhoff)
  let step3Latex = '';
  let step3Explain = '';
  if (!c.isCircuitClosed) {
    step3Latex = `V_1 = 0\\,\\text{V},\\; V_2 = 0\\,\\text{V},\\; I_{\\text{cabang}} = 0\\,\\text{A}`;
    step3Explain =
      'Saat rangkaian terbuka tidak ada penurunan tegangan I·R pada resistor maupun nyala lampu.';
  } else if (params.mode === 'seri') {
    step3Latex = `V_1 = I R_1 = ${c.v1.toFixed(2)}\\,\\text{V},\\; V_2 = I R_2 = ${c.v2.toFixed(2)}\\,\\text{V}`;
    step3Explain =
      'Pada rangkaian seri arus di setiap komponen sama (I₁ = I₂ = I_tot), sedangkan tegangan sumber terbagi sebanding dengan besar masing-masing hambatan (Hukum II Kirchhoff).';
  } else if (params.mode === 'paralel') {
    step3Latex = `I_1 = ${c.i1.toFixed(2)}\\,\\text{A},\\; I_2 = ${c.i2.toFixed(2)}\\,\\text{A}\\; (I_1 + I_2 = ${c.iTotal.toFixed(2)}\\,\\text{A})`;
    step3Explain =
      'Sesuai Hukum I Kirchhoff, arus total terpecah di titik percabangan menjadi I₁ dan I₂ dengan cabang berhambatan lebih kecil menerima arus lebih besar.';
  } else {
    step3Latex = `V_1 = ${c.v1.toFixed(2)}\\,\\text{V},\\; I_2 = ${c.i2.toFixed(2)}\\,\\text{A},\\; I_3 = ${c.i3.toFixed(2)}\\,\\text{A}\\; (I_2 + I_3 = I_1)`;
    step3Explain =
      'Seluruh arus I_tot melewati R₁ sehingga terjadi penurunan tegangan V₁, lalu sisa tegangan masuk ke blok paralel dan arusnya terbagi ke R₂ dan R₃ sesuai Hukum I Kirchhoff.';
  }

  // Step 4: Daya Total & Kecerahan Lampu
  const step4Latex = params.hasLamp
    ? `P_{\\text{tot}} = V\\cdot I_{\\text{tot}} = ${c.powerTotal.toFixed(2)}\\,\\text{W},\\; P_{\\text{lampu}} = I_L^2 R_L = ${c.powerLamp.toFixed(2)}\\,\\text{W}`
    : `P_{\\text{tot}} = V\\cdot I_{\\text{tot}} = ${c.powerTotal.toFixed(2)}\\,\\text{W}`;
  const step4Explain = params.hasLamp
    ? c.isCircuitClosed
      ? `Lampu (${LAMP_SPECS[params.lampType].shortLabel} di ${params.lampPlacement === 'utama' ? 'Jalur Utama' : 'Cabang R₂'}) menyerap daya ${c.powerLamp.toFixed(2)} W — makin besar daya yang diterima, makin terang pijar lampu di simulasi 3D.`
      : 'Lampu terpasang di papan rangkaian, tetapi padam total karena saklar terbuka.'
    : 'Lampu sedang dilepas dari rangkaian sehingga seluruh energi listrik disalurkan sebagai disipasi daya pada resistor.';

  const breakdownSteps: CircuitBreakdownStep[] = [
    {
      step: 1,
      title: `Hitung Hambatan Ekivalen (${modeLabel})`,
      latex: step1Latex,
      plainText: step1Text,
      simpleExplanation: step1Explain,
    },
    {
      step: 2,
      title: 'Tentukan Arus Total (Hukum Ohm)',
      latex: step2Latex,
      plainText: `I_tot = ${c.iTotal.toFixed(2)} A`,
      simpleExplanation: step2Explain,
    },
    {
      step: 3,
      title: 'Distribusi Tegangan & Arus (Kirchhoff)',
      latex: step3Latex,
      plainText: step3Explain,
      simpleExplanation: step3Explain,
    },
    {
      step: 4,
      title: 'Daya Listrik & Performa Lampu',
      latex: step4Latex,
      plainText: `P_tot = ${c.powerTotal.toFixed(2)} W`,
      simpleExplanation: step4Explain,
    },
  ];

  // Hukum Dasar yang berlaku
  const kirchhoff1Check =
    !c.isCircuitClosed
      ? 'Saklar terbuka → ΣI_masuk = ΣI_keluar = 0 A.'
      : params.mode === 'seri'
        ? `Tidak ada titik percabangan: I_tot = I₁ = I₂ = ${c.iTotal.toFixed(2)} A.`
        : params.mode === 'paralel'
          ? `Titik cabang membagi arus: I_tot (${c.iTotal.toFixed(2)} A) = I₁ (${c.i1.toFixed(2)} A) + I₂ (${c.i2.toFixed(2)} A).`
          : `Cabang paralel membagi I₁ (${c.i1.toFixed(2)} A) = I₂ (${c.i2.toFixed(2)} A) + I₃ (${c.i3.toFixed(2)} A).`;

  const kirchhoff2Check = !c.isCircuitClosed
    ? 'Lup terputus oleh saklar terbuka sehingga tidak ada penurunan tegangan pada beban.'
    : params.mode === 'campuran'
      ? `Lup melalui R₂: ${params.voltage.toFixed(1)} V − V₁ (${c.v1.toFixed(2)} V) − V_par (${(c.i3 * params.r3).toFixed(2)} V)${params.hasLamp && params.lampPlacement === 'utama' ? ` − V_L (${c.vLamp.toFixed(2)} V)` : ''} ≈ 0 V.`
      : `Penurunan total beban (${(c.v1 + c.v2 + (params.mode === 'seri' ? c.vLamp : 0)).toFixed(2)} V) mengimbangi tegangan sumber ${params.voltage.toFixed(1)} V.`;

  const circuitLaws: CircuitLawItem[] = [
    {
      id: 'ohm',
      title: 'Hukum Ohm',
      latex: 'V = I \\cdot R_{\\text{tot}} \\;\\Longleftrightarrow\\; I = \\frac{V}{R_{\\text{tot}}}',
      plainText: 'V = I * R_tot',
      description:
        'Pada hambatan tetap dan rangkaian tertutup, kuat arus listrik (I) berbanding lurus dengan tegangan sumber (V) dan berbanding terbalik dengan hambatan total (R_tot).',
      currentCheck: c.isCircuitClosed
        ? `Dengan V = ${params.voltage.toFixed(1)} V dan R_tot = ${c.rTotal.toFixed(2)} Ω → I_tot = ${c.iTotal.toFixed(2)} A.`
        : 'Saklar OFF: jalur terbuka menyebabkan R_rangkaian → ∞ sehingga I_tot = 0 A.',
    },
    {
      id: 'kirchhoff-1',
      title: 'Hukum I Kirchhoff (Titik Percabangan)',
      latex: '\\sum I_{\\text{masuk}} = \\sum I_{\\text{keluar}}',
      plainText: 'Sigma I_masuk = Sigma I_keluar',
      description:
        'Kekekalan muatan listrik: jumlah total arus yang memasuki simpul percabangan selalu sama dengan jumlah arus yang keluar dari simpul tersebut.',
      currentCheck: kirchhoff1Check,
    },
    {
      id: 'kirchhoff-2',
      title: 'Hukum II Kirchhoff (Lup Tertutup)',
      latex: '\\sum \\varepsilon - \\sum (I \\cdot R) = 0',
      plainText: 'Sigma eps - Sigma I*R = 0',
      description:
        'Kekekalan energi di dalam satu lintasan tertutup: jumlah GGL sumber tegangan (ε) sama dengan jumlah total penurunan potensial (I·R) di sepanjang lup.',
      currentCheck: kirchhoff2Check,
    },
  ];

  // Keterangan rumus lengkap per topologi
  const topologyGuides: CircuitTopologyGuide[] = [
    {
      mode: 'seri',
      title: 'Rangkaian Seri',
      subtitle: 'Satu lintasan berurutan tanpa cabang',
      characteristic:
        'Kuat arus sama di semua komponen, tegangan terbagi sesuai nilai resistor. Jika satu titik atau saklar putus, seluruh komponen padam.',
      formulas: [
        {
          label: 'Hambatan Total',
          latex: 'R_{\\text{tot}} = R_1 + R_2 + \\dots + R_n',
          plainText: 'R_tot = R1 + R2 + ...',
          meaning: 'Hambatan pengganti selalu lebih besar daripada resistor terbesar.',
        },
        {
          label: 'Kuat Arus',
          latex: 'I_{\\text{tot}} = I_1 = I_2 = \\frac{V}{R_{\\text{tot}}}',
          plainText: 'I_tot = I1 = I2',
          meaning: 'Arus konstan sepanjang lintasan tunggal.',
        },
        {
          label: 'Pembagian Tegangan',
          latex: 'V_{\\text{tot}} = V_1 + V_2,\\; V_k = I \\cdot R_k',
          plainText: 'V_tot = V1 + V2',
          meaning: 'Resistor lebih besar mendapat porsi tegangan lebih besar.',
        },
      ],
    },
    {
      mode: 'paralel',
      title: 'Rangkaian Paralel',
      subtitle: 'Komponen tersusun dalam beberapa cabang sejajar',
      characteristic:
        'Tegangan di tiap cabang sama besar dengan sumber, sedangkan arus terpecah. Lampu di cabang lain tetap menyala bila satu cabang putus.',
      formulas: [
        {
          label: 'Hambatan Pengganti',
          latex: '\\frac{1}{R_{\\text{tot}}} = \\frac{1}{R_1} + \\frac{1}{R_2}',
          plainText: '1/R_tot = 1/R1 + 1/R2',
          meaning: 'Nilai R_tot selalu lebih kecil dari hambatan cabang terkecil.',
        },
        {
          label: 'Tegangan Cabang',
          latex: 'V_{\\text{tot}} = V_1 = V_2',
          plainText: 'V_tot = V1 = V2',
          meaning: 'Setiap cabang menerima beda potensial penuh yang sama.',
        },
        {
          label: 'Pembagian Arus',
          latex: 'I_{\\text{tot}} = I_1 + I_2,\\; I_k = \\frac{V_{\\text{cabang}}}{R_k}',
          plainText: 'I_tot = I1 + I2',
          meaning: 'Cabang berhambatan lebih kecil dilalui arus lebih besar.',
        },
      ],
    },
    {
      mode: 'campuran',
      title: 'Rangkaian Campuran (Seri–Paralel)',
      subtitle: 'R₁ seri terhadap blok cabang paralel (R₂ ∥ R₃)',
      characteristic:
        'Menggabungkan pembagi tegangan seri dan pembagi arus paralel. Diselesaikan bertahap dari blok paralel terdalam dahulu.',
      formulas: [
        {
          label: 'Blok Paralel & Total',
          latex: 'R_{\\text{par}} = \\frac{R_2 R_3}{R_2 + R_3},\\; R_{\\text{tot}} = R_1 + R_{\\text{par}}',
          plainText: 'R_tot = R1 + (R2*R3)/(R2+R3)',
          meaning: 'Sederhanakan R₂ ∥ R₃ menjadi satu resistor R_par, lalu jumlahkan dengan R₁.',
        },
        {
          label: 'Tegangan Blok Paralel',
          latex: 'V_1 = I_1 R_1,\\; V_{\\text{par}} = V - V_1 = I_1 R_{\\text{par}}',
          plainText: 'V_par = V - V1',
          meaning: 'Sebagian tegangan habis di R₁, sisanya memberi tegangan ke blok R₂ ∥ R₃.',
        },
        {
          label: 'Arus Cabang Campuran',
          latex: 'I_1 = I_{\\text{tot}} = I_2 + I_3,\\; I_2 = \\frac{V_{\\text{par}}}{R_2},\\; I_3 = \\frac{V_{\\text{par}}}{R_3}',
          plainText: 'I1 = I2 + I3',
          meaning: 'Memenuhi Hukum I Kirchhoff pada simpul antara R₁ dan percabangan R₂, R₃.',
        },
      ],
    },
  ];

  // 3 Variasi Grafik Beranimasi
  const ivPrimary: Array<{ x: number; y: number }> = [];
  for (let v = 0; v <= 24; v += 2) {
    ivPrimary.push({
      x: v,
      y: c.isCircuitClosed ? Number((v / c.rTotal).toFixed(3)) : 0,
    });
  }

  const irPrimary: Array<{ x: number; y: number }> = [];
  for (let r = 4; r <= 80; r += 4) {
    irPrimary.push({
      x: r,
      y: c.isCircuitClosed ? Number((params.voltage / r).toFixed(3)) : 0,
    });
  }

  const compPrimary: Array<{ x: number; y: number }> = [];
  const compSecondary: Array<{ x: number; y: number }> = [];
  const compTertiary: Array<{ x: number; y: number }> = [];
  for (let v = 0; v <= 24; v += 2) {
    const stepSample = calculateCircuitPhysics({ ...params, voltage: v });
    if (params.mode === 'seri') {
      compPrimary.push({ x: v, y: Number(stepSample.v1.toFixed(2)) });
      compSecondary.push({ x: v, y: Number(stepSample.v2.toFixed(2)) });
      if (params.hasLamp) {
        compTertiary.push({ x: v, y: Number(stepSample.vLamp.toFixed(2)) });
      }
    } else {
      compPrimary.push({ x: v, y: Number(stepSample.i1.toFixed(3)) });
      compSecondary.push({ x: v, y: Number(stepSample.i2.toFixed(3)) });
      if (params.mode === 'campuran') {
        compTertiary.push({ x: v, y: Number(stepSample.i3.toFixed(3)) });
      }
    }
  }

  const chartVariants: CircuitChartSeries[] = [
    {
      id: 'i-v',
      tabLabel: 'Arus (I) vs Tegangan (V)',
      title: `Kurva Hukum Ohm: Arus (I) vs Tegangan (V) [${modeLabel}]`,
      subtitle: c.isCircuitClosed
        ? `Gradien garis lurus = 1 / R_tot = ${(1 / c.rTotal).toFixed(3)} S`
        : 'Saklar dalam keadaan terbuka (OFF) — arus tetap 0 A',
      xLabel: 'Tegangan V (Volt)',
      yLabel: 'Arus I (Ampere)',
      primaryLabel: 'I_tot (A)',
      primaryPoints: ivPrimary,
      activeX: params.voltage,
      activeY: Number(c.iTotal.toFixed(3)),
      readingGuide: c.isCircuitClosed
        ? `Grafik berbentuk garis lurus miring yang menunjukkan Hukum Ohm: tiap kenaikan tegangan V selalu menaikkan arus I secara proporsional. Makin curam kemiringan garis, makin kecil hambatan totalnya (R_tot = ${c.rTotal.toFixed(2)} Ω).`
        : 'Karena saklar terbuka (OFF), kurva mendatar di 0 A. Tutup saklar (ON) untuk melihat garis linear Hukum Ohm.',
    },
    {
      id: 'i-r',
      tabLabel: 'Arus (I) vs Hambatan (R)',
      title: `Kurva Hiperbolik: Arus (I) vs Hambatan Total (R)`,
      subtitle: `Pada tegangan tetap V = ${params.voltage.toFixed(1)} V`,
      xLabel: 'Hambatan Total R (Ω)',
      yLabel: 'Arus I (Ampere)',
      primaryLabel: 'I = V/R (A)',
      primaryPoints: irPrimary,
      activeX: Math.min(80, Number(c.rTotal.toFixed(2))),
      activeY: Number(c.iTotal.toFixed(3)),
      readingGuide:
        'Grafik berbentuk kurva melengkung turun (hiperbolik) karena I = V / R berbanding terbalik terhadap hambatan. Pada tegangan konstan, menggandakan hambatan total akan memotong arus menjadi setengahnya.',
    },
    {
      id: 'branch-compare',
      tabLabel:
        params.mode === 'seri' ? 'Pembagian Tegangan' : 'Perbandingan Arus Cabang',
      title:
        params.mode === 'seri'
          ? 'Pembagian Tegangan Komponen (V₁, V₂) vs Tegangan Sumber'
          : `Perbandingan Arus Cabang (${params.mode === 'campuran' ? 'I₁, I₂, I₃' : 'I₁, I₂'}) vs Tegangan`,
      subtitle: `Menunjukkan perbandingan distribusi listrik antar resistor pada ${modeLabel}`,
      xLabel: 'Tegangan Sumber V (Volt)',
      yLabel: params.mode === 'seri' ? 'Tegangan (V)' : 'Arus (A)',
      primaryLabel: params.mode === 'seri' ? 'V₁ (V)' : 'I₁ (A)',
      primaryPoints: compPrimary,
      secondaryLabel: params.mode === 'seri' ? 'V₂ (V)' : 'I₂ (A)',
      secondaryPoints: compSecondary,
      tertiaryLabel:
        params.mode === 'campuran'
          ? 'I₃ (A)'
          : params.mode === 'seri' && params.hasLamp
            ? 'V_lampu (V)'
            : undefined,
      tertiaryPoints:
        compTertiary.length > 0 ? compTertiary : undefined,
      activeX: params.voltage,
      activeY: Number((params.mode === 'seri' ? c.v1 : c.i1).toFixed(3)),
      readingGuide:
        params.mode === 'seri'
          ? 'Pada rangkaian seri, garis yang berada lebih atas menunjukkan resistor yang lebih besar mendapat porsi penurunan tegangan lebih besar (Hukum II Kirchhoff: V₁ + V₂ + V_L = V).'
          : 'Pada cabang paralel/campuran, garis dengan kemiringan paling tinggi merupakan cabang berhambatan paling kecil sehingga menyerap arus paling besar (Hukum I Kirchhoff).',
    },
  ];

  return {
    values: c,
    breakdownSteps,
    circuitLaws,
    topologyGuides,
    chartVariants,
  };
}

export function computeCircuitResult(params: CircuitParams): ComputedModuleResult {
  const c = calculateCircuitPhysics(params);
  const modeLabel = getModeLabel(params.mode);

  const points: Array<{ x: number; y: number }> = [];
  for (let v = 0; v <= 24; v += 2) {
    points.push({
      x: v,
      y: c.isCircuitClosed ? Number((v / c.rTotal).toFixed(3)) : 0,
    });
  }

  const equationStr = c.isCircuitClosed
    ? `I = ${params.voltage.toFixed(1)} V / ${c.rTotal.toFixed(2)} Ω = ${c.iTotal.toFixed(2)} A`
    : `Saklar Terbuka (OFF) → I_tot = 0.00 A`;

  const equationLatex = c.isCircuitClosed
    ? `I_{\\text{tot}} = \\frac{${params.voltage.toFixed(1)}\\,\\text{V}}{${c.rTotal.toFixed(2)}\\,\\Omega} = ${c.iTotal.toFixed(2)}\\,\\text{A}`
    : `\\text{Saklar Terbuka (OFF)}\\;\\Rightarrow\\; I_{\\text{tot}} = 0.00\\,\\text{A}`;

  let insight = '';
  if (!c.isCircuitClosed) {
    insight = `Saklar dalam posisi terbuka (OFF), sehingga rangkaian ${modeLabel} terputus. Arus I_tot = 0.00 A dan lampu tidak menyala meski hambatan ekivalen rangkaian terhitung ${c.rTotal.toFixed(2)} Ω.`;
  } else if (params.mode === 'seri') {
    insight = `Pada rangkaian seri, hambatan total dijumlahkan (R_tot = ${c.rTotal.toFixed(1)} Ω). Arus sama di setiap komponen (${c.iTotal.toFixed(2)} A), sedangkan tegangan terbagi: V₁ = ${c.v1.toFixed(1)} V, V₂ = ${c.v2.toFixed(1)} V${params.hasLamp ? `, V_lampu = ${c.vLamp.toFixed(1)} V (P_L = ${c.powerLamp.toFixed(2)} W)` : ''}.`;
  } else if (params.mode === 'paralel') {
    insight = `Pada rangkaian paralel, hambatan pengganti mengecil menjadi R_tot = ${c.rTotal.toFixed(2)} Ω. Arus terpecah memenuhi Hukum I Kirchhoff: I₁ = ${c.i1.toFixed(2)} A dan I₂ = ${c.i2.toFixed(2)} A (total ${c.iTotal.toFixed(2)} A)${params.hasLamp ? `, lampu menyala dengan daya ${c.powerLamp.toFixed(2)} W` : ''}.`;
  } else {
    insight = `Pada rangkaian campuran, R₂ (${params.r2} Ω) ∥ R₃ (${params.r3} Ω) menghasilkan R_par = ${c.rParallel.toFixed(2)} Ω dan R_tot = ${c.rTotal.toFixed(2)} Ω. Arus total I₁ = ${c.iTotal.toFixed(2)} A terbagi di percabangan menjadi I₂ = ${c.i2.toFixed(2)} A dan I₃ = ${c.i3.toFixed(2)} A${params.hasLamp ? `, daya lampu = ${c.powerLamp.toFixed(2)} W` : ''}.`;
  }

  const switchText = params.hasSwitch
    ? params.switchClosed
      ? 'Saklar ON'
      : 'Saklar OFF'
    : 'Tanpa Saklar';
  const lampText = params.hasLamp
    ? `${LAMP_SPECS[params.lampType].shortLabel} (${params.lampPlacement === 'utama' ? 'Utama' : 'Cabang'})`
    : 'Tanpa Lampu';
  const rText =
    params.mode === 'campuran'
      ? `R₁ = ${params.r1} Ω, R₂ = ${params.r2} Ω, R₃ = ${params.r3} Ω`
      : `R₁ = ${params.r1} Ω, R₂ = ${params.r2} Ω`;

  return {
    equationTitle: `Hukum Ohm & Kirchhoff · ${modeLabel}`,
    equationBadge: c.isCircuitClosed ? 'Tertutup (ON)' : 'Terputus (OFF)',
    primaryEquation: equationStr,
    primaryLatex: equationLatex,
    calloutPrimary: `I_tot = ${c.iTotal.toFixed(2)} A`,
    calloutSecondary: `R_tot = ${c.rTotal.toFixed(2)} Ω`,
    metrics: [
      { label: 'Hambatan Total R_tot', value: `${c.rTotal.toFixed(2)} Ω` },
      {
        label:
          params.mode === 'seri'
            ? 'Tegangan V₁ / V₂'
            : params.mode === 'campuran'
              ? 'Arus I₁ / I₂ / I₃'
              : 'Arus Cabang I₁ / I₂',
        value:
          params.mode === 'seri'
            ? `${c.v1.toFixed(1)}V / ${c.v2.toFixed(1)}V`
            : params.mode === 'campuran'
              ? `${c.i1.toFixed(2)} / ${c.i2.toFixed(2)} / ${c.i3.toFixed(2)} A`
              : `${c.i1.toFixed(2)}A / ${c.i2.toFixed(2)}A`,
      },
      {
        label: params.hasLamp ? 'Daya Lampu P_L' : 'Daya Total P',
        value: params.hasLamp
          ? `${c.powerLamp.toFixed(2)} W`
          : `${c.powerTotal.toFixed(2)} W`,
        highlight: true,
      },
    ],
    copilotInsight: insight,
    chart: {
      title: `Kurva Hukum Ohm: Arus (I) vs Tegangan (V) [${modeLabel}]`,
      subtitle: `R_tot = ${c.rTotal.toFixed(2)} Ω`,
      xLabel: 'V (Volt)',
      yLabel: 'I (Ampere)',
      points,
      activePoint: { x: params.voltage, y: Number(c.iTotal.toFixed(3)) },
      activeTooltipText: `V = ${params.voltage.toFixed(1)} V | I = ${c.iTotal.toFixed(2)} A`,
    },
    summaryInputText: `${modeLabel}, V = ${params.voltage.toFixed(1)} V, ${rText}, ${switchText}, ${lampText}`,
    summaryOutputText: `I_tot = ${c.iTotal.toFixed(2)} A, R_tot = ${c.rTotal.toFixed(2)} Ω, P_tot = ${c.powerTotal.toFixed(1)} W${params.hasLamp ? `, P_lampu = ${c.powerLamp.toFixed(2)} W` : ''}`,
    rawNumbers: {
      mode: modeLabel,
      V: Number(params.voltage.toFixed(1)),
      R1: params.r1,
      R2: params.r2,
      R3: params.r3,
      Rtot: Number(c.rTotal.toFixed(2)),
      Itot: Number(c.iTotal.toFixed(2)),
      I1: Number(c.i1.toFixed(2)),
      I2: Number(c.i2.toFixed(2)),
      I3: Number(c.i3.toFixed(2)),
      V1: Number(c.v1.toFixed(2)),
      V2: Number(c.v2.toFixed(2)),
      V3: Number(c.v3.toFixed(2)),
      P: Number(c.powerTotal.toFixed(2)),
      PLamp: Number(c.powerLamp.toFixed(2)),
      switchState: switchText,
      lampState: lampText,
      primaryValue: Number(c.iTotal.toFixed(2)),
      primaryUnit: 'A',
    },
  };
}
