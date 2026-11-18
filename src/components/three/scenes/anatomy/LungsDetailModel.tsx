import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ANATOMY_DETAIL_MODEL_URLS,
  TRANSPARENT_LUNG_NODE_MAP,
} from '../../../../data/anatomyData';
import { NORMAL_RESPIRATORY_RATE } from '../../../../engines/biologyAnatomy';
import type { AnatomyLungVariant } from '../../../../types/lab';
import { CalloutPin } from '../../CalloutPin';
import { AnatomyModelFallback } from './AnatomyModelFallback';
import {
  cloneSceneMaterialsSafely,
  computeNormalizedTransform,
} from './normalizeModel';

interface LungsDetailModelProps {
  lungVariant: AnatomyLungVariant;
  selectedStructureId: string;
  showVectors: boolean;
  isSimRunning: boolean;
  onSelectStructure?: (structureId: string) => void;
}

const TRANSPARENT_LUNG_PIN_OFFSETS: Record<
  string,
  { offset: [number, number, number]; accent: 'teal' | 'charcoal' }
> = {
  Respiratoy_Trachea_Geo: { offset: [1.3, 0.5, 0.45], accent: 'teal' },
  Respiratoy_Bronchi_Geo_Right: { offset: [-1.45, 0.35, 0.55], accent: 'teal' },
  Respiratoy_Bronchi_Geo_Left: { offset: [1.45, 0.25, 0.55], accent: 'teal' },
  Respiratoy_Lung_Geo_Right: { offset: [-1.55, -0.55, 0.45], accent: 'charcoal' },
  Respiratoy_Lung_Geo_Left: { offset: [1.55, -0.55, 0.45], accent: 'charcoal' },
  Respiratoy_Thyroid_Cartliage_Geo: { offset: [-1.35, 0.85, 0.35], accent: 'charcoal' },
  Respiratoy_Epiglotis_Geo: { offset: [1.3, 0.9, -0.15], accent: 'teal' },
  Respiratoy_True_Vocal_Fold_Geo_Left: { offset: [-1.45, 0.05, -0.55], accent: 'charcoal' },
};

function findTransparentLungMeta(obj: THREE.Object3D | null) {
  let curr: THREE.Object3D | null = obj;
  while (curr) {
    if (curr.name && TRANSPARENT_LUNG_NODE_MAP[curr.name]) {
      return TRANSPARENT_LUNG_NODE_MAP[curr.name];
    }
    curr = curr.parent;
  }
  return null;
}

function NormalLungsContent({
  selectedStructureId,
  showVectors,
  isSimRunning,
  onSelectStructure,
}: Omit<LungsDetailModelProps, 'lungVariant'>) {
  const gltf = useGLTF(ANATOMY_DETAIL_MODEL_URLS.lungsNormal);
  const breathRef = useRef<THREE.Group | null>(null);

  const { clonedScene, norm } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloneSceneMaterialsSafely(cloned);
    const computedNorm = computeNormalizedTransform(cloned, 2.4, 1.5);
    return { clonedScene: cloned, norm: computedNorm };
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (!breathRef.current) return;
    if (isSimRunning) {
      const t = clock.getElapsedTime();
      const omega = (NORMAL_RESPIRATORY_RATE / 60) * Math.PI * 2;
      const b = 1 + Math.sin(t * omega) * 0.03;
      breathRef.current.scale.set(
        norm.scale * b,
        norm.scale * (1 + (b - 1) * 0.55),
        norm.scale * b,
      );
    } else {
      breathRef.current.scale.setScalar(norm.scale);
    }
  });

  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.42, 1.54, 0.12, 48]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.9} />
      </mesh>

      <group
        ref={breathRef}
        position={norm.position}
        scale={norm.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelectStructure?.('paru-kanan-utuh');
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
        position={[-0.62, 1.65, 0.25]}
        labelOffset={[-1.25, 0.65, 0.55]}
        label="Paru Kanan (3 Lobus)"
        accent={selectedStructureId === 'paru-kanan-utuh' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
      <CalloutPin
        position={[0.62, 1.65, 0.25]}
        labelOffset={[1.25, 0.65, 0.55]}
        label="Paru Kiri (2 Lobus)"
        accent={selectedStructureId === 'paru-kiri-utuh' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
      <CalloutPin
        position={[-0.45, 1.25, 0.4]}
        labelOffset={[-1.35, -0.45, 0.75]}
        label="Fisura & Pleura"
        accent={selectedStructureId === 'lung-normal-fissures' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
      <CalloutPin
        position={[0.45, 0.92, 0.25]}
        labelOffset={[1.35, -0.45, 0.65]}
        label="Basis & Apeks Paru"
        accent={selectedStructureId === 'lung-normal-apex-base' ? 'teal' : 'charcoal'}
        visible={showVectors}
      />
    </group>
  );
}

function TransparentLungsContent({
  selectedStructureId,
  showVectors,
  isSimRunning,
  onSelectStructure,
}: Omit<LungsDetailModelProps, 'lungVariant'>) {
  const gltf = useGLTF(ANATOMY_DETAIL_MODEL_URLS.lungsTransparent);
  const breathRef = useRef<THREE.Group | null>(null);
  const [hoveredStructureId, setHoveredStructureId] = useState<string | null>(null);

  const { clonedScene, norm, nodePins } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloneSceneMaterialsSafely(cloned);

    // Hitung transform normalisasi sebelum mengambil posisi pin
    const computedNorm = computeNormalizedTransform(cloned, 2.55, 1.54);

    // Hitung pusat tiap objek anatomi bernama dalam koordinat stage
    cloned.updateMatrixWorld(true);
    const pins: Array<{
      nodeName: string;
      structureId: string;
      label: string;
      position: [number, number, number];
      offset: [number, number, number];
      accent: 'teal' | 'charcoal';
    }> = [];

    for (const [nodeName, cfg] of Object.entries(TRANSPARENT_LUNG_PIN_OFFSETS)) {
      const node = cloned.getObjectByName(nodeName);
      const meta = TRANSPARENT_LUNG_NODE_MAP[nodeName];
      if (!node || !meta) continue;
      const box = new THREE.Box3().setFromObject(node);
      if (box.isEmpty()) continue;
      const c = new THREE.Vector3();
      box.getCenter(c);
      pins.push({
        nodeName,
        structureId: meta.structureId,
        label: meta.label,
        position: [
          c.x * computedNorm.scale + computedNorm.position[0],
          c.y * computedNorm.scale + computedNorm.position[1],
          c.z * computedNorm.scale + computedNorm.position[2],
        ],
        offset: cfg.offset,
        accent: cfg.accent,
      });
    }

    return { clonedScene: cloned, norm: computedNorm, nodePins: pins };
  }, [gltf.scene]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Atur transparansi parenkim paru luar + highlight node yang dipilih/di-hover
  useEffect(() => {
    for (const [nodeName, meta] of Object.entries(TRANSPARENT_LUNG_NODE_MAP)) {
      const node = clonedScene.getObjectByName(nodeName);
      if (!node) continue;

      const isActive =
        selectedStructureId === meta.structureId ||
        hoveredStructureId === meta.structureId;

      node.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          if (!mat) continue;
          const orig = mat.userData.__origMat as
            | {
                transparent: boolean;
                opacity: number;
                depthWrite: boolean;
                emissive: THREE.Color | null;
                emissiveIntensity: number;
              }
            | undefined;
          if (!orig) continue;

          if (meta.isOuterParenchyma) {
            mat.transparent = true;
            mat.opacity = isActive ? 0.42 : 0.24;
            mat.depthWrite = false;
          } else {
            mat.transparent = orig.transparent;
            mat.opacity = orig.opacity;
            mat.depthWrite = orig.depthWrite;
          }

          const stdMat = mat as THREE.MeshStandardMaterial;
          if ('emissive' in stdMat && stdMat.emissive && orig.emissive) {
            if (isActive) {
              stdMat.emissive.set('#0E5A63');
              stdMat.emissiveIntensity = meta.isOuterParenchyma ? 0.35 : 0.48;
            } else {
              stdMat.emissive.copy(orig.emissive);
              stdMat.emissiveIntensity = orig.emissiveIntensity;
            }
          }
          mat.needsUpdate = true;
        }
      });
    }
  }, [clonedScene, selectedStructureId, hoveredStructureId]);

  useFrame(({ clock }) => {
    if (!breathRef.current) return;
    if (isSimRunning) {
      const t = clock.getElapsedTime();
      const omega = (NORMAL_RESPIRATORY_RATE / 60) * Math.PI * 2;
      const b = 1 + Math.sin(t * omega) * 0.025;
      breathRef.current.scale.set(
        norm.scale * b,
        norm.scale * (1 + (b - 1) * 0.5),
        norm.scale * b,
      );
    } else {
      breathRef.current.scale.setScalar(norm.scale);
    }
  });

  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.42, 1.54, 0.12, 48]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.9} />
      </mesh>

      <group
        ref={breathRef}
        position={norm.position}
        scale={norm.scale}
        onClick={(e) => {
          e.stopPropagation();
          const meta = findTransparentLungMeta(e.object);
          if (meta) {
            onSelectStructure?.(meta.structureId);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          const meta = findTransparentLungMeta(e.object);
          if (meta) {
            setHoveredStructureId(meta.structureId);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHoveredStructureId(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Penamaan Objek Anatomi di Dalam Paru Transparan */}
      {nodePins.map((pin) => {
        const isActive =
          selectedStructureId === pin.structureId ||
          hoveredStructureId === pin.structureId;
        return (
          <CalloutPin
            key={pin.nodeName}
            position={pin.position}
            labelOffset={pin.offset}
            label={pin.label}
            value={isActive ? 'Aktif' : undefined}
            accent={isActive ? 'teal' : pin.accent}
            visible={showVectors || isActive}
          />
        );
      })}
    </group>
  );
}

export function LungsDetailModel({
  lungVariant,
  selectedStructureId,
  showVectors,
  isSimRunning,
  onSelectStructure,
}: LungsDetailModelProps) {
  return (
    <Suspense
      fallback={
        <AnatomyModelFallback
          label={
            lungVariant === 'transparan'
              ? 'Memuat Paru Transparan & Saluran Napas...'
              : 'Memuat Paru Normal 3D...'
          }
        />
      }
    >
      {lungVariant === 'transparan' ? (
        <TransparentLungsContent
          selectedStructureId={selectedStructureId}
          showVectors={showVectors}
          isSimRunning={isSimRunning}
          onSelectStructure={onSelectStructure}
        />
      ) : (
        <NormalLungsContent
          selectedStructureId={selectedStructureId}
          showVectors={showVectors}
          isSimRunning={isSimRunning}
          onSelectStructure={onSelectStructure}
        />
      )}
    </Suspense>
  );
}
