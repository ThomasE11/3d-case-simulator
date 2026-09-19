// Measure BOTH nail bands per patient GLB (lateral pinky-side and forward
// index/middle). The old hardcoded predicate was two bands, not one, and a
// single interval box is too wide — it catches mid-finger vertices the old
// code correctly rejected. Each band is derived from the measured fingertip
// set: lateral from the two max-|x| tips, forward from the two max-z tips.
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
  const posAttrId = decoder.GetAttributeId(mesh, mod.POSITION);
  const posAttr = decoder.GetAttribute(mesh, posAttrId);
  const pa = new mod.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(mesh, posAttr, pa);
  const P = new Float32Array(pa.size());
  for (let i = 0; i < pa.size(); i++) P[i] = pa.GetValue(i);
  let maxY = -Infinity;
  for (let i = 0; i < numPoints; i++) if (P[i*3+1] > maxY) maxY = P[i*3+1];

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

  const bySide = { neg: [], pos: [] };
  for (const h of hand) bySide[h.x < 0 ? 'neg' : 'pos'].push(h);
  const tips = [];
  for (const side of ['neg', 'pos']) {
    const arr = bySide[side];
    if (!arr.length) continue;
    arr.sort((a, b) => b.z - a.z);
    const taken = [];
    for (const h of arr) {
      if (taken.some(t => Math.abs(t.x - h.x) < 0.035)) continue;
      taken.push(h);
      if (taken.length >= 5) break;
    }
    for (const t of taken) tips.push({ ...t, side });
  }

  // Lateral band: the two tips with the largest |x| (pinky side).
  const lateral = [...tips].sort((a, b) => Math.abs(b.x) - Math.abs(a.x)).slice(0, 2);
  // Forward band: the two tips with the largest z (index/middle facing out).
  const forward = [...tips].sort((a, b) => b.z - a.z).slice(0, 2);

  const band = (group) => {
    const ys = group.map(t => t.y);
    const xs = group.map(t => Math.abs(t.x));
    const zs = group.map(t => t.z);
    return {
      yCenter: (Math.min(...ys) + Math.max(...ys)) / 2,
      yHalf: (Math.max(...ys) - Math.min(...ys)) / 2,
      xMin: Math.min(...xs),
      xMax: Math.max(...xs),
      zMin: Math.min(...zs),
    };
  };

  console.log(`\n=== ${path} ===  crown=${maxY.toFixed(4)}  tips=${tips.length}`);
  console.log(`  lateral: ${JSON.stringify(band(lateral))}`);
  console.log(`  forward: ${JSON.stringify(band(forward))}`);
}
for (const p of process.argv.slice(2)) { await measure(p); }