// Find the mouth (upper+lower lip boundary loops) of each patient GLB by
// decoding the Draco mesh (positions + faces) and detecting boundary edges in
// the face region — the MPFB mouth is two unwelded horizontal boundary loops.
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

  // faces
  const ia = new mod.DracoInt32Array();
  const faces = new Uint32Array(numFaces * 3);
  for (let f = 0; f < numFaces; f++) {
    decoder.GetFaceFromMesh(mesh, f, ia);
    faces[f*3] = ia.GetValue(0);
    faces[f*3+1] = ia.GetValue(1);
    faces[f*3+2] = ia.GetValue(2);
  }

  // boundary edges (used by exactly 1 triangle)
  const edgeCount = new Map();
  const key = (a, b) => (a < b ? a + ':' + b : b + ':' + a);
  for (let f = 0; f < numFaces; f++) {
    const a = faces[f*3], b = faces[f*3+1], c = faces[f*3+2];
    for (const [p, q] of [[a,b],[b,c],[c,a]]) {
      const k = key(p, q);
      edgeCount.set(k, (edgeCount.get(k) || 0) + 1);
    }
  }
  const boundary = [...edgeCount.entries()].filter(([, n]) => n === 1).map(([k]) => k.split(':').map(Number));

  // face-region filter: near max Z (anterior) and upper body
  const faceMinY = maxY * 0.72;
  const boundaryFace = boundary.filter(([a, b]) => {
    const ya = P[a*3+1], yb = P[b*3+1];
    return ya >= faceMinY && yb >= faceMinY;
  });

  // cluster boundary edges into connected components
  const adj = new Map();
  for (const [a, b] of boundaryFace) {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  }
  const seen = new Set();
  const components = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const comp = [];
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const v = stack.pop();
      comp.push(v);
      for (const n of adj.get(v) || []) {
        if (!seen.has(n)) { seen.add(n); stack.push(n); }
      }
    }
    components.push(comp);
  }

  console.log(`\n=== ${path} ===  crown=${maxY.toFixed(4)}  boundaryFaceComponents=${components.length}`);
  for (const comp of components) {
    const ys = comp.map(i => P[i*3+1]);
    const xs = comp.map(i => P[i*3]);
    const zs = comp.map(i => P[i*3+2]);
    const spanX = Math.max(...xs) - Math.min(...xs);
    console.log(`  comp: verts=${comp.length}  Y [${Math.min(...ys).toFixed(4)}, ${Math.max(...ys).toFixed(4)}]  ` +
      `spanX=${spanX.toFixed(4)}  X [${Math.min(...xs).toFixed(4)}, ${Math.max(...xs).toFixed(4)}]  Z [${Math.min(...zs).toFixed(4)}, ${Math.max(...zs).toFixed(4)}]`);
  }
}

for (const p of process.argv.slice(2)) { await measure(p); }
