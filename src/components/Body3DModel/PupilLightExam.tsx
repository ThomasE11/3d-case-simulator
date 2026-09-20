import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import type { PupilProfile } from '@/lib/pupilExam';
import { stepPupilLightResponse } from './pupilLightResponse';
import { pupilDiscScale } from '@/lib/pupilDiscScale';
import { withIrisSurfaceUv } from './irisSurface';

type LightSide = 'left' | 'right' | null;

export function PupilLightControls({ side, onChange }: { side: LightSide; onChange: (side: LightSide) => void }) {
  const { t } = useTranslation();
  return (
    <section aria-label={t('eyeExam.title', { defaultValue: 'Patient pupil examination' })} className="rounded-xl border border-sky-300/30 bg-slate-950 p-3 text-white">
      <h4 className="text-xs font-semibold">{t('eyeExam.title', { defaultValue: 'Patient pupil examination' })}</h4>
      <p className="mt-2 text-[11px] text-slate-300">{t('eyeExam.guidance', { defaultValue: 'Ask the patient to look into the distance. Shine the light into one eye and observe both pupils on the patient.' })}</p>
      <div className="mt-3 grid gap-2">
        {(['left', 'right'] as const).map(eye => (
          <button key={eye} type="button" aria-pressed={side === eye}
            aria-label={t(`eyeExam.${eye}Label`, { defaultValue: `Shine light: patient's ${eye} eye` })}
            onClick={() => onChange(eye)} className={`rounded-lg border px-3 py-2 text-xs ${side === eye ? 'border-sky-300 bg-sky-700' : 'border-white/20 bg-slate-800'}`}>
            {t(`eyeExam.${eye}`, { defaultValue: eye === 'left' ? "Patient's left eye" : "Patient's right eye" })}
          </button>
        ))}
        <button type="button" onClick={() => onChange(null)} aria-pressed={side === null} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          {t('eyeExam.off', { defaultValue: 'Penlight off' })}
        </button>
      </div>
      <p className="mt-2 text-[10px] text-slate-300">{t('eyeExam.observe', { defaultValue: 'Compare direct and consensual responses, then remove the light and watch recovery.' })}</p>
    </section>
  );
}

function irisTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x - size / 2) / (size / 2), dy = (y - size / 2) / (size / 2);
    const radius = Math.hypot(dx, dy), angle = Math.atan2(dy, dx);
    const fibre = Math.sin(angle * 137 + radius * 12) * .15 + Math.sin(angle * 79 - radius * 24) * .10;
    const limbus = 1 - .6 * THREE.MathUtils.smoothstep(radius, .83, 1);
    const ring = .85 + .15 * Math.sin(radius * 45 + Math.sin(angle * 19));
    const shade = Math.max(.15, (1 + fibre) * limbus * ring);
    const offset = (y * size + x) * 4;
    pixels.data.set([Math.round(103 * shade), Math.round(71 * shade), Math.round(40 * shade), 255], offset);
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Iris appearance belongs to the patient, not to the examination tool. The
 * committed face attachment also makes this effect follow a rebuilt clone,
 * rather than running before the asynchronous patient model has loaded. */
export function PilotIrisDetail({ attachment }: { attachment: THREE.Group }) {
  const scene = useThree(state => state.scene);
  useEffect(() => {
    const texture = irisTexture();
    const replacements: Array<{ mesh: THREE.Mesh; material: THREE.Material | THREE.Material[]; replacement: THREE.Material; geometry: THREE.BufferGeometry; detailedGeometry: THREE.BufferGeometry }> = [];
    for (const name of ['irisL', 'irisR']) {
      const mesh = scene.getObjectByName(name) as THREE.Mesh | undefined;
      if (!mesh?.isMesh) continue;
      const replacement = new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: texture,
        roughness: .4, clearcoat: .8, clearcoatRoughness: .1 });
      replacement.userData.skipRecolor = true;
      const detailedGeometry = withIrisSurfaceUv(mesh.geometry);
      replacements.push({ mesh, material: mesh.material, replacement, geometry: mesh.geometry, detailedGeometry });
      mesh.geometry = detailedGeometry;
      mesh.material = replacement;
    }
    return () => {
      for (const { mesh, material, replacement, geometry, detailedGeometry } of replacements) {
        if (mesh.material === replacement) mesh.material = material;
        if (mesh.geometry === detailedGeometry) mesh.geometry = geometry;
        replacement.dispose(); detailedGeometry.dispose();
      }
      texture.dispose();
    };
  }, [scene, attachment]);
  return null;
}

/** Mounted only in the pilot's eye exam. Uses the existing eye nodes, not a
 * separate cartoon face. Penlight highlights and pupil sizes restore on exit;
 * the patient's detailed irises persist independently of the tool. */
export function PupilLightExam({ side, profile }: { side: LightSide; profile: PupilProfile }) {
  const scene = useThree(state => state.scene);
  const penlight = useRef<THREE.Group>(null);
  const light = useRef<THREE.SpotLight>(null);
  const lightTarget = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);
  const sizes = useRef<[number, number]>([profile.leftMm, profile.rightMm]);
  const vectors = useMemo(() => ({ position: new THREE.Vector3(), normal: new THREE.Vector3(), offset: new THREE.Vector3(), rotation: new THREE.Quaternion() }), []);
  useEffect(() => {
    const replacements: Array<{ mesh: THREE.Mesh; material: THREE.Material | THREE.Material[]; replacement: THREE.Material }> = [];
    for (const name of ['eyeL', 'eyeR', 'pupilL', 'pupilR']) {
      const mesh = scene.getObjectByName(name) as THREE.Mesh | undefined;
      if (!mesh?.isMesh) continue;
      const replacement = new THREE.MeshPhysicalMaterial({
        color: name.startsWith('pupil') ? '#020202' : '#e8e3d8',
        roughness: name.startsWith('pupil') ? .3 : .25,
        clearcoat: .8, clearcoatRoughness: .1,
      });
      replacement.userData.skipRecolor = true;
      replacements.push({ mesh, material: mesh.material, replacement });
      mesh.material = replacement;
    }
    return () => {
      for (const { mesh, material, replacement } of replacements) {
        mesh.material = material; replacement.dispose();
      }
      scene.getObjectByName('pupilL')?.scale.setScalar(pupilDiscScale(profile.leftMm));
      scene.getObjectByName('pupilR')?.scale.setScalar(pupilDiscScale(profile.rightMm));
    };
  }, [scene, profile.leftMm, profile.rightMm]);
  useFrame((_, dt) => {
    const delta = Math.min(dt, .05);
    elapsed.current = side ? elapsed.current + delta : 0;
    sizes.current = stepPupilLightResponse(sizes.current, profile, !!side, elapsed.current, delta);
    ['pupilL', 'pupilR'].forEach((name, index) => {
      const pupil = scene.getObjectByName(name);
      if (pupil) pupil.scale.setScalar(pupilDiscScale(sizes.current[index]));
    });
    if (!penlight.current || !light.current) return;
    penlight.current.visible = !!side;
    light.current.intensity = side ? .045 : 0;
    const eye = scene.getObjectByName(side === 'left' ? 'irisL' : 'irisR');
    if (!side || !eye) return;
    eye.getWorldPosition(vectors.position);
    eye.getWorldQuaternion(vectors.rotation);
    // Keep the barrel below/temporal to the eye, within the face framing.
    // The previous broad point light sat near the ear and was imperceptible.
    vectors.offset.set(side === 'left' ? .018 : -.018, -.024, .055).applyQuaternion(vectors.rotation);
    penlight.current.position.copy(vectors.position).add(vectors.offset);
    penlight.current.lookAt(vectors.position);
    lightTarget.position.copy(vectors.position);
    lightTarget.updateMatrixWorld();
    // Place the source at the lens, not at an unrelated point near the face.
    light.current.position.copy(penlight.current.position)
      .addScaledVector(vectors.normal.copy(vectors.offset).normalize(), -.028);
  });
  return <>
    <group ref={penlight} name="pilot-penlight" visible={false}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => {}}>
        <cylinderGeometry args={[.004, .004, .055, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={.6} roughness={.3} />
      </mesh>
      <mesh position={[0, 0, .028]} raycast={() => {}}>
        <circleGeometry args={[.0035, 16]} />
        <meshBasicMaterial color="#fff5d6" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, .023]} rotation={[Math.PI / 2, 0, 0]} raycast={() => {}}>
        <cylinderGeometry args={[.005, .005, .007, 16]} />
        <meshStandardMaterial color="#334155" metalness={.5} roughness={.3} />
      </mesh>
    </group>
    <primitive object={lightTarget} />
    <spotLight ref={light} name="pilot-penlight-illumination" target={lightTarget}
      intensity={0} distance={.18} angle={.38} penumbra={.65} decay={2} color="#fff5df" />
  </>;
}
