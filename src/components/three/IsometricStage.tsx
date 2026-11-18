import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { LabelOverlayContext } from './ProjectedHtml3D';
import type { LabelOverlayApi } from './ProjectedHtml3D';

export interface CameraFocusTarget {
  target: [number, number, number];
  zoomMultiplier: number;
  focusKey: string;
}

interface IsometricStageProps {
  children: ReactNode;
  resetTick?: number;
  zoom?: number;
  interactive?: boolean;
  showFloorGrid?: boolean;
  cameraFocus?: CameraFocusTarget | null;
  dimmedLighting?: boolean;
}

const DEFAULT_CAM_POS: [number, number, number] = [10, 8.5, 10];
const DEFAULT_TARGET: [number, number, number] = [0, 0.85, 0];

function CameraController({
  resetTick,
  baseZoom,
  interactive,
  cameraFocus,
}: {
  resetTick: number;
  baseZoom: number;
  interactive: boolean;
  cameraFocus?: CameraFocusTarget | null;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { size, set } = useThree();
  const lerpingRef = useRef(false);
  const goalTargetRef = useRef(new THREE.Vector3(...DEFAULT_TARGET));
  const goalZoomRef = useRef(baseZoom);

  const responsiveZoom = size.width < 460 ? baseZoom * 0.68 : baseZoom;

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    lerpingRef.current = false;
    const cam = ctrl.object;
    cam.position.set(...DEFAULT_CAM_POS);
    cam.lookAt(...DEFAULT_TARGET);
    if ('zoom' in cam && typeof cam.zoom === 'number') {
      const orthoCam = cam as typeof cam & { zoom: number; updateProjectionMatrix: () => void };
      orthoCam.zoom = responsiveZoom;
      orthoCam.updateProjectionMatrix();
    }
    ctrl.target.set(...DEFAULT_TARGET);
    ctrl.update();
    set({});
  }, [resetTick, responsiveZoom, set]);

  useEffect(() => {
    if (!cameraFocus) {
      goalTargetRef.current.set(...DEFAULT_TARGET);
      goalZoomRef.current = responsiveZoom;
      lerpingRef.current = true;
      return;
    }
    goalTargetRef.current.set(...cameraFocus.target);
    goalZoomRef.current = responsiveZoom * Math.max(0.6, Math.min(3.8, cameraFocus.zoomMultiplier));
    lerpingRef.current = true;
  }, [cameraFocus, responsiveZoom]);

  useFrame((_state, delta) => {
    if (!lerpingRef.current) return;
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const cam = ctrl.object as typeof ctrl.object & {
      zoom?: number;
      updateProjectionMatrix?: () => void;
    };

    const step = Math.min(1, delta * 5.5);
    ctrl.target.lerp(goalTargetRef.current, step);

    let zoomDone = true;
    if (typeof cam.zoom === 'number' && cam.updateProjectionMatrix) {
      cam.zoom = THREE.MathUtils.lerp(cam.zoom, goalZoomRef.current, step);
      cam.updateProjectionMatrix();
      zoomDone = Math.abs(cam.zoom - goalZoomRef.current) < 0.2;
    }

    ctrl.update();

    if (ctrl.target.distanceTo(goalTargetRef.current) < 0.015 && zoomDone) {
      ctrl.target.copy(goalTargetRef.current);
      if (typeof cam.zoom === 'number' && cam.updateProjectionMatrix) {
        cam.zoom = goalZoomRef.current;
        cam.updateProjectionMatrix();
      }
      ctrl.update();
      lerpingRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={interactive}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minZoom={responsiveZoom * 0.55}
      maxZoom={responsiveZoom * 4.0}
      minPolarAngle={0.22}
      maxPolarAngle={Math.PI / 2.08}
      target={DEFAULT_TARGET}
      onStart={() => {
        lerpingRef.current = false;
      }}
    />
  );
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // WebGL context fallback handled gracefully
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-sm text-[#5C6064]">
          <p className="font-semibold text-[#23272A]">Kanvas 3D tidak tersedia</p>
          <p className="mt-1">Pastikan akselerasi WebGL aktif pada browser Anda.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function IsometricStage({
  children,
  resetTick = 0,
  zoom = 50,
  interactive = true,
  showFloorGrid = true,
  cameraFocus = null,
  dimmedLighting = false,
}: IsometricStageProps) {
  const [labels, setLabels] = useState<Array<{ id: string; content: ReactNode }>>([]);
  const domMapRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const upsertLabel = useCallback((id: string, content: ReactNode) => {
    setLabels((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return [...prev, { id, content }];
      const next = [...prev];
      next[idx] = { id, content };
      return next;
    });
  }, []);

  const removeLabel = useCallback((id: string) => {
    domMapRef.current.delete(id);
    setLabels((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getDomEl = useCallback(
    (id: string) => domMapRef.current.get(id) ?? null,
    [],
  );

  const labelApi = useMemo<LabelOverlayApi>(
    () => ({ upsertLabel, removeLabel, getDomEl }),
    [upsertLabel, removeLabel, getDomEl],
  );

  return (
    <CanvasErrorBoundary>
      <div className="relative isolate h-full w-full overflow-hidden">
        <LabelOverlayContext.Provider value={labelApi}>
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            className="h-full w-full"
          >
            <OrthographicCamera
              makeDefault
              position={DEFAULT_CAM_POS}
              zoom={zoom}
              near={0.1}
              far={120}
            />

            {/* Pencahayaan lembut kiri-atas 135° selaras dengan Soft Tactile Neumorphism */}
            <ambientLight
              intensity={dimmedLighting ? 0.34 : 0.78}
              color={dimmedLighting ? '#C7D2DE' : '#FFFFFF'}
            />
            <directionalLight
              position={[-7, 13, 8]}
              intensity={dimmedLighting ? 0.3 : 1.05}
              color={dimmedLighting ? '#A7B8CC' : '#FFFDF8'}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-near={1}
              shadow-camera-far={40}
              shadow-camera-left={-8}
              shadow-camera-right={8}
              shadow-camera-top={8}
              shadow-camera-bottom={-8}
            />
            <directionalLight
              position={[8, 4, -6]}
              intensity={dimmedLighting ? 0.14 : 0.28}
              color="#E3DED2"
            />

            {/* Alas lantai cleanroom matte */}
            {showFloorGrid ? (
              <group position={[0, -0.02, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <circleGeometry args={[6.2, 64]} />
                  <meshStandardMaterial color="#EFECE4" roughness={0.95} metalness={0} />
                </mesh>
                <gridHelper
                  args={[10, 10, '#C8C1B0', '#D8D2C5']}
                  position={[0, 0.01, 0]}
                />
              </group>
            ) : null}

            {children}

            <CameraController
              resetTick={resetTick}
              baseZoom={zoom}
              interactive={interactive}
              cameraFocus={cameraFocus}
            />
          </Canvas>
        </LabelOverlayContext.Provider>

        {/* Overlay DOM murni di luar tree R3F */}
        <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
          {labels.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) domMapRef.current.set(item.id, el);
                else domMapRef.current.delete(item.id);
              }}
              className="pointer-events-none absolute top-0 left-0 will-change-transform"
              style={{ opacity: 0 }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </CanvasErrorBoundary>
  );
}
