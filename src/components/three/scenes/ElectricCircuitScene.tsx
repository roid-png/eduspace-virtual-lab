import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  LAMP_SPECS,
  calculateCircuitPhysics,
} from '../../../engines/physicsCircuit';
import type { CircuitParams } from '../../../types/lab';
import { CalloutPin } from '../CalloutPin';
import { DimensionLine3D } from '../DimensionLine3D';
import {
  BatteryPack3D,
  KnifeSwitch3D,
  LabLamp3D,
  Resistor3D,
  TerminalPost3D,
} from './circuit/CircuitComponents3D';

interface ElectricCircuitSceneProps {
  params: CircuitParams;
  showVectors: boolean;
  isSimRunning: boolean;
  onToggleSwitch?: () => void;
}

type Pt3 = [number, number, number];

// Topologi Seri: loop tunggal
const SERI_LOOP: Pt3[] = [
  [-2.75, 0.25, 0],
  [-2.75, 0.25, -1.65],
  [2.75, 0.25, -1.65],
  [2.75, 0.25, 1.65],
  [-2.75, 0.25, 1.65],
  [-2.75, 0.25, 0],
];

// Topologi Paralel: node cabang A (-1.55) dan B (2.75)
const PARALEL_MAIN_LOOP_1: Pt3[] = [
  [-2.75, 0.25, 0],
  [-2.75, 0.25, -1.65],
  [2.75, 0.25, -1.65],
  [2.75, 0.25, 1.65],
  [-2.75, 0.25, 1.65],
  [-2.75, 0.25, 0],
];

const PARALEL_BRANCH_2_WIRE: Pt3[] = [
  [-1.55, 0.25, -1.65],
  [-1.55, 0.25, -0.05],
  [2.75, 0.25, -0.05],
];

const PARALEL_LOOP_2: Pt3[] = [
  [-2.75, 0.25, 0],
  [-2.75, 0.25, -1.65],
  [-1.55, 0.25, -1.65],
  [-1.55, 0.25, -0.05],
  [2.75, 0.25, -0.05],
  [2.75, 0.25, 1.65],
  [-2.75, 0.25, 1.65],
  [-2.75, 0.25, 0],
];

// Topologi Campuran: R1 seri [-2.75..-0.35] sebelum Node A (-0.35, -1.65) ke (R2 || R3)
const CAMPURAN_LOOP_TOP: Pt3[] = [
  [-2.75, 0.25, 0],
  [-2.75, 0.25, -1.65],
  [2.75, 0.25, -1.65],
  [2.75, 0.25, 1.65],
  [-2.75, 0.25, 1.65],
  [-2.75, 0.25, 0],
];

const CAMPURAN_BRANCH_3_WIRE: Pt3[] = [
  [-0.35, 0.25, -1.65],
  [-0.35, 0.25, -0.05],
  [2.75, 0.25, -0.05],
];

const CAMPURAN_LOOP_BOTTOM: Pt3[] = [
  [-2.75, 0.25, 0],
  [-2.75, 0.25, -1.65],
  [-0.35, 0.25, -1.65],
  [-0.35, 0.25, -0.05],
  [2.75, 0.25, -0.05],
  [2.75, 0.25, 1.65],
  [-2.75, 0.25, 1.65],
  [-2.75, 0.25, 0],
];

function sampleClosedLoop(points: Pt3[], progress: number): Pt3 {
  const segCount = points.length - 1;
  const scaled = (((progress % 1) + 1) % 1) * segCount;
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const a = points[idx];
  const b = points[(idx + 1) % points.length];
  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ];
}

export function ElectricCircuitScene({
  params,
  showVectors,
  isSimRunning,
  onToggleSwitch,
}: ElectricCircuitSceneProps) {
  const calc = useMemo(() => calculateCircuitPhysics(params), [params]);
  const particleRefs = useRef<Array<THREE.Mesh | null>>([]);
  const phasePrimaryRef = useRef(0);
  const phaseBranchRef = useRef(0);

  const particleCount = 14;
  const lampInBranch =
    params.hasLamp &&
    params.mode !== 'seri' &&
    params.lampPlacement === 'cabang';

  useFrame((_state, delta) => {
    if (calc.isCircuitClosed) {
      const baseSpeed = isSimRunning ? 0.14 : 0.045;
      const speedPrimary =
        baseSpeed + Math.min((params.mode === 'campuran' ? calc.i2 : calc.i1) * 0.09, 0.55);
      const speedBranch =
        baseSpeed + Math.min((params.mode === 'campuran' ? calc.i3 : calc.i2) * 0.09, 0.55);
      phasePrimaryRef.current = (phasePrimaryRef.current + delta * speedPrimary) % 1;
      phaseBranchRef.current = (phaseBranchRef.current + delta * speedBranch) % 1;
    }

    particleRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const offset = idx / particleCount;
      let path = SERI_LOOP;
      let phase = phasePrimaryRef.current;

      if (params.mode === 'paralel') {
        if (idx % 2 === 1) {
          path = PARALEL_LOOP_2;
          phase = phaseBranchRef.current;
        } else {
          path = PARALEL_MAIN_LOOP_1;
        }
      } else if (params.mode === 'campuran') {
        if (idx % 2 === 1) {
          path = CAMPURAN_LOOP_BOTTOM;
          phase = phaseBranchRef.current;
        } else {
          path = CAMPURAN_LOOP_TOP;
        }
      }

      const [x, y, z] = sampleClosedLoop(path, phase + offset);
      mesh.position.set(x, y, z);
    });
  });

  // Posisi Resistor sesuai topologi
  const r1Pos: Pt3 =
    params.mode === 'seri'
      ? [-0.95, 0.34, -1.65]
      : params.mode === 'paralel'
        ? [0.45, 0.34, -1.65]
        : [-1.55, 0.34, -1.65];

  const r2Pos: Pt3 =
    params.mode === 'seri'
      ? [1.1, 0.34, -1.65]
      : params.mode === 'paralel'
        ? lampInBranch
          ? [-0.25, 0.34, -0.05]
          : [0.45, 0.34, -0.05]
        : lampInBranch
          ? [0.65, 0.34, -1.65]
          : [1.2, 0.34, -1.65];

  const r3Pos: Pt3 = [1.2, 0.34, -0.05];

  // Posisi Lampu & Saklar
  const switchPos: Pt3 = [-1.05, 0.25, 1.65];
  const lampPos: Pt3 = lampInBranch
    ? params.mode === 'paralel'
      ? [1.55, 0.25, -0.05]
      : [2.0, 0.25, -1.65]
    : [1.1, 0.25, 1.65];

  return (
    <group>
      {/* Papan Uji Praktikum Lab Matte */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.2, 0.14, 4.8]} />
        <meshStandardMaterial color="#E3DED2" roughness={0.88} metalness={0.02} />
      </mesh>
      {/* Bingkai Halus Papan */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[7.45, 0.07, 5.05]} />
        <meshStandardMaterial color="#D5CEBE" roughness={0.92} />
      </mesh>

      {/* Garis Grid Halus Papan Praktikum */}
      {[-2, -1, 0, 1, 2].map((xLine) => (
        <Line
          key={`grid-x-${xLine}`}
          points={[
            [xLine, 0.135, -2.15],
            [xLine, 0.135, 2.15],
          ]}
          color="#5C6064"
          opacity={0.14}
          transparent
          lineWidth={1}
        />
      ))}

      {/* Jalur Konduktor Sesuai Topologi */}
      {params.mode === 'seri' ? (
        <Line points={SERI_LOOP} color="#23272A" lineWidth={3.5} />
      ) : null}

      {params.mode === 'paralel' ? (
        <>
          <Line points={PARALEL_MAIN_LOOP_1} color="#23272A" lineWidth={3.5} />
          <Line points={PARALEL_BRANCH_2_WIRE} color="#23272A" lineWidth={3.5} />
          <TerminalPost3D position={[-1.55, 0.25, -1.65]} />
          <TerminalPost3D position={[2.75, 0.25, -0.05]} />
        </>
      ) : null}

      {params.mode === 'campuran' ? (
        <>
          <Line points={CAMPURAN_LOOP_TOP} color="#23272A" lineWidth={3.5} />
          <Line points={CAMPURAN_BRANCH_3_WIRE} color="#23272A" lineWidth={3.5} />
          <TerminalPost3D position={[-0.35, 0.25, -1.65]} />
          <TerminalPost3D position={[2.75, 0.25, -0.05]} />
        </>
      ) : null}

      {/* Pos Terminal Sudut Papan */}
      <TerminalPost3D position={[-2.75, 0.25, -1.65]} />
      <TerminalPost3D position={[2.75, 0.25, -1.65]} />
      <TerminalPost3D position={[2.75, 0.25, 1.65]} />
      <TerminalPost3D position={[-2.75, 0.25, 1.65]} />

      {/* Sumber Tegangan DC */}
      <BatteryPack3D position={[-2.75, 0.36, 0]} />

      {/* Resistor R1 & R2 (Selalu ada) */}
      <Resistor3D
        position={r1Pos}
        ohms={params.r1}
        bodyColor="#F6F3EC"
        bandColor="#0E5A63"
      />
      <Resistor3D
        position={r2Pos}
        ohms={params.r2}
        bodyColor="#D5CEBE"
        bandColor="#8C5123"
      />

      {/* Resistor R3 (Khusus Rangkaian Campuran) */}
      {params.mode === 'campuran' ? (
        <Resistor3D
          position={r3Pos}
          ohms={params.r3}
          bodyColor="#EFECE4"
          bandColor="#2D6A4F"
        />
      ) : null}

      {/* Saklar Interaktif (Opsional) */}
      {params.hasSwitch ? (
        <KnifeSwitch3D
          position={switchPos}
          closed={params.switchClosed}
          onToggle={onToggleSwitch}
        />
      ) : null}

      {/* Lampu Indikator / Beban (Opsional & Bervariasi) */}
      {params.hasLamp ? (
        <LabLamp3D
          position={lampPos}
          lampType={params.lampType}
          brightness={calc.lampBrightness}
          isOn={calc.isCircuitClosed}
        />
      ) : null}

      {/* Partikel Aliran Arus Listrik */}
      {Array.from({ length: particleCount }).map((_, idx) => (
        <mesh
          key={`charge-${idx}`}
          ref={(el) => {
            particleRefs.current[idx] = el;
          }}
        >
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial
            color={calc.isCircuitClosed ? '#0E5A63' : '#7D8287'}
            emissive={calc.isCircuitClosed ? '#0E5A63' : '#000000'}
            emissiveIntensity={
              !calc.isCircuitClosed ? 0 : isSimRunning ? 0.55 : 0.16
            }
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* Pin Label Berarah Terkalibrasi */}
      <CalloutPin
        position={[-2.75, 0.68, 0]}
        labelOffset={[-1.05, 0.88, 0.55]}
        label="Sumber V"
        value={`${params.voltage.toFixed(1)} V`}
        showPointerArrow
        visible={showVectors}
      />
      <CalloutPin
        position={[r1Pos[0], 0.56, r1Pos[2]]}
        labelOffset={[-0.25, 0.95, -0.78]}
        label="R₁"
        value={`${params.r1} Ω · ${params.mode === 'paralel' ? `${calc.i1.toFixed(2)} A` : `${calc.v1.toFixed(1)} V`}`}
        accent="charcoal"
        showPointerArrow
        visible={showVectors}
      />
      <CalloutPin
        position={[r2Pos[0], 0.56, r2Pos[2]]}
        labelOffset={
          params.mode === 'paralel'
            ? [-0.5, 0.85, 0.45]
            : [0.35, 0.95, -0.78]
        }
        label="R₂"
        value={`${params.r2} Ω · ${params.mode === 'seri' ? `${calc.v2.toFixed(1)} V` : `${calc.i2.toFixed(2)} A`}`}
        accent="charcoal"
        showPointerArrow
        visible={showVectors}
      />

      {params.mode === 'campuran' ? (
        <CalloutPin
          position={[r3Pos[0], 0.56, r3Pos[2]]}
          labelOffset={[0.6, 0.82, 0.45]}
          label="R₃"
          value={`${params.r3} Ω · ${calc.i3.toFixed(2)} A`}
          accent="charcoal"
          showPointerArrow
          visible={showVectors}
        />
      ) : null}

      {params.hasSwitch ? (
        <CalloutPin
          position={[switchPos[0], 0.38, switchPos[2]]}
          labelOffset={[-0.5, 0.72, 0.75]}
          label="Saklar"
          value={params.switchClosed ? 'ON (Tutup)' : 'OFF (Buka)'}
          showPointerArrow
          visible={showVectors}
        />
      ) : null}

      {params.hasLamp ? (
        <CalloutPin
          position={[lampPos[0], 0.65, lampPos[2]]}
          labelOffset={
            lampInBranch ? [0.95, 0.92, -0.45] : [0.75, 0.78, 0.75]
          }
          label={LAMP_SPECS[params.lampType].shortLabel}
          value={
            calc.isCircuitClosed
              ? `${calc.powerLamp.toFixed(2)} W`
              : 'Padam'
          }
          showPointerArrow
          visible={showVectors}
        />
      ) : null}

      <DimensionLine3D
        start={[-2.75, 0.16, 2.22]}
        end={[2.75, 0.16, 2.22]}
        label={`I_tot = ${calc.iTotal.toFixed(2)} A · R_tot = ${calc.rTotal.toFixed(2)} Ω`}
        labelOffset={[0, 0.12, 0.32]}
        visible={showVectors}
      />
    </group>
  );
}
