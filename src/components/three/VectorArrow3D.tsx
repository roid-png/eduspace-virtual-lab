import { useMemo } from 'react';
import * as THREE from 'three';

interface VectorArrow3DProps {
  origin: [number, number, number];
  direction: [number, number, number];
  length: number;
  color?: string;
  radius?: number;
  visible?: boolean;
}

export function VectorArrow3D({
  origin,
  direction,
  length,
  color = '#0E5A63',
  radius = 0.04,
  visible = true,
}: VectorArrow3DProps) {
  const { quaternion, shaftLen, headLen } = useMemo(() => {
    const dirVec = new THREE.Vector3(...direction);
    if (dirVec.lengthSq() < 1e-6) {
      dirVec.set(0, 1, 0);
    } else {
      dirVec.normalize();
    }
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dirVec,
    );
    const clampedLen = Math.max(0.25, length);
    const hLen = Math.min(0.24, clampedLen * 0.35);
    const sLen = Math.max(0.05, clampedLen - hLen);
    return { quaternion: q, shaftLen: sLen, headLen: hLen };
  }, [direction, length]);

  if (!visible || length < 0.05) return null;

  return (
    <group position={origin} quaternion={quaternion}>
      <mesh position={[0, shaftLen / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, shaftLen, 12]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, shaftLen + headLen / 2, 0]} castShadow>
        <coneGeometry args={[radius * 2.4, headLen, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  );
}
