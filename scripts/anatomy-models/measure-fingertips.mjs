// Find the distal fingertip of each patient GLB: decode the Draco mesh, take
// the hand-region boundary component, and report the single most-anterior
// (max-Z) vertex at the top of each finger. The MPFB hand seam is one unwelded
// boundary loop per hand, so the fingertip is the max-Z point in the upper
// lateral window. Used to derive the cyanosis nail band per mesh instead of
// reusing the adult-male hardcoded thresholds.
import { readFileSync } from 'node:fs';
import draco3d from 'draco3d';

function readGlbJson(buf) {
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
}
function getPrimitiveDracoBytes(buf, json) {
  const mesh = (json.meshes ?? []).find(m => m.name === 'Patient');
  const prim = mesh?.primitives?.[0];
  const ext = prim?.extensions?.KHR_draco_mesh_compression;
  const bv = json.bufferViews[ext.bufferView];
  const jsonChunkLen = 20 + buf.readUInt32LE(12);
  const padded = Math.ceil(jsonChunkLen / 4) * 4;
  const binChunkStart = padded + 8;
  return buf.subarray(binChunkStart + bv.byteOffset, binChunkStart + bv.byteOffset + bv.byteLength);
}

async function measure(path) {
  const buf = readFileSync(path);
  const json = readGlbJson(buf);
  const bytes = getPrimitiveDracoBytes(buf, json);
  const mod = await draco3d.createDecoderModule({});
  const decoder = new mod.Decoder();
  const dbuf = new mod.DecoderBuffer();
  dbuf.Init(new Int8Array(bytes), bytes.byteLength);
  const mesh = new mod.Mesh();
  decoder.DecodeBufferToMesh(dbuf, mesh);
  const numPoints = mesh.num_points();
  const numFaces = mesh.num_faces();
  const posAttrId = decoder.GetAttributeId(mesh, mod.POSITION);
  const posAttr = decoder.GetAttribute(mesh, posAttrId);
  const pa = new mod.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(mesh, posAttr, pa);
  const P = new Float32Array(pa.size());
  for (let i = 0; i < pa.size(); i++) P[i] = pa.GetValue(i);
  let maxY = -Infinity;
  for (let i = 0; i < numPoints; i++) if (P[i*3+1] > maxY) maxY = P[i*3+1];

  // Hand window: below the chin, lateral, anterior. Wide enough that infant /
  // toddler hands (which sit lower and less anterior) still fall in.
  const handMinY = maxY * 0.30;
  const handMaxY = maxY * 0.65;
  const hand = [];
  for (let i = 0; i < numPoints; i++) {
    const x = P[i*3], y = P[i*3+1], z = P[i*3+2];
    if (y < handMinY || y > handMaxY) continue;
    if (Math.abs(x) < 0.20) continue;
    if (z < 0.05) continue;
    hand.push({ i, x, y, z });
  }

  // Fingertip = max-Z point per lateral cluster (the nail plate faces +Z).
  // Group by sign of x and by coarse x-band so each of the 5 digits reports.
  const bySide = { neg: [], pos: [] };
  for (const h of hand) bySide[h.x < 0 ? 'neg' : 'pos'].push(h);
  const tips = [];
  for (const side of ['neg', 'pos']) {
    const arr = bySide[side];
    if (!arr.length) continue;
    arr.sort((a, b) => b.z - a.z);
    // Walk the sorted-by-Z list and pull local maxima separated in x so the
    // thumb, index, middle, ring and pinky each report their own tip.
    const taken = [];
    for (const h of arr) {
      if (taken.some(t => Math.abs(t.x - h.x) < 0.035)) continue;
      taken.push(h);
      if (taken.length >= 5) break;
    }
    for (const t of taken) tips.push({ ...t, side });
  }
  console.log(`\n=== ${path} ===  crown=${maxY.toFixed(4)}  handVerts=${hand.length}  tips=${tips.length}`);
  for (const t of tips) {
    console.log(`  tip side=${t.side}  x=${t.x.toFixed(4)}  y=${t.y.toFixed(4)}  z=${t.z.toFixed(4)}`);
  }
  if (hand.length) {
    const ys = hand.map(h => h.y), xs = hand.map(h => Math.abs(h.x)), zs = hand.map(h => h.z);
    console.log(`  hand window: Y [${Math.min(...ys).toFixed(4)}, ${Math.max(...ys).toFixed(4)}]  ` +
      `|x| [${Math.min(...xs).toFixed(4)}, ${Math.max(...xs).toFixed(4)}]  Z [${Math.min(...zs).toFixed(4)}, ${Math.max(...zs).toFixed(4)}]`);
  }
}
for (const p of process.argv.slice(2)) { await measure(p); }