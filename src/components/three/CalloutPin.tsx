import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { ProjectedHtml3D } from './ProjectedHtml3D';

interface CalloutPinProps {
  position: [number, number, number];
  labelOffset?: [number, number, number];
  label: string;
  value?: string;
  accent?: 'teal' | 'charcoal';
  visible?: boolean;
  /** Tampilkan ujung panah penunjuk yang mengarah tepat ke titik jangkar */
  showPointerArrow?: boolean;
}

export function CalloutPin({
  position,
  labelOffset = [0, 0.35, 0],
  label,
  value,
  accent = 'teal',
  visible = true,
  showPointerArrow = false,
}: CalloutPinProps) {
  const lineColor = accent === 'teal' ? '#0E5A63' : '#5C6064';
  const elbow: [number, number, number] = useMemo(
    () => [labelOffset[0] * 0.65, labelOffset[1], labelOffset[2] * 0.65],
    [labelOffset],
  );

  const arrowQuat = useMemo(() => {
    const dirToAnchor = new THREE.Vector3(-elbow[0], -elbow[1], -elbow[2]);
    if (dirToAnchor.lengthSq() < 1e-6) {
      dirToAnchor.set(0, -1, 0);
    } else {
      dirToAnchor.normalize();
    }
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dirToAnchor,
    );
  }, [elbow]);

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Titik penunjuk atau panah penunjuk tepat pada objek 3D */}
      {showPointerArrow ? (
        <group quaternion={arrowQuat}>
          <mesh position={[0, -0.055, 0]}>
            <coneGeometry args={[0.052, 0.13, 12]} />
            <meshStandardMaterial
              color={accent === 'teal' ? '#0E5A63' : '#23272A'}
              roughness={0.45}
            />
          </mesh>
        </group>
      ) : (
        <mesh>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial
            color={accent === 'teal' ? '#0E5A63' : '#23272A'}
            roughness={0.45}
          />
        </mesh>
      )}

      {/* Garis penunjuk keluar menuju label agar tidak menutupi objek */}
      <Line
        points={[[0, 0, 0], elbow, labelOffset]}
        color={lineColor}
        lineWidth={1.35}
      />

      <ProjectedHtml3D center position={labelOffset}>
        <div
          className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: '#F6F3EC',
            color: '#23272A',
            boxShadow:
              '2px 2px 6px rgba(0, 0, 0, 0.12), -2px -2px 5px rgba(255, 255, 255, 0.85)',
          }}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor: accent === 'teal' ? '#0E5A63' : '#5C6064',
            }}
          />
          <span className="font-code font-semibold">{label}</span>
          {value ? (
            <span className="font-code text-[#0E5A63]">{value}</span>
          ) : null}
        </div>
      </ProjectedHtml3D>
    </group>
  );
}
