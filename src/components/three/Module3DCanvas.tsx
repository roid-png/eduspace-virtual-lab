import { useCallback, useState } from 'react';
import type {
  AnatomySeparablePart,
  ModuleId,
  ModuleParamsMap,
  PlantCellOrganelleId,
} from '../../types/lab';
import { IsometricStage } from './IsometricStage';
import type { CameraFocusTarget } from './IsometricStage';
import { CellMicroscopeScene } from './scenes/CellMicroscopeScene';
import { ElectricCircuitScene } from './scenes/ElectricCircuitScene';
import { Geometry3DScene } from './scenes/Geometry3DScene';
import { HumanAnatomyScene } from './scenes/HumanAnatomyScene';
import { InclinedPlaneScene } from './scenes/InclinedPlaneScene';

interface Module3DCanvasProps {
  moduleId: ModuleId;
  paramsMap: ModuleParamsMap;
  showVectors: boolean;
  isSimRunning: boolean;
  resetTick: number;
  zoom?: number;
  onAnatomyOrganClick?: (part: AnatomySeparablePart) => void;
  onAnatomyStructureSelect?: (structureId: string) => void;
  onCircuitSwitchToggle?: () => void;
  onCellOrganelleSelect?: (organelleId: PlantCellOrganelleId) => void;
}

export function Module3DCanvas({
  moduleId,
  paramsMap,
  showVectors,
  isSimRunning,
  resetTick,
  zoom = 52,
  onAnatomyOrganClick,
  onAnatomyStructureSelect,
  onCircuitSwitchToggle,
  onCellOrganelleSelect,
}: Module3DCanvasProps) {
  const [cellCameraFocus, setCellCameraFocus] = useState<CameraFocusTarget | null>(null);

  const handleCellCameraFocusChange = useCallback(
    (focus: CameraFocusTarget | null) => {
      setCellCameraFocus(focus);
    },
    [],
  );

  const isPlantCellDark =
    moduleId === 'biology-cell' &&
    paramsMap['biology-cell'].lightCondition === 'gelap';

  return (
    <IsometricStage
      resetTick={resetTick}
      zoom={zoom}
      cameraFocus={moduleId === 'biology-cell' ? cellCameraFocus : null}
      dimmedLighting={isPlantCellDark}
    >
      {moduleId === 'physics-inclined' ? (
        <InclinedPlaneScene
          params={paramsMap['physics-inclined']}
          showVectors={showVectors}
          isSimRunning={isSimRunning}
        />
      ) : null}

      {moduleId === 'physics-circuit' ? (
        <ElectricCircuitScene
          params={paramsMap['physics-circuit']}
          showVectors={showVectors}
          isSimRunning={isSimRunning}
          onToggleSwitch={onCircuitSwitchToggle}
        />
      ) : null}

      {moduleId === 'biology-anatomy' ? (
        <HumanAnatomyScene
          params={paramsMap['biology-anatomy']}
          showVectors={showVectors}
          isSimRunning={isSimRunning}
          onOrganClick={onAnatomyOrganClick}
          onSelectStructure={onAnatomyStructureSelect}
        />
      ) : null}

      {moduleId === 'biology-cell' ? (
        <CellMicroscopeScene
          params={paramsMap['biology-cell']}
          showVectors={showVectors}
          isSimRunning={isSimRunning}
          onSelectOrganelle={onCellOrganelleSelect}
          onCameraFocusChange={handleCellCameraFocusChange}
        />
      ) : null}

      {moduleId === 'math-geometry3d' ? (
        <Geometry3DScene
          params={paramsMap['math-geometry3d']}
          showVectors={showVectors}
        />
      ) : null}
    </IsometricStage>
  );
}
