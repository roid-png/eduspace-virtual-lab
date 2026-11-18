export type ViewStage = 'landing' | 'catalog' | 'workspace' | 'analysis' | 'worksheet';

export type SubjectCategory = 'fisika' | 'biologi' | 'matematika';

export type CatalogFilter = 'semua' | SubjectCategory;

export type ModuleId =
  | 'physics-inclined'
  | 'physics-circuit'
  | 'biology-anatomy'
  | 'biology-cell'
  | 'math-geometry3d';

export type InclinedObjectType = 'barang' | 'mobil';

export interface InclinedParams {
  objectType: InclinedObjectType;
  theta: number;
  mass: number;
  mu: number;
  rampLengthMeters: number;
}

export type CircuitMode = 'seri' | 'paralel' | 'campuran';

export type CircuitLampType = 'led-5' | 'pijar-10' | 'halogen-20';

export type CircuitLampPlacement = 'utama' | 'cabang';

export interface CircuitParams {
  voltage: number;
  r1: number;
  r2: number;
  r3: number;
  mode: CircuitMode;
  hasSwitch: boolean;
  switchClosed: boolean;
  hasLamp: boolean;
  lampType: CircuitLampType;
  lampPlacement: CircuitLampPlacement;
}

export type AnatomyInspectionMode = 'utuh' | 'pisahkan' | 'belah';

export type AnatomyOrganKey = 'semua' | 'jantung' | 'paru' | 'aorta';

export type AnatomyLungVariant = 'normal' | 'transparan';

export type AnatomySeparablePart = 'jantung' | 'paru-kanan' | 'paru-kiri' | 'aorta';

export interface AnatomyParams {
  inspectionMode: AnatomyInspectionMode;
  focusOrgan: AnatomyOrganKey;
  lungVariant: AnatomyLungVariant;
  separatedParts: AnatomySeparablePart[];
  selectedStructureId: string;
}

export interface ModuleExploredItem {
  id: string;
  moduleId: ModuleId;
  title: string;
  subtitle: string;
  summaryLine: string;
  inputSummary: string;
  outputSummary: string;
  formulaText: string;
  formulaLatex?: string;
  primaryNumericValue: number;
  primaryUnit: string;
  recordKind: 'numeric' | 'anatomy';
  anatomyRecord?: AnatomyRecordPayload;
  selectedForSummary: boolean;
  clickedAt: string;
}

/** @deprecated Gunakan ModuleExploredItem */
export type AnatomyExploredItem = ModuleExploredItem;

export type PlantCellLightCondition = 'terang' | 'gelap';

export type PlantCellOrganelleId =
  | 'semua'
  | 'cell-wall'
  | 'cytoplasm'
  | 'nucleus'
  | 'chloroplast'
  | 'vacuole'
  | 'mitochondria'
  | 'rough-er'
  | 'smooth-er'
  | 'golgi'
  | 'ribosomes'
  | 'lysosome'
  | 'peroxisome'
  | 'plasmodesma';

export interface CellParams {
  focusOrganelle: PlantCellOrganelleId;
  lightCondition: PlantCellLightCondition;
}

export type GeometrySubMode = 'transformasi' | 'lingkaran';

export type TransformType = 'translasi' | 'refleksi' | 'rotasi' | 'dilatasi';

export type ReflectionAxis = 'sumbu-x' | 'sumbu-y' | 'y=x' | 'y=-x';

export interface Geometry3DParams {
  subMode: GeometrySubMode;
  transformType: TransformType;
  pointAx: number;
  pointAy: number;
  tx: number;
  ty: number;
  reflectionAxis: ReflectionAxis;
  rotationDeg: number;
  dilationScale: number;
  radius: number;
  centralAngleDeg: number;
  externalDistanceOffset: number;
  showTangent: boolean;
  showChord: boolean;
}

export interface ModuleParamsMap {
  'physics-inclined': InclinedParams;
  'physics-circuit': CircuitParams;
  'biology-anatomy': AnatomyParams;
  'biology-cell': CellParams;
  'math-geometry3d': Geometry3DParams;
}

export interface ComputedMetric {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ChartData {
  title: string;
  subtitle: string;
  xLabel: string;
  yLabel: string;
  points: Array<{ x: number; y: number }>;
  activePoint: { x: number; y: number };
  referenceLineY?: number;
  referenceLabel?: string;
  activeTooltipText: string;
}

export interface ComputedModuleResult {
  equationTitle: string;
  equationBadge: string;
  primaryEquation: string;
  primaryLatex?: string;
  calloutPrimary: string;
  calloutSecondary: string;
  metrics: ComputedMetric[];
  copilotInsight: string;
  chart: ChartData;
  summaryInputText: string;
  summaryOutputText: string;
  rawNumbers: Record<string, number | string>;
}

export interface GuidedStepDef {
  step: 1 | 2 | 3 | 4;
  shortLabel: string;
  instruction: string;
}

export interface ModuleDefinition {
  id: ModuleId;
  subject: SubjectCategory;
  categoryLabel: string;
  title: string;
  shortTitle: string;
  description: string;
  previewBadge: string;
  stageTag: string;
  constantBadge: string;
  quickActions: string[];
  guidedSteps: GuidedStepDef[];
}

export interface AnatomyRecordPayload {
  organAndMode: string;
  identifiedStructures: string;
  physiologicalFunction: string;
}

export interface ExperimentRecord {
  id: string;
  moduleId: ModuleId;
  moduleTitle: string;
  subject: SubjectCategory;
  timestamp: string;
  inputSummary: string;
  outputSummary: string;
  primaryNumericValue: number;
  primaryUnit: string;
  formulaText: string;
  recordKind?: 'numeric' | 'anatomy';
  anatomyRecord?: AnatomyRecordPayload;
}

export interface ChatMessage {
  id: string;
  role: 'student' | 'assistant';
  text: string;
  formulaChip?: string;
  timestamp: string;
  verifiedLabel?: string;
}
