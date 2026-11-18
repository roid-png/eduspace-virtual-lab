import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { calculateInclinedPhysics } from '../../../engines/physicsInclined';
import type { InclinedParams } from '../../../types/lab';
import { CalloutPin } from '../CalloutPin';
import { DimensionLine3D } from '../DimensionLine3D';
import { VectorArrow3D } from '../VectorArrow3D';
import {
  CargoCrate3D,
  FrictionParticles3D,
  HillCar3D,
} from './inclined/InclinedVehiclesAndCargo';
import { InclinedWorldEnvironment } from './inclined/InclinedWorldEnvironment';

interface InclinedPlaneSceneProps {
  params: InclinedParams;
  showVectors: boolean;
  isSimRunning: boolean;
}

export function InclinedPlaneScene({
  params,
  showVectors,
  isSimRunning,
}: InclinedPlaneSceneProps) {
  const movingGroupRef = useRef<THREE.Group | null>(null);
  const objectVisualRef = useRef<THREE.Group | null>(null);
  const slideProgressRef = useRef(0);
  const velocityRef = useRef(0);
  const wheelAngleRef = useRef(0);

  const physics = useMemo(() => calculateInclinedPhysics(params), [params]);

  const thetaRad = (params.theta * Math.PI) / 180;
  const rampLength = 5.4;
  const rampWidth = 2.2;
  const baseRun = Math.max(2.2, rampLength * Math.cos(thetaRad));
  const rampHeight = Math.max(0.08, rampLength * Math.sin(thetaRad));

  // Geometri prisma bidang miring dinamis berdasarkan theta
  const wedgeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-baseRun / 2, 0);
    shape.lineTo(baseRun / 2, 0);
    shape.lineTo(-baseRun / 2, rampHeight);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: rampWidth,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -rampWidth / 2);
    return geo;
  }, [baseRun, rampHeight]);

  useEffect(() => {
    slideProgressRef.current = 0;
    velocityRef.current = 0;
    wheelAngleRef.current = 0;
  }, [params.objectType, params.theta, params.mass, params.mu, isSimRunning]);

  const blockSize = 0.54 + (params.mass - 1) * 0.036;
  const carScale = 0.88 + (params.mass - 1) * 0.032;
  const objectHalfHeight =
    params.objectType === 'mobil' ? 0.315 * carScale : blockSize / 2;

  const startS = 0.55;
  const maxTravel = Math.max(0.25, rampLength - 1.55);

  const slopeDir = useMemo(() => {
    const dx = baseRun;
    const dy = -rampHeight;
    const len = Math.hypot(dx, dy) || 1;
    return [dx / len, dy / len] as const;
  }, [baseRun, rampHeight]);

  const normalDir = useMemo(
    () => [-slopeDir[1], slopeDir[0]] as const,
    [slopeDir],
  );

  // Titik busur sudut theta di kaki kanan-bawah
  const arcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const toeX = baseRun / 2;
    const radius = 0.95;
    const steps = 16;
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * thetaRad;
      pts.push([
        toeX - Math.cos(a) * radius,
        Math.sin(a) * radius + 0.02,
        rampWidth / 2 + 0.04,
      ]);
    }
    return pts;
  }, [baseRun, thetaRad, rampWidth]);

  useFrame((state, delta) => {
    if (!movingGroupRef.current) return;
    if (isSimRunning && physics.isMoving) {
      const dt = Math.min(delta, 0.05);
      velocityRef.current += physics.acceleration * 0.38 * dt;
      const ds = velocityRef.current * dt;
      slideProgressRef.current += ds;
      wheelAngleRef.current += ds / (0.145 * carScale);
      if (slideProgressRef.current > maxTravel) {
        slideProgressRef.current = 0;
        velocityRef.current = 0;
        wheelAngleRef.current = 0;
      }
    } else if (!isSimRunning) {
      slideProgressRef.current = 0;
      velocityRef.current = 0;
      wheelAngleRef.current = 0;
    }

    const s = startS + slideProgressRef.current;
    const px = -baseRun / 2 + slopeDir[0] * s + normalDir[0] * (objectHalfHeight + 0.028);
    const py = rampHeight + slopeDir[1] * s + normalDir[1] * (objectHalfHeight + 0.028);
    movingGroupRef.current.position.set(px, py, 0);

    // Getaran halus saat melewati permukaan kasar (mu tinggi) sambil meluncur
    if (objectVisualRef.current) {
      if (isSimRunning && physics.isMoving && params.mu > 0.25) {
        const vib = Math.sin(state.clock.getElapsedTime() * 48) * params.mu * 0.012;
        objectVisualRef.current.position.y = vib;
      } else {
        objectVisualRef.current.position.y = 0;
      }
    }
  });

  const initX =
    -baseRun / 2 + slopeDir[0] * startS + normalDir[0] * (objectHalfHeight + 0.028);
  const initY =
    rampHeight + slopeDir[1] * startS + normalDir[1] * (objectHalfHeight + 0.028);

  const scaleF = 0.03;
  const slopeAngle = Math.atan2(rampHeight, baseRun);

  return (
    <group position={[0, 0, 0]}>
      {/* Prisma Bidang Miring Matte/Clay */}
      <mesh geometry={wedgeGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#D8D2C5" roughness={0.86} metalness={0.03} />
      </mesh>

      {/* Lingkungan Dunia Nyata Prosedural (Perbukitan, Pohon, Jalan, Tekstur & Kerikil mu) */}
      <InclinedWorldEnvironment
        objectType={params.objectType}
        baseRun={baseRun}
        rampHeight={rampHeight}
        rampLength={rampLength}
        rampWidth={rampWidth}
        mu={params.mu}
      />

      {/* Busur Sudut Theta + Label Ditarik Keluar */}
      {showVectors && params.theta > 2 ? (
        <group>
          <Line points={arcPoints} color="#0E5A63" lineWidth={2.4} />
          <CalloutPin
            position={[baseRun / 2 - 0.85, 0.24, rampWidth / 2 + 0.06]}
            labelOffset={[0.72, 0.42, 0.85]}
            label={`θ = ${Math.round(params.theta)}°`}
            showPointerArrow
            visible={showVectors}
          />
        </group>
      ) : null}

      {/* Objek Simulasi (Peti Barang / Mobil) + Vektor FBD + Partikel Gesek */}
      <group
        ref={movingGroupRef}
        position={[initX, initY, 0]}
        rotation={[0, 0, -slopeAngle]}
      >
        <group ref={objectVisualRef}>
          {params.objectType === 'mobil' ? (
            <HillCar3D scale={carScale} wheelAngleRef={wheelAngleRef} />
          ) : (
            <CargoCrate3D size={blockSize} />
          )}
        </group>

        {/* Animasi Partikel Gesekan mu saat Meluncur */}
        <FrictionParticles3D
          active={isSimRunning && physics.isMoving}
          mu={params.mu}
          offsetY={-objectHalfHeight + 0.04}
        />

        {/* Vektor Gaya & Label Berarah Jauh dari Bidang */}
        <group rotation={[0, 0, slopeAngle]}>
          {/* W = m * g (lurus ke bawah) */}
          <VectorArrow3D
            origin={[0, 0, 0]}
            direction={[0, -1, 0]}
            length={physics.weight * scaleF}
            color="#23272A"
            visible={showVectors}
          />
          <CalloutPin
            position={[0, -Math.max(0.55, physics.weight * scaleF), 0]}
            labelOffset={[-0.95, -0.35, 0.95]}
            label="W"
            value={`${physics.weight.toFixed(1)} N`}
            accent="charcoal"
            showPointerArrow
            visible={showVectors}
          />

          {/* N (tegak lurus bidang ke atas) */}
          <VectorArrow3D
            origin={[0, 0, 0]}
            direction={[normalDir[0], normalDir[1], 0]}
            length={physics.normalForce * scaleF}
            color="#0E5A63"
            visible={showVectors}
          />
          <CalloutPin
            position={[
              normalDir[0] * Math.max(0.55, physics.normalForce * scaleF),
              normalDir[1] * Math.max(0.55, physics.normalForce * scaleF),
              0,
            ]}
            labelOffset={[0.92, 0.68, -0.58]}
            label="N"
            value={`${physics.normalForce.toFixed(1)} N`}
            showPointerArrow
            visible={showVectors}
          />

          {/* W sin theta (sejajar bidang ke bawah) */}
          {params.theta > 1 ? (
            <>
              <VectorArrow3D
                origin={[0, 0, 0]}
                direction={[slopeDir[0], slopeDir[1], 0]}
                length={physics.drivingForce * scaleF}
                color="#0E5A63"
                radius={0.046}
                visible={showVectors}
              />
              <CalloutPin
                position={[
                  slopeDir[0] * Math.max(0.6, physics.drivingForce * scaleF),
                  slopeDir[1] * Math.max(0.6, physics.drivingForce * scaleF),
                  0,
                ]}
                labelOffset={[1.15, 0.25, 0.85]}
                label="W·sin θ"
                value={`${physics.drivingForce.toFixed(1)} N`}
                showPointerArrow
                visible={showVectors}
              />
            </>
          ) : null}

          {/* Gaya Gesek f_k / f_s (berlawanan ke atas bidang) */}
          {physics.frictionForce > 0.1 ? (
            <>
              <VectorArrow3D
                origin={[0, 0, 0]}
                direction={[-slopeDir[0], -slopeDir[1], 0]}
                length={physics.frictionForce * scaleF}
                color="#5C6064"
                visible={showVectors}
              />
              <CalloutPin
                position={[
                  -slopeDir[0] * Math.max(0.6, physics.frictionForce * scaleF),
                  -slopeDir[1] * Math.max(0.6, physics.frictionForce * scaleF),
                  0,
                ]}
                labelOffset={[-1.12, 0.65, -0.45]}
                label={physics.isMoving ? 'f_k' : 'f_s'}
                value={`${physics.frictionForce.toFixed(1)} N`}
                accent="charcoal"
                showPointerArrow
                visible={showVectors}
              />
            </>
          ) : null}
        </group>
      </group>

      {/* Garis Dimensi Tinggi h (digeser keluar ke kiri dengan labelOffset agar bebas dari bidang) */}
      <DimensionLine3D
        start={[-baseRun / 2 - 0.55, 0, rampWidth / 2]}
        end={[-baseRun / 2 - 0.55, rampHeight, rampWidth / 2]}
        label={`h = ${physics.rampHeightMeters.toFixed(2)} m`}
        labelOffset={[-0.78, 0.05, 0.25]}
        visible={showVectors}
      />

      {/* Garis Dimensi Panjang Alas & Info Massa di Bawah Depan dengan Clearance Jelas */}
      <DimensionLine3D
        start={[-baseRun / 2, -0.35, rampWidth / 2 + 0.15]}
        end={[baseRun / 2, -0.35, rampWidth / 2 + 0.15]}
        label={`L = ${(params.rampLengthMeters || 6).toFixed(1)} m · m = ${params.mass.toFixed(1)} kg`}
        labelOffset={[0, -0.32, 0.45]}
        visible={showVectors}
      />
    </group>
  );
}
