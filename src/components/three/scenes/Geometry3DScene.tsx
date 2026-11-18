import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import {
  calculateCircleGeometry,
  calculateTransformationGeometry,
} from '../../../engines/mathGeometry3d';
import type { Geometry3DParams } from '../../../types/lab';
import { CalloutPin } from '../CalloutPin';
import { DimensionLine3D } from '../DimensionLine3D';
import { ProjectedHtml3D } from '../ProjectedHtml3D';

interface Geometry3DSceneProps {
  params: Geometry3DParams;
  showVectors: boolean;
}

type Pt3 = [number, number, number];

function fmt(n: number): string {
  const r = Math.abs(n) < 0.0005 ? 0 : n;
  return Number.isInteger(r) ? `${r}` : r.toFixed(1);
}

function buildTrianglePrism(
  pts2D: Array<{ x: number; y: number }>,
  scale: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // Shape XY di-rotate -PI/2 pada sumbu X sehingga (x, y) shape menjadi (x, 0, -y) di dunia 3D
  shape.moveTo(pts2D[0].x * scale, pts2D[0].y * scale);
  shape.lineTo(pts2D[1].x * scale, pts2D[1].y * scale);
  shape.lineTo(pts2D[2].x * scale, pts2D[2].y * scale);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
  geom.rotateX(-Math.PI / 2);
  return geom;
}

function TransformationCartesianScene({
  params,
  showVectors,
}: Geometry3DSceneProps) {
  const tVal = useMemo(() => calculateTransformationGeometry(params), [params]);

  const scale = 0.34;
  const toStage = (x: number, y: number, h = 0.2): Pt3 => [
    x * scale,
    h,
    -y * scale,
  ];

  const originPolyGeom = useMemo(
    () => buildTrianglePrism(tVal.points, scale, 0.11),
    [tVal.points],
  );
  const imagePolyGeom = useMemo(
    () => buildTrianglePrism(tVal.transformedPoints, scale, 0.15),
    [tVal.transformedPoints],
  );

  const originLoop: Pt3[] = useMemo(
    () => [
      toStage(tVal.points[0].x, tVal.points[0].y, 0.28),
      toStage(tVal.points[1].x, tVal.points[1].y, 0.28),
      toStage(tVal.points[2].x, tVal.points[2].y, 0.28),
      toStage(tVal.points[0].x, tVal.points[0].y, 0.28),
    ],
    [tVal.points],
  );

  const imageLoop: Pt3[] = useMemo(
    () => [
      toStage(tVal.transformedPoints[0].x, tVal.transformedPoints[0].y, 0.34),
      toStage(tVal.transformedPoints[1].x, tVal.transformedPoints[1].y, 0.34),
      toStage(tVal.transformedPoints[2].x, tVal.transformedPoints[2].y, 0.34),
      toStage(tVal.transformedPoints[0].x, tVal.transformedPoints[0].y, 0.34),
    ],
    [tVal.transformedPoints],
  );

  const A3 = toStage(tVal.points[0].x, tVal.points[0].y, 0.3);
  const APrime3 = toStage(
    tVal.transformedPoints[0].x,
    tVal.transformedPoints[0].y,
    0.36,
  );
  const B3 = toStage(tVal.points[1].x, tVal.points[1].y, 0.3);
  const BPrime3 = toStage(
    tVal.transformedPoints[1].x,
    tVal.transformedPoints[1].y,
    0.36,
  );
  const C3 = toStage(tVal.points[2].x, tVal.points[2].y, 0.3);
  const CPrime3 = toStage(
    tVal.transformedPoints[2].x,
    tVal.transformedPoints[2].y,
    0.36,
  );

  // Garis cermin atau busur rotasi sesuai jenis transformasi
  const mirrorLinePts: Pt3[] | null = useMemo(() => {
    if (params.transformType !== 'refleksi') return null;
    switch (params.reflectionAxis) {
      case 'sumbu-x':
        return [toStage(-8, 0, 0.21), toStage(8, 0, 0.21)];
      case 'sumbu-y':
        return [toStage(0, -8, 0.21), toStage(0, 8, 0.21)];
      case 'y=x':
        return [toStage(-7.5, -7.5, 0.21), toStage(7.5, 7.5, 0.21)];
      case 'y=-x':
        return [toStage(-7.5, 7.5, 0.21), toStage(7.5, -7.5, 0.21)];
    }
  }, [params.transformType, params.reflectionAxis]);

  const rotationArcPts: Pt3[] | null = useMemo(() => {
    if (params.transformType !== 'rotasi' || params.rotationDeg === 0) {
      return null;
    }
    const ax = tVal.points[0].x;
    const ay = tVal.points[0].y;
    const radius = Math.hypot(ax, ay);
    if (radius < 0.05) return null;
    const startAng = Math.atan2(ay, ax);
    const deltaRad = (params.rotationDeg * Math.PI) / 180;
    const steps = 28;
    const pts: Pt3[] = [];
    for (let i = 0; i <= steps; i++) {
      const ang = startAng + (deltaRad * i) / steps;
      pts.push(toStage(radius * Math.cos(ang), radius * Math.sin(ang), 0.25));
    }
    return pts;
  }, [params.transformType, params.rotationDeg, tVal.points]);

  const originCenter3: Pt3 = [0, 0.22, 0];

  return (
    <group>
      {/* Papan Koordinat Kartesius Matte */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.14, 6.4]} />
        <meshStandardMaterial color="#E3DED2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[6.68, 0.06, 6.68]} />
        <meshStandardMaterial color="#D5CEBE" roughness={0.92} />
      </mesh>

      {/* Grid Kartesius [-8..8] kelipatan 2 */}
      {[-8, -6, -4, -2, 2, 4, 6, 8].map((tick) => (
        <group key={`grid-${tick}`}>
          <Line
            points={[toStage(tick, -8, 0.14), toStage(tick, 8, 0.14)]}
            color="#5C6064"
            transparent
            opacity={0.22}
            lineWidth={1}
          />
          <Line
            points={[toStage(-8, tick, 0.14), toStage(8, tick, 0.14)]}
            color="#5C6064"
            transparent
            opacity={0.22}
            lineWidth={1}
          />
        </group>
      ))}

      {/* Sumbu X & Sumbu Y */}
      <Line
        points={[toStage(-8.3, 0, 0.16), toStage(8.3, 0, 0.16)]}
        color="#23272A"
        lineWidth={2.2}
      />
      <Line
        points={[toStage(0, -8.3, 0.16), toStage(0, 8.3, 0.16)]}
        color="#23272A"
        lineWidth={2.2}
      />

      {/* Titik Pusat O(0,0) */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 14]} />
        <meshStandardMaterial color="#23272A" />
      </mesh>

      {showVectors ? (
        <>
          <ProjectedHtml3D center position={toStage(8.5, 0, 0.25)}>
            <span className="font-code text-[11px] font-bold text-[#23272A]">X</span>
          </ProjectedHtml3D>
          <ProjectedHtml3D center position={toStage(0, 8.5, 0.25)}>
            <span className="font-code text-[11px] font-bold text-[#23272A]">Y</span>
          </ProjectedHtml3D>
          <ProjectedHtml3D center position={[0.18, 0.24, 0.18]}>
            <span className="font-code text-[10px] font-semibold text-[#5C6064]">O</span>
          </ProjectedHtml3D>
        </>
      ) : null}

      {/* Prisma Objek Awal (ABC) */}
      <mesh position={[0, 0.15, 0]} geometry={originPolyGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color="#C9C3B4"
          roughness={0.82}
          transparent
          opacity={0.85}
        />
      </mesh>
      <Line points={originLoop} color="#23272A" lineWidth={2} />

      {/* Prisma Objek Bayangan (A'B'C') dengan Aksen Teal */}
      <mesh position={[0, 0.18, 0]} geometry={imagePolyGeom} castShadow>
        <meshStandardMaterial
          color="#0E5A63"
          roughness={0.55}
          transparent
          opacity={0.78}
        />
      </mesh>
      <Line points={imageLoop} color="#083C42" lineWidth={2.5} />

      {/* Garis Bantu Transformasi */}
      {params.transformType === 'translasi' ? (
        <>
          <Line
            points={[A3, APrime3]}
            color="#B86B2B"
            dashed
            dashSize={0.14}
            gapSize={0.08}
            lineWidth={2}
          />
          <Line
            points={[B3, BPrime3]}
            color="#5C6064"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.2}
          />
          <Line
            points={[C3, CPrime3]}
            color="#5C6064"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.2}
          />
        </>
      ) : null}

      {params.transformType === 'refleksi' && mirrorLinePts ? (
        <>
          <Line points={mirrorLinePts} color="#B86B2B" lineWidth={3.2} />
          <Line
            points={[A3, APrime3]}
            color="#0E5A63"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.8}
          />
          <Line
            points={[B3, BPrime3]}
            color="#5C6064"
            dashed
            dashSize={0.1}
            gapSize={0.08}
            lineWidth={1.2}
          />
        </>
      ) : null}

      {params.transformType === 'rotasi' ? (
        <>
          <Line
            points={[originCenter3, A3]}
            color="#5C6064"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.5}
          />
          <Line
            points={[originCenter3, APrime3]}
            color="#0E5A63"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.8}
          />
          {rotationArcPts ? (
            <Line points={rotationArcPts} color="#B86B2B" lineWidth={2.5} />
          ) : null}
        </>
      ) : null}

      {params.transformType === 'dilatasi' ? (
        <>
          <Line
            points={[
              originCenter3,
              params.dilationScale >= 1 ? APrime3 : A3,
            ]}
            color="#B86B2B"
            dashed
            dashSize={0.14}
            gapSize={0.08}
            lineWidth={1.6}
          />
          <Line
            points={[
              originCenter3,
              params.dilationScale >= 1 ? BPrime3 : B3,
            ]}
            color="#5C6064"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.2}
          />
          <Line
            points={[
              originCenter3,
              params.dilationScale >= 1 ? CPrime3 : C3,
            ]}
            color="#5C6064"
            dashed
            dashSize={0.12}
            gapSize={0.08}
            lineWidth={1.2}
          />
        </>
      ) : null}

      {/* Penanda Titik A & A' */}
      <mesh position={A3}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#23272A" />
      </mesh>
      <mesh position={APrime3}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#0E5A63" />
      </mesh>

      <CalloutPin
        position={A3}
        labelOffset={[-1.05, 0.88, 0.78]}
        label="A"
        value={`(${fmt(tVal.points[0].x)}, ${fmt(tVal.points[0].y)})`}
        accent="charcoal"
        showPointerArrow
        visible={showVectors}
      />
      <CalloutPin
        position={APrime3}
        labelOffset={[1.15, 1.05, -0.78]}
        label="A'"
        value={`(${fmt(tVal.transformedPoints[0].x)}, ${fmt(tVal.transformedPoints[0].y)})`}
        showPointerArrow
        visible={showVectors}
      />
    </group>
  );
}

function CircleIsometricScene({
  params,
  showVectors,
}: Geometry3DSceneProps) {
  const cVal = useMemo(() => calculateCircleGeometry(params), [params]);

  const maxSpan = params.showTangent ? cVal.externalDistance : cVal.radius;
  const scale = Math.min(0.45, 2.55 / Math.max(3.5, maxSpan));
  const R = cVal.radius * scale;
  const thetaRad = (cVal.centralAngleDeg * Math.PI) / 180;

  const toPlane = (x: number, y: number, h = 0.22): Pt3 => [x, h, -y];

  // Titik A pada sudut 0 rad, titik B pada sudut thetaRad
  const A = toPlane(R, 0, 0.25);
  const B = toPlane(R * Math.cos(thetaRad), R * Math.sin(thetaRad), 0.25);
  const O: Pt3 = [0, 0.25, 0];

  // Sektor Juring 3D (Extrude)
  const sectorGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, R, 0, thetaRad, false);
    shape.closePath();
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: false,
      curveSegments: 48,
    });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [R, thetaRad]);

  // Keliling Lingkaran & Busur AB
  const circleRimPts = useMemo(() => {
    const pts: Pt3[] = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      pts.push(toPlane(R * Math.cos(a), R * Math.sin(a), 0.22));
    }
    return pts;
  }, [R]);

  const arcPts = useMemo(() => {
    const pts: Pt3[] = [];
    const segs = 40;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * thetaRad;
      pts.push(toPlane(R * Math.cos(a), R * Math.sin(a), 0.34));
    }
    return pts;
  }, [R, thetaRad]);

  // Sudut Keliling di Titik C pada busur mayor berlawanan
  const angleC = thetaRad / 2 + Math.PI;
  const C = toPlane(R * Math.cos(angleC), R * Math.sin(angleC), 0.27);

  // Garis Singgung pada sudut 310° (kuadran IV/bawah-kanan agar lega dari juring atas)
  const tanAngle = -Math.PI * 0.28;
  const tanDirX = Math.cos(tanAngle);
  const tanDirY = Math.sin(tanAngle);
  // Arah tegak lurus garis singgung (tangent unit berlawanan jarum jam)
  const perpX = -tanDirY;
  const perpY = tanDirX;

  const tanLenScaled = cVal.tangentLength * scale;
  const T2x = R * tanDirX;
  const T2y = R * tanDirY;
  const P2x = T2x + perpX * tanLenScaled;
  const P2y = T2y + perpY * tanLenScaled;

  const T = toPlane(T2x, T2y, 0.27);
  const P = toPlane(P2x, P2y, 0.27);

  // Simbol siku-siku 90 derajat di T
  const sq = Math.min(0.22, R * 0.22);
  const sqCorner1 = toPlane(T2x - tanDirX * sq, T2y - tanDirY * sq, 0.27);
  const sqCorner2 = toPlane(
    T2x - tanDirX * sq + perpX * sq,
    T2y - tanDirY * sq + perpY * sq,
    0.27,
  );
  const sqCorner3 = toPlane(T2x + perpX * sq, T2y + perpY * sq, 0.27);

  const midArcAngle = thetaRad / 2;
  const midArc = toPlane(
    R * Math.cos(midArcAngle),
    R * Math.sin(midArcAngle),
    0.34,
  );

  return (
    <group>
      {/* Alas Papan Lingkaran Matte */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.14, 6.4]} />
        <meshStandardMaterial color="#E3DED2" roughness={0.9} />
      </mesh>

      {/* Cakram Lingkaran Dasar */}
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <cylinderGeometry args={[R, R, 0.08, 64]} />
        <meshStandardMaterial color="#F6F3EC" roughness={0.8} />
      </mesh>

      {/* Bingkai Keliling Lingkaran */}
      <Line points={circleRimPts} color="#23272A" lineWidth={2} />

      {/* Sektor Juring Menyala */}
      <mesh position={[0, 0.18, 0]} geometry={sectorGeom}>
        <meshStandardMaterial
          color="#0E5A63"
          transparent
          opacity={0.62}
          roughness={0.5}
        />
      </mesh>

      {/* Jari-jari OA, OB & Busur AB Tebal */}
      <Line points={[O, A]} color="#083C42" lineWidth={2.5} />
      <Line points={[O, B]} color="#083C42" lineWidth={2.5} />
      <Line points={arcPts} color="#B86B2B" lineWidth={4} />

      {/* Pusat O */}
      <mesh position={O}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color="#23272A" />
      </mesh>

      {/* Tali Busur AB & Sudut Keliling di C */}
      {params.showChord ? (
        <group>
          <Line points={[A, B]} color="#23272A" lineWidth={2.4} />
          <Line points={[C, A]} color="#B86B2B" lineWidth={2} />
          <Line points={[C, B]} color="#B86B2B" lineWidth={2} />
          <mesh position={C}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#B86B2B" />
          </mesh>
          <CalloutPin
            position={C}
            labelOffset={[-1.05, 0.72, 0.85]}
            label="Sudut Keliling"
            value={`θ/2 = ${cVal.inscribedAngleDeg.toFixed(1)}°`}
            accent="charcoal"
            showPointerArrow
            visible={showVectors}
          />
        </group>
      ) : null}

      {/* Garis Singgung Tegak Lurus Jari-jari OT */}
      {params.showTangent ? (
        <group>
          <Line points={[O, T]} color="#0E5A63" lineWidth={2.4} />
          <Line points={[T, P]} color="#0E5A63" lineWidth={3.2} />
          <Line
            points={[O, P]}
            color="#5C6064"
            dashed
            dashSize={0.14}
            gapSize={0.08}
            lineWidth={1.6}
          />
          {/* Penanda Siku-siku 90° di T */}
          <Line
            points={[sqCorner1, sqCorner2, sqCorner3]}
            color="#B86B2B"
            lineWidth={2.2}
          />
          <mesh position={T}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#B86B2B" />
          </mesh>
          <mesh position={P}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#0E5A63" />
          </mesh>
          <CalloutPin
            position={[(T[0] + P[0]) / 2, 0.3, (T[2] + P[2]) / 2]}
            labelOffset={[0.85, 0.85, 0.65]}
            label="Garis Singgung PT"
            value={`${cVal.tangentLength.toFixed(2)} cm (90°)`}
            showPointerArrow
            visible={showVectors}
          />
        </group>
      ) : null}

      {/* Callout Jari-jari & Panjang Busur */}
      <CalloutPin
        position={[R * 0.55, 0.28, 0]}
        labelOffset={[0.45, 0.62, 0.78]}
        label="r"
        value={`${cVal.radius.toFixed(1)} cm`}
        accent="charcoal"
        showPointerArrow
        visible={showVectors}
      />
      <CalloutPin
        position={midArc}
        labelOffset={[0.95, 1.05, -0.95]}
        label="Busur s"
        value={`${cVal.arcLength.toFixed(2)} cm (θ=${cVal.centralAngleDeg}°)`}
        showPointerArrow
        visible={showVectors}
      />

      <DimensionLine3D
        start={[-R, 0.16, R + 0.38]}
        end={[R, 0.16, R + 0.38]}
        label={`Diameter = ${(cVal.radius * 2).toFixed(1)} cm · Juring = ${cVal.sectorArea.toFixed(1)} cm²`}
        labelOffset={[0, 0.1, 0.25]}
        visible={showVectors}
      />
    </group>
  );
}

export function Geometry3DScene({ params, showVectors }: Geometry3DSceneProps) {
  if (params.subMode === 'lingkaran') {
    return <CircleIsometricScene params={params} showVectors={showVectors} />;
  }
  return <TransformationCartesianScene params={params} showVectors={showVectors} />;
}
