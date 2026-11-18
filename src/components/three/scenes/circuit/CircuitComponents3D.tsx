import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import type { CircuitLampType } from '../../../../types/lab';

interface BatteryPack3DProps {
  position: [number, number, number];
}

export function BatteryPack3D({ position }: BatteryPack3DProps) {
  return (
    <group position={position}>
      {/* Bodi Baterai DC Lab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.84, 0.56, 1.45]} />
        <meshStandardMaterial color="#0E5A63" roughness={0.62} metalness={0.12} />
      </mesh>
      {/* Pelat Atas Baterai */}
      <mesh position={[0, 0.29, 0]} castShadow>
        <boxGeometry args={[0.78, 0.05, 1.38]} />
        <meshStandardMaterial color="#23272A" roughness={0.55} metalness={0.2} />
      </mesh>
      {/* Strip Aksen Krem */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.86, 0.16, 0.92]} />
        <meshStandardMaterial color="#EFECE4" roughness={0.7} />
      </mesh>
      {/* Terminal Kutub Negatif (+) di Sisi Belakang (-Z) untuk arah arus konvensional */}
      <mesh position={[0, 0.37, -0.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 18]} />
        <meshStandardMaterial color="#B86B2B" roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Cincin Kutub + */}
      <mesh position={[0, 0.45, -0.4]}>
        <boxGeometry args={[0.14, 0.025, 0.035]} />
        <meshStandardMaterial color="#F6F3EC" />
      </mesh>
      <mesh position={[0, 0.45, -0.4]}>
        <boxGeometry args={[0.035, 0.025, 0.14]} />
        <meshStandardMaterial color="#F6F3EC" />
      </mesh>

      {/* Terminal Kutub Negatif (-) di Sisi Depan (+Z) */}
      <mesh position={[0, 0.37, 0.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 18]} />
        <meshStandardMaterial color="#23272A" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0.4]}>
        <boxGeometry args={[0.13, 0.025, 0.035]} />
        <meshStandardMaterial color="#EFECE4" />
      </mesh>
    </group>
  );
}

interface Resistor3DProps {
  position: [number, number, number];
  ohms: number;
  bodyColor: string;
  bandColor: string;
}

export function Resistor3D({
  position,
  ohms,
  bodyColor,
  bandColor,
}: Resistor3DProps) {
  const radius = 0.17 + Math.min(50, Math.max(2, ohms)) / 50 * 0.11;
  return (
    <group position={position}>
      {/* Kaki Kawat Kiri-Kanan */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.32, 10]} />
        <meshStandardMaterial color="#8A8E91" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Badan Keramik Resistor */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.96, 22]} />
        <meshStandardMaterial color={bodyColor} roughness={0.68} metalness={0.05} />
      </mesh>
      {/* Tutup Ujung Resistor */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.45, 0, 0]} castShadow>
        <cylinderGeometry args={[radius + 0.025, radius + 0.025, 0.14, 22]} />
        <meshStandardMaterial color={bodyColor} roughness={0.65} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.45, 0, 0]} castShadow>
        <cylinderGeometry args={[radius + 0.025, radius + 0.025, 0.14, 22]} />
        <meshStandardMaterial color={bodyColor} roughness={0.65} />
      </mesh>
      {/* Pita Kode Warna */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.22, 0, 0]}>
        <cylinderGeometry args={[radius + 0.014, radius + 0.014, 0.09, 22]} />
        <meshStandardMaterial color={bandColor} roughness={0.5} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.02, 0, 0]}>
        <cylinderGeometry args={[radius + 0.014, radius + 0.014, 0.08, 22]} />
        <meshStandardMaterial color="#23272A" roughness={0.5} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.24, 0, 0]}>
        <cylinderGeometry args={[radius + 0.014, radius + 0.014, 0.08, 22]} />
        <meshStandardMaterial color="#B86B2B" roughness={0.45} metalness={0.35} />
      </mesh>
    </group>
  );
}

interface KnifeSwitch3DProps {
  position: [number, number, number];
  closed: boolean;
  onToggle?: () => void;
}

export function KnifeSwitch3D({
  position,
  closed,
  onToggle,
}: KnifeSwitch3DProps) {
  const armRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!armRef.current) return;
    const targetRot = closed ? 0 : 0.72;
    armRef.current.rotation.z = THREE.MathUtils.lerp(
      armRef.current.rotation.z,
      targetRot,
      Math.min(1, delta * 12),
    );
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        if (!onToggle) return;
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        if (!onToggle) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Alas Porselen Saklar */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.1, 0.56]} />
        <meshStandardMaterial
          color={hovered ? '#EFECE4' : '#F6F3EC'}
          roughness={0.65}
        />
      </mesh>
      {/* Engsel Terminal Kanan */}
      <mesh position={[0.36, 0.16, 0]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.18]} />
        <meshStandardMaterial color="#B86B2B" roughness={0.35} metalness={0.75} />
      </mesh>
      {/* Jepitan Terminal Kiri */}
      <mesh position={[-0.36, 0.16, 0]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.18]} />
        <meshStandardMaterial color="#B86B2B" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Tuas Pisau Tembaga Berengsel (Poros di Kanan x = 0.36) */}
      <group ref={armRef} position={[0.36, 0.21, 0]}>
        <mesh position={[-0.36, 0, 0]} castShadow>
          <boxGeometry args={[0.74, 0.055, 0.11]} />
          <meshStandardMaterial
            color="#D48B3E"
            roughness={0.32}
            metalness={0.78}
          />
        </mesh>
        {/* Gagang Isolator Teal */}
        <mesh position={[-0.78, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.075, 0.26, 14]} />
          <meshStandardMaterial
            color={closed ? '#0E5A63' : '#9B2C2C'}
            roughness={0.45}
          />
        </mesh>
      </group>
    </group>
  );
}

interface LabLamp3DProps {
  position: [number, number, number];
  lampType: CircuitLampType;
  brightness: number;
  isOn: boolean;
}

export function LabLamp3D({
  position,
  lampType,
  brightness,
  isOn,
}: LabLamp3DProps) {
  const glassTint =
    lampType === 'led-5'
      ? '#E4F7F9'
      : lampType === 'halogen-20'
        ? '#FFF1C9'
        : '#FFF8E2';
  const glowColor =
    lampType === 'led-5'
      ? '#6CE5F0'
      : lampType === 'halogen-20'
        ? '#FFB32C'
        : '#FFD65A';

  const clamped = isOn ? Math.max(0.08, Math.min(1.5, brightness)) : 0;

  return (
    <group position={position}>
      {/* Dudukan Keramik Soket Lampu */}
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.16, 24]} />
        <meshStandardMaterial color="#F6F3EC" roughness={0.68} />
      </mesh>
      {/* Leher Ulir Kuningan */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.23, 0.18, 20]} />
        <meshStandardMaterial color="#B8863B" roughness={0.38} metalness={0.7} />
      </mesh>

      {/* Filamen / Inti Pijar */}
      <mesh position={[0, 0.46, 0]}>
        <torusGeometry args={[0.09, 0.025, 10, 20]} />
        <meshStandardMaterial
          color={clamped > 0 ? glowColor : '#5C6064'}
          emissive={clamped > 0 ? glowColor : '#000000'}
          emissiveIntensity={clamped * 2.4}
          roughness={0.3}
        />
      </mesh>

      {/* Kubah Kaca Bola Lampu */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color={glassTint}
          emissive={clamped > 0 ? glowColor : '#000000'}
          emissiveIntensity={clamped * 0.72}
          transparent
          opacity={clamped > 0 ? 0.56 : 0.36}
          roughness={0.22}
          metalness={0.06}
        />
      </mesh>

      {/* Halo Lembut & Cahaya Nyata saat Menyala */}
      {clamped > 0 ? (
        <>
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.37 + Math.min(0.18, clamped * 0.11), 16, 16]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={Math.min(0.28, 0.08 + clamped * 0.14)}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0, 0.75, 0]}
            color={glowColor}
            intensity={clamped * 2.6}
            distance={3.6}
            decay={2}
          />
        </>
      ) : null}
    </group>
  );
}

export function TerminalPost3D({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.085, 0.085, 0.14, 14]} />
      <meshStandardMaterial color="#B8863B" roughness={0.35} metalness={0.7} />
    </mesh>
  );
}
