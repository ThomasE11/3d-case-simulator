/**
 * FocusedWoundLayer — sharp, anatomically anchored pathology after inspection.
 *
 * Atlas decals remain the wide-view realism layer. During focused inspection,
 * however, cinematic depth-of-field can blur a small WebGL decal. Drei Html is
 * projected from the same live mesh point but renders after post-processing,
 * keeping authored wound detail crisp. It appears only after the student has
 * selected, exposed and assessed the matching region.
 */

import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import type { BodyInjury } from '@/lib/injuryMap';
import { injuryRegionTo3D, injuryWorldOffsetX } from '@/lib/injuryMap';
import type { SurfaceSampler } from './BodyMesh';
import { spriteKindFor } from './WoundLayer';
import { drawWound } from './woundSprites';

const ANCHORS: Record<string, [number, number, number]> = {
  head: [0, 1.70, 0.19],
  face: [0, 1.62, 0.20],
  'neck-cspine': [0, 1.46, 0.22],
  chest: [0, 1.27, 0.20],
  abdomen: [0, 1.02, 0.24],
  pelvis: [0, 0.90, 0.24],
  'right-arm': [-0.145, 1.10, 0.16],
  'left-arm': [0.145, 1.10, 0.16],
  'right-leg': [-0.165, 0.46, 0.18],
  'left-leg': [0.165, 0.46, 0.18],
  'posterior-logroll': [0, 1.10, -0.20],
};

function makeDataUrl(injury: BodyInjury): string | null {
  const kind = spriteKindFor(injury);
  if (!kind || kind === 'active-bleeding') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawWound(ctx, kind, size / 2, size / 2, size * 0.31, kind === 'infected-incision' ? Math.PI / 2 : 0);
  return canvas.toDataURL('image/png');
}

export function FocusedWoundLayer({
  injuries,
  activeRegion,
  exposed,
  assessedRegions,
  sampler,
}: {
  injuries: BodyInjury[];
  activeRegion: string | null;
  exposed: boolean;
  assessedRegions: Set<string>;
  sampler: SurfaceSampler | null;
}) {
  const visible = useMemo(() => {
    if (!activeRegion || !exposed || !assessedRegions.has(activeRegion)) return [];
    return injuries
      .filter(injury => injuryRegionTo3D(injury.region) === activeRegion && spriteKindFor(injury))
      .map(injury => ({ injury, url: makeDataUrl(injury) }))
      .filter((item): item is { injury: BodyInjury; url: string } => Boolean(item.url));
  }, [activeRegion, assessedRegions, exposed, injuries]);

  return (
    <>
      {visible.map(({ injury, url }, index) => {
        const region = injuryRegionTo3D(injury.region);
        const anchor = ANCHORS[region] ?? ANCHORS.chest;
        const ax = anchor[0] + injuryWorldOffsetX(injury.laterality);
        const sampled = sampler && region !== 'posterior-logroll'
          ? sampler(ax, anchor[1], { coordinateSpace: 'author' })
          : [ax, anchor[1], anchor[2]] as [number, number, number];
        const fallback: [number, number, number] = [ax, anchor[1], anchor[2]];
        const safe = sampled.every(Number.isFinite) ? sampled : fallback;
        const position: [number, number, number] = [safe[0] + index * 0.035, safe[1] + 0.075, safe[2]];
        return (
          <Html
            key={injury.id}
            position={position}
            center
            distanceFactor={spriteKindFor(injury) === 'infected-incision' ? 2.2 : 3.15}
            zIndexRange={[100, 80]}
            transform={false}
            occlude={false}
            pointerEvents="none"
          >
            <div className="focused-wound-callout" data-severity={injury.severity} data-wound-kind={spriteKindFor(injury)} aria-label={injury.label}>
              <img src={url} alt="" aria-hidden="true" />
              <span>{injury.label}</span>
            </div>
          </Html>
        );
      })}
    </>
  );
}
