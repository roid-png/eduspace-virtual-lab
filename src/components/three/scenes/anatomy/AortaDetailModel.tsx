import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ANATOMY_DETAIL_MODEL_URLS } from '../../../../data/anatomyData';
import { NORMAL_HEART_RATE_BPM } from '../../../../engines/biologyAnatomy';
import { CalloutPin } from '../../CalloutPin';
import { AnatomyModelFallback } from './AnatomyModelFallback';
import {
  cloneSceneMaterialsSafely,
  computeNormalizedTransform,
} from './normalizeModel';

interface AortaDetailModelProps {
  selectedStructureId: string;
  showVectors: boolean;
  isSimRunning: boolean;
  onSelectStructure?: (structureId: string) => void;
}

function AortaDetailContent({
  selectedStructureId,
  showVectors,
  isSimRunning,
  onSelectStructure,
}: AortaDetailModelProps) {
  const gltf = useGLTF(ANATOMY_DETAIL_MODEL_URLS.aorta);
  const pulseRef = useRef<THREE.Group | null>(null);

  const { clonedScene, norm } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloneSceneMaterialsSafely(cloned);
    const computedNorm = computeNormalizedTransform(cloned, 2.35, 1.5);
    return { clonedScene: cloned, norm: computedNorm };
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    if (isSimRunning) {
      const t = clock.getElapsedTime();
      const omega = (NORMAL_HEART_RATE_BPM / 60) * Math.PI * 2;
      const p = 1 + Math.pow(Math.max(0, Math.sin(t * omega)), 6) * 0.025;
      pulseRef.current.scale.setScalar(norm.scale * p);
    } else {
      pulseRef.current.scale.setScalar(norm.scale);
    }
  });

  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.38, 1.5, 0.12, 48]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.9} />
      </mesh>

      <group
        ref={pulseRef}
        position={norm.position}
        scale={norm.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelectStructure?.('aorta-utuh');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <primitive object={clonedScene} />
      </group>

      <CalloutPin
        position={[0.05, 2.02, 0.1]}
        labelOffset={[-1.15, 0.45, 0.45]}
        label="Lengkung Aorta"
        accent={selectedStructureId === 'aorta-utuh' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
      <CalloutPin
        position={[0.15, 2.35, 0.0]}
        labelOffset={[1.15, 0.35, 0.35]}
        label="Cabang Arteri Kepala"
        accent={selectedStructureId === 'aorta-branches' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
      <CalloutPin
        position={[-0.2, 1.52, -0.1]}
        labelOffset={[-1.3, -0.15, 0.65]}
        label="Zona Koarktasio"
        value={selectedStructureId === 'aorta-coarctation' ? 'Aktif' : undefined}
        accent={selectedStructureId === 'aorta-coarctation' ? 'teal' : 'charcoal'}
        visible={showVectors || selectedStructureId === 'aorta-coarctation'}
      />
      <CalloutPin
        position={[-0.1, 0.95, -0.15]}
        labelOffset={[1.2, -0.35, 0.55]}
        label="Aorta Desendens"
        accent={selectedStructureId === 'lumen-aorta' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
    </group>
  );
}

export function AortaDetailModel(props: AortaDetailModelProps) {
  return (
    <Suspense fallback={<AnatomyModelFallback label="Memuat model Aorta 3D..." />}>
      <AortaDetailContent {...props} />
    </Suspense>
  );
}
