import { ProjectedHtml3D } from '../../ProjectedHtml3D';

export function AnatomyModelFallback({ label = 'Memuat model 3D...' }: { label?: string }) {
  return (
    <group position={[0, 1.45, 0]}>
      <mesh>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#E3DED2" roughness={0.9} transparent opacity={0.65} />
      </mesh>
      <ProjectedHtml3D center position={[0, 0.7, 0]}>
        <div
          className="rounded-full px-3 py-1 font-code text-[11px] font-semibold"
          style={{
            backgroundColor: '#F6F3EC',
            color: '#0E5A63',
            boxShadow: '3px 3px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.85)',
          }}
        >
          {label}
        </div>
      </ProjectedHtml3D>
    </group>
  );
}
