import { resolveAnatomyExploration } from '../engines/biologyAnatomy';
import { resolvePlantCellObservation } from '../engines/biologyCell';
import {
  calculateCircleGeometry,
  calculateTransformationGeometry,
} from '../engines/mathGeometry3d';
import {
  LAMP_SPECS,
  calculateCircuitPhysics,
  getModeLabel,
} from '../engines/physicsCircuit';
import { calculateInclinedPhysics } from '../engines/physicsInclined';
import type {
  ComputedModuleResult,
  ExperimentRecord,
  ModuleExploredItem,
  ModuleId,
  ModuleParamsMap,
} from '../types/lab';

export interface WorksheetModuleConfig {
  moduleId: ModuleId;
  pickerTitle: string;
  pickerDescription: string;
  pickerEmptyHint: string;
  indexLabel: string;
  col1Label: string;
  col2Label: string;
  col3Label?: string;
  isAnatomyLayout: boolean;
  summaryHeaderPrefix: string;
}

export const WORKSHEET_CONFIG_BY_MODULE: Record<ModuleId, WorksheetModuleConfig> = {
  'physics-inclined': {
    moduleId: 'physics-inclined',
    pickerTitle: 'Pilih Variasi Sudut & Gaya Simulasi 3D',
    pickerDescription:
      'Centang kondisi sudut (θ), massa, atau koefisien gesek (μ) yang sudah kamu uji di Simulasi 3D untuk disusun menjadi rangkuman.',
    pickerEmptyHint:
      'Belum ada variasi parameter yang dicatat. Ubah sudut θ, massa, koefisien gesek μ, atau jalankan simulasi di Kanvas 3D.',
    indexLabel: 'Uji',
    col1Label: 'Sudut, Massa & Gesekan',
    col2Label: 'Gaya & Percepatan',
    isAnatomyLayout: false,
    summaryHeaderPrefix: 'RANGKUMAN EKSPERIMEN BIDANG MIRING',
  },
  'physics-circuit': {
    moduleId: 'physics-circuit',
    pickerTitle: 'Pilih Konfigurasi Rangkaian Hasil Simulasi 3D',
    pickerDescription:
      'Centang variasi rangkaian Seri/Paralel, tegangan, dan hambatan yang sudah kamu uji di Simulasi 3D untuk dirangkum.',
    pickerEmptyHint:
      'Belum ada konfigurasi rangkaian yang dicatat. Pilih mode Seri/Paralel atau ubah nilai V, R₁, dan R₂ di Kanvas 3D.',
    indexLabel: 'Uji',
    col1Label: 'Konfigurasi, V & Resistor',
    col2Label: 'Arus, Tegangan & Daya',
    isAnatomyLayout: false,
    summaryHeaderPrefix: 'RANGKUMAN EKSPERIMEN RANGKAIAN LISTRIK',
  },
  'biology-anatomy': {
    moduleId: 'biology-anatomy',
    pickerTitle: 'Pilih Struktur Organ Hasil Klik Simulasi 3D',
    pickerDescription:
      'Centang organ, katup jantung, atau bagian saluran napas yang sudah kamu klik di Simulasi 3D, lalu susun menjadi rangkuman laporanmu.',
    pickerEmptyHint:
      'Belum ada objek yang diklik di Simulasi 3D. Klik organ, katup jantung, atau bagian paru transparan di kanvas 3D agar otomatis muncul di daftar ini.',
    indexLabel: 'Observasi',
    col1Label: 'Organ & Mode',
    col2Label: 'Struktur yang Diidentifikasi',
    col3Label: 'Fungsi Fisiologis',
    isAnatomyLayout: true,
    summaryHeaderPrefix: 'RANGKUMAN EKSPLORASI ANATOMI',
  },
  'biology-cell': {
    moduleId: 'biology-cell',
    pickerTitle: 'Pilih Organel & Kondisi Cahaya Sel Tumbuhan',
    pickerDescription:
      'Centang organel sel tumbuhan yang sudah kamu zoom dan amati (pada kondisi Terkena Cahaya atau Gelap) untuk disusun menjadi rangkuman.',
    pickerEmptyHint:
      'Belum ada pengamatan organel yang tercatat. Klik organel (Nukleus, Kloroplas, Vakuola, dll.) atau ubah kondisi cahaya di Model 3D.',
    indexLabel: 'Pengamatan',
    col1Label: 'Organel & Kondisi Cahaya',
    col2Label: 'Bagian Sel yang Diamati',
    col3Label: 'Fungsi & Respon Cahaya',
    isAnatomyLayout: true,
    summaryHeaderPrefix: 'RANGKUMAN PENGAMATAN SEL TUMBUHAN 3D',
  },
  'math-geometry3d': {
    moduleId: 'math-geometry3d',
    pickerTitle: 'Pilih Variasi Transformasi & Lingkaran 3D',
    pickerDescription:
      'Centang hasil variasi Transformasi Geometri (Translasi, Refleksi, Rotasi, Dilatasi) atau Lingkaran yang sudah kamu uji di ruang 3D.',
    pickerEmptyHint:
      'Belum ada variasi geometri yang tercatat. Pilih Transformasi atau Lingkaran lalu ubah parameter di Kanvas 3D.',
    indexLabel: 'Uji',
    col1Label: 'Sub-Mode & Parameter Input',
    col2Label: 'Koordinat Bayangan / Sifat Lingkaran',
    isAnatomyLayout: false,
    summaryHeaderPrefix: 'RANGKUMAN TRANSFORMASI GEOMETRI & LINGKARAN',
  },
};

export function createExploredItemFromModuleState<K extends ModuleId>(
  moduleId: K,
  params: ModuleParamsMap[K],
  computed: ComputedModuleResult,
  timestamp: string,
): ModuleExploredItem {
  const primaryNumericValue = Number(computed.rawNumbers.primaryValue ?? 0);
  const primaryUnit = String(computed.rawNumbers.primaryUnit ?? '');

  switch (moduleId) {
    case 'physics-inclined': {
      const p = params as ModuleParamsMap['physics-inclined'];
      const v = calculateInclinedPhysics(p);
      const thetaRounded = Math.round(p.theta);
      const status = v.isMoving ? 'Meluncur' : 'Diam Setimbang';
      const objectLabel = p.objectType === 'mobil' ? 'Mobil & Bukit' : 'Peti Barang';
      return {
        id: `inclined::${p.objectType}::${thetaRounded}::${p.mass.toFixed(1)}::${p.mu.toFixed(2)}`,
        moduleId,
        title: `${objectLabel} · θ = ${thetaRounded}° (${status})`,
        subtitle: `h = ${v.rampHeightMeters.toFixed(2)} m · W = ${v.weight.toFixed(1)} N · μ = ${p.mu.toFixed(2)} · a = ${v.acceleration.toFixed(2)} m/s²`,
        summaryLine: `Objek ${objectLabel} pada θ = ${thetaRounded}° (h = ${v.rampHeightMeters.toFixed(2)} m), m = ${p.mass.toFixed(1)} kg (W = ${v.weight.toFixed(1)} N), μ = ${p.mu.toFixed(2)}: gaya dorong W·sin θ = ${v.drivingForce.toFixed(1)} N vs gaya gesek = ${v.frictionForce.toFixed(1)} N → benda ${v.isMoving ? `meluncur dengan percepatan a = ${v.acceleration.toFixed(2)} m/s²` : 'diam setimbang (a = 0 m/s²)'}.`,
        inputSummary: computed.summaryInputText,
        outputSummary: computed.summaryOutputText,
        formulaText: computed.primaryEquation,
        formulaLatex: computed.primaryLatex,
        primaryNumericValue,
        primaryUnit,
        recordKind: 'numeric',
        selectedForSummary: true,
        clickedAt: timestamp,
      };
    }

    case 'physics-circuit': {
      const p = params as ModuleParamsMap['physics-circuit'];
      const c = calculateCircuitPhysics(p);
      const modeLabel = getModeLabel(p.mode);
      const switchTag = p.hasSwitch
        ? p.switchClosed
          ? 'Saklar ON'
          : 'Saklar OFF'
        : 'Tanpa Saklar';
      const lampTag = p.hasLamp
        ? ` · ${LAMP_SPECS[p.lampType].shortLabel} (${c.powerLamp.toFixed(2)} W)`
        : '';
      const rPart =
        p.mode === 'campuran'
          ? `R₁=${p.r1} Ω, R₂=${p.r2} Ω, R₃=${p.r3} Ω`
          : `R₁=${p.r1} Ω, R₂=${p.r2} Ω`;
      return {
        id: `circuit::${p.mode}::${p.voltage.toFixed(1)}::${p.r1}::${p.r2}::${p.r3}::${p.hasSwitch ? p.switchClosed : 'no-sw'}::${p.hasLamp ? `${p.lampType}-${p.lampPlacement}` : 'no-lamp'}`,
        moduleId,
        title: `Rangkaian ${modeLabel} · V = ${p.voltage.toFixed(1)} V (${switchTag})`,
        subtitle: `${rPart} · I_tot = ${c.iTotal.toFixed(2)} A${lampTag}`,
        summaryLine: `Mode ${modeLabel} (${computed.summaryInputText}): R_tot = ${c.rTotal.toFixed(2)} Ω, I_tot = ${c.iTotal.toFixed(2)} A, daya P = ${c.powerTotal.toFixed(2)} W (${
          !c.isCircuitClosed
            ? 'saklar terbuka sehingga arus nol'
            : p.mode === 'seri'
              ? `V₁ = ${c.v1.toFixed(1)} V, V₂ = ${c.v2.toFixed(1)} V`
              : p.mode === 'campuran'
                ? `V₁ = ${c.v1.toFixed(1)} V, I₂ = ${c.i2.toFixed(2)} A, I₃ = ${c.i3.toFixed(2)} A`
                : `I₁ = ${c.i1.toFixed(2)} A, I₂ = ${c.i2.toFixed(2)} A`
        }${p.hasLamp ? `, P_lampu = ${c.powerLamp.toFixed(2)} W` : ''}).`,
        inputSummary: computed.summaryInputText,
        outputSummary: computed.summaryOutputText,
        formulaText: computed.primaryEquation,
        formulaLatex: computed.primaryLatex,
        primaryNumericValue,
        primaryUnit,
        recordKind: 'numeric',
        selectedForSummary: true,
        clickedAt: timestamp,
      };
    }

    case 'biology-anatomy': {
      const p = params as ModuleParamsMap['biology-anatomy'];
      const exp = resolveAnatomyExploration(p);
      const st = exp.activeStructure;
      const organAndMode = `${exp.organLabel} · ${exp.activeSubModeLabel}`;
      const physFn = `${st.functionSummary} ${st.physiologicalMechanism}`;
      return {
        id: `anatomy::${p.focusOrgan}::${exp.activeSubModeLabel}::${st.id}`,
        moduleId,
        title: st.name,
        subtitle: organAndMode,
        summaryLine: `${st.name} [${organAndMode}] — Letak: ${st.location}. Fungsi: ${physFn}`,
        inputSummary: organAndMode,
        outputSummary: physFn,
        formulaText: st.name,
        primaryNumericValue,
        primaryUnit,
        recordKind: 'anatomy',
        anatomyRecord: {
          organAndMode,
          identifiedStructures: st.name,
          physiologicalFunction: physFn,
        },
        selectedForSummary: true,
        clickedAt: timestamp,
      };
    }

    case 'biology-cell': {
      const p = params as ModuleParamsMap['biology-cell'];
      const obs = resolvePlantCellObservation(p);
      const organAndLight = `Sel Tumbuhan · ${obs.conditionLabel}`;
      const funcAndResp = `${obs.organelle.mainFunction} Respon cahaya: ${obs.activeOrganelleResponse}`;
      return {
        id: `cell::${p.focusOrganelle}::${p.lightCondition}`,
        moduleId,
        title: `${obs.organelle.shortLabel} (${obs.lightSummary.badge})`,
        subtitle: obs.conditionLabel,
        summaryLine: `${obs.organelle.name} [${obs.conditionLabel}] — Letak: ${obs.organelle.location}. Fungsi: ${funcAndResp}`,
        inputSummary: organAndLight,
        outputSummary: funcAndResp,
        formulaText: obs.organelle.name,
        primaryNumericValue: 1,
        primaryUnit: 'organel',
        recordKind: 'anatomy',
        anatomyRecord: {
          organAndMode: organAndLight,
          identifiedStructures: obs.organelle.name,
          physiologicalFunction: funcAndResp,
        },
        selectedForSummary: true,
        clickedAt: timestamp,
      };
    }

    case 'math-geometry3d': {
      const p = params as ModuleParamsMap['math-geometry3d'];
      if (p.subMode === 'transformasi') {
        const tVal = calculateTransformationGeometry(p);
        const paramKey =
          p.transformType === 'translasi'
            ? `${p.tx}-${p.ty}`
            : p.transformType === 'refleksi'
              ? p.reflectionAxis
              : p.transformType === 'rotasi'
                ? `${p.rotationDeg}`
                : `${p.dilationScale.toFixed(2)}`;
        return {
          id: `geom::trans::${p.transformType}::${paramKey}::${p.pointAx}::${p.pointAy}`,
          moduleId,
          title: tVal.transformTitle,
          subtitle: `${tVal.primaryEquation} · Luas = ${tVal.imageArea.toFixed(2)} sat²`,
          summaryLine: `${tVal.transformTitle} pada titik uji A(${tVal.points[0].x}, ${tVal.points[0].y}) menghasilkan bayangan A'(${tVal.transformedPoints[0].x}, ${tVal.transformedPoints[0].y}), |det(M)| = ${tVal.absDeterminant.toFixed(2)}, luas bayangan = ${tVal.imageArea.toFixed(2)} satuan² (${tVal.natureLabel}).`,
          inputSummary: computed.summaryInputText,
          outputSummary: computed.summaryOutputText,
          formulaText: computed.primaryEquation,
          formulaLatex: computed.primaryLatex,
          primaryNumericValue,
          primaryUnit,
          recordKind: 'numeric',
          selectedForSummary: true,
          clickedAt: timestamp,
        };
      }

      const cVal = calculateCircleGeometry(p);
      return {
        id: `geom::lingkaran::${p.radius.toFixed(1)}::${p.centralAngleDeg}::${p.externalDistanceOffset.toFixed(1)}::${p.showTangent}::${p.showChord}`,
        moduleId,
        title: `Lingkaran · r = ${cVal.radius.toFixed(1)} cm, θ = ${cVal.centralAngleDeg}°`,
        subtitle: `Busur s = ${cVal.arcLength.toFixed(2)} cm · Juring = ${cVal.sectorArea.toFixed(2)} cm² · θ/2 = ${cVal.inscribedAngleDeg.toFixed(1)}°`,
        summaryLine: `Lingkaran r = ${cVal.radius.toFixed(1)} cm, sudut pusat θ = ${cVal.centralAngleDeg}°: panjang busur s = ${cVal.arcLength.toFixed(2)} cm, luas juring = ${cVal.sectorArea.toFixed(2)} cm², sudut keliling θ/2 = ${cVal.inscribedAngleDeg.toFixed(1)}°, tali busur = ${cVal.chordLength.toFixed(2)} cm, garis singgung PT = ${cVal.tangentLength.toFixed(2)} cm.`,
        inputSummary: computed.summaryInputText,
        outputSummary: computed.summaryOutputText,
        formulaText: computed.primaryEquation,
        formulaLatex: computed.primaryLatex,
        primaryNumericValue,
        primaryUnit,
        recordKind: 'numeric',
        selectedForSummary: true,
        clickedAt: timestamp,
      };
    }
  }
}

export function buildModuleSummaryFromExplored(
  moduleId: ModuleId,
  items: ModuleExploredItem[],
): string {
  const selected = items.filter((item) => item.selectedForSummary);
  if (selected.length === 0) return '';

  const cfg = WORKSHEET_CONFIG_BY_MODULE[moduleId];
  const lines: string[] = [
    `${cfg.summaryHeaderPrefix} (${selected.length} ITEM DIPILIH):`,
  ];

  selected.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.summaryLine}`);
  });

  return lines.join('\n');
}

export function buildRecordNarrativeSentence(rec: ExperimentRecord): string {
  if (rec.narrativeSummary?.trim()) {
    return rec.narrativeSummary.trim();
  }
  const isAnatomy =
    rec.recordKind === 'anatomy' || rec.moduleId === 'biology-anatomy';
  if (isAnatomy) {
    const struktur = rec.anatomyRecord?.identifiedStructures ?? rec.formulaText;
    const mode = rec.anatomyRecord?.organAndMode ?? rec.inputSummary;
    const fungsi = rec.anatomyRecord?.physiologicalFunction ?? rec.outputSummary;
    return `Pada pengamatan ${struktur} (${mode}), diperoleh pemahaman fisiologis bahwa ${fungsi.charAt(0).toLowerCase()}${fungsi.slice(1)}`;
  }
  return `Pada pengujian dengan kondisi ${rec.inputSummary}, hasil menunjukkan ${rec.outputSummary} sesuai persamaan ${rec.formulaText}.`;
}

export function buildModuleSummaryFromRecords(
  moduleId: ModuleId,
  records: ExperimentRecord[],
): string {
  if (records.length === 0) return '';
  const cfg = WORKSHEET_CONFIG_BY_MODULE[moduleId];
  const lines: string[] = [
    `${cfg.summaryHeaderPrefix} (${records.length} HASIL PRAKTIKUM):`,
  ];
  records.forEach((rec, idx) => {
    lines.push(`${idx + 1}. ${buildRecordNarrativeSentence(rec)}`);
  });
  return lines.join('\n');
}
