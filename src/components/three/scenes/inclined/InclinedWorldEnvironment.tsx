import { useMemo } from 'react';
import type { InclinedObjectType } from '../../../../types/lab';

interface InclinedWorldEnvironmentProps {
  objectType: InclinedObjectType;
  baseRun: number;
  rampHeight: number;
  rampLength: number;
  rampWidth: number;
  mu: number;
}

function PineTree3D({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Batang */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.08, 0.36, 8]} />
        <meshStandardMaterial color="#5C6064" roughness={0.9} />
      </mesh>
      {/* Lapisan Daun Bawah */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.32, 0.52, 7]} />
        <meshStandardMaterial color="#195A61" roughness={0.85} />
      </mesh>
      {/* Lapisan Daun Tengah */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.25, 0.44, 7]} />
        <meshStandardMaterial color="#0E5A63" roughness={0.82} />
      </mesh>
      {/* Pucuk */}
      <mesh position={[0, 1.04, 0]} castShadow>
        <coneGeometry args={[0.16, 0.34, 7]} />
        <meshStandardMaterial color="#2A757E" roughness={0.8} />
      </mesh>
    </group>
  );
}

function HillRock3D({
  position,
  scale = [0.22, 0.16, 0.2],
  rotation = [0.2, 0.5, 0.1],
}: {
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#B9B1A0" roughness={0.95} />
    </mesh>
  );
}

export function InclinedWorldEnvironment({
  objectType,
  baseRun,
  rampHeight,
  rampLength,
  rampWidth,
  mu,
}: InclinedWorldEnvironmentProps) {
  const slopeAngle = Math.atan2(rampHeight, baseRun);

  // Warna & kekasaran permukaan lintasan berubah sesuai koefisien gesek mu
  const trackAppearance = useMemo(() => {
    if (mu <= 0.1) {
      return {
        color: '#CFE2E4',
        roughness: 0.16,
        metalness: 0.12,
        gravelCount: 0,
      };
    }
    if (mu < 0.55) {
      return {
        color: objectType === 'mobil' ? '#4B5054' : '#D5CEC0',
        roughness: 0.72 + mu * 0.2,
        metalness: 0.04,
        gravelCount: Math.round(mu * 24),
      };
    }
    return {
      color: objectType === 'mobil' ? '#3B3F43' : '#C2B8A6',
      roughness: 0.96,
      metalness: 0.02,
      gravelCount: Math.round(mu * 42),
    };
  }, [mu, objectType]);

  // Butiran kerikil/alur kekasaran prosedural di atas lintasan saat mu > 0.10
  const pebbles = useMemo(() => {
    const items: Array<{ x: number; z: number; size: number }> = [];
    for (let i = 0; i < trackAppearance.gravelCount; i += 1) {
      // Pseudo-random deterministik berbasis indeks
      const t = ((i * 37) % 100) / 100;
      const u = (((i * 73 + 19) % 100) / 100 - 0.5) * 0.88;
      items.push({
        x: (t - 0.5) * (rampLength - 0.35),
        z: u * (rampWidth * 0.52),
        size: 0.024 + ((i % 4) * 0.008),
      });
    }
    return items;
  }, [trackAppearance.gravelCount, rampLength, rampWidth]);

  // Garis marka jalan putus-putus untuk mode Mobil & Bukit
  const roadMarkings = useMemo(() => {
    const count = 7;
    const step = rampLength / count;
    return Array.from({ length: count }, (_, idx) => -rampLength / 2 + step * (idx + 0.5));
  }, [rampLength]);

  // Tiang pagar pengaman lereng (guardrail)
  const guardrailPosts = useMemo(() => {
    const count = 5;
    const step = (rampLength - 0.6) / (count - 1);
    return Array.from({ length: count }, (_, idx) => -(rampLength - 0.6) / 2 + step * idx);
  }, [rampLength]);

  const hillMoundHeight = Math.max(0.45, rampHeight * 0.85);

  return (
    <group>
      {/* === Lapisan Area Perbukitan Berteras di Sekeliling Lintasan === */}
      {/* Bukit Belakang Kiri (menopang puncak lereng) */}
      <mesh
        position={[-baseRun / 2 - 0.85, hillMoundHeight * 0.42, -1.9]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1.45, 2.25, hillMoundHeight * 0.84, 9]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.93} />
      </mesh>

      {/* Teras Bukit Samping Belakang */}
      <mesh
        position={[0.45, Math.max(0.28, rampHeight * 0.25), -2.35]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1.3, 1.95, Math.max(0.55, rampHeight * 0.5), 8]} />
        <meshStandardMaterial color="#CFC8B8" roughness={0.94} />
      </mesh>

      {/* Bukit Rendah Sisi Kanan Bawah */}
      <mesh position={[baseRun / 2 + 1.25, 0.22, -1.45]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.4, 0.44, 8]} />
        <meshStandardMaterial color="#DCD6C9" roughness={0.92} />
      </mesh>

      {/* Bukit Rendah Sisi Depan-Kiri (tidak menutupi label bawah) */}
      <mesh position={[-baseRun / 2 - 1.15, 0.18, 1.45]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1.25, 0.36, 7]} />
        <meshStandardMaterial color="#DFD9CC" roughness={0.92} />
      </mesh>

      {/* Pepohonan Pinus Prosedural di Area Perbukitan */}
      <PineTree3D
        position={[-baseRun / 2 - 1.15, hillMoundHeight * 0.82, -2.05]}
        scale={1.05}
      />
      <PineTree3D
        position={[-baseRun / 2 - 0.35, hillMoundHeight * 0.82, -2.45]}
        scale={0.82}
      />
      <PineTree3D
        position={[0.45, Math.max(0.52, rampHeight * 0.5), -2.45]}
        scale={0.95}
      />
      <PineTree3D position={[baseRun / 2 + 1.35, 0.44, -1.55]} scale={0.78} />
      <PineTree3D position={[-baseRun / 2 - 1.25, 0.35, 1.55]} scale={0.72} />

      {/* Bebatuan Alam Lereng Bukit */}
      <HillRock3D
        position={[-baseRun / 2 - 1.4, hillMoundHeight * 0.82, -1.3]}
        scale={[0.24, 0.16, 0.2]}
      />
      <HillRock3D position={[1.15, 0.12, -1.75]} scale={[0.2, 0.14, 0.18]} />
      <HillRock3D position={[baseRun / 2 + 0.75, 0.1, 1.25]} scale={[0.18, 0.12, 0.16]} />

      {/* === Permukaan Lintasan Adaptif Koefisien Gesek (mu) === */}
      <group
        position={[0, rampHeight / 2 + 0.014, 0]}
        rotation={[0, 0, -slopeAngle]}
      >
        <mesh receiveShadow>
          <boxGeometry args={[rampLength, 0.03, rampWidth * 0.62]} />
          <meshStandardMaterial
            color={trackAppearance.color}
            roughness={trackAppearance.roughness}
            metalness={trackAppearance.metalness}
          />
        </mesh>

        {/* Marka Jalan Putus-putus pada Mode Mobil & Bukit */}
        {objectType === 'mobil'
          ? roadMarkings.map((mx, i) => (
              <mesh key={`mark-${i}`} position={[mx, 0.018, 0]}>
                <boxGeometry args={[0.38, 0.008, 0.06]} />
                <meshStandardMaterial color="#F6F3EC" roughness={0.6} />
              </mesh>
            ))
          : null}

        {/* Rel Pagar Pengaman Jalan/Bidang di Sisi Belakang */}
        <group position={[0, 0.14, -(rampWidth * 0.62) / 2 + 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[rampLength - 0.25, 0.045, 0.045]} />
            <meshStandardMaterial color="#EFECE4" roughness={0.6} metalness={0.2} />
          </mesh>
          {guardrailPosts.map((px, idx) => (
            <mesh key={`post-${idx}`} position={[px, -0.07, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.032, 0.18, 8]} />
              <meshStandardMaterial color="#5C6064" roughness={0.75} />
            </mesh>
          ))}
        </group>

        {/* Butiran Kerikil / Tekstur Kasar Permukaan sebanding dengan mu */}
        {pebbles.map((pb, idx) => (
          <mesh key={`peb-${idx}`} position={[pb.x, 0.018, pb.z]}>
            <dodecahedronGeometry args={[pb.size, 0]} />
            <meshStandardMaterial color="#7C766A" roughness={0.95} />
          </mesh>
        ))}

        {/* Penahan / Bumper di Ujung Bawah Lintasan (Mode Peti Barang) */}
        {objectType === 'barang' ? (
          <mesh position={[rampLength / 2 - 0.12, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.14, 0.14, rampWidth * 0.56]} />
            <meshStandardMaterial color="#5C6064" roughness={0.8} />
          </mesh>
        ) : null}
      </group>

      {/* Rambu Sudut Tanjakan/Turunan di Kaki Bukit */}
      <group position={[baseRun / 2 + 0.55, 0, -rampWidth / 2 - 0.25]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.68, 8]} />
          <meshStandardMaterial color="#5C6064" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.68, 0]} rotation={[0, -0.45, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.04]} />
          <meshStandardMaterial color="#0E5A63" roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}
