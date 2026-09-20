/**
 * Eyes for the patient model — painted into the skin texture.
 *
 * The patient GLBs ship with NO eye mesh: the eye sockets are painted bright
 * red in the single skin texture (a MakeHuman placeholder), which read as
 * alarming red eyes. Earlier attempts to cover them with floating 3D eyeballs
 * fought the mesh proportions and the two models' incompatible UV layouts —
 * the eyeballs kept landing on the forehead or the neck.
 *
 * The key realisation: the red is ALREADY at the correct eye location (it is
 * the socket, mapped through the model's own UVs). So we just repaint those
 * red texels in-place — sclera white, a brown iris, a black pupil and a
 * catch-light — and the eyes appear exactly where they belong on ANY of the
 * textured patient meshes, with zero geometry guesswork. The pupil radius is
 * scaled from the case's pupil diameter so anisocoria / blown pupils show.
 *
 * Returns true if it repainted (so the caller knows the eyes are handled).
 *
 * Blink support: alongside the open-eye texture we pre-render ONE closed-lid
 * variant (skin-toned lids with a lash-line crease over the same texels) and
 * stash both on `body.userData.eyesOpenTex` / `body.userData.eyesClosedTex`.
 * The LifeSigns loop swaps `material.map` between them — a uniform update,
 * no per-frame canvas repaints or texture uploads.
 *
 * Real-eye models (Stage 2): GLBs that ship actual eyeball meshes (nodes
 * eyeL/eyeR with iris/pupil disc children — see scripts/blender-stage2-eyes-
 * ao.py) pass `hasEyeMeshes: true`. We recolour the red socket to sclera and
 * add a smaller, texture-level iris backing beneath the 3D discs. A physically
 * sized 12mm iris is sub-pixel in the full-body treatment view; without that
 * backing the patient reads as blank-eyed even though the close-up geometry is
 * correct. The live 3D pupil remains authoritative for size and anisocoria.
 */

import * as THREE from 'three';
import { pupilTextureRadiusFraction } from '@/lib/pupilDiscScale';

const SCLERA = [232, 228, 216] as const; // warm off-white
const IRIS = '#5d4634';
const PUPIL = '#0b0b0d';

export function paintEyesOnTexture(
  body: THREE.Mesh,
  pupilLeftMm: number,
  pupilRightMm: number,
  options?: { hasEyeMeshes?: boolean },
): boolean {
  const hasEyeMeshes = options?.hasEyeMeshes === true;
  const mat = (Array.isArray(body.material) ? body.material[0] : body.material) as
    | THREE.MeshStandardMaterial
    | undefined;
  const tex = mat?.map as THREE.Texture | undefined;
  const img = tex?.image as { width?: number; height?: number } | undefined;
  if (!mat || !tex || !img?.width || !img?.height) return false;

  try {
    const tw = img.width;
    const th = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img as unknown as CanvasImageSource, 0, 0, tw, th);
    const imgData = ctx.getImageData(0, 0, tw, th);
    const d = imgData.data;

    // Pure-red mask (eyes). Lips/skin are far duller. Recolour to sclera as we
    // go — that part is always safe (it only touches the actual red texels).
    const mask = new Uint8Array(tw * th);
    let redCount = 0;
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const i = y * tw + x;
        const o = i * 4;
        const R = d[o], G = d[o + 1], B = d[o + 2];
        if (R > 165 && G < 90 && B < 90 && R - G > 95 && R - B > 95) {
          mask[i] = 1;
          redCount++;
          d[o] = SCLERA[0]; d[o + 1] = SCLERA[1]; d[o + 2] = SCLERA[2];
        }
      }
    }
    if (redCount < 30) return false; // no recognisable red eyes — leave as-is
    ctx.putImageData(imgData, 0, 0);

    // Connected-component labelling so the IRIS/PUPIL discs only land on genuine
    // eye-sized blobs — the red can appear elsewhere in the atlas (and a naive
    // mean-x split then paints a giant disc across the body). 4-connectivity,
    // iterative stack (no recursion blowups on a 2048² atlas).
    type Blob = { cx: number; cy: number; w: number; h: number; n: number };
    const blobs: Blob[] = [];
    const stack: number[] = [];
    const maxEye = Math.max(8, Math.round(tw * 0.06)); // an eye is small in-atlas
    for (let start = 0; start < mask.length; start++) {
      if (mask[start] !== 1) continue;
      let n = 0, sumX = 0, sumY = 0, minX = tw, maxX = 0, minY = th, maxY = 0;
      mask[start] = 2;
      stack.push(start);
      while (stack.length) {
        const p = stack.pop()!;
        const px = p % tw, py = (p / tw) | 0;
        n++; sumX += px; sumY += py;
        if (px < minX) minX = px; if (px > maxX) maxX = px;
        if (py < minY) minY = py; if (py > maxY) maxY = py;
        if (px > 0 && mask[p - 1] === 1) { mask[p - 1] = 2; stack.push(p - 1); }
        if (px < tw - 1 && mask[p + 1] === 1) { mask[p + 1] = 2; stack.push(p + 1); }
        if (py > 0 && mask[p - tw] === 1) { mask[p - tw] = 2; stack.push(p - tw); }
        if (py < th - 1 && mask[p + tw] === 1) { mask[p + tw] = 2; stack.push(p + tw); }
      }
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      // Eye-like: enough pixels, compact, roughly round.
      if (n >= 20 && bw <= maxEye && bh <= maxEye && bw <= bh * 3 && bh <= bw * 3) {
        blobs.push({ cx: sumX / n, cy: sumY / n, w: bw, h: bh, n });
      }
    }
    // Keep the two largest eye blobs.
    blobs.sort((a, b) => b.n - a.n);
    const eyes = blobs.slice(0, 2);
    eyes.sort((a, b) => a.cx - b.cx); // left atlas-x → index 0
    eyes.forEach((e, idx) => {
      // Use the smaller half-extent so a tall/wide socket still gives a round
      // iris. Real-eye meshes receive a restrained backing iris: large enough
      // to preserve gaze at overview distance, but smaller than the opening so
      // the 3D iris/pupil remain crisp and clinically authoritative up close.
      const rEye = Math.min(e.w, e.h) / 2;
      const irisR = Math.max(2, rEye * (hasEyeMeshes ? 0.68 : 1.05));
      ctx.fillStyle = IRIS;
      ctx.beginPath(); ctx.arc(e.cx, e.cy, irisR, 0, Math.PI * 2); ctx.fill();
      if (!hasEyeMeshes) {
        const pupilMm = idx === 0 ? pupilLeftMm : pupilRightMm;
        const pupilR = irisR * pupilTextureRadiusFraction(pupilMm);
        ctx.fillStyle = PUPIL;
        ctx.beginPath(); ctx.arc(e.cx, e.cy, pupilR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath(); ctx.arc(e.cx - irisR * 0.28, e.cy - irisR * 0.28, Math.max(1, irisR * 0.14), 0, Math.PI * 2); ctx.fill();
      }
    });

    const adoptSettings = (t: THREE.CanvasTexture) => {
      t.flipY = tex.flipY;
      t.colorSpace = tex.colorSpace;
      t.wrapS = tex.wrapS;
      t.wrapT = tex.wrapT;
      t.anisotropy = tex.anisotropy;
      t.needsUpdate = true;
    };

    const newTex = new THREE.CanvasTexture(canvas);
    adoptSettings(newTex);
    mat.map = newTex;
    mat.needsUpdate = true;

    // ---- Closed-lid twin texture (blink / unconscious GCS-coupled lids) ----
    // Copy the finished open-eye atlas, then cover each eye blob with a
    // skin-toned lid ellipse sampled from the surrounding face texels, plus a
    // subtle lash-line crease so the closed eye reads as a lid, not a smudge.
    // Failure here is cosmetic only — blink simply stays disabled.
    body.userData.eyesOpenTex = newTex;
    body.userData.eyesClosedTex = null;
    try {
      if (eyes.length === 2) {
        const closedCanvas = document.createElement('canvas');
        closedCanvas.width = tw;
        closedCanvas.height = th;
        const cctx = closedCanvas.getContext('2d');
        if (cctx) {
          cctx.drawImage(canvas, 0, 0);
          for (const e of eyes) {
            // Average facial skin colour from a ring just outside the blob
            // (in-atlas). `d` still holds the pre-iris image data; the ring
            // region was never repainted, so it is genuine skin.
            const x0 = Math.max(0, Math.round(e.cx - e.w * 1.4));
            const x1 = Math.min(tw - 1, Math.round(e.cx + e.w * 1.4));
            const y0 = Math.max(0, Math.round(e.cy - e.h * 1.6));
            const y1 = Math.min(th - 1, Math.round(e.cy + e.h * 1.6));
            let r = 0, g = 0, b = 0, n = 0;
            for (let y = y0; y <= y1; y++) {
              for (let x = x0; x <= x1; x++) {
                // ring only — skip the blob itself (may hold sclera paint)
                if (Math.abs(x - e.cx) < e.w * 0.75 && Math.abs(y - e.cy) < e.h * 0.75) continue;
                const o = (y * tw + x) * 4;
                r += d[o]; g += d[o + 1]; b += d[o + 2]; n++;
              }
            }
            if (n === 0) continue;
            r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
            // Generous coverage: the source atlases carry a dull-red rim
            // around the strict-red mask (eyelid-margin texels) — the lid
            // must swallow that rim too or a closed eye keeps red edges.
            const rx = Math.max(2, e.w * 0.85);
            const ry = Math.max(2, e.h * 0.95);
            cctx.fillStyle = `rgb(${r},${g},${b})`;
            cctx.beginPath();
            cctx.ellipse(e.cx, e.cy, rx, ry, 0, 0, Math.PI * 2);
            cctx.fill();
            // Lash-line crease across the lid
            cctx.strokeStyle = `rgba(${Math.round(r * 0.55)},${Math.round(g * 0.5)},${Math.round(b * 0.5)},0.8)`;
            cctx.lineWidth = Math.max(1, e.h * 0.14);
            cctx.beginPath();
            cctx.moveTo(e.cx - rx * 0.8, e.cy);
            cctx.quadraticCurveTo(e.cx, e.cy + ry * 0.35, e.cx + rx * 0.8, e.cy);
            cctx.stroke();
          }
          const closedTex = new THREE.CanvasTexture(closedCanvas);
          adoptSettings(closedTex);
          body.userData.eyesClosedTex = closedTex;
        }
      }
    } catch {
      body.userData.eyesClosedTex = null;
    }

    return true;
  } catch {
    return false; // texture not readable — fall back to the model as shipped
  }
}
