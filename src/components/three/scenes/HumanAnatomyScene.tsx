import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ANATOMY_GLB_NODES,
  ANATOMY_MODEL_URL,
  ANATOMY_STRUCTURES,
  ORGAN_EXPLODE_OFFSETS,
} from '../../../data/anatomyData';
import {
  NORMAL_HEART_RATE_BPM,
  NORMAL_RESPIRATORY_RATE,
} from '../../../engines/biologyAnatomy';
import type { AnatomyParams, AnatomySeparablePart } from '../../../types/lab';
import { CalloutPin } from '../CalloutPin';
import { ProjectedHtml3D } from '../ProjectedHtml3D';
import { AortaDetailModel } from './anatomy/AortaDetailModel';
import { HeartDetailModel } from './anatomy/HeartDetailModel';
import { LungsDetailModel } from './anatomy/LungsDetailModel';

interface HumanAnatomySceneProps {
  params: AnatomyParams;
  showVectors: boolean;
  isSimRunning: boolean;
  onOrganClick?: (part: AnatomySeparablePart) => void;
  onSelectStructure?: (structureId: string) => void;
}

interface OriginalMatState {
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
      const snapshot: OriginalMatState = {
        transparent: cloned.transparent,
        opacity: cloned.opacity,
        depthWrite: cloned.depthWrite,
        emissive: 'emissive' in stdMat && stdMat.emissive ? stdMat.emissive.clone() : null,
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

function applyOrganMaterialVisuals(
  nodes: Array<THREE.Object3D | undefined>,
  isDimmed: boolean,
  dimOpacity: number,
  isHighlighted: boolean,
): void {
  for (const node of nodes) {
    if (!node) continue;
    node.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of mats) {
        if (!mat) continue;
        const orig = mat.userData.__origMatState as OriginalMatState | undefined;
        if (!orig) continue;

        if (isDimmed) {
          mat.transparent = true;
          mat.opacity = Math.min(orig.opacity, dimOpacity);
          mat.depthWrite = false;
        } else {
          mat.transparent = orig.transparent;
          mat.opacity = orig.opacity;
          mat.depthWrite = orig.depthWrite;
        }

        const stdMat = mat as THREE.MeshStandardMaterial;
        if ('emissive' in stdMat && stdMat.emissive && orig.emissive) {
          if (isHighlighted) {
            stdMat.emissive.set('#0E5A63');
            stdMat.emissiveIntensity = 0.22;
          } else {
            stdMat.emissive.copy(orig.emissive);
            stdMat.emissiveIntensity = orig.emissiveIntensity;
          }
        }
        mat.needsUpdate = true;
      }
    });
  }
}

function AnatomyLoadingFallback() {
  return (
    <group position={[0, 1.35, 0]}>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#E3DED2" roughness={0.9} transparent opacity={0.65} />
      </mesh>
      <ProjectedHtml3D center position={[0, 0.75, 0]}>
        <div
          className="rounded-full px-3 py-1 font-code text-[11px] font-semibold"
          style={{
            backgroundColor: '#F6F3EC',
            color: '#0E5A63',
            boxShadow: '3px 3px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.85)',
          }}
        >
          Memuat model 3D anatomi...
        </div>
      </ProjectedHtml3D>
    </group>
  );
}

function AnatomyGlbContent({
  params,
  showVectors,
  isSimRunning,
  onOrganClick,
}: HumanAnatomySceneProps) {
  const gltf = useGLTF(ANATOMY_MODEL_URL);
  const [hoveredPart, setHoveredPart] = useState<AnatomySeparablePart | null>(null);

  const jantungGroupRef = useRef<THREE.Group | null>(null);
  const paruKananGroupRef = useRef<THREE.Group | null>(null);
  const paruKiriGroupRef = useRef<THREE.Group | null>(null);
  const aortaGroupRef = useRef<THREE.Group | null>(null);

  const {
    aortaUtuh,
    aortaDepan,
    aortaDalam,
    jantungUtuh,
    jantungDepan,
    jantungDalam,
    paruKananUtuh,
    paruKananDepan,
    paruKananDalam,
    paruKiriUtuh,
    paruKiriDepan,
    paruKiriDalam,
  } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloneMaterialsSafely(cloned);

    return {
      aortaUtuh: cloned.getObjectByName(ANATOMY_GLB_NODES.aorta.utuh),
      aortaDepan: cloned.getObjectByName(ANATOMY_GLB_NODES.aorta.depan),
      aortaDalam: cloned.getObjectByName(ANATOMY_GLB_NODES.aorta.dalam),
      jantungUtuh: cloned.getObjectByName(ANATOMY_GLB_NODES.jantung.utuh),
      jantungDepan: cloned.getObjectByName(ANATOMY_GLB_NODES.jantung.depan),
      jantungDalam: cloned.getObjectByName(ANATOMY_GLB_NODES.jantung.dalam),
      paruKananUtuh: cloned.getObjectByName(ANATOMY_GLB_NODES.paruKanan.utuh),
      paruKananDepan: cloned.getObjectByName(ANATOMY_GLB_NODES.paruKanan.depan),
      paruKananDalam: cloned.getObjectByName(ANATOMY_GLB_NODES.paruKanan.dalam),
      paruKiriUtuh: cloned.getObjectByName(ANATOMY_GLB_NODES.paruKiri.utuh),
      paruKiriDepan: cloned.getObjectByName(ANATOMY_GLB_NODES.paruKiri.depan),
      paruKiriDalam: cloned.getObjectByName(ANATOMY_GLB_NODES.paruKiri.dalam),
    };
  }, [gltf.scene]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Sinkronisasi visibilitas 12 node & highlight fokus/hover
  useEffect(() => {
    const isCutaway = params.inspectionMode === 'belah';

    const setGroupVis = (
      utuh: THREE.Object3D | undefined,
      depan: THREE.Object3D | undefined,
      dalam: THREE.Object3D | undefined,
    ) => {
      if (utuh) utuh.visible = !isCutaway;
      if (depan) depan.visible = false;
      if (dalam) dalam.visible = isCutaway;
    };

    setGroupVis(aortaUtuh, aortaDepan, aortaDalam);
    setGroupVis(jantungUtuh, jantungDepan, jantungDalam);
    setGroupVis(paruKananUtuh, paruKananDepan, paruKananDalam);
    setGroupVis(paruKiriUtuh, paruKiriDepan, paruKiriDalam);

    const hasFocus = params.focusOrgan !== 'semua';
    const dimOpacity = params.inspectionMode === 'utuh' ? 0.24 : 0.42;

    applyOrganMaterialVisuals(
      [jantungUtuh, jantungDepan, jantungDalam],
      hasFocus && params.focusOrgan !== 'jantung',
      dimOpacity,
      hoveredPart === 'jantung' || params.focusOrgan === 'jantung',
    );
    applyOrganMaterialVisuals(
      [paruKananUtuh, paruKananDepan, paruKananDalam],
      hasFocus && params.focusOrgan !== 'paru',
      dimOpacity,
      hoveredPart === 'paru-kanan' || params.focusOrgan === 'paru',
    );
    applyOrganMaterialVisuals(
      [paruKiriUtuh, paruKiriDepan, paruKiriDalam],
      hasFocus && params.focusOrgan !== 'paru',
      dimOpacity,
      hoveredPart === 'paru-kiri' || params.focusOrgan === 'paru',
    );
    applyOrganMaterialVisuals(
      [aortaUtuh, aortaDepan, aortaDalam],
      hasFocus && params.focusOrgan !== 'aorta',
      dimOpacity,
      hoveredPart === 'aorta' || params.focusOrgan === 'aorta',
    );
  }, [
    params.inspectionMode,
    params.focusOrgan,
    hoveredPart,
    aortaUtuh,
    aortaDepan,
    aortaDalam,
    jantungUtuh,
    jantungDepan,
    jantungDalam,
    paruKananUtuh,
    paruKananDepan,
    paruKananDalam,
    paruKiriUtuh,
    paruKiriDepan,
    paruKiriDalam,
  ]);

  useFrame(({ clock }, delta) => {
    const step = Math.min(1, delta * 7.5);
    const isSeparateMode = params.inspectionMode === 'pisahkan';

    const lerpOrganPos = (
      group: THREE.Group | null,
      part: AnatomySeparablePart,
    ) => {
      if (!group) return;
      const shouldSeparate = isSeparateMode && params.separatedParts.includes(part);
      const target = shouldSeparate ? ORGAN_EXPLODE_OFFSETS[part] : [0, 0, 0];
      group.position.x = THREE.MathUtils.lerp(group.position.x, target[0], step);
      group.position.y = THREE.MathUtils.lerp(group.position.y, target[1], step);
      group.position.z = THREE.MathUtils.lerp(group.position.z, target[2], step);
    };

    lerpOrganPos(jantungGroupRef.current, 'jantung');
    lerpOrganPos(paruKananGroupRef.current, 'paru-kanan');
    lerpOrganPos(paruKiriGroupRef.current, 'paru-kiri');
    lerpOrganPos(aortaGroupRef.current, 'aorta');

    // Animasi ritme detak jantung & respirasi paru sederhana (pelengkap visual)
    const t = clock.getElapsedTime();
    if (isSimRunning) {
      const heartOmega = (NORMAL_HEART_RATE_BPM / 60) * Math.PI * 2;
      const beatScale = 1 + Math.pow(Math.max(0, Math.sin(t * heartOmega)), 6) * 0.045;
      if (jantungGroupRef.current) {
        jantungGroupRef.current.scale.setScalar(beatScale);
      }

      const breathOmega = (NORMAL_RESPIRATORY_RATE / 60) * Math.PI * 2;
      const breath = 1 + Math.sin(t * breathOmega) * 0.032;
      if (paruKananGroupRef.current) {
        paruKananGroupRef.current.scale.set(breath, 1 + (breath - 1) * 0.55, breath);
      }
      if (paruKiriGroupRef.current) {
        paruKiriGroupRef.current.scale.set(breath, 1 + (breath - 1) * 0.55, breath);
      }
    } else {
      if (jantungGroupRef.current) {
        const s = THREE.MathUtils.lerp(jantungGroupRef.current.scale.x, 1, step);
        jantungGroupRef.current.scale.setScalar(s);
      }
      if (paruKananGroupRef.current) {
        const sx = THREE.MathUtils.lerp(paruKananGroupRef.current.scale.x, 1, step);
        const sy = THREE.MathUtils.lerp(paruKananGroupRef.current.scale.y, 1, step);
        paruKananGroupRef.current.scale.set(sx, sy, sx);
      }
      if (paruKiriGroupRef.current) {
        const sx = THREE.MathUtils.lerp(paruKiriGroupRef.current.scale.x, 1, step);
        const sy = THREE.MathUtils.lerp(paruKiriGroupRef.current.scale.y, 1, step);
        paruKiriGroupRef.current.scale.set(sx, sy, sx);
      }
    }
  });

  const makePointerHandlers = (part: AnatomySeparablePart) => ({
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onOrganClick?.(part);
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHoveredPart(part);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHoveredPart((prev) => (prev === part ? null : prev));
      document.body.style.cursor = 'auto';
    },
  });

  const isCutaway = params.inspectionMode === 'belah';
  const showAll = params.focusOrgan === 'semua';

  const pinHeartInternal = isCutaway && (showAll || params.focusOrgan === 'jantung');
  const pinLungInternal = isCutaway && (showAll || params.focusOrgan === 'paru');
  const pinAortaInternal = isCutaway && (showAll || params.focusOrgan === 'aorta');

  const pinHeartOuter = !isCutaway && (showAll || params.focusOrgan === 'jantung');
  const pinLungOuter = !isCutaway && (showAll || params.focusOrgan === 'paru');
  const pinAortaOuter = !isCutaway && (showAll || params.focusOrgan === 'aorta');

  return (
    <group position={[0, 1.48, 0]} scale={1.15}>
      {/* Alas Penopang Spesimen Anatomi */}
      <mesh position={[0, -1.24, 0]} receiveShadow>
        <cylinderGeometry args={[1.42, 1.54, 0.12, 48]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.9} />
      </mesh>

      {/* Grup Organ 1: Aorta & Pembuluh Besar */}
      <group ref={aortaGroupRef} {...makePointerHandlers('aorta')}>
        {aortaUtuh ? <primitive object={aortaUtuh} /> : null}
        {aortaDepan ? <primitive object={aortaDepan} /> : null}
        {aortaDalam ? <primitive object={aortaDalam} /> : null}

        <CalloutPin
          position={ANATOMY_STRUCTURES['aorta-utuh'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['aorta-utuh'].calloutOffset}
          label="Aorta & Pembuluh"
          value={params.separatedParts.includes('aorta') && params.inspectionMode === 'pisahkan' ? 'Terpisah' : undefined}
          accent="teal"
          visible={showVectors && pinAortaOuter}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['lumen-aorta'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['lumen-aorta'].calloutOffset}
          label="Lumen Aorta"
          value={params.selectedStructureId === 'lumen-aorta' ? 'Aktif' : undefined}
          accent="teal"
          visible={showVectors && pinAortaInternal}
        />
      </group>

      {/* Grup Organ 2: Jantung */}
      <group ref={jantungGroupRef} {...makePointerHandlers('jantung')}>
        {jantungUtuh ? <primitive object={jantungUtuh} /> : null}
        {jantungDepan ? <primitive object={jantungDepan} /> : null}
        {jantungDalam ? <primitive object={jantungDalam} /> : null}

        <CalloutPin
          position={ANATOMY_STRUCTURES['jantung-utuh'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['jantung-utuh'].calloutOffset}
          label="Jantung"
          value={params.separatedParts.includes('jantung') && params.inspectionMode === 'pisahkan' ? 'Terpisah' : undefined}
          accent="teal"
          visible={showVectors && pinHeartOuter}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['serambi-kanan'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['serambi-kanan'].calloutOffset}
          label="Serambi Kanan"
          accent={params.selectedStructureId === 'serambi-kanan' ? 'teal' : 'charcoal'}
          visible={showVectors && pinHeartInternal}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['bilik-kanan'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['bilik-kanan'].calloutOffset}
          label="Bilik Kanan"
          accent={params.selectedStructureId === 'bilik-kanan' ? 'teal' : 'charcoal'}
          visible={showVectors && pinHeartInternal}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['serambi-kiri'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['serambi-kiri'].calloutOffset}
          label="Serambi Kiri"
          accent={params.selectedStructureId === 'serambi-kiri' ? 'teal' : 'charcoal'}
          visible={showVectors && pinHeartInternal}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['bilik-kiri'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['bilik-kiri'].calloutOffset}
          label="Bilik Kiri"
          accent={params.selectedStructureId === 'bilik-kiri' ? 'teal' : 'charcoal'}
          visible={showVectors && pinHeartInternal}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['katup-sekat'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['katup-sekat'].calloutOffset}
          label="Katup & Sekat"
          accent={params.selectedStructureId === 'katup-sekat' ? 'teal' : 'charcoal'}
          visible={showVectors && pinHeartInternal}
        />
      </group>

      {/* Grup Organ 3: Paru Kanan */}
      <group ref={paruKananGroupRef} {...makePointerHandlers('paru-kanan')}>
        {paruKananUtuh ? <primitive object={paruKananUtuh} /> : null}
        {paruKananDepan ? <primitive object={paruKananDepan} /> : null}
        {paruKananDalam ? <primitive object={paruKananDalam} /> : null}

        <CalloutPin
          position={ANATOMY_STRUCTURES['paru-kanan-utuh'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['paru-kanan-utuh'].calloutOffset}
          label="Paru Kanan (3 Lobus)"
          accent="charcoal"
          visible={showVectors && pinLungOuter}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['bronkus-bronkiolus'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['bronkus-bronkiolus'].calloutOffset}
          label="Bronkus Kanan"
          accent={params.selectedStructureId === 'bronkus-bronkiolus' ? 'teal' : 'charcoal'}
          visible={showVectors && pinLungInternal}
        />
      </group>

      {/* Grup Organ 4: Paru Kiri */}
      <group ref={paruKiriGroupRef} {...makePointerHandlers('paru-kiri')}>
        {paruKiriUtuh ? <primitive object={paruKiriUtuh} /> : null}
        {paruKiriDepan ? <primitive object={paruKiriDepan} /> : null}
        {paruKiriDalam ? <primitive object={paruKiriDalam} /> : null}

        <CalloutPin
          position={ANATOMY_STRUCTURES['paru-kiri-utuh'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['paru-kiri-utuh'].calloutOffset}
          label="Paru Kiri (2 Lobus)"
          accent="charcoal"
          visible={showVectors && pinLungOuter}
        />
        <CalloutPin
          position={ANATOMY_STRUCTURES['parenkim-alveolus'].calloutPosition!}
          labelOffset={ANATOMY_STRUCTURES['parenkim-alveolus'].calloutOffset}
          label="Bronkus & Alveolus"
          accent={params.selectedStructureId === 'parenkim-alveolus' ? 'teal' : 'charcoal'}
          visible={showVectors && pinLungInternal}
        />
      </group>
    </group>
  );
}

export function HumanAnatomyScene(props: HumanAnatomySceneProps) {
  const { params, showVectors, isSimRunning, onSelectStructure } = props;

  if (params.focusOrgan === 'jantung') {
    return (
      <HeartDetailModel
        selectedStructureId={params.selectedStructureId}
        showVectors={showVectors}
        isSimRunning={isSimRunning}
        onSelectStructure={onSelectStructure}
      />
    );
  }

  if (params.focusOrgan === 'paru') {
    return (
      <LungsDetailModel
        lungVariant={params.lungVariant}
        selectedStructureId={params.selectedStructureId}
        showVectors={showVectors}
        isSimRunning={isSimRunning}
        onSelectStructure={onSelectStructure}
      />
    );
  }

  if (params.focusOrgan === 'aorta') {
    return (
      <AortaDetailModel
        selectedStructureId={params.selectedStructureId}
        showVectors={showVectors}
        isSimRunning={isSimRunning}
        onSelectStructure={onSelectStructure}
      />
    );
  }

  return (
    <Suspense fallback={<AnatomyLoadingFallback />}>
      <AnatomyGlbContent {...props} />
    </Suspense>
  );
}

useGLTF.preload(ANATOMY_MODEL_URL);
