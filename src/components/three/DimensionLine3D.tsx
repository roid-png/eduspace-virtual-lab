import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { ProjectedHtml3D } from './ProjectedHtml3D';

interface DimensionLine3DProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  color?: string;
  visible?: boolean;
  dashed?: boolean;
  /** Geser posisi badge label keluar dengan garis penunjuk agar tidak menempel bidang */
  labelOffset?: [number, number, number];
}

export function DimensionLine3D({
  start,
  end,
  label,
  color = '#5C6064',
  visible = true,
  dashed = false,
  labelOffset,
}: DimensionLine3DProps) {
  const { midpoint, tickA, tickB, labelPos } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    const perp =
      Math.abs(dir.y) > 0.9 * dir.length()
        ? new THREE.Vector3(0.12, 0, 0)
        : new THREE.Vector3(0, 0.12, 0);

    const outPos: [number, number, number] = labelOffset
      ? [mid.x + labelOffset[0], mid.y + labelOffset[1], mid.z + labelOffset[2]]
      : [mid.x, mid.y, mid.z];

    return {
      midpoint: [mid.x, mid.y, mid.z] as [number, number, number],
      labelPos: outPos,
      tickA: [
        [a.x - perp.x, a.y - perp.y, a.z - perp.z],
        [a.x + perp.x, a.y + perp.y, a.z + perp.z],
      ] as [[number, number, number], [number, number, number]],
      tickB: [
        [b.x - perp.x, b.y - perp.y, b.z - perp.z],
        [b.x + perp.x, b.y + perp.y, b.z + perp.z],
      ] as [[number, number, number], [number, number, number]],
    };
  }, [start, end, labelOffset]);

  if (!visible) return null;

  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={1.6}
        dashed={dashed}
        dashSize={0.14}
        gapSize={0.08}
      />
      <Line points={tickA} color={color} lineWidth={1.4} />
      <Line points={tickB} color={color} lineWidth={1.4} />

      {labelOffset ? (
        <Line points={[midpoint, labelPos]} color={color} lineWidth={1.25} />
      ) : null}

      <ProjectedHtml3D center position={labelPos}>
        <span
          className="font-code whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: '#F6F3EC',
            color: '#23272A',
            boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.12)',
          }}
        >
          {label}
        </span>
      </ProjectedHtml3D>
    </group>
  );
}
