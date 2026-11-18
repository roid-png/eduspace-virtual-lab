import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function CargoCrate3D({ size }: { size: number }) {
  const half = size / 2;
  return (
    <group>
      {/* Badan Peti Kargo */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#2C3236" roughness={0.76} metalness={0.08} />
      </mesh>
      {/* Rangka Penyangga Atas & Bawah */}
      <mesh position={[0, half - 0.03, 0]} castShadow>
        <boxGeometry args={[size * 1.03, 0.06, size * 1.03]} />
        <meshStandardMaterial color="#5C6064" roughness={0.7} />
      </mesh>
      <mesh position={[0, -half + 0.03, 0]} castShadow>
        <boxGeometry args={[size * 1.03, 0.06, size * 1.03]} />
        <meshStandardMaterial color="#5C6064" roughness={0.7} />
      </mesh>
      {/* Sabuk Pengaman Deep Teal */}
      <mesh>
        <boxGeometry args={[size * 1.04, size * 0.24, size * 1.04]} />
        <meshStandardMaterial color="#0E5A63" roughness={0.55} />
      </mesh>
    </group>
  );
}

interface HillCar3DProps {
  scale: number;
  wheelAngleRef: React.MutableRefObject<number>;
}

export function HillCar3D({ scale, wheelAngleRef }: HillCar3DProps) {
  const wheelFLRef = useRef<THREE.Group | null>(null);
  const wheelFRRef = useRef<THREE.Group | null>(null);
  const wheelRLRef = useRef<THREE.Group | null>(null);
  const wheelRRRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    const rotZ = -wheelAngleRef.current;
    if (wheelFLRef.current) wheelFLRef.current.rotation.z = rotZ;
    if (wheelFRRef.current) wheelFRRef.current.rotation.z = rotZ;
    if (wheelRLRef.current) wheelRLRef.current.rotation.z = rotZ;
    if (wheelRRRef.current) wheelRRRef.current.rotation.z = rotZ;
  });

  const renderWheel = (
    ref: React.MutableRefObject<THREE.Group | null>,
    pos: [number, number, number],
  ) => (
    <group ref={ref} position={pos}>
      {/* Ban Karet */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.145, 0.145, 0.11, 18]} />
        <meshStandardMaterial color="#23272A" roughness={0.85} />
      </mesh>
      {/* Velg Dalam */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.116, 12]} />
        <meshStandardMaterial color="#EFECE4" roughness={0.45} metalness={0.35} />
      </mesh>
      {/* Palang Velg agar rotasi roda terlihat jelas */}
      <mesh>
        <boxGeometry args={[0.15, 0.032, 0.12]} />
        <meshStandardMaterial color="#0E5A63" roughness={0.5} />
      </mesh>
    </group>
  );

  // Mobil menghadap +X (menuruni bidang miring) dengan tinggi total terpusat
  return (
    <group scale={scale}>
      {/* Sasis Bawah */}
      <mesh position={[0, -0.11, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.11, 0.56]} />
        <meshStandardMaterial color="#23272A" roughness={0.78} />
      </mesh>

      {/* Bodi Utama SUV */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.98, 0.22, 0.54]} />
        <meshStandardMaterial color="#0E5A63" roughness={0.52} metalness={0.12} />
      </mesh>

      {/* Kabin & Kaca */}
      <mesh position={[-0.08, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.2, 0.48]} />
        <meshStandardMaterial color="#F6F3EC" roughness={0.45} />
      </mesh>
      {/* Kaca Depan & Samping */}
      <mesh position={[-0.06, 0.24, 0]}>
        <boxGeometry args={[0.555, 0.13, 0.495]} />
        <meshStandardMaterial color="#CFE2E4" roughness={0.2} metalness={0.15} />
      </mesh>

      {/* Lampu Depan (+X) */}
      <mesh position={[0.495, 0.05, 0.17]}>
        <boxGeometry args={[0.02, 0.07, 0.11]} />
        <meshStandardMaterial color="#FFF6D6" emissive="#FFF0B8" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.495, 0.05, -0.17]}>
        <boxGeometry args={[0.02, 0.07, 0.11]} />
        <meshStandardMaterial color="#FFF6D6" emissive="#FFF0B8" emissiveIntensity={0.4} />
      </mesh>

      {/* 4 Roda Berputar */}
      {renderWheel(wheelFLRef, [0.3, -0.17, 0.27])}
      {renderWheel(wheelFRRef, [0.3, -0.17, -0.27])}
      {renderWheel(wheelRLRef, [-0.3, -0.17, 0.27])}
      {renderWheel(wheelRRRef, [-0.3, -0.17, -0.27])}
    </group>
  );
}

interface FrictionParticles3DProps {
  active: boolean;
  mu: number;
  offsetY: number;
}

export function FrictionParticles3D({
  active,
  mu,
  offsetY,
}: FrictionParticles3DProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, idx) => ({
        phase: idx / 10,
        zOffset: (((idx * 29) % 10) / 10 - 0.5) * 0.42,
        size: 0.028 + (idx % 3) * 0.012,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (!active || mu <= 0.05) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    const t = clock.getElapsedTime() * (1.8 + mu * 2.2);
    groupRef.current.children.forEach((child, idx) => {
      const p = particles[idx];
      if (!p) return;
      const life = (t + p.phase) % 1;
      child.position.set(
        -0.36 - life * (0.45 + mu * 0.55),
        offsetY + life * (0.14 + mu * 0.18),
        p.zOffset,
      );
      const s = (1 - life) * (0.65 + mu * 0.9);
      child.scale.setScalar(Math.max(0.01, s));
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={`fp-${idx}`}>
          <dodecahedronGeometry args={[p.size, 0]} />
          <meshStandardMaterial
            color="#9C9588"
            roughness={0.95}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}
