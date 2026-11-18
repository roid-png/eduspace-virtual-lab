import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  ANATOMY_DETAIL_MODEL_URLS,
  HEART_JOINT_PINS,
} from '../../../../data/anatomyData';
import { CalloutPin } from '../../CalloutPin';
import { AnatomyModelFallback } from './AnatomyModelFallback';
import {
  cloneSceneMaterialsSafely,
  computeNormalizedTransform,
  findNodeBySanitizedName,
} from './normalizeModel';

interface HeartDetailModelProps {
  selectedStructureId: string;
  showVectors: boolean;
  isSimRunning: boolean;
  onSelectStructure?: (structureId: string) => void;
}

const _worldPos = new THREE.Vector3();

function HeartDetailContent({
  selectedStructureId,
  showVectors,
  isSimRunning,
  onSelectStructure,
}: HeartDetailModelProps) {
  const gltf = useGLTF(ANATOMY_DETAIL_MODEL_URLS.heart);
  const stageGroupRef = useRef<THREE.Group | null>(null);
  const pinGroupRefs = useRef<Record<string, THREE.Group | null>>({});

  const { clonedScene, norm, mixer } = useMemo(() => {
    const cloned = cloneSkeleton(gltf.scene);
    cloneSceneMaterialsSafely(cloned);
    const computedNorm = computeNormalizedTransform(cloned, 2.35, 1.52);

    const animMixer = new THREE.AnimationMixer(cloned);
    const firstClip = gltf.animations[0];
    if (firstClip) {
      animMixer.clipAction(firstClip).play();
    }

    return { clonedScene: cloned, norm: computedNorm, mixer: animMixer };
  }, [gltf.scene, gltf.animations]);

  useEffect(() => {
    return () => {
      mixer.stopAllAction();
    };
  }, [mixer]);

  const jointObjects = useMemo(() => {
    const map: Record<string, THREE.Object3D | undefined> = {};
    for (const pin of HEART_JOINT_PINS) {
      map[pin.jointName] = findNodeBySanitizedName(clonedScene, pin.jointName);
    }
    return map;
  }, [clonedScene]);

  const syncPinPositions = useCallback(() => {
    const stage = stageGroupRef.current;
    if (!stage) return;
    stage.updateMatrixWorld(true);
    for (const pin of HEART_JOINT_PINS) {
      const joint = jointObjects[pin.jointName];
      const pinGroup = pinGroupRefs.current[pin.structureId];
      if (!joint || !pinGroup) continue;
      joint.getWorldPosition(_worldPos);
      stage.worldToLocal(_worldPos);
      pinGroup.position.copy(_worldPos);
    }
  }, [jointObjects]);

  useEffect(() => {
    syncPinPositions();
  }, [syncPinPositions]);

  useFrame((_, delta) => {
    if (isSimRunning) {
      mixer.update(Math.min(delta, 0.05));
    }
    syncPinPositions();
  });

  return (
    <group ref={stageGroupRef}>
      {/* Alas Penopang Spesimen Jantung */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.38, 1.5, 0.12, 48]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.9} />
      </mesh>

      <group
        position={norm.position}
        scale={norm.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelectStructure?.('heart-muscle');
        }}
      >
        <primitive object={clonedScene} />
      </group>

      {/* CalloutPin & Titik Klik Mengikuti Bone Joints Jantung */}
      {HEART_JOINT_PINS.map((pin) => {
        const isSelected = selectedStructureId === pin.structureId;
        return (
          <group
            key={pin.structureId}
            ref={(el) => {
              pinGroupRefs.current[pin.structureId] = el;
            }}
          >
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectStructure?.(pin.structureId);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <CalloutPin
              position={[0, 0, 0]}
              labelOffset={pin.labelOffset}
              label={pin.label}
              value={isSelected ? 'Dipilih' : undefined}
              accent={isSelected ? 'teal' : pin.accent}
              visible={showVectors || isSelected}
            />
          </group>
        );
      })}
    </group>
  );
}

export function HeartDetailModel(props: HeartDetailModelProps) {
  return (
    <Suspense fallback={<AnatomyModelFallback label="Memuat model Jantung 3D..." />}>
      <HeartDetailContent {...props} />
    </Suspense>
  );
}
