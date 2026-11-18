import { useFrame, useThree } from '@react-three/fiber';
import { createContext, useContext, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

export interface LabelOverlayApi {
  upsertLabel: (id: string, content: ReactNode) => void;
  removeLabel: (id: string) => void;
  getDomEl: (id: string) => HTMLDivElement | null;
}

export const LabelOverlayContext = createContext<LabelOverlayApi | null>(null);

interface ProjectedHtml3DProps {
  position?: [number, number, number];
  center?: boolean;
  children: ReactNode;
}

const _vec = new THREE.Vector3();

export function ProjectedHtml3D({
  position = [0, 0, 0],
  center = true,
  children,
}: ProjectedHtml3DProps) {
  const api = useContext(LabelOverlayContext);
  const id = useId();
  const groupRef = useRef<THREE.Group | null>(null);
  const { camera, size } = useThree();

  useEffect(() => {
    if (!api) return;
    api.upsertLabel(id, children);
  }, [api, id, children]);

  useEffect(() => {
    if (!api) return;
    return () => {
      api.removeLabel(id);
    };
  }, [api, id]);

  useFrame(() => {
    if (!api || !groupRef.current) return;
    const domEl = api.getDomEl(id);
    if (!domEl) return;

    groupRef.current.getWorldPosition(_vec);
    _vec.project(camera);

    if (_vec.z > 1 || _vec.z < -1) {
      domEl.style.opacity = '0';
      return;
    }

    const x = (_vec.x * 0.5 + 0.5) * size.width;
    const y = (-_vec.y * 0.5 + 0.5) * size.height;

    domEl.style.opacity = '1';
    domEl.style.transform = center
      ? `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
      : `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });

  // Hanya mengembalikan elemen Three.js murni di dalam tree R3F
  return <group ref={groupRef} position={position} />;
}
