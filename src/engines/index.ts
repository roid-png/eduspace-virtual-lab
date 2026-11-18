import { computeAnatomyResult } from './biologyAnatomy';
import { computeCellResult } from './biologyCell';
import { computeGeometry3DResult } from './mathGeometry3d';
import { computeCircuitResult } from './physicsCircuit';
import { computeInclinedResult } from './physicsInclined';
import type { ComputedModuleResult, ModuleId, ModuleParamsMap } from '../types/lab';

export const DEFAULT_MODULE_PARAMS: ModuleParamsMap = {
  'physics-inclined': {
    objectType: 'barang',
    theta: 30,
    mass: 5.0,
    mu: 0.2,
    rampLengthMeters: 6.0,
  },
  'physics-circuit': {
    voltage: 12.0,
    r1: 10,
    r2: 20,
    r3: 20,
    mode: 'seri',
    hasSwitch: true,
    switchClosed: true,
    hasLamp: true,
    lampType: 'pijar-10',
    lampPlacement: 'utama',
  },
  'biology-anatomy': {
    inspectionMode: 'utuh',
    focusOrgan: 'semua',
    lungVariant: 'normal',
    separatedParts: [],
    selectedStructureId: 'ringkasan-toraks',
  },
  'biology-cell': {
    focusOrganelle: 'semua',
    lightCondition: 'terang',
  },
  'math-geometry3d': {
    subMode: 'transformasi',
    transformType: 'translasi',
    pointAx: 1,
    pointAy: 1,
    tx: 2.5,
    ty: 2.0,
    reflectionAxis: 'sumbu-y',
    rotationDeg: 90,
    dilationScale: 1.5,
    radius: 3.5,
    centralAngleDeg: 100,
    externalDistanceOffset: 2.5,
    showTangent: true,
    showChord: true,
  },
};

export function computeModuleResult<K extends ModuleId>(
  moduleId: K,
  params: ModuleParamsMap[K],
): ComputedModuleResult {
  switch (moduleId) {
    case 'physics-inclined':
      return computeInclinedResult(params as ModuleParamsMap['physics-inclined']);
    case 'physics-circuit':
      return computeCircuitResult(params as ModuleParamsMap['physics-circuit']);
    case 'biology-anatomy':
      return computeAnatomyResult(params as ModuleParamsMap['biology-anatomy']);
    case 'biology-cell':
      return computeCellResult(params as ModuleParamsMap['biology-cell']);
    case 'math-geometry3d':
      return computeGeometry3DResult(params as ModuleParamsMap['math-geometry3d']);
  }
}
