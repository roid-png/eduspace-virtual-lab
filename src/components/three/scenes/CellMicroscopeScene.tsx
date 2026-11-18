import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  PLANT_CELL_MODEL_URL,
  PLANT_CELL_ORGANELLES,
  resolveOrganelleFromGltfName,
} from '../../../data/plantCellData';
import type { CellParams, PlantCellOrganelleId } from '../../../types/lab';
import { CalloutPin } from '../CalloutPin';
import type { CameraFocusTarget } from '../IsometricStage';

interface CellMicroscopeSceneProps {
  params: CellParams;
  showVectors: boolean;
  isSimRunning: boolean;
  onSelectOrganelle?: (organelleId: PlantCellOrganelleId) => void;
  onCameraFocusChange?: (focus: CameraFocusTarget | null) => void;
}

interface OriginalMatSnapshot {
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;
  emissive: THREE.Color | null;
  emissiveIntensity: number;
}

function cloneMaterialsSafely(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    const cloneOne = (mat: THREE.Material): THREE.Material => {
      const cloned = mat.clone();
      const stdMat = cloned as THREE.MeshStandardMaterial;
      const snapshot: OriginalMatSnapshot = {
        transparent: cloned.transparent,
        opacity: cloned.opacity,
        depthWrite: cloned.depthWrite,
        emissive:
          'emissive' in stdMat && stdMat.emissive ? stdMat.emissive.clone() : null,
        emissiveIntensity:
          'emissiveIntensity' in stdMat && typeof stdMat.emissiveIntensity === 'number'
            ? stdMat.emissiveIntensity
            : 0,
      };
      cloned.userData.__origMatState = snapshot;
      return cloned;
    };

    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map(cloneOne);
    } else if (obj.material) {
      obj.material = cloneOne(obj.material);
    }
  });
}

function setNodeVisualState(
  node: THREE.Object3D,
  options: {
    opacityOverride?: number;
    emissiveHex?: string;
    emissiveIntensity?: number;
  },
): void {
  node.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat) continue;
      const orig = mat.userData.__origMatState as OriginalMatSnapshot | undefined;
      if (!orig) continue;

      if (options.opacityOverride !== undefined && options.opacityOverride < 1) {
        mat.transparent = true;
        mat.opacity = Math.min(orig.opacity, options.opacityOverride);
        mat.depthWrite = false;
      } else {
        mat.transparent = orig.transparent;
        mat.opacity = orig.opacity;
        mat.depthWrite = orig.depthWrite;
      }

      const stdMat = mat as THREE.MeshStandardMaterial;
      if ('emissive' in stdMat && stdMat.emissive) {
        if (options.emissiveHex && (options.emissiveIntensity ?? 0) > 0) {
          stdMat.emissive.set(options.emissiveHex);
          stdMat.emissiveIntensity = options.emissiveIntensity ?? 0.35;
        } else if (orig.emissive) {
          stdMat.emissive.copy(orig.emissive);
          stdMat.emissiveIntensity = orig.emissiveIntensity;
        } else {
          stdMat.emissive.set('#000000');
          stdMat.emissiveIntensity = 0;
        }
      }
      mat.needsUpdate = true;
    }
  });
}

function PlantCellGltfInner({
  params,
  showVectors,
  isSimRunning,
  onSelectOrganelle,
  onCameraFocusChange,
}: CellMicroscopeSceneProps) {
  const gltf = useGLTF(PLANT_CELL_MODEL_URL);
  const photonRefs = useRef<Array<THREE.Mesh | null>>([]);
  const photonPhaseRef = useRef(0);
  const pulsePhaseRef = useRef(0);

  // Kloning & normalisasi model GLTF sel tumbuhan secara deterministik (tanpa explode)
  const { normalizedScene, transformOffset, uniformScale, nodeMap, nodeCenters } =
    useMemo(() => {
      const cloned = gltf.scene.clone(true);
      cloneMaterialsSafely(cloned);
      cloned.updateMatrixWorld(true);

      const rawBox = new THREE.Box3().setFromObject(cloned);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      rawBox.getSize(size);
      rawBox.getCenter(center);

      const maxSpan = Math.max(size.x, size.y, size.z, 0.001);
      const scale = 3.85 / maxSpan;
      const offset: [number, number, number] = [
        -center.x * scale,
        0.18 - rawBox.min.y * scale,
        -center.z * scale,
      ];

      // Hitung pusat dunia nyata setiap organel setelah transform normalisasi
      const wrapper = new THREE.Group();
      wrapper.position.set(...offset);
      wrapper.scale.setScalar(scale);
      wrapper.add(cloned);
      wrapper.updateMatrixWorld(true);

      const map = new Map<PlantCellOrganelleId, THREE.Object3D[]>();
      const centers: Partial<Record<PlantCellOrganelleId, [number, number, number]>> =
        {};

      for (const info of Object.values(PLANT_CELL_ORGANELLES)) {
        if (info.id === 'semua' || info.gltfNodes.length === 0) continue;
        const found: THREE.Object3D[] = [];
        for (const nodeName of info.gltfNodes) {
          const obj = cloned.getObjectByName(nodeName);
          if (obj) found.push(obj);
        }
        if (found.length > 0) {
          map.set(info.id, found);
          const unionBox = new THREE.Box3();
          for (const node of found) {
            unionBox.expandByObject(node);
          }
          const nodeCenter = new THREE.Vector3();
          unionBox.getCenter(nodeCenter);
          centers[info.id] = [nodeCenter.x, nodeCenter.y, nodeCenter.z];
        }
      }

      const wholeCenter = new THREE.Vector3();
      const wholeBox = new THREE.Box3().setFromObject(wrapper);
      wholeBox.getCenter(wholeCenter);
      centers.semua = [wholeCenter.x, wholeCenter.y, wholeCenter.z];

      // Lepaskan kembali agar React Three Fiber mengelola mounting via <primitive>
      wrapper.remove(cloned);

      return {
        normalizedScene: cloned,
        transformOffset: offset,
        uniformScale: scale,
        nodeMap: map,
        nodeCenters: centers,
      };
    }, [gltf.scene]);

  const [hoveredId, setHoveredId] = useState<PlantCellOrganelleId | null>(null);

  // Terapkan sorotan organel aktif, transparansi lapisan pelindung saat fokus organel dalam, & efek cahaya
  useEffect(() => {
    const activeInfo =
      PLANT_CELL_ORGANELLES[params.focusOrganelle] ?? PLANT_CELL_ORGANELLES.semua;
    const isFocused = params.focusOrganelle !== 'semua';

    for (const [id, nodes] of nodeMap.entries()) {
      const isSelected = id === params.focusOrganelle;
      const isHovered = id === hoveredId;

      let opacityOverride: number | undefined;
      let emissiveHex: string | undefined;
      let emissiveIntensity = 0;

      if (isFocused) {
        if (isSelected) {
          emissiveHex = '#0E5A63';
          emissiveIntensity = 0.42;
        } else if (
          activeInfo.isInnerStructure &&
          (id === 'cell-wall' || id === 'cytoplasm')
        ) {
          opacityOverride = 0.22;
        } else {
          opacityOverride = 0.48;
        }
      }

      if (isHovered && !isSelected) {
        emissiveHex = '#197D88';
        emissiveIntensity = Math.max(emissiveIntensity, 0.25);
      }

      // Respon visual kondisi cahaya (Terang -> Kloroplas aktif, Gelap -> Mitokondria dominan)
      if (params.lightCondition === 'terang' && id === 'chloroplast') {
        emissiveHex = isSelected ? '#1C9B68' : '#2E8B57';
        emissiveIntensity = Math.max(emissiveIntensity, isSelected ? 0.55 : 0.34);
      } else if (params.lightCondition === 'gelap' && id === 'mitochondria') {
        emissiveHex = isSelected ? '#D97706' : '#B45309';
        emissiveIntensity = Math.max(emissiveIntensity, isSelected ? 0.55 : 0.35);
      }

      for (const n of nodes) {
        setNodeVisualState(n, {
          opacityOverride,
          emissiveHex,
          emissiveIntensity,
        });
      }
    }
  }, [params.focusOrganelle, params.lightCondition, hoveredId, nodeMap]);

  // Sinkronkan target kamera Auto-Zoom setiap kali organel fokus berubah
  useEffect(() => {
    if (!onCameraFocusChange) return;
    const info =
      PLANT_CELL_ORGANELLES[params.focusOrganelle] ?? PLANT_CELL_ORGANELLES.semua;
    const target = nodeCenters[params.focusOrganelle] ??
      nodeCenters.semua ?? [0, 0.85, 0];

    onCameraFocusChange({
      target,
      zoomMultiplier: info.zoomMultiplier,
      focusKey: `${params.focusOrganelle}`,
    });
  }, [params.focusOrganelle, nodeCenters, onCameraFocusChange]);

  // Animasi partikel foton (Terang) & denyut metabolik halus
  useFrame((_state, delta) => {
    const speed = isSimRunning ? 1 : 0.25;
    photonPhaseRef.current = (photonPhaseRef.current + delta * 0.45 * speed) % 1;
    pulsePhaseRef.current += delta * 2.2 * speed;

    if (params.lightCondition === 'terang') {
      const targetAnchor = nodeCenters.chloroplast ?? [0, 0.9, 0];
      photonRefs.current.forEach((mesh, idx) => {
        if (!mesh) return;
        const t = (photonPhaseRef.current + idx / 6) % 1;
        const spreadX = ((idx % 3) - 1) * 0.52;
        const spreadZ = (Math.floor(idx / 3) - 0.5) * 0.52;
        const x = targetAnchor[0] + spreadX * (1 - t * 0.55);
        const y = 3.2 - t * (3.2 - targetAnchor[1]);
        const z = targetAnchor[2] + spreadZ * (1 - t * 0.55);
        mesh.position.set(x, y, z);
        const s = 0.8 + Math.sin(t * Math.PI) * 0.45;
        mesh.scale.setScalar(s);
      });
    }
  });

  const handleMeshClick = (e: ThreeEvent<MouseEvent>) => {
    if (!onSelectOrganelle) return;
    e.stopPropagation();
    let curr: THREE.Object3D | null = e.object;
    while (curr) {
      const resolved = resolveOrganelleFromGltfName(curr.name);
      if (resolved) {
        onSelectOrganelle(resolved);
        return;
      }
      curr = curr.parent;
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    let curr: THREE.Object3D | null = e.object;
    while (curr) {
      const resolved = resolveOrganelleFromGltfName(curr.name);
      if (resolved) {
        if (hoveredId !== resolved) setHoveredId(resolved);
        document.body.style.cursor = 'pointer';
        return;
      }
      curr = curr.parent;
    }
  };

  const handlePointerOut = () => {
    setHoveredId(null);
    document.body.style.cursor = 'auto';
  };

  const activeInfo =
    PLANT_CELL_ORGANELLES[params.focusOrganelle] ?? PLANT_CELL_ORGANELLES.semua;
  const focusedPos = nodeCenters[params.focusOrganelle];

  return (
    <group>
      {/* Alas Kaca Preparat Matte Soft Tactile */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.95, 3.05, 0.14, 56]} />
        <meshStandardMaterial
          color={params.lightCondition === 'gelap' ? '#C7C3B7' : '#E3DED2'}
          roughness={0.88}
        />
      </mesh>

      {/* Model 3D Plant Cell (GLTF Realistis Tanpa Explode) */}
      <group
        position={transformOffset}
        scale={[uniformScale, uniformScale, uniformScale]}
        onClick={handleMeshClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <primitive object={normalizedScene} />
      </group>

      {/* Efek Sinar & Foton saat Kondisi Terkena Cahaya */}
      {params.lightCondition === 'terang' ? (
        <group>
          <mesh position={[-0.2, 2.3, -0.1]} rotation={[0.1, 0, -0.18]}>
            <coneGeometry args={[1.45, 2.7, 28, 1, true]} />
            <meshBasicMaterial
              color="#FCE883"
              transparent
              opacity={0.11}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {Array.from({ length: 6 }).map((_, idx) => (
            <mesh
              key={`photon-${idx}`}
              ref={(el) => {
                photonRefs.current[idx] = el;
              }}
            >
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial
                color="#FBBF24"
                emissive="#F59E0B"
                emissiveIntensity={1.1}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>
      ) : null}

      {/* Pin Label 3D */}
      {params.focusOrganelle === 'semua' ? (
        <>
          {nodeCenters.nucleus ? (
            <CalloutPin
              position={nodeCenters.nucleus}
              labelOffset={[1.35, 1.05, -0.95]}
              label="Nukleus"
              value="Pusat DNA"
              showPointerArrow
              visible={showVectors}
            />
          ) : null}
          {nodeCenters.chloroplast ? (
            <CalloutPin
              position={nodeCenters.chloroplast}
              labelOffset={[-1.45, 0.92, 0.85]}
              label="Kloroplas"
              value={params.lightCondition === 'terang' ? 'Fotosintesis Aktif' : 'Istirahat'}
              showPointerArrow
              visible={showVectors}
            />
          ) : null}
          {nodeCenters.vacuole ? (
            <CalloutPin
              position={nodeCenters.vacuole}
              labelOffset={[1.55, 0.65, 1.05]}
              label="Vakuola"
              value="Turgor Sel"
              accent="charcoal"
              showPointerArrow
              visible={showVectors}
            />
          ) : null}
          {nodeCenters.mitochondria ? (
            <CalloutPin
              position={nodeCenters.mitochondria}
              labelOffset={[-1.25, 1.05, -1.05]}
              label="Mitokondria"
              value={params.lightCondition === 'gelap' ? 'ATP Utama' : 'Respirasi'}
              accent="charcoal"
              showPointerArrow
              visible={showVectors}
            />
          ) : null}
        </>
      ) : focusedPos ? (
        <CalloutPin
          position={focusedPos}
          labelOffset={[1.1, 0.85, -0.75]}
          label={activeInfo.shortLabel}
          value={params.lightCondition === 'terang' ? 'Terkena Cahaya' : 'Gelap'}
          showPointerArrow
          visible={showVectors}
        />
      ) : null}
    </group>
  );
}

export function CellMicroscopeScene(props: CellMicroscopeSceneProps) {
  return (
    <Suspense fallback={null}>
      <PlantCellGltfInner {...props} />
    </Suspense>
  );
}

useGLTF.preload(PLANT_CELL_MODEL_URL);
