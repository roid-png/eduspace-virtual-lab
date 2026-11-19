import type {
  ComputedModuleResult,
  Geometry3DParams,
  ReflectionAxis,
  TransformType,
} from '../types/lab';

export interface Point2D {
  label: string;
  x: number;
  y: number;
}

export interface TransformPointPair {
  label: string;
  origin: Point2D;
  image: Point2D;
  stepLatex: string;
  stepPlain: string;
}

export interface TransformationGeometryValues {
  transformType: TransformType;
  transformTitle: string;
  matrix: [[number, number], [number, number]];
  translationVec: [number, number];
  determinant: number;
  absDeterminant: number;
  initialArea: number;
  imageArea: number;
  isCongruent: boolean;
  natureLabel: string;
  points: [Point2D, Point2D, Point2D];
  transformedPoints: [Point2D, Point2D, Point2D];
  pointPairs: [TransformPointPair, TransformPointPair, TransformPointPair];
  primaryEquation: string;
  primaryLatex: string;
  propertySummary: string;
}

export interface CircleGeometryValues {
  radius: number;
  centralAngleDeg: number;
  inscribedAngleDeg: number;
  arcLength: number;
  sectorArea: number;
  circumference: number;
  circleArea: number;
  chordLength: number;
  externalDistance: number;
  tangentLength: number;
  primaryEquation: string;
  primaryLatex: string;
  propertySummary: string;
}

export interface GeometryBreakdownStep {
  step: number;
  title: string;
  latex: string;
  plainText: string;
  simpleExplanation: string;
}

export interface GeometryConceptItem {
  id: string;
  title: string;
  latex: string;
  plainText: string;
  explanation: string;
}

function fmtNum(n: number): string {
  const rounded = Math.abs(n) < 0.0005 ? 0 : n;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2);
}

function getReflectionMatrix(axis: ReflectionAxis): {
  label: string;
  matrix: [[number, number], [number, number]];
} {
  switch (axis) {
    case 'sumbu-x':
      return { label: 'Sumbu X (y = 0)', matrix: [[1, 0], [0, -1]] };
    case 'sumbu-y':
      return { label: 'Sumbu Y (x = 0)', matrix: [[-1, 0], [0, 1]] };
    case 'y=x':
      return { label: 'Garis y = x', matrix: [[0, 1], [1, 0]] };
    case 'y=-x':
      return { label: 'Garis y = -x', matrix: [[0, -1], [-1, 0]] };
  }
}

export function calculateTransformationGeometry(
  params: Geometry3DParams,
): TransformationGeometryValues {
  const ax = params.pointAx;
  const ay = params.pointAy;

  // Segitiga non-simetris berluas tetap 3 satuan^2: alas 3 (A->B), tinggi 2 (C di y+2)
  const points: [Point2D, Point2D, Point2D] = [
    { label: 'A', x: ax, y: ay },
    { label: 'B', x: ax + 3, y: ay },
    { label: 'C', x: ax + 1, y: ay + 2 },
  ];
  const initialArea = 3;

  let matrix: [[number, number], [number, number]] = [[1, 0], [0, 1]];
  let translationVec: [number, number] = [0, 0];
  let transformTitle = '';
  let propertySummary = '';

  if (params.transformType === 'translasi') {
    translationVec = [params.tx, params.ty];
    transformTitle = `Translasi T(${fmtNum(params.tx)}, ${fmtNum(params.ty)})`;
    propertySummary = `Setiap titik segitiga digeser sejajar sejauh (${fmtNum(params.tx)}, ${fmtNum(params.ty)}). Ukuran dan orientasi bangun tetap sama persis (kongruen, |det(I)| = 1) sehingga luas bayangan tetap ${initialArea.toFixed(2)} satuan².`;
  } else if (params.transformType === 'refleksi') {
    const ref = getReflectionMatrix(params.reflectionAxis);
    matrix = ref.matrix;
    transformTitle = `Refleksi terhadap ${ref.label}`;
    propertySummary = `Pencerminan terhadap ${ref.label} membalik orientasi bangun namun mempertahankan panjang sisi serta luas (det = -1, |det| = 1 → kongruen). Jarak setiap titik ke garis cermin selalu tegak lurus dan sama jauh.`;
  } else if (params.transformType === 'rotasi') {
    const rad = (params.rotationDeg * Math.PI) / 180;
    const cosA = Number(Math.cos(rad).toFixed(4));
    const sinA = Number(Math.sin(rad).toFixed(4));
    matrix = [[cosA, -sinA], [sinA, cosA]];
    transformTitle = `Rotasi Pusat O(0,0) Sudut ${params.rotationDeg}°`;
    propertySummary = `Setiap titik diputar sejauh ${params.rotationDeg}° berlawanan/searah jarum jam terhadap O(0,0) dengan jari-jari putar tetap. Bangun bayangan tetap kongruen dengan bangun awal (det = cos²α + sin²α = 1).`;
  } else {
    const k = params.dilationScale;
    matrix = [[k, 0], [0, k]];
    transformTitle = `Dilatasi Pusat O(0,0) Skala k = ${k.toFixed(2)}`;
    propertySummary = `Dilatasi mengalikan koordinat dari pusat O(0,0) dengan faktor k = ${k.toFixed(2)}. Bentuk bangun sebangun, sedangkan luas bayangan berubah menjadi k² = ${(k * k).toFixed(2)} kali luas awal (${(k * k * initialArea).toFixed(2)} satuan²).`;
  }

  const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  const absDeterminant = Math.abs(determinant);
  const imageArea = initialArea * absDeterminant;
  const isCongruent = Math.abs(absDeterminant - 1) < 0.001;
  const natureLabel = isCongruent
    ? 'Kongruen (Ukuran Tetap)'
    : `Sebangun (Skala Luas ×${absDeterminant.toFixed(2)})`;

  const applyTransform = (pt: Point2D): TransformPointPair => {
    const nx =
      params.transformType === 'translasi'
        ? pt.x + translationVec[0]
        : matrix[0][0] * pt.x + matrix[0][1] * pt.y;
    const ny =
      params.transformType === 'translasi'
        ? pt.y + translationVec[1]
        : matrix[1][0] * pt.x + matrix[1][1] * pt.y;

    const roundedX = Number(nx.toFixed(2));
    const roundedY = Number(ny.toFixed(2));
    const image: Point2D = {
      label: `${pt.label}'`,
      x: roundedX,
      y: roundedY,
    };

    const stepLatex =
      params.transformType === 'translasi'
        ? `${pt.label}' = \\begin{pmatrix} ${fmtNum(pt.x)} \\\\ ${fmtNum(pt.y)} \\end{pmatrix} + \\begin{pmatrix} ${fmtNum(translationVec[0])} \\\\ ${fmtNum(translationVec[1])} \\end{pmatrix} = \\begin{pmatrix} ${fmtNum(roundedX)} \\\\ ${fmtNum(roundedY)} \\end{pmatrix}`
        : `${pt.label}' = \\begin{pmatrix} ${fmtNum(matrix[0][0])} & ${fmtNum(matrix[0][1])} \\\\ ${fmtNum(matrix[1][0])} & ${fmtNum(matrix[1][1])} \\end{pmatrix} \\begin{pmatrix} ${fmtNum(pt.x)} \\\\ ${fmtNum(pt.y)} \\end{pmatrix} = \\begin{pmatrix} ${fmtNum(roundedX)} \\\\ ${fmtNum(roundedY)} \\end{pmatrix}`;

    const stepPlain = `${pt.label}(${fmtNum(pt.x)}, ${fmtNum(pt.y)}) -> ${pt.label}'(${fmtNum(roundedX)}, ${fmtNum(roundedY)})`;
    return { label: pt.label, origin: pt, image, stepLatex, stepPlain };
  };

  const pairA = applyTransform(points[0]);
  const pairB = applyTransform(points[1]);
  const pairC = applyTransform(points[2]);

  const primaryEquation = `A(${fmtNum(pairA.origin.x)}, ${fmtNum(pairA.origin.y)}) → A'(${fmtNum(pairA.image.x)}, ${fmtNum(pairA.image.y)})`;
  const primaryLatex = pairA.stepLatex;

  return {
    transformType: params.transformType,
    transformTitle,
    matrix,
    translationVec,
    determinant,
    absDeterminant,
    initialArea,
    imageArea,
    isCongruent,
    natureLabel,
    points,
    transformedPoints: [pairA.image, pairB.image, pairC.image],
    pointPairs: [pairA, pairB, pairC],
    primaryEquation,
    primaryLatex,
    propertySummary,
  };
}

export function calculateCircleGeometry(
  params: Geometry3DParams,
): CircleGeometryValues {
  const r = params.radius;
  const theta = params.centralAngleDeg;
  const rad = (theta * Math.PI) / 180;
  const inscribedAngleDeg = theta / 2;
  const circumference = 2 * Math.PI * r;
  const circleArea = Math.PI * r * r;
  const arcLength = (theta / 360) * circumference;
  const sectorArea = (theta / 360) * circleArea;
  const chordLength = 2 * r * Math.sin(rad / 2);

  const externalDistance = r + params.externalDistanceOffset;
  const tangentLength = Math.sqrt(
    Math.max(0, externalDistance * externalDistance - r * r),
  );

  const primaryEquation = `Busur s = (${theta}°/360°)·2π(${r.toFixed(1)}) = ${arcLength.toFixed(2)} cm`;
  const primaryLatex = `s = \\frac{${theta}^{\\circ}}{360^{\\circ}} \\cdot 2\\pi(${r.toFixed(1)}) = ${arcLength.toFixed(2)}\\,\\text{cm},\\; L_{\\text{juring}} = ${sectorArea.toFixed(2)}\\,\\text{cm}^2`;

  const propertySummary =
    `Pada lingkaran berjari-jari r = ${r.toFixed(1)} cm dan sudut pusat θ = ${theta}°, sudut keliling yang menghadap busur AB sama dengan θ/2 = ${inscribedAngleDeg.toFixed(1)}°. ` +
    (params.showTangent
      ? `Garis singgung PT (panjang ${tangentLength.toFixed(2)} cm) selalu membentuk sudut siku-siku 90° terhadap jari-jari OT di titik singgung.`
      : `Aktifkan Garis Singgung untuk mengamati sifat siku-siku 90° antara jari-jari dan garis singgung.`);

  return {
    radius: r,
    centralAngleDeg: theta,
    inscribedAngleDeg,
    arcLength,
    sectorArea,
    circumference,
    circleArea,
    chordLength,
    externalDistance,
    tangentLength,
    primaryEquation,
    primaryLatex,
    propertySummary,
  };
}

export function buildGeometryAnalysisDetails(params: Geometry3DParams): {
  subMode: Geometry3DParams['subMode'];
  primaryExplanation: string;
  transformValues: TransformationGeometryValues;
  circleValues: CircleGeometryValues;
  breakdownSteps: GeometryBreakdownStep[];
  concepts: GeometryConceptItem[];
} {
  const tVal = calculateTransformationGeometry(params);
  const cVal = calculateCircleGeometry(params);

  if (params.subMode === 'transformasi') {
    const primaryExplanation =
      params.transformType === 'translasi'
        ? `Rumus ini menggeser titik A(${fmtNum(tVal.points[0].x)}, ${fmtNum(tVal.points[0].y)}) sejauh (${fmtNum(tVal.translationVec[0])}, ${fmtNum(tVal.translationVec[1])}) ke bayangan A'(${fmtNum(tVal.transformedPoints[0].x)}, ${fmtNum(tVal.transformedPoints[0].y)}) tanpa mengubah ukuran.`
        : `Perkalian matriks 2×2 memetakan koordinat awal A(${fmtNum(tVal.points[0].x)}, ${fmtNum(tVal.points[0].y)}) menjadi bayangan A'(${fmtNum(tVal.transformedPoints[0].x)}, ${fmtNum(tVal.transformedPoints[0].y)}) dengan skala luas ${tVal.absDeterminant.toFixed(2)}×.`;

    const matrixDescLatex =
      params.transformType === 'translasi'
        ? `\\vec{T} = \\begin{pmatrix} a \\\\ b \\end{pmatrix} = \\begin{pmatrix} ${fmtNum(tVal.translationVec[0])} \\\\ ${fmtNum(tVal.translationVec[1])} \\end{pmatrix}`
        : `M = \\begin{pmatrix} ${fmtNum(tVal.matrix[0][0])} & ${fmtNum(tVal.matrix[0][1])} \\\\ ${fmtNum(tVal.matrix[1][0])} & ${fmtNum(tVal.matrix[1][1])} \\end{pmatrix}`;

    const breakdownSteps: GeometryBreakdownStep[] = [
      {
        step: 1,
        title: `Operator Transformasi (${tVal.transformTitle})`,
        latex: matrixDescLatex,
        plainText: tVal.transformTitle,
        simpleExplanation:
          params.transformType === 'translasi'
            ? 'Translasi menggeser setiap titik dengan menambahkan vektor (a, b) tanpa mengubah bentuk maupun sudut.'
            : 'Matriks 2×2 mengalikan vektor kolom tiap titik sudut untuk menentukan posisi bayangan barunya.',
      },
      {
        step: 2,
        title: 'Pemetaan Titik Sudut Utama A → A\'',
        latex: tVal.pointPairs[0].stepLatex,
        plainText: tVal.pointPairs[0].stepPlain,
        simpleExplanation: `Titik awal A(${fmtNum(tVal.points[0].x)}, ${fmtNum(tVal.points[0].y)}) berpindah ke koordinat bayangan A'(${fmtNum(tVal.transformedPoints[0].x)}, ${fmtNum(tVal.transformedPoints[0].y)}).`,
      },
      {
        step: 3,
        title: 'Pemetaan Titik Sudut B → B\' dan C → C\'',
        latex: `${tVal.pointPairs[1].stepLatex} \\quad \\Big|\\quad ${tVal.pointPairs[2].stepLatex}`,
        plainText: `${tVal.pointPairs[1].stepPlain} | ${tVal.pointPairs[2].stepPlain}`,
        simpleExplanation:
          'Titik B dan C ikut mengalami aturan transformasi yang sama agar seluruh bentuk segitiga tetap utuh.',
      },
      {
        step: 4,
        title: 'Determinan Matriks & Luas Bayangan',
        latex: `L' = |\\det(M)| \\times L_{\\text{awal}} = ${tVal.absDeterminant.toFixed(2)} \\times ${tVal.initialArea.toFixed(1)} = ${tVal.imageArea.toFixed(2)}\\,\\text{satuan}^2`,
        plainText: `L' = ${tVal.imageArea.toFixed(2)} satuan^2`,
        simpleExplanation: `Nilai mutlak determinan (${tVal.absDeterminant.toFixed(2)}) menentukan faktor perubahan luas dari bangun awal ke bayangannya.`,
      },
    ];

    const concepts: GeometryConceptItem[] = [
      {
        id: 'matrix-general',
        title: 'Bentuk Umum Matriks Transformasi 2×2',
        latex: `\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix}`,
        plainText: "(x', y') = M * (x, y)",
        explanation: 'Mengalikan matriks 2×2 dengan koordinat awal (x, y) untuk menghasilkan bayangan pada Refleksi, Rotasi, atau Dilatasi.',
      },
      {
        id: 'translation-vector',
        title: 'Rumus Translasi (Pergeseran Vektor)',
        latex: `\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = \\begin{pmatrix} x \\\\ y \\end{pmatrix} + \\begin{pmatrix} a \\\\ b \\end{pmatrix}`,
        plainText: "(x', y') = (x + a, y + b)",
        explanation: 'Menambahkan pergeseran horizontal a dan vertikal b langsung ke koordinat titik asal tanpa mengubah ukuran.',
      },
      {
        id: 'det-area',
        title: 'Determinan & Faktor Skala Luas',
        latex: `\\det(M) = ad - bc,\\;\\; L' = |\\det(M)| \\cdot L`,
        plainText: "L' = |det(M)| * L",
        explanation: 'Menghitung luas bayangan: jika |det(M)| = 1 maka bangun kongruen, jika selain 1 maka luas ikut diskalakan.',
      },
      {
        id: 'rotation-dilation',
        title: 'Matriks Rotasi α & Dilatasi Skala k',
        latex: `R_\\alpha = \\begin{pmatrix} \\cos\\alpha & -\\sin\\alpha \\\\ \\sin\\alpha & \\cos\\alpha \\end{pmatrix},\\;\\; D_k = \\begin{pmatrix} k & 0 \\\\ 0 & k \\end{pmatrix}`,
        plainText: 'R_alpha = [[cos, -sin], [sin, cos]], D_k = [[k, 0], [0, k]]',
        explanation: 'Rotasi memutar koordinat sebesar sudut α terhadap O(0,0), sedangkan Dilatasi memperbesar/memperkecil sejauh skala k.',
      },
    ];

    return {
      subMode: params.subMode,
      primaryExplanation,
      transformValues: tVal,
      circleValues: cVal,
      breakdownSteps,
      concepts,
    };
  }

  const primaryExplanation = `Busur dan juring mengambil porsi ${((cVal.centralAngleDeg / 360) * 100).toFixed(1)}% dari keliling dan luas lingkaran berjari-jari r = ${cVal.radius.toFixed(1)} cm.`;

  const breakdownSteps: GeometryBreakdownStep[] = [
    {
      step: 1,
      title: 'Hitung Panjang Busur (s)',
      latex: `s = \\frac{\\theta}{360^{\\circ}} \\cdot 2\\pi r = \\frac{${cVal.centralAngleDeg}^{\\circ}}{360^{\\circ}} \\cdot 2\\pi(${cVal.radius.toFixed(1)}) = ${cVal.arcLength.toFixed(2)}\\,\\text{cm}`,
      plainText: `s = ${cVal.arcLength.toFixed(2)} cm`,
      simpleExplanation: `Panjang lengkung busur AB sebanding dengan rasio sudut pusat θ terhadap 360° dikalikan keliling (${cVal.circumference.toFixed(2)} cm).`,
    },
    {
      step: 2,
      title: 'Hitung Luas Juring (Sektor OAB)',
      latex: `L_{\\text{juring}} = \\frac{\\theta}{360^{\\circ}} \\cdot \\pi r^2 = \\frac{${cVal.centralAngleDeg}^{\\circ}}{360^{\\circ}} \\cdot \\pi(${cVal.radius.toFixed(1)})^2 = ${cVal.sectorArea.toFixed(2)}\\,\\text{cm}^2`,
      plainText: `L_juring = ${cVal.sectorArea.toFixed(2)} cm^2`,
      simpleExplanation: `Luas daerah sektor yang menyala dihitung dari porsi sudut pusat θ = ${cVal.centralAngleDeg}° terhadap luas lingkaran penuh.`,
    },
    {
      step: 3,
      title: 'Sudut Keliling & Panjang Tali Busur AB',
      latex: `\\alpha_{\\text{keliling}} = \\frac{1}{2}\\theta = ${cVal.inscribedAngleDeg.toFixed(1)}^{\\circ},\\;\\; c = 2r\\sin\\!\\left(\\frac{\\theta}{2}\\right) = ${cVal.chordLength.toFixed(2)}\\,\\text{cm}`,
      plainText: `Sudut keliling = ${cVal.inscribedAngleDeg.toFixed(1)}°, tali busur c = ${cVal.chordLength.toFixed(2)} cm`,
      simpleExplanation:
        'Sudut keliling selalu bernilai setengah dari sudut pusat yang menghadap busur yang sama, sementara tali busur dihitung lewat sinus setengah sudut.',
    },
    {
      step: 4,
      title: 'Panjang Garis Singgung dari Titik Luar P',
      latex: `PT = \\sqrt{OP^2 - r^2} = \\sqrt{${cVal.externalDistance.toFixed(1)}^2 - ${cVal.radius.toFixed(1)}^2} = ${cVal.tangentLength.toFixed(2)}\\,\\text{cm}`,
      plainText: `PT = ${cVal.tangentLength.toFixed(2)} cm`,
      simpleExplanation:
        'Garis singgung PT membentuk sudut siku-siku 90° dengan jari-jari OT sehingga panjangnya diperoleh dari Teorema Pythagoras.',
    },
  ];

  const concepts: GeometryConceptItem[] = [
    {
      id: 'arc-ratio',
      title: 'Rumus Panjang Busur Lingkaran',
      latex: `s = \\frac{\\theta}{360^{\\circ}} \\cdot 2\\pi r`,
      plainText: 's = (theta / 360) * 2 * pi * r',
      explanation: 'Menghitung panjang garis lengkung di tepi lingkaran berdasarkan besar sudut pusat θ.',
    },
    {
      id: 'sector-area',
      title: 'Rumus Luas Juring (Sektor)',
      latex: `L_{\\text{juring}} = \\frac{\\theta}{360^{\\circ}} \\cdot \\pi r^2`,
      plainText: 'L_juring = (theta / 360) * pi * r^2',
      explanation: 'Menentukan luas potongan daerah lingkaran yang dibatasi oleh dua jari-jari dan satu busur.',
    },
    {
      id: 'inscribed-chord',
      title: 'Sudut Keliling & Tali Busur',
      latex: `\\theta_{\\text{keliling}} = \\frac{1}{2}\\theta_{\\text{pusat}},\\;\\; c = 2r\\sin\\!\\left(\\frac{\\theta}{2}\\right)`,
      plainText: 'theta_keliling = 1/2 theta_pusat, c = 2r sin(theta/2)',
      explanation: 'Sudut keliling berukuran setengah sudut pusatnya, sedangkan tali busur menghubungkan dua titik ujung busur secara lurus.',
    },
    {
      id: 'tangent-pythagoras',
      title: 'Garis Singgung Siku-siku (90°)',
      latex: `OT \\perp PT,\\;\\; PT = \\sqrt{OP^2 - r^2}`,
      plainText: 'OT tegak lurus PT, PT = sqrt(OP^2 - r^2)',
      explanation: 'Garis singgung selalu tegak lurus terhadap jari-jari di titik singgung sehingga berlaku segitiga siku-siku Pythagoras.',
    },
  ];

  return {
    subMode: params.subMode,
    primaryExplanation,
    transformValues: tVal,
    circleValues: cVal,
    breakdownSteps,
    concepts,
  };
}

export function computeGeometry3DResult(
  params: Geometry3DParams,
): ComputedModuleResult {
  const tVal = calculateTransformationGeometry(params);
  const cVal = calculateCircleGeometry(params);

  if (params.subMode === 'transformasi') {
    const pairA = tVal.pointPairs[0];
    return {
      equationTitle: tVal.transformTitle,
      equationBadge: tVal.natureLabel,
      primaryEquation: tVal.primaryEquation,
      primaryLatex: tVal.primaryLatex,
      calloutPrimary: `A'(${fmtNum(pairA.image.x)}, ${fmtNum(pairA.image.y)})`,
      calloutSecondary: `|det| = ${tVal.absDeterminant.toFixed(2)} · L' = ${tVal.imageArea.toFixed(1)}`,
      metrics: [
        { label: 'Koordinat Awal A', value: `(${fmtNum(pairA.origin.x)}, ${fmtNum(pairA.origin.y)})` },
        { label: 'Bayangan A\'', value: `(${fmtNum(pairA.image.x)}, ${fmtNum(pairA.image.y)})`, highlight: true },
        { label: 'Luas Bayangan L\'', value: `${tVal.imageArea.toFixed(2)} sat²` },
      ],
      copilotInsight: tVal.propertySummary,
      chart: {
        title: 'Detailing Matriks Transformasi Geometri',
        subtitle: tVal.transformTitle,
        xLabel: '',
        yLabel: '',
        points: [],
        activePoint: { x: 0, y: 0 },
        activeTooltipText: tVal.primaryEquation,
      },
      summaryInputText: `${tVal.transformTitle}, A(${fmtNum(pairA.origin.x)}, ${fmtNum(pairA.origin.y)})`,
      summaryOutputText: `A'(${fmtNum(pairA.image.x)}, ${fmtNum(pairA.image.y)}), |det| = ${tVal.absDeterminant.toFixed(2)}, L' = ${tVal.imageArea.toFixed(2)}`,
      rawNumbers: {
        subMode: 'Transformasi Geometri',
        transformTitle: tVal.transformTitle,
        ax: pairA.origin.x,
        ay: pairA.origin.y,
        axPrime: pairA.image.x,
        ayPrime: pairA.image.y,
        absDet: Number(tVal.absDeterminant.toFixed(2)),
        imageArea: Number(tVal.imageArea.toFixed(2)),
        primaryValue: Number(tVal.imageArea.toFixed(2)),
        primaryUnit: 'sat²',
      },
    };
  }

  return {
    equationTitle: `Lingkaran · Jari-jari r = ${cVal.radius.toFixed(1)} cm, θ = ${cVal.centralAngleDeg}°`,
    equationBadge: params.showTangent ? 'Juring & Garis Singgung' : 'Busur & Sudut Keliling',
    primaryEquation: cVal.primaryEquation,
    primaryLatex: cVal.primaryLatex,
    calloutPrimary: `Busur s = ${cVal.arcLength.toFixed(2)} cm`,
    calloutSecondary: `Keliling θ/2 = ${cVal.inscribedAngleDeg.toFixed(1)}°`,
    metrics: [
      { label: 'Luas Juring', value: `${cVal.sectorArea.toFixed(2)} cm²`, highlight: true },
      { label: 'Sudut Keliling', value: `${cVal.inscribedAngleDeg.toFixed(1)}°` },
      {
        label: params.showTangent ? 'Garis Singgung PT' : 'Tali Busur AB',
        value: params.showTangent
          ? `${cVal.tangentLength.toFixed(2)} cm`
          : `${cVal.chordLength.toFixed(2)} cm`,
      },
    ],
    copilotInsight: cVal.propertySummary,
    chart: {
      title: 'Detailing Rumus Lingkaran',
      subtitle: `r = ${cVal.radius.toFixed(1)} cm, θ = ${cVal.centralAngleDeg}°`,
      xLabel: '',
      yLabel: '',
      points: [],
      activePoint: { x: 0, y: 0 },
      activeTooltipText: cVal.primaryEquation,
    },
    summaryInputText: `Lingkaran r = ${cVal.radius.toFixed(1)} cm, θ = ${cVal.centralAngleDeg}°, OP = ${cVal.externalDistance.toFixed(1)} cm`,
    summaryOutputText: `Busur s = ${cVal.arcLength.toFixed(2)} cm, Juring = ${cVal.sectorArea.toFixed(2)} cm², θ/2 = ${cVal.inscribedAngleDeg.toFixed(1)}°, PT = ${cVal.tangentLength.toFixed(2)} cm`,
    rawNumbers: {
      subMode: 'Lingkaran',
      r: cVal.radius,
      theta: cVal.centralAngleDeg,
      arcLength: Number(cVal.arcLength.toFixed(2)),
      sectorArea: Number(cVal.sectorArea.toFixed(2)),
      inscribedAngle: Number(cVal.inscribedAngleDeg.toFixed(1)),
      chordLength: Number(cVal.chordLength.toFixed(2)),
      tangentLength: Number(cVal.tangentLength.toFixed(2)),
      primaryValue: Number(cVal.arcLength.toFixed(2)),
      primaryUnit: 'cm',
    },
  };
}
