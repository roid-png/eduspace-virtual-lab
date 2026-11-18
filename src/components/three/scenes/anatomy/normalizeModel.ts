import * as THREE from 'three';

export interface NormalizedTransform {
  scale: number;
  position: [number, number, number];
}

export function computeNormalizedTransform(
  object: THREE.Object3D,
  targetMaxDimension = 2.35,
  targetCenterY = 1.48,
): NormalizedTransform {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) {
    return { scale: 1, position: [0, targetCenterY, 0] };
  }

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  const scale = targetMaxDimension / maxDim;

  return {
    scale,
    position: [
      -center.x * scale,
      targetCenterY - center.y * scale,
      -center.z * scale,
    ],
  };
}

export function cloneSceneMaterialsSafely(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    const cloneMat = (mat: THREE.Material): THREE.Material => {
      const cloned = mat.clone();
      const stdMat = cloned as THREE.MeshStandardMaterial;
      cloned.userData.__origMat = {
        transparent: cloned.transparent,
        opacity: cloned.opacity,
        depthWrite: cloned.depthWrite,
        emissive: 'emissive' in stdMat && stdMat.emissive ? stdMat.emissive.clone() : null,
        emissiveIntensity:
          'emissiveIntensity' in stdMat && typeof stdMat.emissiveIntensity === 'number'
            ? stdMat.emissiveIntensity
            : 0,
      };
      return cloned;
    };

    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map(cloneMat);
    } else if (obj.material) {
      obj.material = cloneMat(obj.material);
    }
  });
}

export function findNodeBySanitizedName(
  root: THREE.Object3D,
  targetName: string,
): THREE.Object3D | undefined {
  const direct = root.getObjectByName(targetName);
  if (direct) return direct;

  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, '');
  const normalizedTarget = sanitize(targetName);
  let found: THREE.Object3D | undefined;
  root.traverse((obj) => {
    if (found) return;
    if (obj.name && sanitize(obj.name) === normalizedTarget) {
      found = obj;
    }
  });
  return found;
}
