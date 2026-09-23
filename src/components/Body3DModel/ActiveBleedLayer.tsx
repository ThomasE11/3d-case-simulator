/**
 * ActiveBleedLayer — a *living* bleed overlay for the treatment bay.
 *
 * Static wound decals read as "paint". This layer makes an active bleed
 * unmistakable at a glance: a soft red glow that pulses with the patient's
 * heart rhythm at the wound site. When the student achieves source control
 * (tourniquet / pressure dressing / chest seal), the glow collapses — the
 * wound "dies" visually, exactly like a real bleeding site under control.
 *
 * Self-contained: no clinical state, pure presentational input.
 *   - `overlays`: the same PatientWoundOverlay[] fed to the body.
 *   - `controlledIds`: wound ids considered controlled.
 *   - `sampler`: projects a 2D landmark onto the real mesh surface.
 *   - `bpm`: heart rate drives the pulse frequency.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PatientWoundOverlay } from '@/lib/patientVisualState';
import { isBleedRegionControlled } from '@/lib/bleedControl';
import type { SurfaceSampler } from './BodyMesh';

const ANCHORS: Record<string, [number, number, number]> = {
  'left-arm': [0.145, 1.10, 0.16],
  'right-arm': [-0.145, 1.10, 0.16],
  'left-leg': [0.165, 0.42, 0.18],
  'right-leg': [-0.165, 0.42, 0.18],
  'chest': [0.0, 1.27, 0.20],
  'abdomen': [0.0, 1.02, 0.24],
  'pelvis': [0.0, 0.90, 0.24],
  'neck': [0.0, 1.46, 0.22],
  'face': [0.0, 1.62, 0.20],
  'posterior': [0.0, 1.10, -0.20],
};

function makeBleedTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // Hot core that reads against both skin and clothing: bright crimson
  // centre fading through red to transparent — unmistakable as fresh blood.
  const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 40, 30, 0.98)');
  grad.addColorStop(0.28, 'rgba(230, 30, 20, 0.85)');
  grad.addColorStop(0.55, 'rgba(190, 20, 15, 0.55)');
  grad.addColorStop(1, 'rgba(150, 10, 10, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // Bright rim — a thin ring of alert-red that separates the glow from a
  // red garment underneath.
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 80, 60, 0.9)';
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ActiveBleedSprites({
  overlays,
  controlledIds,
  sampler,
  bpm = 80,
}: {
  overlays: PatientWoundOverlay[];
  controlledIds: Set<string>;
  sampler: SurfaceSampler | null;
  bpm?: number;
}) {
  const texture = useMemo(() => makeBleedTexture(), []);
  const groupRef = useRef<THREE.Group>(null);

  const sites = useMemo(() => {
    return overlays
      .filter(o => o.kind === 'active_bleeding')
      .map((o, i) => {
        const anchor = ANCHORS[o.region] ?? ANCHORS.chest;
        const pos: [number, number, number] =
          sampler && o.region !== 'posterior'
            ? sampler(anchor[0], anchor[1])
            : anchor;
        // Sampler can return NaN for landmarks outside the sampled mesh —
        // never let a NaN position silently cull the bleed sprite.
        const safePos: [number, number, number] = Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2])
          ? pos
          : anchor;
        const upward: [number, number, number] = ['chest', 'abdomen', 'pelvis', 'face', 'neck'].includes(o.region)
          ? [safePos[0], safePos[1] + 0.06, safePos[2]]
          : o.region === 'posterior'
            ? [safePos[0], safePos[1] - 0.06, safePos[2]]
            : [safePos[0], safePos[1], safePos[2] + 0.045]; // limbs: lateral +Z
        return { pos: upward, id: `bleed-${o.region}-${i}`, region: o.region };
      });
  }, [overlays, sampler]);

  const spritesRef = useRef<THREE.Sprite[]>([]);
  const sitesRef = useRef(sites);
  sitesRef.current = sites;
  const siteSignature = sites.map(site => site.id).join('|');

  // Imperative sprite construction keeps the material under the animation
  // loop's ownership. Rebuild only when the wound identities change, not
  // whenever vitals or breathing mint a fresh position/overlay array.
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    while (g.children.length) g.remove(g.children[0]);
    spritesRef.current = sitesRef.current.map(site => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          toneMapped: false,
          opacity: 0.3,
        }),
      );
      sprite.position.set(site.pos[0], site.pos[1], site.pos[2]);
      sprite.renderOrder = 999;
      g.add(sprite);
      return sprite;
    });
  }, [siteSignature, texture]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const freq = Math.min(180, Math.max(30, bpm || 80)) / 60;
    spritesRef.current.forEach((sprite, idx) => {
      const site = sites[idx];
      if (!site) return;
      const mat = sprite.material as THREE.SpriteMaterial;
      // Follow chest/limb movement without replacing the animated material.
      sprite.position.set(site.pos[0], site.pos[1], site.pos[2]);
      const controlled = isBleedRegionControlled(controlledIds, site.region);
      if (controlled) {
        mat.opacity = 0;
        sprite.scale.setScalar(0.4);
        return;
      }
      const pulse = 0.5 + 0.5 * Math.sin(t * Math.min(freq, 1.1) * Math.PI * 2);
      // A wound cue must never become a full-torso flashing disc. Keep the
      // opacity and scale variations subtle; continuous bleeding reads through
      // the crimson texture while motion stays below the flicker threshold.
      const target = 0.72 + 0.05 * pulse;
      mat.opacity += (target - mat.opacity) * 0.08;
      const scale = 0.06 + 0.006 * pulse;
      sprite.scale.setScalar(scale);
    });
  });

  return <group ref={groupRef} />;
}


/**
 * ContinuousBleedField — blood that keeps coming until source control.
 *
 * The pulse sprite only said "this wound is red". Real bleeding is a
 * process: it drips, it pools, and the pool grows while the source is open.
 * Each uncontrolled `active_bleeding` site drops timed drips to the floor and
 * grows a wet pool under the patient. When `isBleedRegionControlled` flips
 * true the drips stop; the pool freezes at its current size as evidence of
 * what was lost. Controlled wounds never resume bleeding.
 */
const DRIP_INTERVAL_S = 0.55;
const MAX_DRIPS = 18;
const POOL_GROWTH_PER_S = 0.012; // metres of pool radius per second
const POOL_MAX_RADIUS = 0.55;

function makePoolTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(120, 8, 8, 0.92)');
  grad.addColorStop(0.45, 'rgba(95, 6, 6, 0.72)');
  grad.addColorStop(0.8, 'rgba(70, 4, 4, 0.35)');
  grad.addColorStop(1, 'rgba(50, 2, 2, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // Irregular edge so the pool is not a perfect circle decal.
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(
      size / 2 + Math.cos(a) * size * 0.38,
      size / 2 + Math.sin(a) * size * 0.38,
      size * 0.12,
      size * 0.08,
      a,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ContinuousBleedField({
  overlays,
  controlledIds,
  sampler,
  floorY = -0.04,
}: {
  overlays: PatientWoundOverlay[];
  controlledIds: Set<string>;
  sampler: SurfaceSampler | null;
  floorY?: number;
}) {
  const poolTex = useMemo(() => makePoolTexture(), []);
  const dripTex = useMemo(() => makeBleedTexture(), []);
  const root = useRef<THREE.Group>(null);
  const dripsRef = useRef<Array<{
    sprite: THREE.Sprite;
    region: string;
    birth: number;
    from: THREE.Vector3;
    to: THREE.Vector3;
  }>>([]);
  const poolsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const elapsedRef = useRef(0);
  const lastDripRef = useRef<Map<string, number>>(new Map());

  const sites = useMemo(() => {
    return overlays
      .filter(o => o.kind === 'active_bleeding')
      .map((o, i) => {
        const anchor = ANCHORS[o.region] ?? ANCHORS.chest;
        const pos: [number, number, number] =
          sampler && o.region !== 'posterior' ? sampler(anchor[0], anchor[1]) : anchor;
        const safe: THREE.Vector3 = new THREE.Vector3(
          Number.isFinite(pos[0]) ? pos[0] : anchor[0],
          Number.isFinite(pos[1]) ? pos[1] : anchor[1],
          Number.isFinite(pos[2]) ? pos[2] : anchor[2],
        );
        return { region: o.region, id: `cbleed-${o.region}-${i}`, wound: safe };
      });
  }, [overlays, sampler]);
  const siteKey = sites.map(s => s.id).join('|');

  useEffect(() => {
    const g = root.current;
    const pools = poolsRef.current;
    return () => {
      dripsRef.current.forEach(d => {
        d.sprite.material.dispose();
        g?.remove(d.sprite);
      });
      dripsRef.current = [];
      pools.forEach(m => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
        g?.remove(m);
      });
      pools.clear();
    };
  }, []);

  useFrame((_, delta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    elapsedRef.current += dt;
    const now = elapsedRef.current;

    for (const site of sites) {
      const open = !isBleedRegionControlled(controlledIds, site.region);

      // Floor pool sits under the wound (or slightly anterior on the floor).
      let pool = poolsRef.current.get(site.id);
      if (!pool) {
        const mat = new THREE.MeshBasicMaterial({
          map: poolTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.85,
          toneMapped: false,
        });
        pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        pool.rotation.x = -Math.PI / 2;
        pool.renderOrder = 2;
        g.add(pool);
        poolsRef.current.set(site.id, pool);
      }
      pool.position.set(site.wound.x, floorY + 0.004, site.wound.z + 0.05);
      if (open) {
        const next = Math.min(POOL_MAX_RADIUS, pool.scale.x + POOL_GROWTH_PER_S * dt * 2);
        pool.scale.set(next, next, 1);
      }

      if (!open) continue;

      // Drips fall from the wound to the pool while the source is open.
      const last = lastDripRef.current.get(site.id) ?? -99;
      if (now - last >= DRIP_INTERVAL_S && dripsRef.current.length < MAX_DRIPS * Math.max(1, sites.length)) {
        lastDripRef.current.set(site.id, now);
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: dripTex,
            transparent: true,
            depthWrite: false,
            opacity: 0.9,
            toneMapped: false,
          }),
        );
        sprite.scale.setScalar(0.025);
        sprite.renderOrder = 998;
        g.add(sprite);
        dripsRef.current.push({
          sprite,
          region: site.region,
          birth: now,
          from: site.wound.clone(),
          to: new THREE.Vector3(site.wound.x + (Math.random() - 0.5) * 0.04, floorY + 0.01, site.wound.z + 0.05),
        });
      }
    }

    // Advance live drips; retire those that hit the floor or whose site closed.
    const keep: typeof dripsRef.current = [];
    for (const d of dripsRef.current) {
      const open = !isBleedRegionControlled(controlledIds, d.region);
      const age = now - d.birth;
      const fall = 0.45; // seconds to floor
      if (!open && age > fall) {
        d.sprite.material.dispose();
        g.remove(d.sprite);
        continue;
      }
      const t = Math.min(1, age / fall);
      // Ease-in fall (gravity), slight lateral drift.
      const y = d.from.y + (d.to.y - d.from.y) * (t * t);
      d.sprite.position.set(
        d.from.x + (d.to.x - d.from.x) * t,
        y,
        d.from.z + (d.to.z - d.from.z) * t,
      );
      const mat = d.sprite.material as THREE.SpriteMaterial;
      mat.opacity = open ? 0.9 * (1 - t * 0.25) : 0.9 * (1 - t);
      if (t >= 1) {
        d.sprite.material.dispose();
        g.remove(d.sprite);
        continue;
      }
      keep.push(d);
    }
    dripsRef.current = keep;
  });

  // Rebuild nothing on siteKey — meshes are created lazily per site id.
  void siteKey;
  return <group ref={root} />;
}
