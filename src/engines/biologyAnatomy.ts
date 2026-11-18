import {
  ANATOMY_STRUCTURES,
  CARDIORESPIRATORY_FLOW,
  INSPECTION_MODE_LABELS,
  LUNG_VARIANT_LABELS,
  NORMAL_PHYSIOLOGY_REFERENCE,
  getAvailableStructureIdsForState,
  getOrganDisplayLabel,
  getStructureDetail,
} from '../data/anatomyData';
import type { AnatomyParams, AnatomyRecordPayload, ComputedModuleResult } from '../types/lab';

export const NORMAL_HEART_RATE_BPM = 72;
export const NORMAL_STROKE_VOLUME_ML = 70;
export const NORMAL_RESPIRATORY_RATE = 14;

export interface AnatomyExplorationState {
  modeLabel: string;
  organLabel: string;
  activeSubModeLabel: string;
  activeStructure: ReturnType<typeof getStructureDetail>;
  availableStructureIds: string[];
  separatedCount: number;
  normalCardiacOutputLMin: number;
  normalHeartRateBpm: number;
  normalRespiratoryRate: number;
  recordPayload: AnatomyRecordPayload;
}

export function resolveAnatomyExploration(params: AnatomyParams): AnatomyExplorationState {
  const modeLabel = INSPECTION_MODE_LABELS[params.inspectionMode];
  const organLabel = getOrganDisplayLabel(params.focusOrgan);
  const availableStructureIds = getAvailableStructureIdsForState(
    params.focusOrgan,
    params.inspectionMode,
    params.lungVariant,
  );

  const isCandidateAvailable = availableStructureIds.includes(params.selectedStructureId);
  const resolvedStructureId = isCandidateAvailable
    ? params.selectedStructureId
    : (availableStructureIds[0] ?? 'ringkasan-toraks');

  const activeStructure = getStructureDetail(resolvedStructureId);
  const normalCardiacOutputLMin =
    (NORMAL_HEART_RATE_BPM * NORMAL_STROKE_VOLUME_ML) / 1000;

  let activeSubModeLabel = `Mode: ${modeLabel}`;
  if (params.focusOrgan === 'paru') {
    activeSubModeLabel = LUNG_VARIANT_LABELS[params.lungVariant];
  } else if (params.focusOrgan === 'jantung') {
    activeSubModeLabel = 'Model Jantung Berdenyut';
  } else if (params.focusOrgan === 'aorta') {
    activeSubModeLabel = 'Model Detail Aorta';
  }

  const identifiedNames = availableStructureIds
    .slice(0, 4)
    .map((id) => ANATOMY_STRUCTURES[id]?.shortLabel ?? ANATOMY_STRUCTURES[id]?.name.split(' (')[0] ?? id)
    .join(', ');

  const recordPayload: AnatomyRecordPayload = {
    organAndMode: `${organLabel} · ${activeSubModeLabel}`,
    identifiedStructures:
      params.focusOrgan === 'semua' && params.inspectionMode === 'belah'
        ? `${activeStructure.name} (Bagian Dalam: ${identifiedNames})`
        : params.focusOrgan === 'paru' && params.lungVariant === 'transparan'
          ? `${activeStructure.name} (Paru Transparan: ${identifiedNames})`
          : `${activeStructure.name}${params.focusOrgan === 'semua' && params.separatedParts.length > 0 ? ` · Terpisah (${params.separatedParts.length} organ)` : ''}`,
    physiologicalFunction: `${activeStructure.functionSummary} ${activeStructure.physiologicalMechanism}`,
  };

  return {
    modeLabel,
    organLabel,
    activeSubModeLabel,
    activeStructure,
    availableStructureIds,
    separatedCount: params.separatedParts.length,
    normalCardiacOutputLMin,
    normalHeartRateBpm: NORMAL_HEART_RATE_BPM,
    normalRespiratoryRate: NORMAL_RESPIRATORY_RATE,
    recordPayload,
  };
}

export function computeAnatomyResult(params: AnatomyParams): ComputedModuleResult {
  const exp = resolveAnatomyExploration(params);

  const insight = `Sedang mengamati ${exp.activeStructure.name} (${exp.activeSubModeLabel}). Letak: ${exp.activeStructure.location}. Fungsi: ${exp.activeStructure.functionSummary}`;

  return {
    equationTitle: 'Identifikasi Struktur & Fungsi Fisiologis',
    equationBadge: exp.activeSubModeLabel,
    primaryEquation: `${exp.activeStructure.name}${exp.activeStructure.latinName ? ` (${exp.activeStructure.latinName})` : ''}`,
    calloutPrimary: exp.organLabel,
    calloutSecondary: exp.activeSubModeLabel,
    metrics: [
      { label: 'Organ Fokus', value: exp.organLabel, highlight: true },
      { label: 'Tampilan Model', value: exp.activeSubModeLabel },
      {
        label: 'Info Normal',
        value: `HR ${NORMAL_HEART_RATE_BPM} bpm · CO ${exp.normalCardiacOutputLMin.toFixed(2)} L/mnt`,
      },
    ],
    copilotInsight: insight,
    chart: {
      title: 'Alur Sirkulasi Kardiorespirasi',
      subtitle: NORMAL_PHYSIOLOGY_REFERENCE.cardiacOutput,
      xLabel: 'Tahap',
      yLabel: 'Aliran',
      points: CARDIORESPIRATORY_FLOW.map((step) => ({ x: step.step, y: step.step })),
      activePoint: { x: 1, y: 1 },
      activeTooltipText: exp.activeStructure.name,
    },
    summaryInputText: `${exp.organLabel} · ${exp.activeSubModeLabel}${params.focusOrgan === 'semua' && exp.separatedCount > 0 ? ` (${exp.separatedCount} organ terpisah)` : ''}`,
    summaryOutputText: `${exp.activeStructure.name} — ${exp.activeStructure.functionSummary}`,
    rawNumbers: {
      inspectionMode: params.inspectionMode,
      focusOrgan: exp.organLabel,
      lungVariant: params.lungVariant,
      selectedStructureId: exp.activeStructure.id,
      separatedCount: exp.separatedCount,
      normalHR: NORMAL_HEART_RATE_BPM,
      normalCO: Number(exp.normalCardiacOutputLMin.toFixed(2)),
      normalRR: NORMAL_RESPIRATORY_RATE,
      flowStages: CARDIORESPIRATORY_FLOW.length,
      primaryValue: exp.availableStructureIds.length,
      primaryUnit: 'struktur',
    },
  };
}
