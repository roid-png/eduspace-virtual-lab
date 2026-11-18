import {
  PLANT_CELL_LIGHT_EFFECTS,
  PLANT_CELL_ORGANELLES,
} from '../data/plantCellData';
import type {
  PlantCellLightEffectSummary,
  PlantCellOrganelleInfo,
} from '../data/plantCellData';
import type { CellParams, ComputedModuleResult } from '../types/lab';

export interface PlantCellObservationSummary {
  organelle: PlantCellOrganelleInfo;
  lightSummary: PlantCellLightEffectSummary;
  conditionLabel: string;
  activeOrganelleResponse: string;
}

export function resolvePlantCellObservation(
  params: CellParams,
): PlantCellObservationSummary {
  const organelle =
    PLANT_CELL_ORGANELLES[params.focusOrganelle] ?? PLANT_CELL_ORGANELLES.semua;
  const lightSummary =
    PLANT_CELL_LIGHT_EFFECTS[params.lightCondition] ??
    PLANT_CELL_LIGHT_EFFECTS.terang;
  const conditionLabel =
    params.lightCondition === 'terang'
      ? 'Terkena Cahaya (Terang)'
      : 'Tidak Terkena Cahaya (Gelap)';
  const activeOrganelleResponse =
    params.lightCondition === 'terang'
      ? organelle.lightResponse
      : organelle.darkResponse;

  return {
    organelle,
    lightSummary,
    conditionLabel,
    activeOrganelleResponse,
  };
}

export function computeCellResult(params: CellParams): ComputedModuleResult {
  const obs = resolvePlantCellObservation(params);

  const insight =
    `Pengamatan Sel Tumbuhan berfokus pada ${obs.organelle.name} (${obs.organelle.latinName}) dalam ${obs.conditionLabel}. ` +
    `${obs.organelle.mainFunction} ${obs.activeOrganelleResponse}`;

  return {
    equationTitle: 'Identifikasi Organel & Respon Sel Tumbuhan',
    equationBadge: obs.lightSummary.badge,
    primaryEquation: `${obs.organelle.name} · ${obs.conditionLabel}`,
    calloutPrimary: obs.organelle.shortLabel,
    calloutSecondary: obs.conditionLabel,
    metrics: [
      { label: 'Organel Fokus', value: obs.organelle.shortLabel, highlight: true },
      { label: 'Kategori', value: obs.organelle.category },
      { label: 'Kondisi Cahaya', value: obs.lightSummary.badge },
    ],
    copilotInsight: insight,
    chart: {
      title: 'Pengamatan Biologi Sel Tumbuhan (Non-Perhitungan)',
      subtitle: obs.conditionLabel,
      xLabel: '',
      yLabel: '',
      points: [],
      activePoint: { x: 0, y: 0 },
      activeTooltipText: obs.organelle.shortLabel,
    },
    summaryInputText: `Sel Tumbuhan · Fokus: ${obs.organelle.shortLabel} · ${obs.conditionLabel}`,
    summaryOutputText: `${obs.organelle.mainFunction} Respon cahaya: ${obs.activeOrganelleResponse}`,
    rawNumbers: {
      organelleId: obs.organelle.id,
      organelleName: obs.organelle.name,
      lightCondition: params.lightCondition,
      lightBadge: obs.lightSummary.badge,
      primaryValue: 1,
      primaryUnit: 'organel',
    },
  };
}
