import { describe, expect, it } from 'vitest';
import { convertFormulaToLatex } from '../components/ui/FormulaText';
import { getAdaptiveFlowForOrgan } from '../data/anatomyData';
import { MODULES } from '../data/modules';
import {
  WORKSHEET_CONFIG_BY_MODULE,
  buildModuleSummaryFromExplored,
  buildModuleSummaryFromRecords,
  createExploredItemFromModuleState,
} from '../data/worksheetTemplates';
import { formatWorksheetText } from '../services/exportReport';
import { computeAnatomyResult, resolveAnatomyExploration } from './biologyAnatomy';
import { computeCellResult, resolvePlantCellObservation } from './biologyCell';
import {
  buildGeometryAnalysisDetails,
  calculateCircleGeometry,
  calculateTransformationGeometry,
  computeGeometry3DResult,
} from './mathGeometry3d';
import {
  buildCircuitAnalysisDetails,
  calculateCircuitPhysics,
  computeCircuitResult,
} from './physicsCircuit';
import {
  buildInclinedAnalysisDetails,
  calculateInclinedPhysics,
  computeInclinedResult,
} from './physicsInclined';

describe('EDUSPACE 5 Deterministic Science & Math Engines', () => {
  it('Katalog modul berisi tepat 5 modul tanpa Kalkulus Lanjut', () => {
    expect(MODULES).toHaveLength(5);
    expect(MODULES.some((m) => (m.id as string) === 'math-integral3d')).toBe(false);
  });

  it('Fisika 1 (Bidang Miring): menghitung gerak, kesetimbangan statis, tinggi h, sudut kritis, dan detail analisis', () => {
    const moving = calculateInclinedPhysics({
      objectType: 'barang',
      theta: 30,
      mass: 5,
      mu: 0.2,
      rampLengthMeters: 6,
    });
    expect(moving.isMoving).toBe(true);
    expect(moving.weight).toBeCloseTo(49.0, 2);
    expect(moving.drivingForce).toBeCloseTo(24.5, 2);
    expect(moving.normalForce).toBeCloseTo(42.435, 2);
    expect(moving.frictionForce).toBeCloseTo(8.487, 2);
    expect(moving.acceleration).toBeCloseTo(3.203, 2);
    expect(moving.rampHeightMeters).toBeCloseTo(3.0, 2);
    expect(moving.criticalAngleDeg).toBeCloseTo(11.31, 1);

    const computed = computeInclinedResult({
      objectType: 'mobil',
      theta: 30,
      mass: 5,
      mu: 0.2,
      rampLengthMeters: 6,
    });
    expect(computed.primaryLatex).toContain('\\sin 30^{\\circ}');
    expect(computed.summaryInputText).toContain('Mobil');
    expect(computed.summaryInputText).toContain('h = 3.00 m');
    expect(computed.summaryInputText).toContain('W = 49.0 N');

    const details = buildInclinedAnalysisDetails({
      objectType: 'mobil',
      theta: 30,
      mass: 5,
      mu: 0.2,
      rampLengthMeters: 6,
    });
    expect(details.breakdownSteps).toHaveLength(4);
    expect(details.formulaReference).toHaveLength(6);
    expect(details.chartVariants).toHaveLength(3);

    const flat = calculateInclinedPhysics({
      objectType: 'barang',
      theta: 0,
      mass: 5,
      mu: 0.2,
      rampLengthMeters: 6,
    });
    expect(flat.isMoving).toBe(false);
    expect(flat.acceleration).toBe(0);

    const staticCase = calculateInclinedPhysics({
      objectType: 'barang',
      theta: 10,
      mass: 5,
      mu: 0.5,
      rampLengthMeters: 6,
    });
    expect(staticCase.isMoving).toBe(false);
    expect(staticCase.netForce).toBe(0);
    expect(staticCase.acceleration).toBe(0);
  });

  it('Fisika 2 (Rangkaian Listrik): seri, paralel, campuran, saklar OFF, beban lampu, dan detail analisis', () => {
    const baseCircuit = {
      voltage: 12,
      r1: 10,
      r2: 20,
      r3: 20,
      hasSwitch: true,
      switchClosed: true,
      hasLamp: false,
      lampType: 'pijar-10' as const,
      lampPlacement: 'utama' as const,
    };

    const seri = calculateCircuitPhysics({ ...baseCircuit, mode: 'seri' });
    expect(seri.rTotal).toBe(30);
    expect(seri.iTotal).toBeCloseTo(0.4, 4);
    expect(seri.v1).toBeCloseTo(4, 4);
    expect(seri.v2).toBeCloseTo(8, 4);

    const paralel = calculateCircuitPhysics({ ...baseCircuit, mode: 'paralel' });
    expect(paralel.rTotal).toBeCloseTo(200 / 30, 4);
    expect(paralel.i1).toBeCloseTo(1.2, 4);
    expect(paralel.i2).toBeCloseTo(0.6, 4);
    expect(paralel.iTotal).toBeCloseTo(1.8, 4);

    // Campuran: R1 (10 Ω) seri dengan (R2=20 Ω || R3=20 Ω => 10 Ω), R_tot = 20 Ω
    const campuran = calculateCircuitPhysics({ ...baseCircuit, mode: 'campuran' });
    expect(campuran.rParallel).toBeCloseTo(10, 4);
    expect(campuran.rTotal).toBeCloseTo(20, 4);
    expect(campuran.iTotal).toBeCloseTo(0.6, 4);
    expect(campuran.i2).toBeCloseTo(0.3, 4);
    expect(campuran.i3).toBeCloseTo(0.3, 4);
    expect(campuran.i2 + campuran.i3).toBeCloseTo(campuran.i1, 4); // Hukum I Kirchhoff

    // Saklar OFF: arus = 0, lampu padam
    const switchOff = calculateCircuitPhysics({
      ...baseCircuit,
      mode: 'campuran',
      switchClosed: false,
      hasLamp: true,
    });
    expect(switchOff.isCircuitClosed).toBe(false);
    expect(switchOff.iTotal).toBe(0);
    expect(switchOff.powerLamp).toBe(0);
    expect(switchOff.lampBrightness).toBe(0);

    // Lampu terpasang di jalur utama pada mode campuran (R_L = 10 Ω -> R_tot = 30 Ω)
    const withLamp = calculateCircuitPhysics({
      ...baseCircuit,
      mode: 'campuran',
      hasLamp: true,
      lampType: 'pijar-10',
      lampPlacement: 'utama',
    });
    expect(withLamp.rTotal).toBeCloseTo(30, 4);
    expect(withLamp.iTotal).toBeCloseTo(0.4, 4);
    expect(withLamp.powerLamp).toBeCloseTo(1.6, 4);

    const details = buildCircuitAnalysisDetails({
      ...baseCircuit,
      mode: 'campuran',
      hasLamp: true,
    });
    expect(details.breakdownSteps).toHaveLength(4);
    expect(details.circuitLaws).toHaveLength(3);
    expect(details.topologyGuides).toHaveLength(3);
    expect(details.chartVariants).toHaveLength(3);

    const computedSeri = computeCircuitResult({ ...baseCircuit, mode: 'seri' });
    expect(computedSeri.primaryLatex).toContain('\\frac{12.0\\,\\text{V}}');
  });

  it('Biologi 1 (Anatomi Kardiorespirasi): fokus organ, switch paru normal/transparan, alur adaptif & rangkuman', () => {
    const intact = resolveAnatomyExploration({
      inspectionMode: 'utuh',
      focusOrgan: 'semua',
      lungVariant: 'normal',
      separatedParts: [],
      selectedStructureId: 'ringkasan-toraks',
    });
    expect(intact.modeLabel).toBe('Utuh');
    expect(intact.activeStructure.id).toBe('ringkasan-toraks');
    expect(intact.normalCardiacOutputLMin).toBeCloseTo(5.04, 2);

    const heartDetail = resolveAnatomyExploration({
      inspectionMode: 'utuh',
      focusOrgan: 'jantung',
      lungVariant: 'normal',
      separatedParts: [],
      selectedStructureId: 'heart-mitral-valve',
    });
    expect(heartDetail.activeStructure.id).toBe('heart-mitral-valve');
    expect(heartDetail.availableStructureIds).toContain('heart-tricuspid-valve');
    expect(heartDetail.recordPayload.organAndMode).toContain('Beating Heart');

    const lungTransparent = resolveAnatomyExploration({
      inspectionMode: 'utuh',
      focusOrgan: 'paru',
      lungVariant: 'transparan',
      separatedParts: [],
      selectedStructureId: 'lung-t-trachea',
    });
    expect(lungTransparent.activeStructure.id).toBe('lung-t-trachea');
    expect(lungTransparent.availableStructureIds).toContain('lung-t-bronchi-right');
    expect(lungTransparent.availableStructureIds).toContain('lung-t-epiglotis');
    expect(lungTransparent.availableStructureIds).toContain('lung-t-vocal-folds');
    expect(lungTransparent.recordPayload.organAndMode).toContain('Paru Transparan');

    const computedLungNormal = computeAnatomyResult({
      inspectionMode: 'utuh',
      focusOrgan: 'paru',
      lungVariant: 'normal',
      separatedParts: [],
      selectedStructureId: 'paru-kanan-utuh',
    });
    expect(computedLungNormal.calloutPrimary).toContain('Paru-paru');
    expect(computedLungNormal.calloutSecondary).toBe('Paru Normal');

    const flowAll = getAdaptiveFlowForOrgan('semua');
    const flowLungs = getAdaptiveFlowForOrgan('paru', 'transparan');
    const flowHeart = getAdaptiveFlowForOrgan('jantung');
    const flowAorta = getAdaptiveFlowForOrgan('aorta');
    expect(flowAll.steps.length).toBe(5);
    expect(flowLungs.title).toContain('Pernapasan');
    expect(flowHeart.title).toContain('Katup Jantung');
    expect(flowAorta.title).toContain('Koarktasio Aorta');

    const summaryText = buildModuleSummaryFromExplored('biology-anatomy', [
      {
        id: '1',
        moduleId: 'biology-anatomy',
        title: 'Epiglotis',
        subtitle: 'Paru-paru · Paru Transparan',
        summaryLine: 'Epiglotis — Menutup glotis saat menelan.',
        inputSummary: 'Paru-paru · Paru Transparan',
        outputSummary: 'Menutup glotis saat menelan.',
        formulaText: 'Epiglotis',
        primaryNumericValue: 1,
        primaryUnit: 'struktur',
        recordKind: 'anatomy',
        selectedForSummary: true,
        clickedAt: '11:00',
      },
      {
        id: '2',
        moduleId: 'biology-anatomy',
        title: 'Katup Mitral',
        subtitle: 'Jantung · Model Jantung Berdenyut',
        summaryLine: 'Katup Mitral — Mencegah aliran balik darah.',
        inputSummary: 'Jantung · Model Jantung Berdenyut',
        outputSummary: 'Mencegah aliran balik darah.',
        formulaText: 'Katup Mitral',
        primaryNumericValue: 1,
        primaryUnit: 'struktur',
        recordKind: 'anatomy',
        selectedForSummary: false,
        clickedAt: '11:01',
      },
    ]);
    expect(summaryText).toContain('1 ITEM DIPILIH');
    expect(summaryText).toContain('Epiglotis');
    expect(summaryText).not.toContain('Katup Mitral');

    // Setiap modul memiliki konfigurasi aspek Lembar Kerja & builder item eksplorasi sendiri
    const inclinedParams = {
      objectType: 'mobil' as const,
      theta: 30,
      mass: 5,
      mu: 0.2,
      rampLengthMeters: 6,
    };
    const inclinedItem = createExploredItemFromModuleState(
      'physics-inclined',
      inclinedParams,
      computeInclinedResult(inclinedParams),
      '12:00',
    );
    expect(inclinedItem.moduleId).toBe('physics-inclined');
    expect(inclinedItem.title).toContain('30°');
    expect(WORKSHEET_CONFIG_BY_MODULE['physics-inclined'].pickerTitle).not.toBe(
      WORKSHEET_CONFIG_BY_MODULE['biology-anatomy'].pickerTitle,
    );
    expect(WORKSHEET_CONFIG_BY_MODULE['math-geometry3d'].col1Label).toContain('Sub-Mode');
  });

  it('Biologi 2 (Sel Tumbuhan): observasi organel GLTF & respon Terang vs Gelap tanpa perhitungan maupun Sel Darah', () => {
    const nucleusLight = resolvePlantCellObservation({
      focusOrganelle: 'nucleus',
      lightCondition: 'terang',
    });
    expect(nucleusLight.organelle.gltfNodes).toContain('nucleus');
    expect(nucleusLight.organelle.zoomMultiplier).toBeGreaterThan(1.5);
    expect(nucleusLight.conditionLabel).toContain('Terkena Cahaya');

    const chloroplastDark = resolvePlantCellObservation({
      focusOrganelle: 'chloroplast',
      lightCondition: 'gelap',
    });
    expect(chloroplastDark.organelle.gltfNodes).toEqual(['chloroplast.in', 'chloroplast.out']);
    expect(chloroplastDark.activeOrganelleResponse).toContain('berhenti');

    const computed = computeCellResult({
      focusOrganelle: 'chloroplast',
      lightCondition: 'terang',
    });
    expect(computed.primaryLatex).toBeUndefined();
    expect(computed.chart.points).toHaveLength(0);
    expect(computed.copilotInsight).not.toContain('Sel Darah');
    expect(computed.copilotInsight).not.toContain('FOV');

    const cellWorksheetItem = createExploredItemFromModuleState(
      'biology-cell',
      { focusOrganelle: 'nucleus', lightCondition: 'gelap' },
      computeCellResult({ focusOrganelle: 'nucleus', lightCondition: 'gelap' }),
      '15:50',
    );
    expect(cellWorksheetItem.recordKind).toBe('anatomy');
    expect(cellWorksheetItem.summaryLine).toContain('Nukleus');
  });

  it('Matematika 1 (Transformasi Geometri & Lingkaran): matriks 2×2, determinan luas, busur, sudut keliling, garis singgung, & LaTeX', () => {
    const baseGeom = {
      subMode: 'transformasi' as const,
      transformType: 'translasi' as const,
      pointAx: 1,
      pointAy: 1,
      tx: 3,
      ty: 2,
      reflectionAxis: 'y=x' as const,
      rotationDeg: 90,
      dilationScale: 2,
      radius: 4,
      centralAngleDeg: 90,
      externalDistanceOffset: 1,
      showTangent: true,
      showChord: true,
    };

    const translasi = calculateTransformationGeometry(baseGeom);
    expect(translasi.transformedPoints[0]).toEqual({ label: "A'", x: 4, y: 3 });
    expect(translasi.imageArea).toBeCloseTo(3, 4);

    const refleksiYX = calculateTransformationGeometry({
      ...baseGeom,
      transformType: 'refleksi',
      pointAx: 2,
      pointAy: 5,
    });
    expect(refleksiYX.transformedPoints[0]).toEqual({ label: "A'", x: 5, y: 2 });
    expect(refleksiYX.absDeterminant).toBeCloseTo(1, 4);

    const rotasi90 = calculateTransformationGeometry({
      ...baseGeom,
      transformType: 'rotasi',
      pointAx: 2,
      pointAy: 1,
      rotationDeg: 90,
    });
    expect(rotasi90.transformedPoints[0]).toEqual({ label: "A'", x: -1, y: 2 });

    const dilatasi2 = calculateTransformationGeometry({
      ...baseGeom,
      transformType: 'dilatasi',
      dilationScale: 2,
    });
    expect(dilatasi2.transformedPoints[0]).toEqual({ label: "A'", x: 2, y: 2 });
    expect(dilatasi2.absDeterminant).toBeCloseTo(4, 4);
    expect(dilatasi2.imageArea).toBeCloseTo(12, 4);

    // Lingkaran: r = 4, theta = 90°, OP = r + 1 = 5 -> PT = sqrt(5^2 - 4^2) = 3 cm
    const lingkaran = calculateCircleGeometry({ ...baseGeom, subMode: 'lingkaran' });
    expect(lingkaran.arcLength).toBeCloseTo(2 * Math.PI, 4);
    expect(lingkaran.sectorArea).toBeCloseTo(4 * Math.PI, 4);
    expect(lingkaran.inscribedAngleDeg).toBeCloseTo(45, 4);
    expect(lingkaran.tangentLength).toBeCloseTo(3, 4);

    const details = buildGeometryAnalysisDetails({ ...baseGeom, subMode: 'lingkaran' });
    expect(details.breakdownSteps).toHaveLength(4);
    expect(details.concepts).toHaveLength(2);

    const computedCircle = computeGeometry3DResult({ ...baseGeom, subMode: 'lingkaran' });
    expect(computedCircle.chart.points).toHaveLength(0);
    expect(computedCircle.primaryLatex).toContain('\\frac{90^{\\circ}}{360^{\\circ}}');

    const worksheetItem = createExploredItemFromModuleState(
      'math-geometry3d',
      dilatasi2 ? { ...baseGeom, transformType: 'dilatasi', dilationScale: 2 } : baseGeom,
      computeGeometry3DResult({ ...baseGeom, transformType: 'dilatasi', dilationScale: 2 }),
      '17:05',
    );
    expect(worksheetItem.title).toContain('Dilatasi');
    expect(worksheetItem.summaryLine).toContain('12.00');

    const converted = convertFormulaToLatex('d(P, BDG) = 6·(1 + 1.00) / √3 = 6.93 cm');
    expect(converted).toContain('\\sqrt{3}');
    expect(converted).toContain('\\cdot');
  });

  it('Ekspor .txt & Rangkuman Real-Time: menghasilkan ringkasan naratif tanpa format tabel dan tanpa label Kelas XI', () => {
    const inclinedParams = {
      objectType: 'barang' as const,
      theta: 30,
      mass: 5,
      mu: 0.2,
      rampLengthMeters: 6,
    };
    const explored = createExploredItemFromModuleState(
      'physics-inclined',
      inclinedParams,
      computeInclinedResult(inclinedParams),
      '20:15',
    );
    const records = [
      {
        id: 'rec-test-1',
        moduleId: 'physics-inclined' as const,
        moduleTitle: 'Bidang Miring & Vektor Gaya',
        subject: 'fisika' as const,
        timestamp: '20:15',
        inputSummary: explored.inputSummary,
        outputSummary: explored.outputSummary,
        primaryNumericValue: explored.primaryNumericValue,
        primaryUnit: explored.primaryUnit,
        formulaText: explored.formulaText,
        narrativeSummary: explored.summaryLine,
        recordKind: explored.recordKind,
      },
    ];

    const autoSummary = buildModuleSummaryFromRecords('physics-inclined', records);
    expect(autoSummary).toContain('1 HASIL PRAKTIKUM');
    expect(autoSummary).toContain('Objek Peti Barang');

    const txt = formatWorksheetText(
      records,
      'Sudut lebih besar membuat percepatan bertambah.',
      'Bidang Miring & Vektor Gaya',
      'physics-inclined',
    );
    expect(txt).toContain('Kurikulum Merdeka / Sekolah Menengah Atas');
    expect(txt).toContain('RINGKASAN LAPORAN PRAKTIKUM VIRTUAL');
    expect(txt).toContain('Sudut lebih besar membuat percepatan bertambah.');
    expect(txt).not.toContain('Kelas XI');
    expect(txt).not.toContain('Variabel Input:');
    expect(txt).not.toContain('Hasil Hitung:');
  });
});
